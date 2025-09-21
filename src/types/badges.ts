// Badge types const object - All possible badges users can earn
export const BadgeType = {
  // === REVIEWER BADGES ===
  NEW_REVIEWER: "new_reviewer",
  FREQUENT_REVIEWER: "frequent_reviewer",
  QUALITY_REVIEWER: "quality_reviewer",
  HELPFUL_REVIEWER: "helpful_reviewer",
  REVIEW_MACHINE: "review_machine",
  CRITIC_MASTER: "critic_master",

  // === SOCIAL BADGES ===
  POPULAR_HYDRATOR: "popular_hydrator",
  SOCIAL_BUTTERFLY: "social_butterfly",
  INFLUENCER: "influencer",
  COMMUNITY_BUILDER: "community_builder",
  FOLLOW_LEADER: "follow_leader",

  // === SPECIALTY BADGES ===
  FIRST_SIP: "first_sip",
  CARTographer: "cartographer",
  BALANCED_JUDGE: "balanced_judge",
  HIDDEN_GEM_FINDER: "hidden_gem_finder",
  RIPPLE_EFFECT: "ripple_effect",

  // === FUNNY/WEIRD BADGES ===
  WATER_SNOB: "water_snob",
  TEMPERATURE_PICKY: "temperature_picky",
  PRESSURE_OBSESSED: "pressure_obsessed",
  YUM_FACTOR_FANATIC: "yum_factor_fanatic",
  FOUNTAIN_WHISPERER: "fountain_whisperer",
  HYDROPHILE: "hydrophile",
  AQUA_AFICIONADO: "aqua_aficionado",
  LIQUID_CONNOISSEUR: "liquid_connoisseur",

  // === STREAK BADGES ===
  DAILY_HYDRATOR: "daily_hydrator",
  WEEKLY_WARRIOR: "weekly_warrior",
  MONTHLY_MARATHON: "monthly_marathon",
  CONSISTENCY_KING: "consistency_king",
  STREAK_MASTER: "streak_master",

  // === WEIRD/SPECIAL BADGES ===
  MIDNIGHT_HYDRATOR: "midnight_hydrator",
  EARLY_BIRD_DRINKER: "early_bird_drinker",
  LUNCH_BREAK_LEGEND: "lunch_break_legend",
  CLASS_DASHER: "class_dasher",
  LIBRARY_LURKER: "library_lurker",
  GYM_GULPER: "gym_gulper",

  // === RATING PATTERN BADGES ===
  PERFECTIONIST: "perfectionist",
  GENEROUS_GIVER: "generous_giver",
  HARSH_CRITIC: "harsh_critic",
  OPTIMIST: "optimist",
  REALIST: "realist",
  PESSIMIST: "pessimist",

  // === ACHIEVEMENT BADGES ===
  CENTURY_CLUB: "century_club",
  MILLENNIUM_MEMBER: "millennium_member",
  LEGENDARY_LIQUIDATOR: "legendary_liquidator",
  ULTIMATE_URBAN_EXPLORER: "ultimate_urban_explorer",
  SUPREME_SIPPER: "supreme_sipper",

  // === WEIRD PERSONALITY BADGES ===
  FOUNTAIN_PHOTOGRAPHER: "fountain_photographer",
  REVIEW_POET: "review_poet",
  EMOJI_EXPERT: "emoji_expert",
  CAPS_LOCK_CRAZY: "caps_lock_crazy",
  PUNCTUATION_PERFECTIONIST: "punctuation_perfectionist",
} as const;

// Type for badge values
export type BadgeType = (typeof BadgeType)[keyof typeof BadgeType];

