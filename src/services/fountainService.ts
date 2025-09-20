import { supabase } from "../lib/supabase";

export interface Fountain {
  id: string;
  name: string;
  building: string;
  floor: string;
  latitude: number;
  longitude: number;
  description?: string;
  status: "working" | "bad_filter" | "out_of_order";
  type: "indoor" | "outdoor";
  last_checked?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFountainData {
  name: string;
  building: string;
  floor: string;
  latitude: number;
  longitude: number;
  description?: string;
  status: "working" | "bad_filter" | "out_of_order";
  type: "indoor" | "outdoor";
  last_checked?: string;
  image_url?: string;
}

export interface UpdateFountainData {
  name?: string;
  building?: string;
  floor?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  status?: "working" | "bad_filter" | "out_of_order";
  type?: "indoor" | "outdoor";
  last_checked?: string;
  image_url?: string;
}

// Fetch all fountains
export const getFountains = async (): Promise<Fountain[]> => {
  const { data, error } = await supabase
    .from("fountains")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching fountains:", error);
    throw error;
  }

  return data || [];
};

// Fetch a single fountain by ID
export const getFountain = async (id: string): Promise<Fountain | null> => {
  const { data, error } = await supabase
    .from("fountains")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching fountain:", error);
    throw error;
  }

  return data;
};

// Create a new fountain
export const createFountain = async (
  fountainData: CreateFountainData
): Promise<Fountain> => {
  const { data, error } = await supabase
    .from("fountains")
    .insert([fountainData])
    .select()
    .single();

  if (error) {
    console.error("Error creating fountain:", error);
    throw error;
  }

  return data;
};

// Update a fountain
export const updateFountain = async (
  id: string,
  updates: UpdateFountainData
): Promise<Fountain> => {
  const { data, error } = await supabase
    .from("fountains")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating fountain:", error);
    throw error;
  }

  return data;
};

// Delete a fountain
export const deleteFountain = async (id: string): Promise<void> => {
  const { error } = await supabase.from("fountains").delete().eq("id", id);

  if (error) {
    console.error("Error deleting fountain:", error);
    throw error;
  }
};

// Subscribe to real-time updates
export const subscribeToFountains = (callback: (payload: unknown) => void) => {
  return supabase
    .channel("fountains_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "fountains",
      },
      callback
    )
    .subscribe();
};

// Image upload functions
export const uploadFountainImage = async (
  file: File,
  fountainId: string
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${fountainId}.${fileExt}`;

  const { error } = await supabase.storage
    .from("fountain-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading image:", error);
    throw error;
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("fountain-images").getPublicUrl(fileName);

  return publicUrl;
};

export const deleteFountainImage = async (imageUrl: string): Promise<void> => {
  // Extract filename from URL
  const urlParts = imageUrl.split("/");
  const fileName = urlParts[urlParts.length - 1];

  const { error } = await supabase.storage
    .from("fountain-images")
    .remove([fileName]);

  if (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
