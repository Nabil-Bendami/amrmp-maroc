import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHero } from "@/components/ui/SectionHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — AMRMP" },
      { name: "description", content: "Contactez l'AMRMP pour toute question ou collaboration." },
      { property: "og:title", content: "Contact AMRMP" },
      { property: "og:description", content: "Une question, une proposition de collaboration ?" },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(5).max(2000),
});

type FormData = z.infer<typeof schema>;

function ContactPage() {
  const { t, dir } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (_data: FormData) => {
    setSubmitting(true);
    // Local UX only for v1. CRM/email integration can be wired later via server function.
    await new Promise((r) => setTimeout(r, 600));
    toast.success(t("contact.sent"));
    reset();
    setSubmitting(false);
  };

  return (
    <PublicLayout>
      <PageHero eyebrow={t("nav.contact")} title={t("contact.title")} subtitle={t("contact.sub")} />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16" dir={dir}>
        <div className="grid gap-10 lg:grid-cols-5">
          <aside className="lg:col-span-2 space-y-5">
            {[
              { icon: Mail, label: "Email", value: "contact@amrmp.ma" },
              { icon: Phone, label: "Téléphone", value: "+212 5XX-XXXXXX" },
              { icon: MapPin, label: "Adresse", value: "Rabat, Maroc" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-1 font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </aside>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-elevation space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("contact.name")} error={errors.name?.message}>
                <input
                  {...register("name")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                />
              </Field>
              <Field label={t("contact.email")} error={errors.email?.message}>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                />
              </Field>
            </div>
            <Field label={t("contact.subject")} error={errors.subject?.message}>
              <input
                {...register("subject")}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
              />
            </Field>
            <Field label={t("contact.message")} error={errors.message?.message}>
              <textarea
                {...register("message")}
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition resize-none"
              />
            </Field>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:bg-primary-glow transition-colors disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {t("contact.send")}
            </button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
      {error && <span className="block mt-1 text-xs text-destructive">{error}</span>}
    </label>
  );
}
