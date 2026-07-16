import {
  signInWithEmailAndPassword,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "./firebase";

const AUTH_STORAGE_KEY = "kg_admin_authed";
const ADMIN_ROLE_STORAGE_KEY = "kg_admin_role";

// Built-in superadmin — hardcoded, never touches Firebase
const SUPER_ADMIN_EMAIL = "admin@wwi.org.in";
const SUPER_ADMIN_PASSWORD = "WWI@9326";

export type AdminRole = "main-admin" | "client-admin";

// ── Session helpers ──────────────────────────────────────────────────────────

export const isAdminAuthenticated = () => localStorage.getItem(AUTH_STORAGE_KEY) === "true";

export const setAdminAuthenticated = (role: AdminRole) => {
  localStorage.setItem(AUTH_STORAGE_KEY, "true");
  localStorage.setItem(ADMIN_ROLE_STORAGE_KEY, role);
};

export const clearAdminAuthenticated = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(ADMIN_ROLE_STORAGE_KEY);
};

export const getAuthenticatedAdminRole = (): AdminRole | null => {
  if (!isAdminAuthenticated()) return null;
  const role = localStorage.getItem(ADMIN_ROLE_STORAGE_KEY);
  if (role === "main-admin" || role === "client-admin") return role;
  return null;
};

// ── Login ────────────────────────────────────────────────────────────────────

/**
 * Attempts admin login.
 * 1. Checks the hardcoded superadmin (no network).
 * 2. Falls back to Firebase Authentication for any other email.
 */
export const loginAdmin = async (
  email: string,
  password: string,
): Promise<AdminRole | null> => {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Superadmin — hardcoded, always works offline
  if (
    normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase() &&
    password === SUPER_ADMIN_PASSWORD
  ) {
    return "main-admin";
  }

  // 2. Firebase Authentication (admin@kirnagram.com and future Firebase admins)
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    return "main-admin";
  } catch {
    return null;
  }
};

// ── Password change ──────────────────────────────────────────────────────────

export interface ChangePasswordResult {
  success: boolean;
  message?: string;
}

/**
 * Changes the currently signed-in Firebase admin's password.
 * Re-authenticates first to satisfy Firebase's recent-login requirement.
 */
export const changeAdminPassword = async (
  oldPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    return {
      success: false,
      message: "No Firebase session found. Please log in again.",
    };
  }

  if (newPassword.trim().length < 6) {
    return { success: false, message: "New password must be at least 6 characters." };
  }

  if (oldPassword === newPassword) {
    return { success: false, message: "New password must be different from the old one." };
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, oldPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { success: true };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
      return { success: false, message: "Old password is incorrect." };
    }
    return { success: false, message: "Failed to change password. Please log in again." };
  }
};
