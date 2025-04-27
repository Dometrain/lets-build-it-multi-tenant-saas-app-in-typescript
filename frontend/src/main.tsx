import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import { configureAuth } from "./auth";

if (import.meta.env.VITE_MOCK_DATA === "true") {
  import("./mocks/browser").then(({ worker }) => worker.start());
}
export const queryClient = new QueryClient();
configureAuth();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
      </AuthProvider>
  </React.StrictMode>
);

