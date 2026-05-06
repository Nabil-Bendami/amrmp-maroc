import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type PublicationRow = Database["public"]["Tables"]["publications"]["Row"];
export type AlbumRow = Database["public"]["Tables"]["albums"]["Row"];
export type AlbumImageRow = Database["public"]["Tables"]["album_images"]["Row"];
export type AnalyticsRow = Database["public"]["Tables"]["analytics"]["Row"];
export type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"];
export type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];

export async function fetchEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPublications(): Promise<PublicationRow[]> {
  const { data, error } = await supabase
    .from("publications")
    .select("*")
    .eq("is_published", true)
    .order("publication_year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAlbums(): Promise<(AlbumRow & { images: AlbumImageRow[] })[]> {
  const { data, error } = await supabase
    .from("albums")
    .select("*, images:album_images(*)")
    .eq("is_published", true)
    .order("album_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as (AlbumRow & { images: AlbumImageRow[] })[];
}

export async function fetchAnalytics(): Promise<AnalyticsRow[]> {
  const { data, error } = await supabase
    .from("analytics")
    .select("*")
    .order("date", { ascending: false })
    .limit(7);
  if (error) throw error;
  return data ?? [];
}

export async function fetchTeamMembers(): Promise<TeamMemberRow[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPartners(): Promise<PartnerRow[]> {
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPartner(partner: Database["public"]["Tables"]["partners"]["Insert"]): Promise<PartnerRow> {
  const { data, error } = await supabase
    .from("partners")
    .insert(partner)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePartner(id: string, partner: Database["public"]["Tables"]["partners"]["Update"]): Promise<PartnerRow> {
  const { data, error } = await supabase
    .from("partners")
    .update(partner)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePartner(id: string): Promise<void> {
  const { error } = await supabase
    .from("partners")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function createEvent(event: Database["public"]["Tables"]["events"]["Insert"]): Promise<EventRow> {
  const { data, error } = await supabase
    .from("events")
    .insert(event)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, event: Database["public"]["Tables"]["events"]["Update"]): Promise<EventRow> {
  const { data, error } = await supabase
    .from("events")
    .update(event)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function createPublication(pub: Database["public"]["Tables"]["publications"]["Insert"]): Promise<PublicationRow> {
  const { data, error } = await supabase
    .from("publications")
    .insert(pub)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePublication(id: string, pub: Database["public"]["Tables"]["publications"]["Update"]): Promise<PublicationRow> {
  const { data, error } = await supabase
    .from("publications")
    .update(pub)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePublication(id: string): Promise<void> {
  const { error } = await supabase
    .from("publications")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function createTeamMember(member: Database["public"]["Tables"]["team_members"]["Insert"]): Promise<TeamMemberRow> {
  const { data, error } = await supabase
    .from("team_members")
    .insert(member)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTeamMember(id: string, member: Database["public"]["Tables"]["team_members"]["Update"]): Promise<TeamMemberRow> {
  const { data, error } = await supabase
    .from("team_members")
    .update(member)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTeamMember(id: string): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// Album CRUD Functions
export async function fetchAllAlbums(): Promise<(AlbumRow & { images: AlbumImageRow[] })[]> {
  const { data, error } = await supabase
    .from("albums")
    .select("*, images:album_images(*)")
    .order("album_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as (AlbumRow & { images: AlbumImageRow[] })[];
}

export async function createAlbum(album: Database["public"]["Tables"]["albums"]["Insert"]): Promise<AlbumRow> {
  const { data, error } = await supabase
    .from("albums")
    .insert(album)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAlbum(id: string, album: Database["public"]["Tables"]["albums"]["Update"]): Promise<AlbumRow> {
  const { data, error } = await supabase
    .from("albums")
    .update(album)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAlbum(id: string): Promise<void> {
  try {
    // First, fetch all images in the album to delete from storage
    const { data: images, error: fetchError } = await supabase
      .from('album_images')
      .select('image_url')
      .eq('album_id', id);

    if (fetchError) throw fetchError;

    // Delete images from storage
    if (images && images.length > 0) {
      const filePaths = images.map(img => img.image_url);
      const { error: storageError } = await supabase.storage
        .from('albums')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting images from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete the album from database (cascade will delete album_images)
    const { error: dbError } = await supabase
      .from('albums')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error deleting album:', error);
    throw error;
  }
}

// Album Image Upload & Management
export async function uploadAlbumImages(
  albumId: string,
  files: File[],
  onProgress?: (progress: number) => void
): Promise<AlbumImageRow[]> {
  const uploadedImages: AlbumImageRow[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${albumId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = fileName;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('albums')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create album_images record with the file path
      const { data: imageRecord, error: recordError } = await supabase
        .from('album_images')
        .insert({
          album_id: albumId,
          image_url: filePath,
          sort_order: i,
        })
        .select()
        .single();

      if (recordError) throw recordError;
      uploadedImages.push(imageRecord);

      // Update progress
      if (onProgress) {
        onProgress(Math.round(((i + 1) / files.length) * 100));
      }
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw error;
    }
  }

  return uploadedImages;
}

export async function deleteAlbumImage(imageId: string, filePath: string): Promise<void> {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('albums')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('album_images')
      .delete()
      .eq('id', imageId);

    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

// Publication PDF Upload
export async function uploadPublicationPDF(
  publicationId: string,
  file: File
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${publicationId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = fileName;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('publications')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    return filePath;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
}

export async function deletePublicationPDF(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('publications')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting PDF:', error);
    throw error;
  }
}
