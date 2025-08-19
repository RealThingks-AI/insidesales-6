
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { User, LogOut } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export const CRMLayout = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (!session?.user && location.pathname !== '/auth') {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session?.user && location.pathname !== '/auth') {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-foreground">CRM Dashboard</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
