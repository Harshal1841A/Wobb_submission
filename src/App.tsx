import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SearchPage } from "@/pages/SearchPage";
import { ProfileDetailPage } from "@/pages/ProfileDetailPage";

function AnimatedRoutes() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: shouldReduceMotion ? 0 : 0.2, ease: "easeInOut" },
        }}
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, transition: { duration: 0.15, ease: "easeInOut" } }
        }
      >
        <Routes location={location}>
          <Route path="/" element={<SearchPage />} />
          <Route path="/profile/:username" element={<ProfileDetailPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
