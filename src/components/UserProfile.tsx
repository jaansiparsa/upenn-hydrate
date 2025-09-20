import {
  ArrowLeft,
  Edit3,
  Save,
  User,
  UserMinus,
  UserPlus,
  Users,
  UserCheck,
  X,
  Eye,
  Camera,
  Upload,
  RotateCcw,
  Check,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Review } from "../services/reviewService";
import { getUserReviews } from "../services/reviewService";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { ReviewItem } from "./ReviewItem";
import { BadgeDisplay } from "./BadgeDisplay";
import { BadgeNotification, useBadgeNotifications } from "./BadgeNotification";
import { checkAndAwardBadges } from "../services/badgeService";

export const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<{
    id: string;
    display_name?: string;
    email?: string;
    total_ratings: number;
    badges: string[];
    followers: string[];
    following: string[];
    profile_picture_url?: string;
  } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<Array<{id: string, display_name?: string, email?: string, profile_picture_url?: string}>>([]);
  const [followingList, setFollowingList] = useState<Array<{id: string, display_name?: string, email?: string, profile_picture_url?: string}>>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const { notifications, showBadgeEarned, removeNotification } = useBadgeNotifications();

  // Handle vote updates
  const handleVote = (updatedReview: Review) => {
    setReviews(prev => 
      prev.map(review => review.id === updatedReview.id ? updatedReview : review)
    );
  };

  // Fetch followers list
  const fetchFollowersList = async () => {
    if (!profile?.followers?.length) {
      setFollowersList([]);
      return;
    }

    try {
      setLoadingLists(true);
      const { data, error } = await supabase
        .from("users")
        .select("id, display_name, email, profile_picture_url")
        .in("id", profile.followers);

      if (error) throw error;
      setFollowersList(data || []);
    } catch (error) {
      console.error("Error fetching followers list:", error);
      setFollowersList([]);
    } finally {
      setLoadingLists(false);
    }
  };

  // Fetch following list
  const fetchFollowingList = async () => {
    if (!profile?.following?.length) {
      setFollowingList([]);
      return;
    }

    try {
      setLoadingLists(true);
      const { data, error } = await supabase
        .from("users")
        .select("id, display_name, email, profile_picture_url")
        .in("id", profile.following);

      if (error) throw error;
      setFollowingList(data || []);
    } catch (error) {
      console.error("Error fetching following list:", error);
      setFollowingList([]);
    } finally {
      setLoadingLists(false);
    }
  };

  // Handle opening followers modal
  const handleShowFollowers = async () => {
    setShowFollowersModal(true);
    await fetchFollowersList();
  };

  // Handle opening following modal
  const handleShowFollowing = async () => {
    setShowFollowingModal(true);
    await fetchFollowingList();
  };

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) {
      console.error('No file or profile found:', { file: !!file, profile: !!profile });
      return;
    }

    console.log('Starting photo upload:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type,
      profileId: profile.id 
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      setError(null);

      // Check if storage bucket exists
      await ensureStorageBucket();

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      console.log('Uploading to storage:', { filePath, bucket: 'profile-pictures' });

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Storage error: ${uploadError.message}`);
      }

      console.log('Storage upload successful');

      // Get public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      console.log('Got public URL:', data.publicUrl);

      // Update user profile with photo URL
      console.log('Updating user profile with photo URL...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_picture_url: data.publicUrl })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error(`Database error: ${updateError.message}`);
      }

      console.log('Profile update successful');

      // Update local state
      setProfile(prev => prev ? { ...prev, profile_picture_url: data.publicUrl } : null);
      setPhotoPreview(null);

    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(`Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle photo removal
  const handlePhotoRemove = async () => {
    if (!profile?.profile_picture_url) return;

    try {
      setUploadingPhoto(true);
      setError(null);

      // Remove from storage
      const fileName = profile.profile_picture_url.split('/').pop();
      const filePath = `${profile.id}/${fileName}`;

      await supabase.storage
        .from('profile-pictures')
        .remove([filePath]);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_picture_url: null })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, profile_picture_url: undefined } : null);

    } catch (error) {
      console.error('Error removing photo:', error);
      setError('Failed to remove photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Camera functionality
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 }
        }
      });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCapturedPhoto(null);
  };

  const capturePhoto = () => {
    if (!videoRef) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    
    context.drawImage(videoRef, 0, 0);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoDataUrl);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  const useCapturedPhoto = async () => {
    if (!capturedPhoto || !profile) {
      console.error('No captured photo or profile found:', { 
        capturedPhoto: !!capturedPhoto, 
        profile: !!profile 
      });
      return;
    }

    try {
      setUploadingPhoto(true);
      setError(null);

      console.log('Processing captured photo for profile:', profile.id);

      // Check if storage bucket exists
      await ensureStorageBucket();

      // Convert data URL to blob
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });

      console.log('Created file from captured photo:', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type 
      });

      // Upload to Supabase Storage
      const filePath = `${profile.id}/camera-photo.jpg`;

      console.log('Uploading captured photo to storage:', { filePath, bucket: 'profile-photos' });

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error for captured photo:', uploadError);
        throw new Error(`Storage error: ${uploadError.message}`);
      }

      console.log('Captured photo storage upload successful');

      // Get public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      console.log('Got public URL for captured photo:', data.publicUrl);

      // Update user profile with photo URL
      console.log('Updating user profile with captured photo URL...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_picture_url: data.publicUrl })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Database update error for captured photo:', updateError);
        throw new Error(`Database error: ${updateError.message}`);
      }

      console.log('Captured photo profile update successful');

      // Update local state
      setProfile(prev => prev ? { ...prev, profile_picture_url: data.publicUrl } : null);
      
      // Clean up
      stopCamera();

    } catch (error) {
      console.error('Error uploading captured photo:', error);
      setError(`Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const isOwnProfile = currentUser?.id === id;

  // Check and create storage bucket if needed
  const ensureStorageBucket = async () => {
    try {
      // Try to list files in the bucket to check if it exists
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .list('', { limit: 1 });

      if (error && error.message.includes('not found')) {
        console.log('Storage bucket not found, creating...');
        // The bucket doesn't exist, we need to create it
        // This should be done via the migration, but let's handle it gracefully
        throw new Error('Storage bucket "profile-pictures" does not exist. Please run the database migration first.');
      }
      
      console.log('Storage bucket exists and is accessible');
      return true;
    } catch (error) {
      console.error('Storage bucket check failed:', error);
      throw error;
    }
  };

  // Handle video stream
  useEffect(() => {
    if (videoRef && stream) {
      videoRef.srcObject = stream;
    }
  }, [videoRef, stream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Fetch user profile and reviews
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError) {
          if (profileError.code === "PGRST116") {
            setError("User not found");
            return;
          }
          throw profileError;
        }

        if (profileData) {
          setProfile(profileData);
          setNewDisplayName(profileData.display_name || "");

          // Check if current user is following this profile
          if (currentUser && !isOwnProfile) {
            // We need to check if the current user's following list includes this profile
            // So we need to fetch the current user's data to check their following list
            const { data: currentUserData, error: getUserError } =
              await supabase
                .from("users")
                .select("following")
                .eq("id", currentUser.id)
                .single();

            if (getUserError) {
              console.error("Error fetching current user data:", getUserError);
              setIsFollowing(false);
            } else {
              const isCurrentlyFollowing =
                currentUserData.following?.includes(profileData.id) || false;
              console.log("Follow status check on page load:", {
                profileId: profileData.id,
                currentUserId: currentUser.id,
                currentUserFollowing: currentUserData.following,
                followingType: typeof currentUserData.following,
                followingLength: currentUserData.following?.length,
                isFollowing: isCurrentlyFollowing,
              });
              setIsFollowing(isCurrentlyFollowing);
            }
          }
        }

        // Fetch user reviews
        setReviewsLoading(true);
        const userReviews = await getUserReviews(id);
        setReviews(userReviews);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser, isOwnProfile]);

  const handleUpdateDisplayName = async () => {
    if (!currentUser || !profile || !isOwnProfile) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ display_name: newDisplayName })
        .eq("id", currentUser.id);

      if (error) throw error;

      setProfile((prev) =>
        prev ? { ...prev, display_name: newDisplayName } : null
      );
      setEditingName(false);
    } catch (error) {
      console.error("Error updating display name:", error);
      setError("Failed to update display name");
    } finally {
      setUpdating(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !profile || isOwnProfile) return;

    console.log("Follow button clicked:", {
      isFollowing,
      profileId: profile.id,
      currentUserId: currentUser.id,
      followers: profile.followers,
    });

    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow: Remove current user from profile's followers and remove profile from current user's following
        // Check if actually following before attempting removal
        if (profile.followers?.includes(currentUser.id)) {
          const { error: removeFollowerError } = await supabase
            .from("users")
            .update({
              followers: profile.followers.filter(
                (followerId) => followerId !== currentUser.id
              ),
            })
            .eq("id", profile.id);

          if (removeFollowerError) throw removeFollowerError;
        }

        // Get current user's following list and remove the profile user
        const { data: currentUserData, error: getUserError } = await supabase
          .from("users")
          .select("following")
          .eq("id", currentUser.id)
          .single();

        if (getUserError) throw getUserError;

        // Check if actually following before attempting removal
        if (currentUserData.following?.includes(profile.id)) {
          const { error: removeFollowingError } = await supabase
            .from("users")
            .update({
              following: currentUserData.following.filter(
                (followingId: string) => followingId !== profile.id
              ),
            })
            .eq("id", currentUser.id);

          if (removeFollowingError) throw removeFollowingError;
        }

        setIsFollowing(false);
        console.log("Setting isFollowing to false after unfollow action");
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followers:
                  prev.followers?.filter(
                    (followerId) => followerId !== currentUser.id
                  ) || [],
              }
            : null
        );
      } else {
        // Follow: Add current user to profile's followers and add profile to current user's following
        // Check if already following to prevent duplicates
        if (!profile.followers?.includes(currentUser.id)) {
          console.log("Adding follower to database:", {
            profileId: profile.id,
            currentUserId: currentUser.id,
            currentFollowers: profile.followers,
            newFollowers: [...(profile.followers || []), currentUser.id],
          });

          const { error: addFollowerError } = await supabase
            .from("users")
            .update({
              followers: [...(profile.followers || []), currentUser.id],
            })
            .eq("id", profile.id);

          if (addFollowerError) {
            console.error("Error adding follower:", addFollowerError);
            throw addFollowerError;
          }

          console.log("Successfully added follower to database");
        } else {
          console.log(
            "User already in followers list, skipping database update"
          );
        }

        // Get current user's following list and add the profile user
        const { data: currentUserData, error: getUserError } = await supabase
          .from("users")
          .select("following")
          .eq("id", currentUser.id)
          .single();

        if (getUserError) throw getUserError;

        // Check if already in following list to prevent duplicates
        if (!currentUserData.following?.includes(profile.id)) {
          const { error: addFollowingError } = await supabase
            .from("users")
            .update({
              following: [...(currentUserData.following || []), profile.id],
            })
            .eq("id", currentUser.id);

          if (addFollowingError) throw addFollowingError;
        }

        setIsFollowing(true);
        console.log("Setting isFollowing to true after follow action");
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followers: [...(prev.followers || []), currentUser.id],
              }
            : null
        );
      }

      // Refresh the profile data to get accurate counts
      const { data: updatedProfile, error: refreshError } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (!refreshError && updatedProfile) {
        setProfile(updatedProfile);
      }

      // Check for new badges after follow action
      if (currentUser) {
        const newBadges = await checkAndAwardBadges(currentUser.id, 'user_followed', {});
        newBadges.forEach(badgeName => {
          showBadgeEarned(badgeName, '🤝', `You earned the ${badgeName} badge!`, 'bronze');
        });
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      setError("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => {
      return (
        sum +
        (review.coldness +
          review.experience +
          review.pressure +
          review.yum_factor) /
          4
      );
    }, 0);

    return totalRating / reviews.length;
  };

  const getBadgeDisplay = (badges: string[]) => {
    if (!badges || badges.length === 0) return "No badges yet";

    const badgeMap: Record<string, string> = {
      new_reviewer: "New Reviewer",
      frequent_reviewer: "Frequent Reviewer",
      quality_reviewer: "Quality Reviewer",
      helpful_reviewer: "Helpful Reviewer",
    };

    return badges.map((badge) => badgeMap[badge] || badge).join(", ");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {error || "User not found"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The user you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                {profile.profile_picture_url || photoPreview ? (
                  <img
                    src={photoPreview || profile.profile_picture_url}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-blue-600" />
                )}
              </div>
              {isOwnProfile && (
                <div className="absolute -bottom-1 -right-1">
                  <div className="flex space-x-1">
                    <label className="cursor-pointer">
                      <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <Upload className="h-3 w-3 text-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                    <button
                      onClick={startCamera}
                      disabled={uploadingPhoto}
                      className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Camera className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              )}
              {isOwnProfile && profile.profile_picture_url && (
                <button
                  onClick={handlePhotoRemove}
                  disabled={uploadingPhoto}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {editingName && isOwnProfile ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600"
                    placeholder="Enter display name"
                  />
                  <button
                    onClick={handleUpdateDisplayName}
                    disabled={updating}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {updating ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNewDisplayName(profile.display_name || "");
                    }}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.display_name || "No display name set"}
                  </h1>
                  {isOwnProfile && (
                    <button
                      onClick={() => setEditingName(true)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-gray-600">{profile.email}</p>
                <div className="flex items-center space-x-3 text-sm">
                  <button
                    onClick={handleShowFollowers}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{profile.followers?.length || 0}</span>
                    <span className="text-gray-500">followers</span>
                  </button>
                  <button
                    onClick={handleShowFollowing}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span className="font-medium">{profile.following?.length || 0}</span>
                    <span className="text-gray-500">following</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Follow Button - Only show for other users' profiles */}
          {!isOwnProfile && currentUser && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${
                isFollowing
                  ? "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  : "border-transparent text-white bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {followLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  {isFollowing ? "Unfollowing..." : "Following..."}
                </>
              ) : (
                <>
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </>
              )}
            </button>
          )}
        </div>

        {/* Photo Upload Status */}
        {uploadingPhoto && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-sm text-blue-600">Uploading photo...</p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-blue-600 text-sm">📝</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {profile.total_ratings}
            </div>
            <div className="text-sm text-gray-600">Reviews</div>
          </div>
          
          <div className="text-center bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-yellow-600 text-sm">⭐</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
            </div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
          
          <div className="text-center bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-gray-600 text-sm">🏆</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">Badges</div>
            <div className="text-xs text-gray-500 mt-1">
              {getBadgeDisplay(profile.badges)}
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-yellow-600 text-lg">🏆</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Badges & Achievements</h2>
        </div>
        <BadgeDisplay userId={profile.id} showProgress={true} compact={false} />
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isOwnProfile ? "Your Reviews" : "Reviews"}
          </h2>
          <span className="text-sm text-gray-600">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        </div>

        {reviewsLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading reviews...</span>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                showFountainInfo={true}
                onVote={handleVote}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-500">
              {isOwnProfile
                ? "Start reviewing fountains to see them here!"
                : "This user hasn't reviewed any fountains yet."}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Followers ({profile.followers?.length || 0})
              </h3>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-80">
              {loadingLists ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : followersList.length > 0 ? (
                <div className="space-y-3">
                  {followersList.map((follower) => (
                    <div
                      key={follower.id}
                      className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Navigating to follower profile:", follower.id);
                        setShowFollowersModal(false);
                        navigate(`/user/${follower.id}`);
                      }}
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                        {follower.profile_picture_url ? (
                          <img
                            src={follower.profile_picture_url}
                            alt={follower.display_name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 hover:text-green-700 transition-colors">
                          {follower.display_name || "Unknown User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {follower.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No followers yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
                Following ({profile.following?.length || 0})
              </h3>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-80">
              {loadingLists ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : followingList.length > 0 ? (
                <div className="space-y-3">
                  {followingList.map((following) => (
                    <div
                      key={following.id}
                      className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Navigating to following profile:", following.id);
                        setShowFollowingModal(false);
                        navigate(`/user/${following.id}`);
                      }}
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                        {following.profile_picture_url ? (
                          <img
                            src={following.profile_picture_url}
                            alt={following.display_name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 hover:text-purple-700 transition-colors">
                          {following.display_name || "Unknown User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {following.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Not following anyone yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-green-600" />
                Take Photo
              </h3>
              <button
                onClick={stopCamera}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              {!capturedPhoto ? (
                <div className="space-y-4">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
                    <video
                      ref={setVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none"></div>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={capturePhoto}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Capture
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }}>
                    <img
                      src={capturedPhoto}
                      alt="Captured photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={useCapturedPhoto}
                      disabled={uploadingPhoto}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {uploadingPhoto ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Use Photo
                        </>
                      )}
                    </button>
                    <button
                      onClick={retakePhoto}
                      disabled={uploadingPhoto}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Retake
                    </button>
                    <button
                      onClick={stopCamera}
                      disabled={uploadingPhoto}
                      className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Badge Notifications */}
      {notifications.map((notification) => (
        <BadgeNotification
          key={notification.id}
          badgeName={notification.badgeName}
          badgeIcon={notification.badgeIcon}
          badgeDescription={notification.badgeDescription}
          badgeTier={notification.badgeTier}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};
