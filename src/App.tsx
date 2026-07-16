import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Agents from "./pages/Agents";
import Prompts from "./pages/Prompts";
import ApprovedPrompts from "./pages/ApprovedPrompts";
import RemixReviews from "./pages/RemixReviews";
import Ads from "./pages/Ads";
import Currency from "./pages/Currency";
import CreditsSettings from "./pages/CreditsSettings";
import AICreatorRequests from "./pages/AICreatorRequests";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import RequireAdmin from "./components/admin/RequireAdmin";
import RequireAdminOrAgent from "./components/admin/RequireAdminOrAgent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route element={<RequireAdmin />}>
            <Route path="/" element={<Index />} />
            <Route element={<RequireAdminOrAgent type="admin" />}>
              <Route path="/agents" element={<Agents />} />
              <Route path="/users" element={<Users />} />
            </Route>
            <Route element={<RequireAdminOrAgent type="agent" requiredPermission="prompts" />}>
              <Route path="/prompts" element={<Prompts />} />
              <Route path="/approved-prompts" element={<ApprovedPrompts />} />
              <Route path="/remix-reviews" element={<RemixReviews />} />
            </Route>
            <Route element={<RequireAdminOrAgent type="agent" requiredPermission="ads" />}>
              <Route path="/ads" element={<Ads />} />
            </Route>
            <Route element={<RequireAdminOrAgent type="admin" />}>
              <Route path="/currency" element={<Currency />} />
              <Route path="/credits" element={<CreditsSettings />} />
            </Route>
            <Route element={<RequireAdminOrAgent type="agent" requiredPermission="aiCreatorRequests" />}>
              <Route path="/ai-creators" element={<AICreatorRequests />} />
            </Route>
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
