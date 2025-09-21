import type { BadgeProgress, UserBadge } from "../services/badgeService";
import {
  Camera,
  Flame,
  MapPin,
  Star,
  Trophy,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  getUserBadgeProgress,
  getUserBadgesWithMigration,
} from "../services/badgeService";

interface BadgeDisplayProps {
  userId: string;
  showProgress?: boolean;
  compact?: boolean;
}

const categoryIcons = {
  beginner: Star,
  reviewer: Trophy,
  explorer: MapPin,
  visual: Camera,
  quality: Zap,
  social: Users,
  maintenance: Wrench,
  streak: Flame,
  special: Star,
};

const tierColors = {
  bronze: "text-amber-600 bg-amber-100",
  silver: "text-gray-600 bg-gray-100",
  gold: "text-yellow-600 bg-yellow-100",
  platinum: "text-blue-600 bg-blue-100",
  special: "text-purple-600 bg-purple-100",
};

const tierBorders = {
  bronze: "border-amber-300",
  silver: "border-gray-300",
  gold: "border-yellow-300",
  platinum: "border-blue-300",
  special: "border-purple-300",
};

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  userId,
  showProgress = true,
  compact = false,
}) => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchBadgeData = async () => {
      try {
        setLoading(true);
        const [badges, progress] = await Promise.all([
          getUserBadgesWithMigration(userId),
          showProgress ? getUserBadgeProgress(userId) : Promise.resolve([]),
        ]);

        setUserBadges(badges);
        setBadgeProgress(progress);
      } catch (error) {
        console.error("Error fetching badge data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadgeData();
  }, [userId, showProgress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading badges...</span>
      </div>
    );
  }

  const categories = [
    "all",
    "beginner",
    "reviewer",
    "explorer",
    "visual",
    "quality",
    "social",
    "maintenance",
    "streak",
    "special",
  ];
  const filteredBadges =
    selectedCategory === "all"
      ? userBadges
      : userBadges.filter((ub) => ub.badges?.category === selectedCategory);

  const getProgressForGroup = (group: string) => {
    return badgeProgress.find((p) => p.progression_group === group);
  };

  const getNextTier = (currentTier: string): string => {
    const tiers = ["bronze", "silver", "gold", "platinum"];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : "max";
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {filteredBadges.slice(0, 6).map((userBadge) => {
          const badge = userBadge.badges;
          if (!badge) return null;

          return (
            <div
              key={userBadge.id}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                tierColors[badge.tier]
              } ${tierBorders[badge.tier]} border`}
              title={`${badge.name}: ${badge.description}`}
            >
              <span className="mr-1">{badge.icon}</span>
              {badge.name}
            </div>
          );
        })}
        {userBadges.length > 6 && (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
            +{userBadges.length - 6} more
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            {category === "all"
              ? "All"
              : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((userBadge) => {
          const badge = userBadge.badges;
          if (!badge) return null;

          const IconComponent =
            categoryIcons[badge.category as keyof typeof categoryIcons] || Star;
          const progress = badge.is_progression
            ? getProgressForGroup(badge.progression_group || "")
            : null;

          return (
            <div
              key={userBadge.id}
              className={`p-4 rounded-lg border-2 ${tierBorders[badge.tier]} ${
                tierColors[badge.tier]
              } bg-white hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${tierColors[badge.tier]}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{badge.icon}</span>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {badge.name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {badge.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tierColors[badge.tier]
                      }`}
                    >
                      {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(userBadge.earned_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Progress Bar for Progression Badges */}
                  {showProgress && progress && badge.is_progression && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>
                          {progress.progress_value} / {badge.requirement_value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${tierColors[badge.tier]
                            .split(" ")[0]
                            .replace("text-", "bg-")}`}
                          style={{
                            width: `${Math.min(
                              (progress.progress_value /
                                badge.requirement_value) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      {getNextTier(progress.current_tier) !== "max" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Next:{" "}
                          {getNextTier(progress.current_tier)
                            .charAt(0)
                            .toUpperCase() +
                            getNextTier(progress.current_tier).slice(1)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {selectedCategory === "all"
              ? "No badges earned yet. Start reviewing fountains to earn your first badge!"
              : `No ${selectedCategory} badges earned yet.`}
          </p>
        </div>
      )}
    </div>
  );
};
