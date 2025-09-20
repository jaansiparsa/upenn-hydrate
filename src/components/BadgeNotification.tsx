import React, { useEffect, useState } from "react";
import { Star, Trophy, X } from "lucide-react";

interface BadgeNotificationProps {
  badgeName: string;
  badgeIcon: string;
  badgeDescription: string;
  badgeTier: "bronze" | "silver" | "gold" | "platinum" | "special";
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const tierColors = {
  bronze: "from-amber-400 to-amber-600",
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-blue-400 to-blue-600",
  special: "from-purple-400 to-purple-600",
};

const tierGlow = {
  bronze: "shadow-amber-500/50",
  silver: "shadow-gray-500/50",
  gold: "shadow-yellow-500/50",
  platinum: "shadow-blue-500/50",
  special: "shadow-purple-500/50",
};

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  badgeName,
  badgeIcon,
  badgeDescription,
  badgeTier,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Auto close
    if (autoClose) {
      const closeTimer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible && !isExiting
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden max-w-sm w-full ${tierGlow[badgeTier]} shadow-lg`}
      >
        {/* Header with gradient */}
        <div
          className={`bg-gradient-to-r ${tierColors[badgeTier]} p-4 text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Badge Earned!</h3>
                <p className="text-sm opacity-90">Congratulations!</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Badge Content */}
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div
              className={`p-3 rounded-full ${tierColors[badgeTier]} bg-gradient-to-r text-white text-2xl`}
            >
              {badgeIcon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-lg">
                {badgeName}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{badgeDescription}</p>
              <div className="flex items-center mt-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    badgeTier === "bronze"
                      ? "bg-amber-100 text-amber-800"
                      : badgeTier === "silver"
                      ? "bg-gray-100 text-gray-800"
                      : badgeTier === "gold"
                      ? "bg-yellow-100 text-yellow-800"
                      : badgeTier === "platinum"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {badgeTier.charAt(0).toUpperCase() + badgeTier.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="h-1 bg-gray-200">
            <div
              className={`h-full bg-gradient-to-r ${tierColors[badgeTier]} transition-all ease-linear`}
              style={{
                animation: `shrink ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Hook for managing badge notifications
export const useBadgeNotifications = () => {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      badgeName: string;
      badgeIcon: string;
      badgeDescription: string;
      badgeTier: "bronze" | "silver" | "gold" | "platinum" | "special";
    }>
  >([]);

  const addNotification = (badge: {
    badgeName: string;
    badgeIcon: string;
    badgeDescription: string;
    badgeTier: "bronze" | "silver" | "gold" | "platinum" | "special";
  }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, ...badge }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const showBadgeEarned = (
    badgeName: string,
    badgeIcon: string,
    badgeDescription: string,
    badgeTier: "bronze" | "silver" | "gold" | "platinum" | "special"
  ) => {
    addNotification({
      badgeName,
      badgeIcon,
      badgeDescription,
      badgeTier,
    });
  };

  return {
    notifications,
    showBadgeEarned,
    removeNotification,
  };
};
