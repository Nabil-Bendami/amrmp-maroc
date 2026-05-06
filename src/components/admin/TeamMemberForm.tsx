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
import { createTeamMember, updateTeamMember, type TeamMemberRow } from "@/services/content";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  bio: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  image_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface TeamMemberFormProps {
  member?: TeamMemberRow | null;
  onSuccess: () => void;
}

export function TeamMemberForm({ member, onSuccess }: TeamMemberFormProps) {
  const [uploading, setUploading] = useState(false);

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: member?.name || "",
      role: member?.role || "",
      bio: member?.bio || "",
      email: member?.email || "",
      image_url: member?.image_url || "",
      is_active: member?.is_active ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: createTeamMember,
    onSuccess: () => {
      toast.success("Team member created successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to create team member: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTeamMember(id, data),
    onSuccess: () => {
      toast.success("Team member updated successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to update team member: " + error.message);
    },
  });

  const onSubmit = (data: TeamMemberFormData) => {
    const submitData = {
      ...data,
      bio: data.bio || null,
      email: data.email || null,
      image_url: data.image_url || null,
    };

    if (member) {
      updateMutation.mutate({ id: member.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${Date.now()}-${file.name}`;

      console.log('Attempting upload to bucket:', 'team', 'with path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('team')
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
        .from('team')
        .getPublicUrl(filePath);

      form.setValue('image_url', urlData.publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error('Full error object:', error);
      toast.error("Failed to upload image: " + (error as Error).message);
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
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role/Position</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., President, Vice President" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biography (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a short biography"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="image-upload">Profile Image (Optional)</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          {form.watch('image_url') && (
            <div className="mt-2">
              <img
                src={form.watch('image_url')}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
          )}
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel>Or enter image URL</FormLabel>
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
            {member ? "Update" : "Create"} Team Member
          </Button>
        </div>
      </form>
    </Form>
  );
}