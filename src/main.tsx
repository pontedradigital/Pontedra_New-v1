import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { BrowserRouter } from "react-router-dom"; // Importar BrowserRouter

createRoot(document.getElementById("root")!).render(
  <BrowserRouter> {/* Envolver App com BrowserRouter */}
    <App />
  </BrowserRouter>
);