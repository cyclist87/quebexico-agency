import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import Home from "@/pages/Home";
import Contact from "@/pages/Contact";
import BookDiscovery from "@/pages/BookDiscovery";
import BookExpert from "@/pages/BookExpert";
import Legal from "@/pages/Legal";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Cookies from "@/pages/Cookies";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Admin from "@/pages/Admin";
import Booking from "@/pages/Booking";
import DemoIndex from "@/pages/demo/DemoIndex";
import DemoAthlete from "@/pages/demo/DemoAthlete";
import DemoFreelancer from "@/pages/demo/DemoFreelancer";
import DemoRentalHost from "@/pages/demo/DemoRentalHost";
import NotFound from "@/pages/not-found";

function MainRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/contact" component={Contact} />
      <Route path="/book/discovery" component={BookDiscovery} />
      <Route path="/book/expert" component={BookExpert} />
      <Route path="/legal" component={Legal} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/admin" component={Admin} />
      <Route path="/booking" component={Booking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function DemoRouter() {
  return (
    <Switch>
      <Route path="/demo" component={DemoIndex} />
      <Route path="/demo/athlete/:page?" component={DemoAthlete} />
      <Route path="/demo/freelancer/:page?" component={DemoFreelancer} />
      <Route path="/demo/chalet/:page?" component={DemoRentalHost} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isDemoPage = location.startsWith("/demo");

  if (isDemoPage) {
    return <DemoRouter />;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow">
          <MainRouter />
        </main>
        <Footer />
      </div>
      <ChatWidget />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
