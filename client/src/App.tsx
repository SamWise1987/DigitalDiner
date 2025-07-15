import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "@/pages/admin-dashboard";
import QRLanding from "@/pages/qr-landing";
import CustomerApp from "@/pages/customer-app";
import SplitPayment from "@/pages/split-payment";
import DigitalMenu from "@/pages/digital-menu";
import OrderCart from "@/pages/order-cart";
import Payment from "@/pages/payment";
import OrderConfirmation from "@/pages/order-confirmation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Admin Routes */}
      <Route path="/" component={AdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      
      {/* Customer Routes */}
      <Route path="/qr/:qrCode" component={QRLanding} />
      <Route path="/menu/:sessionId" component={CustomerApp} />
      <Route path="/split-payment/:sessionId" component={SplitPayment} />
      <Route path="/cart/:sessionId" component={OrderCart} />
      <Route path="/payment/:orderId" component={Payment} />
      <Route path="/confirmation/:orderId" component={OrderConfirmation} />
      
      {/* Legacy routes for compatibility */}
      <Route path="/digital-menu/:sessionId" component={DigitalMenu} />
      
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
