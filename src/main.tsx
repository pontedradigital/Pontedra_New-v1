import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { BrowserRouter } from "react-router-dom";
import { MockProvider } from "./context/MockContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx"; // Importar AuthProvider

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider> {/* AuthProvider agora envolve MockProvider */}
      <MockProvider>
        <App />
      </MockProvider>
    </AuthProvider>
  </BrowserRouter>
);