import { calculateCompatibility } from "./datingService";
import { supabase } from "../lib/supabase";

export interface TopFountain {
  fountain_id: string;
  fountain_name: string;
  building: string;
  floor: string;
  average_rating: number;
  user_rating?: number;
}

export interface PlanDateData {
  user1TopFountains: TopFountain[];
  user2TopFountains: TopFountain[];
  suggestedLocation?: TopFountain;
  compatibilityScore: number;
  user2DisplayName?: string;
}

// Get top-rated fountains for a user
export async function getUserTopFountains(
  userId: string,
  limit: number = 5
): Promise<TopFountain[]> {
  const { data, error } = await supabase
    .from("ratings")
    .select(
      `
      fountain_id,
      fountains:fountain_id (
        name,
        building,
        floor
      ),
      coldness,
      experience,
      pressure,
      yum_factor
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user ratings:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Calculate average rating for each fountain
  const fountainRatings: Record<string, { ratings: number[]; fountain: any }> =
    {};

  data.forEach((rating) => {
    const fountainId = rating.fountain_id;
    const avgRating =
      (rating.coldness +
        rating.experience +
        rating.pressure +
        rating.yum_factor) /
      4;

    if (!fountainRatings[fountainId]) {
      fountainRatings[fountainId] = {
        ratings: [],
        fountain: rating.fountains,
      };
    }
    fountainRatings[fountainId].ratings.push(avgRating);
  });

  // Convert to TopFountain array and sort by average rating
  const topFountains: TopFountain[] = Object.entries(fountainRatings).map(
    ([fountainId, data]) => {
      const averageRating =
        data.ratings.reduce((sum, rating) => sum + rating, 0) /
        data.ratings.length;
      return {
        fountain_id: fountainId,
        fountain_name: data.fountain.name,
        building: data.fountain.building,
        floor: data.fountain.floor,
        average_rating: averageRating,
        user_rating: averageRating,
      };
    }
  );

  return topFountains
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, limit);
}

// Get plan date data for two users
export async function getPlanDateData(
  user1Id: string,
  user2Id: string
): Promise<PlanDateData> {
  try {
    const [user1TopFountains, user2TopFountains, user2Data] = await Promise.all(
      [
        getUserTopFountains(user1Id),
        getUserTopFountains(user2Id),
        supabase
          .from("users")
          .select("display_name")
          .eq("id", user2Id)
          .single(),
      ]
    );

    // Find common fountains or suggest the highest rated fountain
    const user1FountainIds = new Set(
      user1TopFountains.map((f) => f.fountain_id)
    );
    const commonFountains = user2TopFountains.filter((f) =>
      user1FountainIds.has(f.fountain_id)
    );

    let suggestedLocation: TopFountain | undefined;

    if (commonFountains.length > 0) {
      // If they have common fountains, pick the one with highest combined rating
      suggestedLocation = commonFountains.reduce((best, current) => {
        const currentCombinedRating =
          (current.average_rating +
            (user1TopFountains.find(
              (f) => f.fountain_id === current.fountain_id
            )?.average_rating || 0)) /
          2;
        const bestCombinedRating =
          (best.average_rating +
            (user1TopFountains.find((f) => f.fountain_id === best.fountain_id)
              ?.average_rating || 0)) /
          2;
        return currentCombinedRating > bestCombinedRating ? current : best;
      });
    } else {
      // If no common fountains, suggest the highest rated fountain from either user
      const allFountains = [...user1TopFountains, ...user2TopFountains];
      suggestedLocation = allFountains.reduce((best, current) =>
        current.average_rating > best.average_rating ? current : best
      );
    }

    // Calculate compatibility using the same algorithm as hyDATEr
    const compatibilityData = await calculateCompatibility(user1Id, user2Id);
    const compatibilityScore = compatibilityData.overall_compatibility;

    return {
      user1TopFountains,
      user2TopFountains,
      suggestedLocation,
      compatibilityScore,
      user2DisplayName: user2Data.data?.display_name,
    };
  } catch (error) {
    console.error("Error getting plan date data:", error);
    throw error;
  }
}
