import {
  Droplets,
  Heart,
  LogOut,
  MapPin,
  MessageCircle,
  Plus,
  Rss,
  Search,
  Trophy,
  UserCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AddFountainForm } from "./AddFountainForm";
import { Feed } from "./Feed";
import { HyDATEr } from "./HyDATEr";
import { Leaderboard } from "./Leaderboard";
import { Map } from "./Map";
import { Messages } from "./Messages";
import { useAuth } from "../contexts/AuthContext";

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "fountains" | "feed" | "leaderboard" | "hydater" | "messages" | "profile"
  >("fountains");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMessageUser, setSelectedMessageUser] = useState<{
    userId: string;
    userName?: string;
  } | null>(null);

  const handleFindFountain = () => {
    // TODO: Implement fountain search functionality
    console.log("Find a fountain clicked");
    // This could open a search modal or filter the map
  };

  const handleAddFountain = () => {
    setShowAddForm(true);
  };

  const handleStartMessage = (userId: string, userName?: string) => {
    setSelectedMessageUser({ userId, userName });
    setActiveTab("messages");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Handle URL parameters for navigation from PlanDate page
  useEffect(() => {
    const tab = searchParams.get("tab");
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");

    if (
      tab &&
      [
        "fountains",
        "feed",
        "leaderboard",
        "hydater",
        "messages",
        "profile",
      ].includes(tab)
    ) {
      setActiveTab(
        tab as
          | "fountains"
          | "feed"
          | "leaderboard"
          | "hydater"
          | "messages"
          | "profile"
      );
    }

    if (userId && tab === "messages") {
      setSelectedMessageUser({ userId, userName: userName || undefined });
    }
  }, [searchParams]);

  // Show add fountain form if requested
  if (showAddForm) {
    return <AddFountainForm onClose={() => setShowAddForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold">
                  <span style={{ color: "#DBE5FF" }}>H</span>
                  <span style={{ color: "#A9BDF1" }}>y</span>
                  <span style={{ color: "#88A3E9" }}>d</span>
                  <span style={{ color: "#446FE0" }}>r</span>
                  <span style={{ color: "#0F44CD" }}>a</span>
                  <span style={{ color: "#0836AB" }}>t</span>
                  <span style={{ color: "#062472" }}>e</span>
                </h1>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-6">
                <button
                  onClick={() => setActiveTab("fountains")}
                  className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === "fountains"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Droplets className="h-4 w-4 mr-1" />
                  Fountains
                </button>
                <button
                  onClick={() => setActiveTab("feed")}
                  className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === "feed"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Rss className="h-4 w-4 mr-1" />
                  Feed
                </button>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === "leaderboard"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Leaderboard
                </button>
                <button
                  onClick={() => setActiveTab("hydater")}
                  className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === "hydater"
                      ? "border-pink-500 text-pink-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  hyDATEr
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === "messages"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Messages
                </button>
                <button
                  onClick={() => navigate(`/user/${user?.id}`)}
                  className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === "profile"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <UserCircle className="h-4 w-4 mr-1" />
                  Profile
                </button>
              </nav>

              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Content */}
          {activeTab === "fountains" && (
            <>
              {/* Welcome Section */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Campus Water Fountains
                </h2>
                <p className="text-gray-600">
                  Explore water fountains around Penn's campus.
                </p>
              </div>

              {/* Map Section */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Campus Water Fountains
                    </h3>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={handleFindFountain}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Find a Fountain
                    </button>
                    <button
                      onClick={handleAddFountain}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add a Fountain
                    </button>
                  </div>
                </div>
                <Map className="h-[600px] rounded-lg shadow-lg" />
              </div>
            </>
          )}

          {activeTab === "feed" && <Feed />}

          {activeTab === "leaderboard" && <Leaderboard />}

          {activeTab === "hydater" && (
            <HyDATEr onStartMessage={handleStartMessage} />
          )}

          {activeTab === "messages" && (
            <Messages
              initialUserId={selectedMessageUser?.userId}
              initialUserName={selectedMessageUser?.userName}
            />
          )}
        </div>
      </main>
    </div>
  );
};