// Badge display names mapping
export const BADGE_DISPLAY_NAMES: Record<BadgeType, string> = {
  // Reviewer badges
  [BadgeType.NEW_REVIEWER]: "New Reviewer",
  [BadgeType.FREQUENT_REVIEWER]: "Frequent Reviewer",
  [BadgeType.QUALITY_REVIEWER]: "Quality Reviewer",
  [BadgeType.HELPFUL_REVIEWER]: "Helpful Reviewer",
  [BadgeType.REVIEW_MACHINE]: "Review Machine",
  [BadgeType.CRITIC_MASTER]: "Critic Master",

  // Social badges
  [BadgeType.POPULAR_HYDRATOR]: "Popular Hydrator",
  [BadgeType.SOCIAL_BUTTERFLY]: "Social Butterfly",
  [BadgeType.INFLUENCER]: "Influencer",
  [BadgeType.COMMUNITY_BUILDER]: "Community Builder",
  [BadgeType.FOLLOW_LEADER]: "Follow Leader",

  // Specialty badges
  [BadgeType.FIRST_SIP]: "First Sip",
  [BadgeType.CARTographer]: "Cartographer",
  [BadgeType.BALANCED_JUDGE]: "Balanced Judge",
  [BadgeType.HIDDEN_GEM_FINDER]: "Hidden Gem Finder",
  [BadgeType.RIPPLE_EFFECT]: "Ripple Effect",

  // Funny/weird badges
  [BadgeType.WATER_SNOB]: "Water Snob",
  [BadgeType.TEMPERATURE_PICKY]: "Temperature Picky",
  [BadgeType.PRESSURE_OBSESSED]: "Pressure Obsessed",
  [BadgeType.YUM_FACTOR_FANATIC]: "Yum Factor Fanatic",
  [BadgeType.FOUNTAIN_WHISPERER]: "Fountain Whisperer",
  [BadgeType.HYDROPHILE]: "Hydrophile",
  [BadgeType.AQUA_AFICIONADO]: "Aqua Aficionado",
  [BadgeType.LIQUID_CONNOISSEUR]: "Liquid Connoisseur",

  // Streak badges
  [BadgeType.DAILY_HYDRATOR]: "Daily Hydrator",
  [BadgeType.WEEKLY_WARRIOR]: "Weekly Warrior",
  [BadgeType.MONTHLY_MARATHON]: "Monthly Marathon",
  [BadgeType.CONSISTENCY_KING]: "Consistency King",
  [BadgeType.STREAK_MASTER]: "Streak Master",

  // Weird/special badges
  [BadgeType.MIDNIGHT_HYDRATOR]: "Midnight Hydrator",
  [BadgeType.EARLY_BIRD_DRINKER]: "Early Bird Drinker",
  [BadgeType.LUNCH_BREAK_LEGEND]: "Lunch Break Legend",
  [BadgeType.CLASS_DASHER]: "Class Dasher",
  [BadgeType.LIBRARY_LURKER]: "Library Lurker",
  [BadgeType.GYM_GULPER]: "Gym Gulper",

  // Rating pattern badges
  [BadgeType.PERFECTIONIST]: "Perfectionist",
  [BadgeType.GENEROUS_GIVER]: "Generous Giver",
  [BadgeType.HARSH_CRITIC]: "Harsh Critic",
  [BadgeType.OPTIMIST]: "Optimist",
  [BadgeType.REALIST]: "Realist",
  [BadgeType.PESSIMIST]: "Pessimist",

  // Achievement badges
  [BadgeType.CENTURY_CLUB]: "Century Club",
  [BadgeType.MILLENNIUM_MEMBER]: "Millennium Member",
  [BadgeType.LEGENDARY_LIQUIDATOR]: "Legendary Liquidator",
  [BadgeType.ULTIMATE_URBAN_EXPLORER]: "Ultimate Urban Explorer",
  [BadgeType.SUPREME_SIPPER]: "Supreme Sipper",

  // Weird personality badges
  [BadgeType.FOUNTAIN_PHOTOGRAPHER]: "Fountain Photographer",
  [BadgeType.REVIEW_POET]: "Review Poet",
  [BadgeType.EMOJI_EXPERT]: "Emoji Expert",
  [BadgeType.CAPS_LOCK_CRAZY]: "Caps Lock Crazy",
  [BadgeType.PUNCTUATION_PERFECTIONIST]: "Punctuation Perfectionist",
};

// Badge categories for organization
export const BadgeCategory = {
  REVIEWER: "reviewer",
  EXPLORER: "explorer",
  SOCIAL: "social",
  SPECIALTY: "specialty",
  FUNNY: "funny",
  STREAK: "streak",
  WEIRD: "weird",
  RATING_PATTERN: "rating_pattern",
  LOCATION: "location",
  TIME_BASED: "time_based",
  ACHIEVEMENT: "achievement",
  PERSONALITY: "personality",
  SPECIAL_CIRCUMSTANCES: "special_circumstances",
  ULTRA_RARE: "ultra_rare",
  META: "meta",
} as const;

// Type for badge category values
export type BadgeCategory = (typeof BadgeCategory)[keyof typeof BadgeCategory];

// Badge rarity levels
export const BadgeRarity = {
  COMMON: "common",
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
  MYTHICAL: "mythical",
} as const;

// Type for badge rarity values
export type BadgeRarity = (typeof BadgeRarity)[keyof typeof BadgeRarity];
