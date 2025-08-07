import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import CreateGroup from "./pages/CreateGroup";
import Chat from "./pages/Chat";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Proposals from "./pages/Proposals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Welcome & Auth Routes */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/auth/:mode" element={<Auth />} />
          
          {/* Main App Routes - Protected */}
          <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/groups" element={<AuthGuard><Groups /></AuthGuard>} />
          <Route path="/groups/create" element={<AuthGuard><CreateGroup /></AuthGuard>} />
          <Route path="/calendar" element={<AuthGuard><Calendar /></AuthGuard>} />
          <Route path="/proposals" element={<AuthGuard><Proposals /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
