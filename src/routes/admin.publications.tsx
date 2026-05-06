import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Upload, X, FileText, Loader2 } from "lucide-react";
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
  fetchPublications,
  createPublication,
  updatePublication,
  deletePublication,
  uploadPublicationPDF,
  deletePublicationPDF,
  type PublicationRow,
} from "@/services/content";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/publications")({
  component: PublicationsManagement,
});

function PublicationsManagement() {
  // All hooks must be called at the top level, before any conditional returns
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // State hooks
  const [selectedPub, setSelectedPub] = useState<PublicationRow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title_fr: "",
    title_ar: "",
    authors: "",
    abstract_fr: "",
    abstract_ar: "",
    publication_year: new Date().getFullYear(),
    is_published: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Query hooks
  const { data: publications, isLoading } = useQuery({
    queryKey: ["publications-all"],
    queryFn: fetchPublications,
  });

  // Mutation hooks
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let pdfPath: string | null = null;

      // Upload PDF if provided
      if (selectedFile) {
        setUploading(true);
        pdfPath = await uploadPublicationPDF("temp", selectedFile);
      }

      return createPublication({
        title_fr: data.title_fr,
        title_ar: data.title_ar || null,
        authors: data.authors || null,
        abstract_fr: data.abstract_fr || null,
        abstract_ar: data.abstract_ar || null,
        pdf_url: pdfPath || null,
        publication_year: data.publication_year || null,
        is_published: data.is_published,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      queryClient.invalidateQueries({ queryKey: ["publications-all"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Publication created successfully");
      setUploading(false);
    },
    onError: (error) => {
      toast.error("Failed to create publication: " + error.message);
      setUploading(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!selectedPub) return;

      let pdfPath = selectedPub.pdf_url;

      // Upload new PDF if provided
      if (selectedFile) {
        setUploading(true);
        // Delete old PDF if exists
        if (selectedPub.pdf_url) {
          await deletePublicationPDF(selectedPub.pdf_url).catch(() => {});
        }
        pdfPath = await uploadPublicationPDF(selectedPub.id, selectedFile);
      }

      return updatePublication(selectedPub.id, {
        title_fr: data.title_fr,
        title_ar: data.title_ar || null,
        authors: data.authors || null,
        abstract_fr: data.abstract_fr || null,
        abstract_ar: data.abstract_ar || null,
        pdf_url: pdfPath || null,
        publication_year: data.publication_year || null,
        is_published: data.is_published,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      queryClient.invalidateQueries({ queryKey: ["publications-all"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Publication updated successfully");
      setUploading(false);
    },
    onError: (error) => {
      toast.error("Failed to update publication: " + error.message);
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (pub: PublicationRow) => {
      // Delete PDF from storage if exists
      if (pub.pdf_url) {
        await deletePublicationPDF(pub.pdf_url).catch(() => {});
      }
      return deletePublication(pub.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      queryClient.invalidateQueries({ queryKey: ["publications-all"] });
      toast.success("Publication deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete publication: " + error.message);
    },
  });

  // Conditional renders based on role (AFTER all hooks are declared)
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
    setSelectedPub(null);
    setFormData({
      title_fr: "",
      title_ar: "",
      authors: "",
      abstract_fr: "",
      abstract_ar: "",
      publication_year: new Date().getFullYear(),
      is_published: true,
    });
    setSelectedFile(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (pub: PublicationRow) => {
    setSelectedPub(pub);
    setFormData({
      title_fr: pub.title_fr,
      title_ar: pub.title_ar || "",
      authors: pub.authors || "",
      abstract_fr: pub.abstract_fr || "",
      abstract_ar: pub.abstract_ar || "",
      publication_year: pub.publication_year || new Date().getFullYear(),
      is_published: pub.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title_fr) {
      toast.error("Title (French) is required");
      return;
    }

    if (selectedPub) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeletePub = (pub: PublicationRow) => {
    if (confirm("Are you sure you want to delete this publication?")) {
      deleteMutation.mutate(pub);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publications Management</h1>
          <p className="text-muted-foreground">Manage your research publications and papers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Publication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPub ? "Edit Publication" : "Add New Publication"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Publication Details */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="title_fr">Title (French)</Label>
                    <Input
                      id="title_fr"
                      value={formData.title_fr}
                      onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                      placeholder="Publication title in French"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title_ar">Title (Arabic)</Label>
                    <Input
                      id="title_ar"
                      value={formData.title_ar}
                      onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                      placeholder="Publication title in Arabic"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="authors">Authors</Label>
                  <Input
                    id="authors"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    placeholder="Author names separated by comma"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="abstract_fr">Abstract (French)</Label>
                    <Textarea
                      id="abstract_fr"
                      value={formData.abstract_fr}
                      onChange={(e) => setFormData({ ...formData, abstract_fr: e.target.value })}
                      placeholder="Abstract in French"
                    />
                  </div>
                  <div>
                    <Label htmlFor="abstract_ar">Abstract (Arabic)</Label>
                    <Textarea
                      id="abstract_ar"
                      value={formData.abstract_ar}
                      onChange={(e) => setFormData({ ...formData, abstract_ar: e.target.value })}
                      placeholder="Abstract in Arabic"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="publication_year">Publication Year</Label>
                    <Input
                      id="publication_year"
                      type="number"
                      value={formData.publication_year}
                      onChange={(e) => setFormData({ ...formData, publication_year: parseInt(e.target.value) })}
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

              {/* PDF Upload */}
              <div className="border-t pt-4">
                <Label className="mb-3 block">PDF File</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition">
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Click to upload PDF or drag and drop</p>
                        <p className="text-sm text-muted-foreground">PDF up to 50MB</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Selected File Display */}
                {selectedFile && (
                  <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm truncate">{selectedFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Current PDF Display */}
                {selectedPub?.pdf_url && !selectedFile && (
                  <div className="mt-4 p-3 bg-green-500/10 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm">PDF uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedPub.pdf_url) {
                          deletePublicationPDF(selectedPub.pdf_url).catch(() => {});
                          setSelectedPub({
                            ...selectedPub,
                            pdf_url: null,
                          });
                        }
                      }}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Uploading PDF...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-2 justify-end border-t pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending || uploading}
                >
                  {createMutation.isPending || updateMutation.isPending || uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Publication"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Publications List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : publications && publications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publications.map((pub) => (
            <Card key={pub.id} className="overflow-hidden flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">{pub.title_fr}</CardTitle>
                    {pub.title_ar && (
                      <p className="text-xs text-muted-foreground mt-1">{pub.title_ar}</p>
                    )}
                  </div>
                  <Badge variant={pub.is_published ? "default" : "secondary"}>
                    {pub.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                {pub.authors && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Authors:</span> {pub.authors}
                  </p>
                )}
                {pub.abstract_fr && (
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {pub.abstract_fr}
                  </p>
                )}
                {pub.publication_year && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Year:</span> {pub.publication_year}
                  </p>
                )}
                {pub.pdf_url && (
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <FileText className="h-3 w-3" />
                    PDF attached
                  </div>
                )}
                <div className="flex gap-2 pt-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(pub)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePub(pub)}
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
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No publications yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first publication to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
