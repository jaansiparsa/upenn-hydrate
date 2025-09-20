import { MapPin, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Fountain } from "../services/fountainService";
import { searchFountains } from "../services/fountainService";

interface FountainSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFountainSelect?: (fountain: Fountain) => void;
}

export const FountainSearchModal: React.FC<FountainSearchModalProps> = ({
  isOpen,
  onClose,
  onFountainSelect,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Fountain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchFountains(query);
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error("Error searching fountains:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const handleFountainClick = (fountain: Fountain) => {
    if (onFountainSelect) {
      onFountainSelect(fountain);
    } else {
      navigate(`/fountain/${fountain.id}`);
    }
    onClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  const getStatusColor = (status: Fountain["status"]) => {
    switch (status) {
      case "working":
        return "bg-green-100 text-green-800";
      case "bad_filter":
        return "bg-yellow-100 text-yellow-800";
      case "out_of_order":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Fountain["status"]) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Find a Fountain</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, building, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

          {!isLoading && !hasSearched && searchQuery === "" && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Start typing to search for fountains</p>
              <p className="text-sm mt-1">
                Search by name, building, or description
              </p>
            </div>
          )}

          {!isLoading && hasSearched && searchResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No fountains found</p>
              <p className="text-sm mt-1">
                Try searching with different keywords
              </p>
            </div>
          )}

          {!isLoading && searchResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-3">
                Found {searchResults.length} fountain{searchResults.length !== 1 ? 's' : ''}
              </p>
              {searchResults.map((fountain) => (
                <div
                  key={fountain.id}
                  onClick={() => handleFountainClick(fountain)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {fountain.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{fountain.building} - Floor {fountain.floor}</span>
                      </div>
                      {fountain.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {fountain.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            fountain.status
                          )}`}
                        >
                          {getStatusText(fountain.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {fountain.type}
                        </span>
                      </div>
                    </div>
                    {fountain.image_url && (
                      <img
                        src={fountain.image_url}
                        alt={fountain.name}
                        className="w-16 h-16 object-cover rounded-lg ml-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Click on a fountain to view details</span>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
