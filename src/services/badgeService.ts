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
  requirement_data?: Record<string, unknown>;
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
  progress_data?: Record<string, unknown>;
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

// Get user badges from the existing users.badges column
export const getUserBadgesFromUsersTable = async (
  userId: string
): Promise<UserBadge[]> => {
  try {
    const { data: userData, error } = await supabase
      .from("users")
      .select("badges")
      .eq("id", userId)
      .single();

    if (error || !userData?.badges) {
      return [];
    }

    const badgeNames = userData.badges as string[];

    // Create mock UserBadge objects for the existing badges
    const userBadges: UserBadge[] = badgeNames.map((badgeName) => ({
      id: `mock-${userId}-${badgeName}`,
      user_id: userId,
      badge_id: `mock-badge-${badgeName}`,
      earned_at: new Date().toISOString(),
      progress_data: undefined,
      badges: {
        id: `mock-badge-${badgeName}`,
        name: getBadgeDisplayName(badgeName),
        description: getBadgeDescription(badgeName),
        icon: getBadgeIcon(badgeName),
        category: getBadgeCategory(badgeName),
        tier: getBadgeTier(badgeName),
        requirement_type: "count" as const,
        requirement_value: 1,
        requirement_data: undefined,
        is_progression: false,
        progression_group: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));

    return userBadges;
  } catch (error) {
    console.error("Error fetching badges from users table:", error);
    return [];
  }
};

// Helper functions to map old badge names to display data
const getBadgeDisplayName = (badgeName: string): string => {
  const mapping: Record<string, string> = {
    new_reviewer: "New Reviewer",
    frequent_reviewer: "Frequent Reviewer",
    quality_reviewer: "Quality Reviewer",
    helpful_reviewer: "Helpful Reviewer",
    review_machine: "Review Machine",
    critic_master: "Critic Master",
    first_sip: "First Sip",
    cartographer: "Cartographer",
    balanced_judge: "Balanced Judge",
    hidden_gem_finder: "Hidden Gem Finder",
    perfectionist: "Perfectionist",
    generous_giver: "Generous Giver",
    harsh_critic: "Harsh Critic",
    optimist: "Optimist",
    realist: "Realist",
    pessimist: "Pessimist",
    midnight_hydrator: "Midnight Hydrator",
    early_bird_drinker: "Early Bird Drinker",
    lunch_break_legend: "Lunch Break Legend",
    emoji_expert: "Emoji Expert",
    caps_lock_crazy: "Caps Lock Crazy",
    punctuation_perfectionist: "Punctuation Perfectionist",
    review_poet: "Review Poet",
    century_club: "Century Club",
    millennium_member: "Millennium Member",
  };
  return (
    mapping[badgeName] ||
    badgeName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

const getBadgeDescription = (badgeName: string): string => {
  const mapping: Record<string, string> = {
    new_reviewer: "You've written your first review!",
    frequent_reviewer: "You're becoming a regular reviewer",
    quality_reviewer: "Your reviews are detailed and helpful",
    helpful_reviewer: "Your reviews help other users",
    review_machine: "You've written many reviews",
    critic_master: "You're a master reviewer",
    first_sip: "You've taken your first sip and left a review",
    cartographer: "You've added a new fountain to the map",
    balanced_judge: "You use all rating categories thoughtfully",
    hidden_gem_finder: "You found a hidden gem fountain",
    perfectionist: "You consistently give high ratings",
    generous_giver: "You're generous with your ratings",
    harsh_critic: "You're a tough critic",
    optimist: "You see the positive in everything",
    realist: "You give balanced, realistic ratings",
    pessimist: "You tend to be critical",
    midnight_hydrator: "You review fountains late at night",
    early_bird_drinker: "You're an early morning reviewer",
    lunch_break_legend: "You review during lunch breaks",
    emoji_expert: "You love using emojis in reviews",
    caps_lock_crazy: "You're enthusiastic with CAPS LOCK",
    punctuation_perfectionist: "You're meticulous with punctuation",
    review_poet: "You write beautiful, detailed reviews",
    century_club: "You've written 100+ reviews",
    millennium_member: "You've written 1000+ reviews",
  };
  return mapping[badgeName] || `You've earned the ${badgeName} badge!`;
};

const getBadgeIcon = (badgeName: string): string => {
  const mapping: Record<string, string> = {
    new_reviewer: "🌟",
    frequent_reviewer: "⭐",
    quality_reviewer: "💎",
    helpful_reviewer: "🤝",
    review_machine: "🤖",
    critic_master: "👑",
    first_sip: "💧",
    cartographer: "🗺️",
    balanced_judge: "⚖️",
    hidden_gem_finder: "💎",
    perfectionist: "✨",
    generous_giver: "🎁",
    harsh_critic: "🔥",
    optimist: "😊",
    realist: "🎯",
    pessimist: "😔",
    midnight_hydrator: "🌙",
    early_bird_drinker: "🌅",
    lunch_break_legend: "🍽️",
    emoji_expert: "😀",
    caps_lock_crazy: "🔊",
    punctuation_perfectionist: "📝",
    review_poet: "📖",
    century_club: "💯",
    millennium_member: "🏆",
  };
  return mapping[badgeName] || "🏆";
};

const getBadgeCategory = (badgeName: string): string => {
  const mapping: Record<string, string> = {
    new_reviewer: "reviewer",
    frequent_reviewer: "reviewer",
    quality_reviewer: "reviewer",
    helpful_reviewer: "reviewer",
    review_machine: "reviewer",
    critic_master: "reviewer",
    first_sip: "beginner",
    cartographer: "beginner",
    balanced_judge: "quality",
    hidden_gem_finder: "special",
    perfectionist: "rating_pattern",
    generous_giver: "rating_pattern",
    harsh_critic: "rating_pattern",
    optimist: "rating_pattern",
    realist: "rating_pattern",
    pessimist: "rating_pattern",
    midnight_hydrator: "time_based",
    early_bird_drinker: "time_based",
    lunch_break_legend: "time_based",
    emoji_expert: "personality",
    caps_lock_crazy: "personality",
    punctuation_perfectionist: "personality",
    review_poet: "personality",
    century_club: "achievement",
    millennium_member: "achievement",
  };
  return mapping[badgeName] || "special";
};

const getBadgeTier = (
  badgeName: string
): "bronze" | "silver" | "gold" | "platinum" | "special" => {
  const mapping: Record<
    string,
    "bronze" | "silver" | "gold" | "platinum" | "special"
  > = {
    new_reviewer: "bronze",
    frequent_reviewer: "silver",
    quality_reviewer: "silver",
    helpful_reviewer: "gold",
    review_machine: "gold",
    critic_master: "platinum",
    first_sip: "special",
    cartographer: "special",
    balanced_judge: "gold",
    hidden_gem_finder: "special",
    perfectionist: "gold",
    generous_giver: "silver",
    harsh_critic: "silver",
    optimist: "bronze",
    realist: "silver",
    pessimist: "bronze",
    midnight_hydrator: "bronze",
    early_bird_drinker: "bronze",
    lunch_break_legend: "silver",
    emoji_expert: "bronze",
    caps_lock_crazy: "bronze",
    punctuation_perfectionist: "silver",
    review_poet: "gold",
    century_club: "platinum",
    millennium_member: "special",
  };
  return mapping[badgeName] || "bronze";
};

// Enhanced getUserBadges that works with existing database structure
export const getUserBadgesWithMigration = async (
  userId: string
): Promise<UserBadge[]> => {
  // Since user_badges table doesn't exist, use the users.badges column
  return await getUserBadgesFromUsersTable(userId);
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
  progressData?: Record<string, unknown>
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
  actionData: Record<string, unknown>
): Promise<string[]> => {
  const awardedBadges: string[] = [];

  try {
    // Get user's current badges to avoid duplicates
    const userBadges = await getUserBadgesFromUsersTable(userId);
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
      const progressData: Record<string, unknown> | null = null;

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
        await awardBadge(userId, badge.id, progressData || undefined);
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
  actionData: Record<string, unknown>
): Promise<boolean> => {
  // Mark actionData as used to avoid TypeScript error
  void actionData;
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

// Helper function to calculate streak
const calculateStreak = (dates: Date[]): number => {
  if (dates.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    currentDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (currentDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// Check streak-based requirements
const checkStreakRequirement = async (
  userId: string,
  badge: Badge,
  actionType: string,
  actionData: Record<string, unknown>
): Promise<boolean> => {
  // Mark actionData as used to avoid TypeScript error
  void actionData;
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
  actionData: Record<string, unknown>
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
  actionData: Record<string, unknown>
): Promise<boolean> => {
  // Mark actionData as used to avoid TypeScript error
  void actionData;
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

// Enhanced badge checking for review-based badges
export const checkReviewBasedBadges = async (
  userId: string,
  reviewData: Record<string, unknown>
): Promise<string[]> => {
  const awardedBadges: string[] = [];

  try {
    // Get user's current badges to avoid duplicates
    const userBadges = await getUserBadgesFromUsersTable(userId);
    const earnedBadgeIds = userBadges.map((ub) => ub.badge_id);

    // Get all badges
    const allBadges = await getAllBadges();

    // Check each badge for review-based criteria
    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let shouldAward = false;

      // Check specific badge types
      switch (badge.name) {
        // === REVIEWER BADGES ===
        case "New Reviewer":
          shouldAward = await checkNewReviewerBadge(userId);
          break;
        case "Frequent Reviewer":
          shouldAward = await checkFrequentReviewerBadge(userId);
          break;
        case "Quality Reviewer":
          shouldAward = await checkQualityReviewerBadge(userId);
          break;
        case "Review Machine":
          shouldAward = await checkReviewMachineBadge(userId);
          break;
        case "Critic Master":
          shouldAward = await checkCriticMasterBadge(userId);
          break;

        // === SPECIALTY BADGES ===
        case "First Sip":
          shouldAward = await checkFirstSipBadge(userId);
          break;
        case "Balanced Judge":
          shouldAward = await checkBalancedJudgeBadge(userId);
          break;
        case "Hidden Gem Finder":
          shouldAward = await checkHiddenGemFinderBadge(
            reviewData.fountain_id as string
          );
          break;

        // === RATING PATTERN BADGES ===
        case "Perfectionist":
          shouldAward = await checkPerfectionistBadge(userId);
          break;
        case "Generous Giver":
          shouldAward = await checkGenerousGiverBadge(userId);
          break;
        case "Harsh Critic":
          shouldAward = await checkHarshCriticBadge(userId);
          break;
        case "Optimist":
          shouldAward = await checkOptimistBadge(userId);
          break;
        case "Realist":
          shouldAward = await checkRealistBadge(userId);
          break;
        case "Pessimist":
          shouldAward = await checkPessimistBadge(userId);
          break;

        // === TIME-BASED BADGES ===
        case "Midnight Hydrator":
          shouldAward = await checkMidnightHydratorBadge(userId);
          break;
        case "Early Bird Drinker":
          shouldAward = await checkEarlyBirdDrinkerBadge(userId);
          break;
        case "Lunch Break Legend":
          shouldAward = await checkLunchBreakLegendBadge(userId);
          break;

        // === PERSONALITY BADGES ===
        case "Emoji Expert":
          shouldAward = await checkEmojiExpertBadge(userId);
          break;
        case "Caps Lock Crazy":
          shouldAward = await checkCapsLockCrazyBadge(userId);
          break;
        case "Punctuation Perfectionist":
          shouldAward = await checkPunctuationPerfectionistBadge(userId);
          break;
        case "Review Poet":
          shouldAward = await checkReviewPoetBadge(userId);
          break;

        // === ACHIEVEMENT BADGES ===
        case "Century Club":
          shouldAward = await checkCenturyClubBadge(userId);
          break;
        case "Millennium Member":
          shouldAward = await checkMillenniumMemberBadge(userId);
          break;
      }

      if (shouldAward) {
        await awardBadge(userId, badge.id);
        awardedBadges.push(badge.name);
      }
    }

    return awardedBadges;
  } catch (error) {
    console.error("Error checking review-based badges:", error);
    return [];
  }
};

// === REVIEWER BADGE CHECKS ===
const checkNewReviewerBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  return (data?.length || 0) >= 1;
};

const checkFrequentReviewerBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  return (data?.length || 0) >= 10;
};

const checkQualityReviewerBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("comment")
    .eq("user_id", userId)
    .not("comment", "is", null);

  const detailedReviews =
    data?.filter((review) => review.comment && review.comment.length >= 50) ||
    [];

  return detailedReviews.length >= 5;
};

const checkReviewMachineBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  return (data?.length || 0) >= 50;
};

const checkCriticMasterBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  return (data?.length || 0) >= 100;
};

// === SPECIALTY BADGE CHECKS ===
const checkFirstSipBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  return (data?.length || 0) >= 1;
};

const checkBalancedJudgeBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("coldness, experience, pressure, yum_factor")
    .eq("user_id", userId);

  // Check if user has used all 4 rating categories in at least one review
  const hasAllCategories = data?.some(
    (review) =>
      review.coldness > 0 &&
      review.experience > 0 &&
      review.pressure > 0 &&
      review.yum_factor > 0
  );

  return hasAllCategories || false;
};

const checkHiddenGemFinderBadge = async (
  fountainId: string
): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("id", { count: "exact" })
    .eq("fountain_id", fountainId);

  return (data?.length || 0) === 1; // First review for this fountain
};

// === RATING PATTERN BADGE CHECKS ===
const checkPerfectionistBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("coldness, experience, pressure, yum_factor")
    .eq("user_id", userId);

  if (!data || data.length < 5) return false;

  // Check if user consistently gives high ratings (4-5 stars)
  const perfectReviews = data.filter(
    (review) =>
      review.coldness >= 4 &&
      review.experience >= 4 &&
      review.pressure >= 4 &&
      review.yum_factor >= 4
  );

  return perfectReviews.length / data.length >= 0.8; // 80% perfect reviews
};

const checkGenerousGiverBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("coldness, experience, pressure, yum_factor")
    .eq("user_id", userId);

  if (!data || data.length < 10) return false;

  // Check if user gives mostly high ratings
  const allRatings = data.flatMap((review) => [
    review.coldness,
    review.experience,
    review.pressure,
    review.yum_factor,
  ]);

  const highRatings = allRatings.filter((rating) => rating >= 4);
  return highRatings.length / allRatings.length >= 0.7; // 70% high ratings
};

const checkHarshCriticBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("coldness, experience, pressure, yum_factor")
    .eq("user_id", userId);

  if (!data || data.length < 10) return false;

  // Check if user gives mostly low ratings
  const allRatings = data.flatMap((review) => [
    review.coldness,
    review.experience,
    review.pressure,
    review.yum_factor,
  ]);

  const lowRatings = allRatings.filter((rating) => rating <= 2);
  return lowRatings.length / allRatings.length >= 0.6; // 60% low ratings
};

const checkOptimistBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("coldness, experience, pressure, yum_factor")
    .eq("user_id", userId);

  if (!data || data.length < 5) return false;

  // Check if user's yum_factor is consistently higher than other ratings
  const optimisticReviews = data.filter(
    (review) =>
      review.yum_factor >
      Math.max(review.coldness, review.experience, review.pressure)
  );

  return optimisticReviews.length / data.length >= 0.6; // 60% optimistic reviews
};

const checkRealistBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("coldness, experience, pressure, yum_factor")
    .eq("user_id", userId);

  if (!data || data.length < 10) return false;

  // Check if user's ratings are balanced and realistic
  const balancedReviews = data.filter((review) => {
    const ratings = [
      review.coldness,
      review.experience,
      review.pressure,
      review.yum_factor,
    ];
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const variance =
      ratings.reduce((sum, rating) => sum + Math.pow(rating - avg, 2), 0) /
      ratings.length;
    return variance <= 1; // Low variance = balanced ratings
  });

  return balancedReviews.length / data.length >= 0.7; // 70% balanced reviews
};

const checkPessimistBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("coldness, experience, pressure, yum_factor")
    .eq("user_id", userId);

  if (!data || data.length < 5) return false;

  // Check if user's yum_factor is consistently lower than other ratings
  const pessimisticReviews = data.filter(
    (review) =>
      review.yum_factor <
      Math.min(review.coldness, review.experience, review.pressure)
  );

  return pessimisticReviews.length / data.length >= 0.6; // 60% pessimistic reviews
};

// === TIME-BASED BADGE CHECKS ===
const checkMidnightHydratorBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("created_at")
    .eq("user_id", userId);

  if (!data || data.length === 0) return false;

  // Check if user has reviews between 11 PM and 2 AM
  const midnightReviews = data.filter((review) => {
    const hour = new Date(review.created_at).getHours();
    return hour >= 23 || hour <= 2;
  });

  return midnightReviews.length >= 3;
};

const checkEarlyBirdDrinkerBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("created_at")
    .eq("user_id", userId);

  if (!data || data.length === 0) return false;

  // Check if user has reviews between 6 AM and 9 AM
  const earlyReviews = data.filter((review) => {
    const hour = new Date(review.created_at).getHours();
    return hour >= 6 && hour <= 9;
  });

  return earlyReviews.length >= 5;
};

const checkLunchBreakLegendBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("created_at")
    .eq("user_id", userId);

  if (!data || data.length === 0) return false;

  // Check if user has reviews between 11 AM and 2 PM
  const lunchReviews = data.filter((review) => {
    const hour = new Date(review.created_at).getHours();
    return hour >= 11 && hour <= 14;
  });

  return lunchReviews.length >= 10;
};

// === PERSONALITY BADGE CHECKS ===
const checkEmojiExpertBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("comment")
    .eq("user_id", userId)
    .not("comment", "is", null);

  if (!data || data.length === 0) return false;

  // Check if user uses emojis frequently in comments
  const emojiReviews = data.filter((review) => {
    if (!review.comment) return false;
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(review.comment);
  });

  return emojiReviews.length / data.length >= 0.5; // 50% of reviews have emojis
};

const checkCapsLockCrazyBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("comment")
    .eq("user_id", userId)
    .not("comment", "is", null);

  if (!data || data.length === 0) return false;

  // Check if user uses ALL CAPS frequently
  const capsReviews = data.filter((review) => {
    if (!review.comment) return false;
    const words = review.comment.split(/\s+/);
    const capsWords = words.filter(
      (word: string) => word === word.toUpperCase() && word.length > 2
    );
    return capsWords.length >= 2;
  });

  return capsReviews.length >= 3;
};

const checkPunctuationPerfectionistBadge = async (
  userId: string
): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("comment")
    .eq("user_id", userId)
    .not("comment", "is", null);

  if (!data || data.length === 0) return false;

  // Check if user uses proper punctuation consistently
  const properPunctuationReviews = data.filter((review) => {
    if (!review.comment) return false;
    const text = review.comment.trim();
    return text.endsWith(".") || text.endsWith("!") || text.endsWith("?");
  });

  return properPunctuationReviews.length / data.length >= 0.8; // 80% proper punctuation
};

const checkReviewPoetBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("comment")
    .eq("user_id", userId)
    .not("comment", "is", null);

  if (!data || data.length === 0) return false;

  // Check if user writes poetic/lengthy reviews
  const poeticReviews = data.filter((review) => {
    if (!review.comment) return false;
    return (
      review.comment.length >= 100 &&
      (review.comment.includes("\n") || review.comment.split(".").length >= 3)
    );
  });

  return poeticReviews.length >= 5;
};

// === ACHIEVEMENT BADGE CHECKS ===
const checkCenturyClubBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  return (data?.length || 0) >= 100;
};

const checkMillenniumMemberBadge = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("ratings")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  return (data?.length || 0) >= 1000;
};
