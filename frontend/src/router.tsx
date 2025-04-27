import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/HomePage";
import NotesPage from "./pages/NotesPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";


const rootRoute = createRootRoute();

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "app",
  component: AppLayout,
});

const notesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "notes",
  component: NotesPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "reports",
  component: ReportsPage,
});

const usersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "users",
  component: UsersPage,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    homeRoute, 
    appRoute.addChildren([notesRoute, reportsRoute, usersRoute])
  ]),
  defaultPreload: "intent",
});