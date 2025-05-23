import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Calibration from "./pages/Calibration";
import Tracking from "./pages/Tracking";
import GameSummary from "./pages/GameSummary";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import CourtSelection from "./pages/CourtSelection";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/calibration" element={<Calibration />} />
          <Route path="/court-selection" element={<CourtSelection />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/game-summary" element={<GameSummary />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
