import { supabase } from "../lib/supabase";

export interface CompatibilityScore {
  correlation_score: number;
  weighted_similarity_score: number;
  overall_compatibility: number;
  shared_fountains_count: number;
  confidence_score: number;
}

export interface UserRating {
  fountain_id: string;
  coldness: number;
  pressure: number;
  experience: number;
  yum_factor: number;
}

export interface Match {
  user_id: string;
  display_name?: string;
  email?: string;
  total_ratings: number;
  badges: string[];
  compatibility_score: number;
  confidence_score: number;
  shared_fountains_count: number;
  compatibility_breakdown: {
    correlation_score: number;
    weighted_similarity_score: number;
  };
}

// Weight configuration for different rating dimensions
const RATING_WEIGHTS = {
  coldness: 0.3,
  pressure: 0.25,
  experience: 0.25,
  yum_factor: 0.2,
};

// Calculate Pearson correlation coefficient
function calculateCorrelation(
  user1Ratings: number[][],
  user2Ratings: number[][]
): number {
  if (
    user1Ratings.length !== user2Ratings.length ||
    user1Ratings.length === 0
  ) {
    return 0;
  }

  const n = user1Ratings.length;
  let sum1 = 0,
    sum2 = 0,
    sum1Sq = 0,
    sum2Sq = 0,
    pSum = 0;

  for (let i = 0; i < n; i++) {
    const rating1 = user1Ratings[i];
    const rating2 = user2Ratings[i];

    // Calculate average rating for each user's rating
    const avg1 = rating1.reduce((sum, val) => sum + val, 0) / rating1.length;
    const avg2 = rating2.reduce((sum, val) => sum + val, 0) / rating2.length;

    sum1 += avg1;
    sum2 += avg2;
    sum1Sq += avg1 * avg1;
    sum2Sq += avg2 * avg2;
    pSum += avg1 * avg2;
  }

  const num = pSum - (sum1 * sum2) / n;
  const den = Math.sqrt(
    (sum1Sq - (sum1 * sum1) / n) * (sum2Sq - (sum2 * sum2) / n)
  );

  if (den === 0) return 0;

  return num / den;
}

// Calculate weighted similarity score
function calculateWeightedSimilarity(
  user1Ratings: UserRating[],
  user2Ratings: UserRating[]
): number {
  if (user1Ratings.length === 0) return 0;

  let totalWeightedDifference = 0;
  let totalWeight = 0;

  for (let i = 0; i < user1Ratings.length; i++) {
    const rating1 = user1Ratings[i];
    const rating2 = user2Ratings[i];

    // Calculate differences for each dimension
    const coldnessDiff = Math.abs(rating1.coldness - rating2.coldness);
    const pressureDiff = Math.abs(rating1.pressure - rating2.pressure);
    const experienceDiff = Math.abs(rating1.experience - rating2.experience);
    const yumFactorDiff = Math.abs(rating1.yum_factor - rating2.yum_factor);

    // Apply weights
    const weightedDiff =
      coldnessDiff * RATING_WEIGHTS.coldness +
      pressureDiff * RATING_WEIGHTS.pressure +
      experienceDiff * RATING_WEIGHTS.experience +
      yumFactorDiff * RATING_WEIGHTS.yum_factor;

    totalWeightedDifference += weightedDiff;
    totalWeight += 1;
  }

  if (totalWeight === 0) return 0;

  const averageWeightedDifference = totalWeightedDifference / totalWeight;
  const maxPossibleDifference = 4; // Since ratings are 1-5

  return Math.max(0, 1 - averageWeightedDifference / maxPossibleDifference);
}

// Calculate confidence score based on data quality
function calculateConfidenceScore(
  sharedFountainsCount: number,
  correlationScore: number
): number {
  // Base confidence on number of shared fountains
  let confidence = Math.min(sharedFountainsCount / 10, 1); // Max confidence at 10+ shared fountains

  // Adjust based on correlation strength
  const correlationStrength = Math.abs(correlationScore);
  confidence *= 0.5 + correlationStrength * 0.5; // Boost confidence for strong correlations

  return Math.min(confidence, 1);
}

