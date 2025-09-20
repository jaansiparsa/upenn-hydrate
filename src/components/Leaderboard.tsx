import {
  Award,
  Droplets,
  Star,
  Trophy,
  Users,
  Zap,
  Calendar,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  leaderboardService,
  type InfluencerUser,
  type LeaderboardFountain,
  type LeaderboardUser,
  type TimeFilter,
} from "../services/leaderboardService";

type LeaderboardTab = "most_hydrated" | "water_influencer" | "best_fountain";

export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("most_hydrated");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all_time");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [mostHydrated, setMostHydrated] = useState<LeaderboardUser[]>([]);
  const [waterInfluencers, setWaterInfluencers] = useState<InfluencerUser[]>(
    []
  );
  const [bestFountains, setBestFountains] = useState<LeaderboardFountain[]>([]);

  const fetchMostHydrated = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaderboardService.getMostHydratedUsers(
        10,
        timeFilter
      );
      setMostHydrated(data);
    } catch (err) {
      setError("Failed to load most hydrated users");
      console.error("Error fetching most hydrated:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaterInfluencers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaderboardService.getWaterInfluencers(10, timeFilter);
      setWaterInfluencers(data);
    } catch (err) {
      setError("Failed to load water influencers");
      console.error("Error fetching water influencers:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBestFountains = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaderboardService.getBestFountains(10, timeFilter);
      setBestFountains(data);
    } catch (err) {
      setError("Failed to load best fountains");
      console.error("Error fetching best fountains:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "most_hydrated") {
      fetchMostHydrated();
    } else if (activeTab === "water_influencer") {
      fetchWaterInfluencers();
    } else if (activeTab === "best_fountain") {
      fetchBestFountains();
    }
  }, [activeTab, timeFilter]);

  const handleTimeFilterChange = (newFilter: TimeFilter) => {
    setTimeFilter(newFilter);
    // Clear existing data to force refresh
    setMostHydrated([]);
    setWaterInfluencers([]);
    setBestFountains([]);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Award className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const formatML = (ml: number) => {
    const oz = Math.round(ml / 29.5735); // Convert ml to oz
    return `${oz} oz`;
  };

  const renderMostHydrated = () => (
    <div className="space-y-4">
      {mostHydrated.map((user) => (
        <div
          key={user.user_id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/user/${user.user_id}`)}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">{getRankIcon(user.rank)}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.display_name}
              </h3>
              <p className="text-sm text-gray-600">
                {user.total_drinks} drinks • {formatML(user.total_ml_consumed)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {formatML(user.total_ml_consumed)}
            </div>
            <div className="text-xs text-gray-500">total consumed</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderWaterInfluencers = () => (
    <div className="space-y-4">
      {waterInfluencers.map((user) => (
        <div
          key={user.user_id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/user/${user.user_id}`)}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">{getRankIcon(user.rank)}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.display_name}
              </h3>
              <p className="text-sm text-gray-600">
                {user.total_reviews} reviews
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {user.total_upvotes}
            </div>
            <div className="text-xs text-gray-500">upvotes</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBestFountains = () => (
    <div className="space-y-4">
      {bestFountains.map((fountain) => (
        <div
          key={fountain.fountain_id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/fountain/${fountain.fountain_id}`)}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">{getRankIcon(fountain.rank)}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {fountain.name}
              </h3>
              <p className="text-sm text-gray-600">
                {fountain.total_reviews} reviews
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-lg font-bold text-yellow-600">
                {fountain.average_rating.toFixed(1)}
              </span>
            </div>
            <div className="text-xs text-gray-500">average rating</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">
          See who's leading the hydration game on campus
        </p>
      </div>

      {/* Time Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Time Period:
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleTimeFilterChange("week")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              timeFilter === "week"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Past Week
          </button>
          <button
            onClick={() => handleTimeFilterChange("month")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              timeFilter === "month"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Past 30 Days
          </button>
          <button
            onClick={() => handleTimeFilterChange("all_time")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              timeFilter === "all_time"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("most_hydrated")}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "most_hydrated"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Droplets className="h-4 w-4 mr-2" />
            Most Hydrated
          </button>
          <button
            onClick={() => setActiveTab("water_influencer")}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "water_influencer"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Zap className="h-4 w-4 mr-2" />
            Water Influencer
          </button>
          <button
            onClick={() => setActiveTab("best_fountain")}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "best_fountain"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Star className="h-4 w-4 mr-2" />
            Best Fountain
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading leaderboard...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Users className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load leaderboard
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                if (activeTab === "most_hydrated") fetchMostHydrated();
                else if (activeTab === "water_influencer")
                  fetchWaterInfluencers();
                else if (activeTab === "best_fountain") fetchBestFountains();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {activeTab === "most_hydrated" && renderMostHydrated()}
            {activeTab === "water_influencer" && renderWaterInfluencers()}
            {activeTab === "best_fountain" && renderBestFountains()}
          </>
        )}
      </div>
    </div>
  );
};
