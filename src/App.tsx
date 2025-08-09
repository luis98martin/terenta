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
import GroupDetail from "./pages/GroupDetail";
import CreateProposal from "./pages/CreateProposal";
import ProposalDetail from "./pages/ProposalDetail";
import GroupManagement from "./pages/GroupManagement";
import Calendar from "./pages/Calendar";
import Chat from "./pages/Chat";
import ChatPage from "./pages/ChatPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import JoinGroup from "./pages/JoinGroup";

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
          <Route path="/join/:code" element={<JoinGroup />} />
          
          {/* Main App Routes - Protected */}
          <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/groups" element={<AuthGuard><Groups /></AuthGuard>} />
          <Route path="/groups/create" element={<AuthGuard><CreateGroup /></AuthGuard>} />
          <Route path="/groups/:groupId" element={<AuthGuard><GroupDetail /></AuthGuard>} />
          <Route path="/groups/:groupId/proposals/create" element={<AuthGuard><CreateProposal /></AuthGuard>} />
          <Route path="/groups/:groupId/proposals/:proposalId" element={<AuthGuard><ProposalDetail /></AuthGuard>} />
          <Route path="/groups/:groupId/manage" element={<AuthGuard><GroupManagement /></AuthGuard>} />
          <Route path="/calendar" element={<AuthGuard><Calendar /></AuthGuard>} />
          <Route path="/chat" element={<AuthGuard><Chat /></AuthGuard>} />
          <Route path="/chat/:chatId" element={<AuthGuard><ChatPage /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
