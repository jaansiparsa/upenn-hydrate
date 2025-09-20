import { supabase } from "../lib/supabase";

export interface LeaderboardUser {
  user_id: string;
  display_name: string;
  total_ml_consumed: number;
  total_drinks: number;
  rank: number;
}

export interface LeaderboardFountain {
  fountain_id: string;
  name: string;
  average_rating: number;
  total_reviews: number;
  rank: number;
}

export interface InfluencerUser {
  user_id: string;
  display_name: string;
  total_upvotes: number;
  total_reviews: number;
  rank: number;
}

export type TimeFilter = "week" | "month" | "all_time";

export const leaderboardService = {
  // Helper function to get date filter for queries
  getDateFilter(timeFilter: TimeFilter): string | null {
    const now = new Date();
    switch (timeFilter) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString();
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString();
      case "all_time":
      default:
        return null;
    }
  },

  // Get most hydrated users (by total ml consumed)
  async getMostHydratedUsers(
    limit: number = 10,
    timeFilter: TimeFilter = "all_time"
  ): Promise<LeaderboardUser[]> {
    const dateFilter = this.getDateFilter(timeFilter);

    let query = supabase.from("drinks").select(`
        user_id,
        amount_ml,
        consumed_at
      `);

    // Apply date filter if specified
    if (dateFilter) {
      query = query.gte("consumed_at", dateFilter);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch most hydrated users: ${error.message}`);
    }

    // Group by user and sum amounts
    const userStats =
      data?.reduce((acc, drink) => {
        const userId = drink.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            display_name: `User ${userId.slice(0, 8)}`, // Fallback display name
            total_ml_consumed: 0,
            total_drinks: 0,
          };
        }
        acc[userId].total_ml_consumed += drink.amount_ml || 0;
        acc[userId].total_drinks += 1;
        return acc;
      }, {} as Record<string, LeaderboardUser>) || {};

    // Try to get display names from public.users table
    const userIds = Object.keys(userStats);
    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from("users")
        .select("id, display_name")
        .in("id", userIds);

      // Update display names if found
      usersData?.forEach((user) => {
        if (userStats[user.id]) {
          userStats[user.id].display_name = user.display_name;
        }
      });
    }

    // Convert to array and sort by total ml consumed
    const sortedUsers = Object.values(userStats)
      .sort((a, b) => b.total_ml_consumed - a.total_ml_consumed)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    return sortedUsers;
  },

  // Get water influencers (users with most upvotes on their reviews)
  async getWaterInfluencers(
    limit: number = 10,
    timeFilter: TimeFilter = "all_time"
  ): Promise<InfluencerUser[]> {
    const dateFilter = this.getDateFilter(timeFilter);

    let query = supabase
      .from("ratings")
      .select(
        `
        user_id,
        upvotes,
        created_at,
        users!inner(display_name)
      `
      )
      .not("upvotes", "is", null);

    // Apply date filter if specified
    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch water influencers: ${error.message}`);
    }

    // Group by user and count upvotes (length of upvotes array)
    const userStats =
      data?.reduce((acc, rating) => {
        const userId = rating.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            display_name: rating.users.display_name,
            total_upvotes: 0,
            total_reviews: 0,
          };
        }
        // Count the number of people who upvoted this rating
        acc[userId].total_upvotes += (rating.upvotes || []).length;
        acc[userId].total_reviews += 1;
        return acc;
      }, {} as Record<string, InfluencerUser>) || {};

    // Convert to array and sort by total upvotes
    const sortedUsers = Object.values(userStats)
      .sort((a, b) => b.total_upvotes - a.total_upvotes)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    return sortedUsers;
  },

  // Get best fountains (by average rating)
  async getBestFountains(
    limit: number = 10,
    timeFilter: TimeFilter = "all_time"
  ): Promise<LeaderboardFountain[]> {
    const dateFilter = this.getDateFilter(timeFilter);

    let query = supabase.from("ratings").select(`
        fountain_id,
        coldness,
        experience,
        pressure,
        yum_factor,
        created_at,
        fountains!inner(name)
      `);

    // Apply date filter if specified
    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch fountain ratings: ${error.message}`);
    }

    // Group by fountain and calculate average ratings
    const fountainStats =
      data?.reduce((acc, rating) => {
        const fountainId = rating.fountain_id;
        if (!acc[fountainId]) {
          acc[fountainId] = {
            fountain_id: fountainId,
            name: rating.fountains.name,
            ratings: [],
          };
        }
        acc[fountainId].ratings.push(rating);
        return acc;
      }, {} as Record<string, any>) || {};

    // Calculate average ratings for each fountain
    const fountainAverages = Object.values(fountainStats).map(
      (fountain: any) => {
        const ratings = fountain.ratings;
        const avgColdness =
          ratings.reduce((sum: number, r: any) => sum + r.coldness, 0) /
          ratings.length;
        const avgExperience =
          ratings.reduce((sum: number, r: any) => sum + r.experience, 0) /
          ratings.length;
        const avgPressure =
          ratings.reduce((sum: number, r: any) => sum + r.pressure, 0) /
          ratings.length;
        const avgYumFactor =
          ratings.reduce((sum: number, r: any) => sum + r.yum_factor, 0) /
          ratings.length;

        // Calculate overall average
        const averageRating =
          (avgColdness + avgExperience + avgPressure + avgYumFactor) / 4;

        return {
          fountain_id: fountain.fountain_id,
          name: fountain.name,
          average_rating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
          total_reviews: ratings.length,
        };
      }
    );

    // Sort by average rating and add rank
    const sortedFountains = fountainAverages
      .sort((a, b) => b.average_rating - a.average_rating)
      .slice(0, limit)
      .map((fountain, index) => ({
        ...fountain,
        rank: index + 1,
      }));

    return sortedFountains;
  },
};
