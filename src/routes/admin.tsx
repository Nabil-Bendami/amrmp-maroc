import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, LayoutDashboard, Calendar, BookText, Images, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import adminLogo from "@/assets/téléchargement.png";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — AMRMP" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Allow login route to render immediately, even during loading
  const isLoginRoute = window.location.pathname === '/admin/login';

  useEffect(() => {
    if (!loading) {
      console.log('Admin layout check - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin, 'isLoginRoute:', isLoginRoute);
      
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        if (!isLoginRoute) {
          navigate({ to: "/admin/login" });
        }
      } 
      // If authenticated but not admin, redirect to login
      else if (!isAdmin) {
        console.log('Authenticated but not admin, redirecting to login');
        if (!isLoginRoute) {
          navigate({ to: "/admin/login" });
        }
      }
      // If authenticated AND admin, allow access
      else {
        console.log('User is authenticated and admin, allowing access');
      }
    }
  }, [loading, isAuthenticated, isAdmin, isLoginRoute, navigate]);

  // If on login route, always render the outlet (login form)
  if (isLoginRoute) {
    console.log('On login route, rendering outlet');
    return <Outlet />;
  }

  // Show loading for other admin routes
  if (loading) {
    console.log('Still loading, showing loading screen');
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  // Only render admin dashboard if authenticated AND is admin
  if (!isAuthenticated || !isAdmin) {
    console.log('Not authenticated or not admin, rendering outlet for redirect');
    return <Outlet />;
  }

  console.log('Rendering authenticated admin layout');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("admin.signout"));
    navigate({ to: "/admin/login" });
  };

  const navItems = [
    { to: "/admin", key: "admin.dashboard.title", icon: LayoutDashboard, exact: true },
    { to: "/admin/events", key: "admin.section.events", icon: Calendar, exact: false },
    { to: "/admin/publications", key: "admin.section.publications", icon: BookText, exact: false },
    { to: "/admin/albums", key: "admin.section.albums", icon: Images, exact: false },
    { to: "/admin/about-management", key: "About Management", icon: Users, exact: false },
  ];

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border/40">
          <img
            src={adminLogo}
            alt="AMRMP admin logo"
            className="h-14 w-auto rounded-md border border-sidebar-border/50 bg-sidebar/95 p-1"
          />
          <div>
            <p className="font-serif font-semibold leading-tight">AMRMP</p>
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Admin
            </p>
          </div>
        </Link>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ to, key, icon: Icon, exact }, i) => (
            <Link
              key={i}
              to={to}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground" }}
              activeOptions={{ exact }}
            >
              <Icon className="h-4 w-4" />
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-sidebar-border/40">
          <p className="px-3 text-xs text-sidebar-foreground/60 mb-2 truncate">
            {user?.email}
          </p>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t("admin.signout")}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between gap-3 bg-sidebar text-sidebar-foreground px-4 py-3 sticky top-0 z-10">
          <Link to="/" className="font-serif font-semibold">AMRMP Admin</Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-sidebar-border/40"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("admin.signout")}
          </button>
        </header>
        <div className="p-6 sm:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
