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
    const [user1TopFountains, user2TopFountains] = await Promise.all([
      getUserTopFountains(user1Id),
      getUserTopFountains(user2Id),
    ]);

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

    // Calculate a simple compatibility score based on fountain preferences
    const compatibilityScore = calculateFountainCompatibility(
      user1TopFountains,
      user2TopFountains
    );

    return {
      user1TopFountains,
      user2TopFountains,
      suggestedLocation,
      compatibilityScore,
    };
  } catch (error) {
    console.error("Error getting plan date data:", error);
    throw error;
  }
}

// Calculate compatibility based on fountain rating patterns
function calculateFountainCompatibility(
  user1Fountains: TopFountain[],
  user2Fountains: TopFountain[]
): number {
  if (user1Fountains.length === 0 || user2Fountains.length === 0) {
    return 0;
  }

  // Find common fountains
  const user1FountainIds = new Set(user1Fountains.map((f) => f.fountain_id));
  const commonFountains = user2Fountains.filter((f) =>
    user1FountainIds.has(f.fountain_id)
  );

  if (commonFountains.length === 0) {
    return 0.3; // Low compatibility if no common fountains
  }

  // Calculate correlation for common fountains
  let correlationSum = 0;
  let count = 0;

  commonFountains.forEach((fountain) => {
    const user1Rating =
      user1Fountains.find((f) => f.fountain_id === fountain.fountain_id)
        ?.average_rating || 0;
    const user2Rating = fountain.average_rating;

    // Simple correlation: how close are their ratings?
    const ratingDiff = Math.abs(user1Rating - user2Rating);
    const correlation = Math.max(0, 1 - ratingDiff / 5); // Normalize by max rating difference

    correlationSum += correlation;
    count++;
  });

  const averageCorrelation = correlationSum / count;

  // Boost score if they have many common fountains
  const commonFountainBonus = Math.min(0.3, commonFountains.length * 0.05);

  return Math.min(1, averageCorrelation + commonFountainBonus);
}
