import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import LandingPage from "./pages/LandingPage";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import TermosDeUso from "./pages/TermosDeUso";
import NotFound from "./pages/NotFound";
import ScrollToTopSpecific from "./components/ScrollToTopSpecific";
import LoginPage from "./pages/LoginPage";
import LoadingPage from "./pages/LoadingPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
 
 
 

// Importando as páginas de dashboard
 

// Nova página de configurações combinada
 

// Novas páginas para o Master
 
// import AvailabilityPage from "./pages/dashboard/master/AvailabilityPage"; // Removido


function App() {
  const location = useLocation();
  
  return (
    <>
      <Toaster position="top-right" richColors />
      <ScrollToTopSpecific />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/termos-de-uso" element={<TermosDeUso />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/loading" element={<LoadingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['master']}><DashboardPage /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default App;
