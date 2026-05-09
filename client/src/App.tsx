import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
// Critical path — loaded eagerly
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
// Non-critical — lazy loaded
const Ministries     = lazy(() => import("./pages/Ministries"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Profile        = lazy(() => import("./pages/Profile"));
const OrderSuccess   = lazy(() => import("./pages/OrderSuccess"));
const OrderCancel    = lazy(() => import("./pages/OrderCancel"));
const ProductDetail  = lazy(() => import("./pages/ProductDetail"));
const Subscribe      = lazy(() => import("./pages/Subscribe"));
const Contact        = lazy(() => import("./pages/Contact"));
const NotFound       = lazy(() => import("./pages/NotFound"));

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}

const PageFallback = () => (
  <div style={{ minHeight: "60vh", background: "#f5efe4" }} />
);

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ScrollToTop />
      <Switch>
        {/* Auth page renders without the main Layout */}
        <Route path="/auth" component={Auth} />

      {/* All other routes use the main Layout */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/shop" component={Shop} />
            <Route path="/product/:id" component={ProductDetail} />
            <Route path="/cart" component={Cart} />
            <Route path="/ministries" component={Ministries} />
            <Route path="/profile" component={Profile} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/subscribe" component={Subscribe} />
            <Route path="/order/success" component={OrderSuccess} />
            <Route path="/order/cancel" component={OrderCancel} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
