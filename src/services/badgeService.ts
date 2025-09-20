import { supabase } from "../lib/supabase";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "special";
  requirement_type: "count" | "streak" | "special" | "social";
  requirement_value: number;
  requirement_data?: any;
  is_progression: boolean;
  progression_group?: string;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress_data?: any;
  badges?: Badge;
}

export interface BadgeProgress {
  id: string;
  user_id: string;
  progression_group: string;
  current_tier: string;
  progress_value: number;
  last_updated: string;
}

// Get all badges
export const getAllBadges = async (): Promise<Badge[]> => {
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("category", { ascending: true })
    .order("tier", { ascending: true });

  if (error) throw error;
  return data || [];
};

// Get user's earned badges
export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  const { data, error } = await supabase
    .from("user_badges")
    .select(
      `
      *,
      badges (*)
    `
    )
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get user's badge progress
export const getUserBadgeProgress = async (
  userId: string
): Promise<BadgeProgress[]> => {
  const { data, error } = await supabase
    .from("badge_progress")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data || [];
};

// Award a badge to a user
export const awardBadge = async (
  userId: string,
  badgeId: string,
  progressData?: any
): Promise<void> => {
  const { error } = await supabase.from("user_badges").insert({
    user_id: userId,
    badge_id: badgeId,
    progress_data: progressData,
  });

  if (error && error.code !== "23505") {
    // Ignore duplicate key errors
    throw error;
  }
};

// Update badge progress
export const updateBadgeProgress = async (
  userId: string,
  progressionGroup: string,
  progressValue: number,
  currentTier: string
): Promise<void> => {
  const { error } = await supabase.from("badge_progress").upsert({
    user_id: userId,
    progression_group: progressionGroup,
    progress_value: progressValue,
    current_tier: currentTier,
    last_updated: new Date().toISOString(),
  });

  if (error) throw error;
};

// Check and award badges based on user actions
export const checkAndAwardBadges = async (
  userId: string,
  actionType: string,
  actionData: any
): Promise<string[]> => {
  const awardedBadges: string[] = [];

  try {
    // Get user's current badges to avoid duplicates
    const userBadges = await getUserBadges(userId);
    const earnedBadgeIds = userBadges.map((ub) => ub.badge_id);

    // Get all badges
    const allBadges = await getAllBadges();

    // Get user's current progress
    const userProgress = await getUserBadgeProgress(userId);
    const progressMap = new Map(
      userProgress.map((p) => [p.progression_group, p])
    );

    // Check each badge
    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue; // Skip already earned badges

      let shouldAward = false;
      let progressData: any = null;

      switch (badge.requirement_type) {
        case "count":
          shouldAward = await checkCountRequirement(
            userId,
            badge,
            actionType,
            actionData
          );
          break;
        case "streak":
          shouldAward = await checkStreakRequirement(
            userId,
            badge,
            actionType,
            actionData
          );
          break;
        case "special":
          shouldAward = await checkSpecialRequirement(
            userId,
            badge,
            actionType,
            actionData
          );
          break;
        case "social":
          shouldAward = await checkSocialRequirement(
            userId,
            badge,
            actionType,
            actionData
          );
          break;
      }

      if (shouldAward) {
        await awardBadge(userId, badge.id, progressData);
        awardedBadges.push(badge.name);

        // Update progression if it's a progression badge
        if (badge.is_progression && badge.progression_group) {
          const currentProgress = progressMap.get(badge.progression_group);
          const newProgressValue = (currentProgress?.progress_value || 0) + 1;

          await updateBadgeProgress(
            userId,
            badge.progression_group,
            newProgressValue,
            badge.tier
          );
        }
      }
    }

    return awardedBadges;
  } catch (error) {
    console.error("Error checking badges:", error);
    return [];
  }
};

