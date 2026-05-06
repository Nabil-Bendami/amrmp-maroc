import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, BookText, Images, Users, ArrowUpRight, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { fetchEvents, fetchPublications, fetchAlbums, fetchAnalytics, fetchTeamMembers } from "@/services/content";
import { VisitorChart } from "@/components/admin/VisitorChart";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const { t } = useI18n();

  const eventsQ = useQuery({ queryKey: ["events"], queryFn: fetchEvents });
  const pubsQ = useQuery({ queryKey: ["publications"], queryFn: fetchPublications });
  const albumsQ = useQuery({ queryKey: ["albums"], queryFn: fetchAlbums });
  const analyticsQ = useQuery({ queryKey: ["analytics"], queryFn: fetchAnalytics });
  const teamQ = useQuery({ queryKey: ["team"], queryFn: fetchTeamMembers });

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">403 Unauthorized</h1>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Calendar, label: t("admin.section.events"), value: eventsQ.data?.length ?? 0 },
    { icon: BookText, label: t("admin.section.publications"), value: pubsQ.data?.length ?? 0 },
    { icon: Images, label: t("admin.section.albums"), value: albumsQ.data?.length ?? 0 },
    { icon: Users, label: "Active Team Members", value: teamQ.data?.filter(m => m.is_active).length ?? 0 },
  ];

  const totalVisitors = analyticsQ.data?.reduce((sum, item) => sum + item.unique_visitors, 0) ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-accent font-semibold">
          {t("admin.dashboard.title")}
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold">
          {t("admin.dashboard.welcome")}, {user?.email?.split("@")[0]}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl bg-card border border-border p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-4 font-serif text-3xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-xl font-semibold">7-Day Traffic Overview</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Total unique visitors: <span className="font-semibold text-primary">{totalVisitors}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </div>
        </div>
        {analyticsQ.isLoading ? (
          <div className="h-80 bg-muted/50 rounded-lg animate-pulse" />
        ) : analyticsQ.data && analyticsQ.data.length > 0 ? (
          <VisitorChart data={analyticsQ.data} />
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No analytics data available
          </div>
        )}
      </div>

      {/* Quick Actions or Coming Soon */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("admin.coming.soon")}</p>
      </div>
    </div>
  );
}
