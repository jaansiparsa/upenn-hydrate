# Updated Profile Pictures Setup Guide

## Overview

The profile picture system has been updated to use the new user table schema with the `profile_picture_url` column and the `profile-pictures` storage bucket.

## Changes Made

### 1. Database Schema Updates
- Updated to use `profile_picture_url` column instead of `profile_photo_url`
- Changed storage bucket from `profile-photos` to `profile-pictures`

### 2. Code Updates
- **UserProfile.tsx**: Updated all references to use `profile_picture_url`
- **ReviewItem.tsx**: Updated to display profile pictures using new column name
- **reviewService.ts**: Updated interface and queries to use new column name
- **Storage bucket**: Changed from `profile-photos` to `profile-pictures`

## Step 1: Apply the Database Migration

1. **Go to your Supabase Dashboard**
   - Navigate to your project
   - Go to the "SQL Editor" section

2. **Run the New Migration**
   - Copy and paste the contents of `supabase-migrations/016_update_profile_pictures_bucket.sql`
   - Click "Run" to execute the migration

## Step 2: Verify the Setup

The migration should:
- Create `profile-pictures` storage bucket
- Set up proper RLS policies for the new bucket
- Allow users to upload, update, and delete their own profile pictures

## Step 3: Test the Profile Picture Functionality

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to your profile** (http://localhost:5176/user/[your-user-id])

3. **Test profile picture upload**:
   - Click the camera icon to take a new photo
   - Or click the upload button to select an existing image
   - Verify the image appears correctly

4. **Test profile picture display**:
   - Check that profile pictures appear in review items
   - Verify followers/following lists show profile pictures
   - Ensure profile pictures display correctly in user profiles

## Step 4: Database Verification

If you want to manually verify the setup:

1. **Check the users table**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users' AND column_name = 'profile_picture_url';
   ```

2. **Check storage buckets**:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'profile-pictures';
   ```

3. **Check RLS policies**:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'objects' 
   AND policyname LIKE '%profile%';
   ```

## Common Issues and Solutions

### Issue: "Storage bucket not found"
**Solution**: Run the new migration `016_update_profile_pictures_bucket.sql`

### Issue: "Column profile_picture_url does not exist"
**Solution**: The user table schema should already have this column. If not, check your database schema.

### Issue: "Permission denied"
**Solution**: The RLS policies weren't set up correctly. Re-run the migration.

### Issue: "Failed to upload photo"
**Solution**: Check browser console for detailed error messages. Ensure you're logged in and have proper permissions.

## Migration Notes

- The old `profile-photos` bucket can be manually removed if no longer needed
- All existing profile pictures will need to be re-uploaded to the new bucket
- The new system is fully compatible with the updated user table schema

## File Structure

```
src/
├── components/
│   ├── UserProfile.tsx          # Main profile component with upload logic
│   └── ReviewItem.tsx           # Displays profile pictures in reviews
├── services/
│   └── reviewService.ts         # Updated to use profile_picture_url
└── supabase-migrations/
    └── 016_update_profile_pictures_bucket.sql  # New migration
```

## API Endpoints Used

- **Storage**: `profile-pictures` bucket for image storage
- **Database**: `users` table with `profile_picture_url` column
- **RLS Policies**: Secure access to user's own profile pictures only
