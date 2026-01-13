import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TemplateProvider } from "@/contexts/TemplateContext";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { AdminShell } from "@/components/admin/AdminShell";
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
import AdminDashboard from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";
import Booking from "@/pages/Booking";
import DemoIndex from "@/pages/demo/DemoIndex";
import DemoAthlete from "@/pages/demo/DemoAthlete";
import DemoFreelancer from "@/pages/demo/DemoFreelancer";
import DemoRentalHost from "@/pages/demo/DemoRentalHost";
import DemoCleaning from "@/pages/demo/DemoCleaning";
import DemoSportsClub from "@/pages/demo/DemoSportsClub";
import DemoProfessional from "@/pages/demo/DemoProfessional";
import EmailSignature from "@/pages/tools/EmailSignature";
import DigitalCard from "@/pages/tools/DigitalCard";
import Offre from "@/pages/Offre";
import PublicCard from "@/pages/PublicCard";
import PropertyDetail from "@/pages/PropertyDetail";
import Properties from "@/pages/Properties";
import AdminProperties from "@/pages/AdminProperties";
import AdminCoupons from "@/pages/AdminCoupons";
import AdminReservations from "@/pages/AdminReservations";
import AdminIntegrations from "@/pages/AdminIntegrations";
import AdminTools from "@/pages/AdminTools";
import AdminSettingsPage from "@/pages/AdminSettingsPage";
import AdminSuper from "@/pages/AdminSuper";
import AdminAppearance from "@/pages/AdminAppearance";
import AdminContent from "@/pages/AdminContent";
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
      <Route path="/booking" component={Booking} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:slug" component={PropertyDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ProtectedAdminRouter() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  return (
    <TemplateProvider>
      <AdminShell>
        <Switch>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/properties" component={AdminProperties} />
          <Route path="/admin/reservations" component={AdminReservations} />
          <Route path="/admin/coupons" component={AdminCoupons} />
          <Route path="/admin/integrations" component={AdminIntegrations} />
          <Route path="/admin/tools" component={AdminTools} />
          <Route path="/admin/settings" component={AdminSettingsPage} />
          <Route path="/admin/appearance" component={AdminAppearance} />
          <Route path="/admin/content" component={AdminContent} />
          <Route path="/admin/super" component={AdminSuper} />
          <Route component={NotFound} />
        </Switch>
      </AdminShell>
    </TemplateProvider>
  );
}

function AdminRouter() {
  const [location] = useLocation();
  
  if (location === "/admin/login") {
    return <AdminLogin />;
  }
  
  return <ProtectedAdminRouter />;
}

function ToolsRouter() {
  return (
    <Switch>
      <Route path="/tools/signature" component={EmailSignature} />
      <Route path="/tools/carte" component={DigitalCard} />
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
      <Route path="/demo/cleaning/:page?" component={DemoCleaning} />
      <Route path="/demo/sports-club/:page?" component={DemoSportsClub} />
      <Route path="/demo/professional/:page?" component={DemoProfessional} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isDemoPage = location.startsWith("/demo");
  const isToolsPage = location.startsWith("/tools");
  const isAdminPage = location.startsWith("/admin");
  const isOffrePage = location === "/offre";
  const isCardPage = location.startsWith("/c/");

  if (isDemoPage) {
    return <DemoRouter />;
  }

  if (isToolsPage) {
    return <ToolsRouter />;
  }

  if (isAdminPage) {
    return <AdminRouter />;
  }

  if (isOffrePage) {
    return <Offre />;
  }

  if (isCardPage) {
    return <PublicCard />;
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
        <AdminAuthProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </AdminAuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
