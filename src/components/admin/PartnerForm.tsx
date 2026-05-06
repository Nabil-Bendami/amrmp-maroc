import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createPartner, updatePartner, type PartnerRow } from "@/services/content";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const partnerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo_url: z.string().url().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  sort_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

interface PartnerFormProps {
  partner?: PartnerRow | null;
  onSuccess: () => void;
}

export function PartnerForm({ partner, onSuccess }: PartnerFormProps) {
  const [uploading, setUploading] = useState(false);

  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: partner?.name || "",
      logo_url: partner?.logo_url || "",
      website_url: partner?.website_url || "",
      description: partner?.description || "",
      sort_order: partner?.sort_order || 0,
      is_active: partner?.is_active ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: createPartner,
    onSuccess: () => {
      toast.success("Partner created successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to create partner: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePartner(id, data),
    onSuccess: () => {
      toast.success("Partner updated successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to update partner: " + error.message);
    },
  });

  const onSubmit = (data: PartnerFormData) => {
    const submitData = {
      ...data,
      logo_url: data.logo_url || null,
      website_url: data.website_url || null,
      description: data.description || null,
    };

    if (partner) {
      updateMutation.mutate({ id: partner.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${Date.now()}-${file.name}`;

      console.log('Attempting upload to bucket:', 'partners', 'with path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('partners')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'image/*',
        });

      if (uploadError) {
        console.error('Full Supabase Error:', uploadError);
        console.error('Upload error details:', uploadError);
        console.error('Error message:', uploadError.message);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('partners')
        .getPublicUrl(filePath);

      form.setValue('logo_url', urlData.publicUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error('Full error object:', error);
      toast.error("Failed to upload logo: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partner Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter partner name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sort_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a brief description of the partner"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="logo-upload">Partner Logo (Optional)</Label>
          <Input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          {form.watch('logo_url') && (
            <div className="mt-2">
              <img
                src={form.watch('logo_url')}
                alt="Logo preview"
                className="w-20 h-20 rounded object-contain border"
              />
            </div>
          )}
          <FormField
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel>Or enter logo URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {partner ? "Update" : "Create"} Partner
          </Button>
        </div>
      </form>
    </Form>
  );
}