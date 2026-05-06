import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  fetchAllAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  uploadAlbumImages,
  deleteAlbumImage,
  type AlbumRow,
  type AlbumImageRow,
} from "@/services/content";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/albums")({
  component: AlbumsManagement,
});

function AlbumsManagement() {
  // All hooks must be called at the top level, before any conditional returns
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // State hooks
  const [selectedAlbum, setSelectedAlbum] = useState<(AlbumRow & { images: AlbumImageRow[] }) | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title_fr: "", title_ar: "", description_fr: "", description_ar: "", album_date: "", is_published: true });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Query hooks
  const { data: albums, isLoading } = useQuery({
    queryKey: ["all-albums"],
    queryFn: fetchAllAlbums,
  });

  // Mutation hooks
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const album = await createAlbum({
        title_fr: data.title_fr,
        title_ar: data.title_ar || null,
        description_fr: data.description_fr || null,
        description_ar: data.description_ar || null,
        album_date: data.album_date || null,
        is_published: data.is_published,
      });

      // Upload images if any
      if (selectedImages.length > 0) {
        await uploadAlbumImages(album.id, selectedImages, setUploadProgress);
      }

      return album;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["all-albums"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Album created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create album: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!selectedAlbum) return;
      return updateAlbum(selectedAlbum.id, {
        title_fr: data.title_fr,
        title_ar: data.title_ar || null,
        description_fr: data.description_fr || null,
        description_ar: data.description_ar || null,
        album_date: data.album_date || null,
        is_published: data.is_published,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["all-albums"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Album updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update album: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["all-albums"] });
      toast.success("Album deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete album: " + error.message);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ imageId, filePath }: { imageId: string; filePath: string }) =>
      deleteAlbumImage(imageId, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
      queryClient.invalidateQueries({ queryKey: ["all-albums"] });
      toast.success("Image deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete image: " + error.message);
    },
  });

  // Conditional renders based on role and state (AFTER all hooks are declared)
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">403 Forbidden</h1>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setSelectedAlbum(null);
    setFormData({ title_fr: "", title_ar: "", description_fr: "", description_ar: "", album_date: "", is_published: true });
    setSelectedImages([]);
    setUploadProgress(0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    setSelectedImages(imageFiles);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (album: (AlbumRow & { images: AlbumImageRow[] })) => {
    setSelectedAlbum(album);
    setFormData({
      title_fr: album.title_fr,
      title_ar: album.title_ar || "",
      description_fr: album.description_fr || "",
      description_ar: album.description_ar || "",
      album_date: album.album_date || "",
      is_published: album.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title_fr) {
      toast.error("Title (French) is required");
      return;
    }

    if (selectedAlbum) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteAlbum = (album: AlbumRow) => {
    if (confirm("Are you sure you want to delete this album? All images will be deleted.")) {
      deleteMutation.mutate(album.id);
    }
  };

  const handleDeleteImage = (imageId: string, filePath: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImageMutation.mutate({ imageId, filePath });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Albums Management</h1>
          <p className="text-muted-foreground">Manage your photo albums and galleries</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Album
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedAlbum ? "Edit Album" : "Create New Album"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Album Details */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="title_fr">Title (French)</Label>
                    <Input
                      id="title_fr"
                      value={formData.title_fr}
                      onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                      placeholder="Album title in French"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title_ar">Title (Arabic)</Label>
                    <Input
                      id="title_ar"
                      value={formData.title_ar}
                      onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                      placeholder="Album title in Arabic"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="description_fr">Description (French)</Label>
                    <Textarea
                      id="description_fr"
                      value={formData.description_fr}
                      onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                      placeholder="Album description in French"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description_ar">Description (Arabic)</Label>
                    <Textarea
                      id="description_ar"
                      value={formData.description_ar}
                      onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                      placeholder="Album description in Arabic"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="album_date">Album Date</Label>
                    <Input
                      id="album_date"
                      type="date"
                      value={formData.album_date}
                      onChange={(e) => setFormData({ ...formData, album_date: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      />
                      <span className="text-sm font-medium">Published</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="border-t pt-4">
                <Label className="mb-3 block">Upload Images</Label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition"
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Drag images here or click to select</p>
                        <p className="text-sm text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Selected Images Preview */}
                {selectedImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">{selectedImages.length} image(s) selected</p>
                    <div className="grid gap-2 md:grid-cols-3">
                      {selectedImages.map((file, idx) => (
                        <div key={idx} className="relative bg-muted rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-32 object-cover"
                          />
                          <p className="text-xs p-2 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Uploading: {uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Images */}
              {selectedAlbum && selectedAlbum.images && selectedAlbum.images.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="mb-3 block">Existing Images</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {selectedAlbum.images.map((img) => (
                      <div key={img.id} className="relative group bg-muted rounded-lg overflow-hidden">
                        <img
                          src={`https://mopuxulrzctwgestdfvl.supabase.co/storage/v1/object/public/albums/${img.image_url}`}
                          alt={img.caption || "Album image"}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5IDE4QzYuOSAxOCA2IDE3LjEgNiAxNlY0QzYgMi45IDYuOSAyIDggMkgxNkMxNy4xIDIgMTggMi45IDE4IDRWMTJDMTggMTMuMSAxNy4xIDE0IDE2IDE0SDEyQzEwLjkgMTQgMTAgMTMuMSAxMCAxMloiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5IDE4QzYuOSAxOCA2IDE3LjEgNiAxNlY0QzYgMi45IDYuOSAyIDggMkgxNkMxNy4xIDIgMTggMi45IDE4IDRWMTJDMTggMTMuMSAxNy4xIDE0IDE2IDE0SDEyQzEwLjkgMTQgMTAgMTMuMSAxMCAxMloiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5IDE4QzYuOSAxOCA2IDE3LjEgNiAxNlY0QzYgMi45IDYuOSAyIDggMkgxNkMxNy4xIDIgMTggMi45IDE4IDRWMTJDMTggMTMuMSAxNy4xIDE0IDE2IDE0SDEyQzEwLjkgMTQgMTAgMTMuMSAxMCAxMloiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id, img.image_url)}
                          className="absolute top-1 right-1 bg-destructive/90 hover:bg-destructive p-1 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-2 justify-end border-t pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Album"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Albums Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : albums && albums.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Card key={album.id} className="overflow-hidden">
              {album.images && album.images.length > 0 && (
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={`https://mopuxulrzctwgestdfvl.supabase.co/storage/v1/object/public/albums/${album.images[0].image_url}`}
                    alt={album.title_fr}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{album.title_fr}</CardTitle>
                    {album.title_ar && (
                      <p className="text-sm text-muted-foreground mt-1">{album.title_ar}</p>
                    )}
                  </div>
                  <Badge variant={album.is_published ? "default" : "secondary"}>
                    {album.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {album.description_fr && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {album.description_fr}
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  <p>{album.images?.length || 0} image(s)</p>
                  {album.album_date && (
                    <p>{new Date(album.album_date).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(album)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAlbum(album)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No albums yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first album to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