// Check count-based requirements
const checkCountRequirement = async (
  userId: string,
  badge: Badge,
  actionType: string,
  _actionData: any
): Promise<boolean> => {
  switch (badge.category) {
    case "reviewer":
      if (actionType === "review_created") {
        const { data } = await supabase
          .from("ratings")
          .select("id", { count: "exact" })
          .eq("user_id", userId);

        return (data?.length || 0) >= badge.requirement_value;
      }
      break;

    case "explorer":
      if (actionType === "review_created") {
        const { data } = await supabase
          .from("ratings")
          .select("fountain_id")
          .eq("user_id", userId);

        const uniqueFountains = new Set(data?.map((r) => r.fountain_id) || []);
        return uniqueFountains.size >= badge.requirement_value;
      }
      break;

    case "visual":
      if (actionType === "photo_uploaded") {
        // This would need to be implemented when we add fountain photos
        return false;
      }
      break;

    case "social":
      if (actionType === "user_followed") {
        const { data } = await supabase
          .from("users")
          .select("following")
          .eq("id", userId)
          .single();

        return (data?.following?.length || 0) >= badge.requirement_value;
      }
      break;

    case "maintenance":
      if (actionType === "fountain_flagged") {
        // This would need to be implemented when we add fountain status reporting
        return false;
      }
      break;
  }

  return false;
};

// Check streak-based requirements
const checkStreakRequirement = async (
  userId: string,
  badge: Badge,
  actionType: string,
  _actionData: any
): Promise<boolean> => {
  if (actionType === "review_created") {
    // Calculate review streak
    const { data } = await supabase
      .from("ratings")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) return false;

    // Simple streak calculation (could be more sophisticated)
    const streakDays = calculateStreak(data.map((r) => new Date(r.created_at)));

    return streakDays >= badge.requirement_value;
  }

  return false;
};

// Check special requirements
const checkSpecialRequirement = async (
  userId: string,
  badge: Badge,
  actionType: string,
  actionData: any
): Promise<boolean> => {
  switch (badge.name) {
    case "First Sip":
      return actionType === "review_created";

    case "Cartographer":
      return actionType === "fountain_created";

    case "Balanced Judge":
      if (actionType === "review_created") {
        const { data } = await supabase
          .from("ratings")
          .select("coldness, experience, pressure, yum_factor")
          .eq("user_id", userId);

        // Check if user has used all 4 rating categories
        const hasAllCategories = data?.some(
          (review) =>
            review.coldness > 0 &&
            review.experience > 0 &&
            review.pressure > 0 &&
            review.yum_factor > 0
        );

        return hasAllCategories || false;
      }
      break;

    case "Hidden Gem Finder":
      if (actionType === "review_created" && actionData?.fountain_id) {
        // Check if this is the first review for this fountain
        const { data } = await supabase
          .from("ratings")
          .select("id", { count: "exact" })
          .eq("fountain_id", actionData.fountain_id);

        return (data?.length || 0) === 1;
      }
      break;

    case "Ripple Effect":
      if (actionType === "review_created") {
        const { data } = await supabase
          .from("ratings")
          .select("upvotes")
          .eq("user_id", userId);

        const totalUpvotes =
          data?.reduce(
            (sum, review) => sum + (review.upvotes?.length || 0),
            0
          ) || 0;

        return totalUpvotes >= badge.requirement_value;
      }
      break;
  }

  return false;
};

// Check social requirements
const checkSocialRequirement = async (
  userId: string,
  badge: Badge,
  actionType: string,
  _actionData: any
): Promise<boolean> => {
  if (actionType === "user_followed") {
    const { data } = await supabase
      .from("users")
      .select("following")
      .eq("id", userId)
      .single();

    return (data?.following?.length || 0) >= badge.requirement_value;
  }

  if (actionType === "user_followed_back") {
    const { data } = await supabase
      .from("users")
      .select("followers")
      .eq("id", userId)
      .single();

    return (data?.followers?.length || 0) >= badge.requirement_value;
  }

  return false;
};

// Calculate streak days
const calculateStreak = (dates: Date[]): number => {
  if (dates.length === 0) return 0;

  const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    date.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (date.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
