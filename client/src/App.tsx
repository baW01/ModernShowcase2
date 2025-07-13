import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieConsent } from "@/components/cookie-consent";
import Home from "@/pages/home";
import Product from "@/pages/product";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import DeleteRequest from "@/pages/delete-request";
import VerifySale from "@/pages/verify-sale";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={Product} />
      <Route path="/admin" component={Admin} />
      <Route path="/regulamin" component={Terms} />
      <Route path="/polityka-prywatnosci" component={Privacy} />
      <Route path="/delete-request" component={DeleteRequest} />
      <Route path="/verify-sale" component={VerifySale} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <CookieConsent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
