import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
  Navigate, // Import Navigate for redirection
} from "react-router-dom";
import App from "./App.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/todo" replace />, // Redirect to /todo
  },
  {
    path: "/todo",
    element: (
      <App option="withWrapper" component="todo"></App>
    ),
  },
  {
    path: "/note",
    element: (
      <App option="withWrapper" component="note"></App>
    ),
  },
]);

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
