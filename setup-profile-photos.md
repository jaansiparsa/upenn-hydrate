# Profile Photos Setup Guide

## Issue: "Failed to upload photo" Error

The error you're experiencing is likely because the database migration for profile photos hasn't been applied yet. Here's how to fix it:

## Step 1: Apply the Database Migration

1. **Go to your Supabase Dashboard**
   - Navigate to your project
   - Go to the "SQL Editor" section

2. **Run the Migration**
   - Copy and paste the contents of `supabase-migrations/014_add_profile_photos.sql`
   - Click "Run" to execute the migration

## Step 2: Verify the Migration

The migration should:
- Add `profile_photo_url` column to the `users` table
- Create `profile-photos` storage bucket
- Set up proper RLS policies

## Step 3: Test the Photo Upload

1. **Refresh your app** (http://localhost:5175)
2. **Go to your profile**
3. **Try uploading a photo** using either:
   - The blue upload button (for existing photos)
   - The green camera button (for taking new photos)

## Step 4: Check Browser Console

If you still get errors, check the browser console (F12) for detailed error messages. The updated code now provides much better error reporting.

## Common Issues and Solutions

### Issue: "Storage bucket not found"
**Solution**: The migration wasn't applied. Run the SQL migration in Supabase.

### Issue: "User not found"
**Solution**: Make sure you're logged in and viewing your own profile.

### Issue: "Permission denied"
**Solution**: The RLS policies weren't set up correctly. Re-run the migration.

### Issue: "Database error"
**Solution**: Check if the `profile_photo_url` column exists in your `users` table.

## Manual Database Check

If you want to manually verify the setup:

1. **Check the users table**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users' AND column_name = 'profile_photo_url';
   ```

2. **Check storage buckets**:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'profile-photos';
   ```

3. **Check RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%profile%';
   ```

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify the migration was applied successfully
3. Make sure you're logged in to the app
4. Try refreshing the page after applying the migration

The updated code now provides much better error messages to help diagnose any remaining issues.
