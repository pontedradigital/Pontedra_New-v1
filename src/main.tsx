import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { BrowserRouter } from "react-router-dom";
import { MockProvider } from "./context/MockContext.tsx"; // Importar MockProvider

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <MockProvider> {/* Envolver App com MockProvider */}
      <App />
    </MockProvider>
  </BrowserRouter>
);