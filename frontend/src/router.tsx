import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/HomePage";
import NotesPage from "./pages/NotesPage";
import ReportsPage from "./pages/ReportsPage";
import { getLoggedInUser } from "./auth";
import PurchasePage from "./pages/PurchasePage";
import { signInWithRedirect } from 'aws-amplify/auth';
import UsersPage from "./pages/UsersPage";
import CheckoutCompletePage from "./pages/CheckoutCompletePage";
//import { useAuth } from "./contexts/AuthContext";

const requireSubscription = async () => {
  const user = await getLoggedInUser();
  if (!user) {
    console.warn(`Not logged in, redirecting to login page...`);
    await signInWithRedirect({ });
    return Promise.reject("Unauthorized");
  }
  if (!user.tenantId) {
    console.warn(`No subscription, redirecting to purchase page...`);
    router.navigate({ to: "/purchase" });
    return Promise.reject("Unauthorized");
  }
};

const requireLoggedInButNoSubscription = async () => {
  const user = await getLoggedInUser();
  if (!user) {
    console.warn(`Not logged in, redirecting to login page...`);
    await signInWithRedirect({ });
    return Promise.reject("Unauthorized");
  }
  if (user.tenantId) {
    console.warn(`User is already in a subscription, redirecting to app...`);
    router.navigate({ to: "/app/notes" });
    return Promise.reject("Unavailable");
  }
};


const rootRoute = createRootRoute();

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const purchaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/purchase",
  component: PurchasePage,
  beforeLoad: requireLoggedInButNoSubscription,
});

const checkoutCompleteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout-complete",
  component: CheckoutCompletePage,
  beforeLoad: requireLoggedInButNoSubscription,
});


const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "app",
  component: AppLayout,
  beforeLoad: requireSubscription, // Protects all child routes
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

// Create the router with route tree
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    homeRoute, 
    purchaseRoute, 
    checkoutCompleteRoute,
    appRoute.addChildren([notesRoute, reportsRoute, usersRoute])
  ]),
  defaultPreload: "intent", // Preload when user intends to navigate
});
