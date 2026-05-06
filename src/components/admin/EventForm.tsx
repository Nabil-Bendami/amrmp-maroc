import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { EventRow } from "@/services/content";

const eventSchema = z.object({
  title_fr: z.string().min(1, "Title (French) is required"),
  title_ar: z.string().optional(),
  summary_fr: z.string().optional(),
  summary_ar: z.string().optional(),
  description_fr: z.string().optional(),
  description_ar: z.string().optional(),
  event_date: z.string().optional(),
  location: z.string().optional(),
  is_published: z.boolean().default(true),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: EventRow;
  onSubmit: (data: EventFormData & { image_url?: string }) => Promise<void>;
  onCancel: () => void;
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(event?.image_url || null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title_fr: event?.title_fr || "",
      title_ar: event?.title_ar || "",
      summary_fr: event?.summary_fr || "",
      summary_ar: event?.summary_ar || "",
      description_fr: event?.description_fr || "",
      description_ar: event?.description_ar || "",
      event_date: event?.event_date || "",
      location: event?.location || "",
      is_published: event?.is_published ?? true,
    },
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);

      setImagePreview(data.publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        handleImageUpload(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onFormSubmit = async (data: EventFormData) => {
    setSubmitting(true);
    try {
      await onSubmit({
        ...data,
        image_url: imagePreview || undefined,
      });
      toast.success(event ? "Event updated successfully" : "Event created successfully");
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{event ? "Edit Event" : "Create New Event"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Event Image</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {uploading ? "Uploading..." : "Drop an image here or click to select"}
                </p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title_fr">Title (French) *</Label>
              <Input
                id="title_fr"
                {...register("title_fr")}
                placeholder="Event title in French"
              />
              {errors.title_fr && (
                <p className="text-sm text-destructive">{errors.title_fr.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_ar">Title (Arabic)</Label>
              <Input
                id="title_ar"
                {...register("title_ar")}
                placeholder="Event title in Arabic"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date</Label>
              <Input
                id="event_date"
                type="date"
                {...register("event_date")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Event location"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summary_fr">Summary (French)</Label>
              <Textarea
                id="summary_fr"
                {...register("summary_fr")}
                placeholder="Brief summary in French"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary_ar">Summary (Arabic)</Label>
              <Textarea
                id="summary_ar"
                {...register("summary_ar")}
                placeholder="Brief summary in Arabic"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_fr">Description (French)</Label>
              <Textarea
                id="description_fr"
                {...register("description_fr")}
                placeholder="Full description in French"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_ar">Description (Arabic)</Label>
              <Textarea
                id="description_ar"
                {...register("description_ar")}
                placeholder="Full description in Arabic"
                rows={5}
              />
            </div>
          </div>

          {/* Publish Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              {...register("is_published")}
              className="rounded"
            />
            <Label htmlFor="is_published">Publish immediately</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}