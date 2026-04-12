import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Ministries from "./pages/Ministries";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import OrderSuccess from "./pages/OrderSuccess";
import OrderCancel from "./pages/OrderCancel";

function Router() {
  return (
    <Switch>
      {/* Auth page renders without the main Layout */}
      <Route path="/auth" component={Auth} />

      {/* All other routes use the main Layout */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/shop" component={Shop} />
            <Route path="/cart" component={Cart} />
            <Route path="/ministries" component={Ministries} />
            <Route path="/profile" component={Profile} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/order/success" component={OrderSuccess} />
            <Route path="/order/cancel" component={OrderCancel} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
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
