import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AdminApp from "./AdminApp.jsx";
import { ConfirmProvider, ToastProvider } from "./components/ui.jsx";
import "./styles/admin.css";

const basename = window.location.pathname.startsWith("/admin") ? "/admin" : "/";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <ToastProvider>
        <ConfirmProvider>
          <AdminApp />
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
