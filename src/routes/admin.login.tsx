import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Connexion — AMRMP Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});
type FormData = z.infer<typeof schema>;

function AdminLogin() {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/admin" });
  }, [loading, isAuthenticated, navigate]);

  const onSubmit = async ({ email, password }: FormData) => {
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/admin`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast.success("Compte créé. Vérifiez votre e-mail si la confirmation est activée.");
      } else {
        // Sign in with password
        console.log('Step 0: Attempting sign in for:', email);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('Step 1: Sign in failed:', error);
          throw error;
        }

        // Check if user has admin role by direct query
        if (data.user) {
          console.log('Step 1: User authenticated with ID:', data.user.id);
          
          // Direct query to user_roles table
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .single();

          if (roleError) {
            console.error('Step 2: Role query error:', roleError);
            await supabase.auth.signOut();
            throw new Error('Erreur lors de la vérification des droits');
          }

          console.log('Step 2: Role found in DB:', roleData?.role);

          if (roleData?.role !== 'admin') {
            console.error('Step 3: User does not have admin role:', roleData?.role);
            // Sign out the user since they don't have admin rights
            await supabase.auth.signOut();
            throw new Error('Accès refusé : Vous n\'avez pas les droits administrateur.');
          }

          console.log('Step 3: Admin role verified, redirecting to /admin');
          toast.success("Connecté avec succès.");
          navigate({ to: "/admin" });
        } else {
          console.error('Step 1: No user in response');
          throw new Error('Erreur d\'authentification');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inattendue";
      console.error('Login error:', msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/40 via-background to-accent-soft/40">
      <div className="px-4 py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          AMRMP
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-10" dir={dir}>
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-card border border-border shadow-elegant p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-semibold">{t("admin.signin.title")}</h1>
                <p className="text-xs text-muted-foreground">{t("admin.signin.sub")}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {t("admin.signin.email")}
                </span>
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                {errors.email && (
                  <span className="block mt-1 text-xs text-destructive">{errors.email.message}</span>
                )}
              </label>
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {t("admin.signin.password")}
                </span>
                <input
                  {...register("password")}
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                {errors.password && (
                  <span className="block mt-1 text-xs text-destructive">
                    {errors.password.message}
                  </span>
                )}
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-glow transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signup" ? t("admin.signin.signup") : t("admin.signin.submit")}
              </button>
            </form>

            <button
              onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
              className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-primary"
            >
              {mode === "signin" ? t("admin.signin.create") : t("admin.signin.have")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
