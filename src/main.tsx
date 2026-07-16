import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const media = window.matchMedia("(prefers-color-scheme: dark)");

const applyThemeClass = (isDark: boolean) => {
	document.documentElement.classList.toggle("dark", isDark);
};

applyThemeClass(media.matches);
media.addEventListener("change", (event) => applyThemeClass(event.matches));

createRoot(document.getElementById("root")!).render(<App />);
