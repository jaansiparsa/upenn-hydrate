import { supabase } from "../lib/supabase";

export interface Drink {
  id: string;
  fountain_id: string;
  user_id: string;
  amount_ml: number;
  consumed_at: string;
  notes?: string;
  duration_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDrinkData {
  fountain_id: string;
  amount_ml: number;
  notes?: string;
  duration_seconds?: number;
  user_id?: string; // Optional - will be set automatically if not provided
}

export const drinksService = {
  // Log a new drink
  async createDrink(drinkData: CreateDrinkData): Promise<Drink> {
    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(
        `Authentication required: ${authError?.message || "No user found"}`
      );
    }

    // Prepare the data with user_id
    const insertData = {
      ...drinkData,
      user_id: drinkData.user_id || user.id, // Use provided user_id or current user's id
    };

    const { data, error } = await supabase
      .from("drinks")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log drink: ${error.message}`);
    }

    return data;
  },

  // Get drinks for a specific fountain
  async getFountainDrinks(fountainId: string): Promise<Drink[]> {
    const { data, error } = await supabase
      .from("drinks")
      .select("*")
      .eq("fountain_id", fountainId)
      .order("consumed_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch fountain drinks: ${error.message}`);
    }

    return data || [];
  },

  // Get drinks for a specific user
  async getUserDrinks(userId: string): Promise<Drink[]> {
    const { data, error } = await supabase
      .from("drinks")
      .select("*")
      .eq("user_id", userId)
      .order("consumed_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user drinks: ${error.message}`);
    }

    return data || [];
  },

  // Get user drinking statistics
  async getUserDrinkingStats(userId: string) {
    const { data, error } = await supabase
      .from("user_drinking_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user drinking stats: ${error.message}`);
    }

    return data;
  },

  // Get fountain usage statistics
  async getFountainUsageStats(fountainId: string) {
    const { data, error } = await supabase
      .from("fountain_usage_stats")
      .select("*")
      .eq("fountain_id", fountainId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch fountain usage stats: ${error.message}`);
    }

    return data;
  },

  // Delete a drink (only own drinks)
  async deleteDrink(drinkId: string): Promise<void> {
    const { error } = await supabase.from("drinks").delete().eq("id", drinkId);

    if (error) {
      throw new Error(`Failed to delete drink: ${error.message}`);
    }
  },

  // Update a drink (only own drinks)
  async updateDrink(
    drinkId: string,
    updates: Partial<CreateDrinkData>
  ): Promise<Drink> {
    const { data, error } = await supabase
      .from("drinks")
      .update(updates)
      .eq("id", drinkId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update drink: ${error.message}`);
    }

    return data;
  },

  // Get user's total water consumption statistics
  async getUserTotalConsumption(userId: string): Promise<{
    total_ml: number;
    total_oz: number;
    total_drinks: number;
    bottles_saved: number;
  }> {
    const { data, error } = await supabase
      .from("drinks")
      .select("amount_ml")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch user consumption: ${error.message}`);
    }

    const total_ml = data?.reduce((sum, drink) => sum + (drink.amount_ml || 0), 0) || 0;
    const total_oz = Math.round(total_ml / 29.5735); // Convert ml to oz
    const total_drinks = data?.length || 0;
    const bottles_saved = Math.round(total_oz / 16); // 16 oz per bottle

    return {
      total_ml,
      total_oz,
      total_drinks,
      bottles_saved,
    };
  },
};