// Calculate compatibility between two users
export async function calculateCompatibility(
  user1Id: string,
  user2Id: string
): Promise<CompatibilityScore> {
  // Get shared fountain ratings for both users
  const { data: user1Ratings, error: error1 } = await supabase
    .from("ratings")
    .select("fountain_id, coldness, pressure, experience, yum_factor")
    .eq("user_id", user1Id);

  const { data: user2Ratings, error: error2 } = await supabase
    .from("ratings")
    .select("fountain_id, coldness, pressure, experience, yum_factor")
    .eq("user_id", user2Id);

  if (error1 || error2) {
    throw new Error("Failed to fetch user ratings");
  }

  // Find shared fountains
  const user1FountainMap = new Map(
    user1Ratings?.map((r) => [r.fountain_id, r]) || []
  );
  const user2FountainMap = new Map(
    user2Ratings?.map((r) => [r.fountain_id, r]) || []
  );

  const sharedFountains = Array.from(user1FountainMap.keys()).filter(
    (fountainId) => user2FountainMap.has(fountainId)
  );

  if (sharedFountains.length === 0) {
    // No shared fountains - return zero compatibility
    return {
      correlation_score: 0,
      weighted_similarity_score: 0,
      overall_compatibility: 0,
      shared_fountains_count: 0,
      confidence_score: 0,
    };
  }

  // Prepare rating arrays for correlation calculation
  const user1RatingArrays: number[][] = [];
  const user2RatingArrays: number[][] = [];
  const user1RatingsForSimilarity: UserRating[] = [];
  const user2RatingsForSimilarity: UserRating[] = [];

  sharedFountains.forEach((fountainId) => {
    const rating1 = user1FountainMap.get(fountainId)!;
    const rating2 = user2FountainMap.get(fountainId)!;

    // For correlation: use all rating dimensions as separate data points
    user1RatingArrays.push([
      rating1.coldness,
      rating1.pressure,
      rating1.experience,
      rating1.yum_factor,
    ]);
    user2RatingArrays.push([
      rating2.coldness,
      rating2.pressure,
      rating2.experience,
      rating2.yum_factor,
    ]);

    // For similarity: use individual ratings
    user1RatingsForSimilarity.push(rating1);
    user2RatingsForSimilarity.push(rating2);
  });

  // Calculate scores
  const correlationScore = calculateCorrelation(
    user1RatingArrays,
    user2RatingArrays
  );
  const weightedSimilarityScore = calculateWeightedSimilarity(
    user1RatingsForSimilarity,
    user2RatingsForSimilarity
  );
  const confidenceScore = calculateConfidenceScore(
    sharedFountains.length,
    correlationScore
  );

  // Combine scores (60% correlation, 40% similarity)
  const overallCompatibility =
    Math.abs(correlationScore) * 0.6 + weightedSimilarityScore * 0.4;

  return {
    correlation_score: correlationScore,
    weighted_similarity_score: weightedSimilarityScore,
    overall_compatibility: overallCompatibility,
    shared_fountains_count: sharedFountains.length,
    confidence_score: confidenceScore,
  };
}

// Get matches for a user (real-time calculation)
export async function getUserMatches(userId: string): Promise<Match[]> {
  // Get all other users who have rated fountains
  const { data: allUsers, error: usersError } = await supabase
    .from("users")
    .select("id, display_name, email, total_ratings, badges")
    .neq("id", userId)
    .gt("total_ratings", 0); // Only users who have rated fountains

  if (usersError) {
    console.error("Error fetching users:", usersError);
    return [];
  }

  if (!allUsers || allUsers.length === 0) {
    return [];
  }

  // Calculate compatibility for each user
  const matches: Match[] = [];

  for (const user of allUsers) {
    try {
      const compatibility = await calculateCompatibility(userId, user.id);

      // Only include matches with minimum compatibility and confidence
      if (
        compatibility.overall_compatibility >= 0.3 &&
        compatibility.confidence_score >= 0.2
      ) {
        matches.push({
          user_id: user.id,
          display_name: user.display_name,
          email: user.email,
          total_ratings: user.total_ratings,
          badges: user.badges,
          compatibility_score: compatibility.overall_compatibility,
          confidence_score: compatibility.confidence_score,
          shared_fountains_count: compatibility.shared_fountains_count,
          compatibility_breakdown: {
            correlation_score: compatibility.correlation_score,
            weighted_similarity_score: compatibility.weighted_similarity_score,
          },
        });
      }
    } catch (error) {
      console.error(
        `Error calculating compatibility with user ${user.id}:`,
        error
      );
    }
  }

  // Sort by compatibility score (highest first)
  return matches.sort((a, b) => b.compatibility_score - a.compatibility_score);
}
