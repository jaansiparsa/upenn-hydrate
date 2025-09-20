# Profile Picture Upload Debug Guide

## Step 1: Check Browser Console

1. **Open your app** (http://localhost:5176)
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Try to upload a profile picture**
5. **Look for any error messages** in the console

## Step 2: Check Network Tab

1. **Go to Network tab** in Developer Tools
2. **Try uploading a profile picture**
3. **Look for failed requests** (they'll be in red)
4. **Check the response** for any error messages

## Step 3: Verify Database Permissions

Run this SQL in your Supabase SQL Editor to check if the user can update their profile:

```sql
-- Check if you can update your own profile
SELECT id, email, display_name, profile_picture_url 
FROM users 
WHERE id = auth.uid();
```

## Step 4: Verify Storage Permissions

Run this SQL to check storage bucket policies:

```sql
-- Check storage bucket policies
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%profile%';
```

## Step 5: Test Storage Upload Manually

Try this in your browser console while on your profile page:

```javascript
// Test if you can access the storage bucket
const { data, error } = await supabase.storage
  .from('profile-pictures')
  .list('', { limit: 1 });

console.log('Storage test result:', { data, error });
```

## Common Issues and Solutions

### Issue: "Permission denied" or "Row Level Security" error
**Solution**: The user might not be authenticated or RLS policies are blocking the operation.

### Issue: "Storage bucket not found"
**Solution**: The bucket exists but might not be accessible due to permissions.

### Issue: "Database update failed"
**Solution**: Check if the user has permission to update their own row in the users table.

### Issue: "File upload failed"
**Solution**: Check file size, type, and network connectivity.

## Debug Information to Collect

When you try to upload, please share:
1. **Console error messages**
2. **Network request failures**
3. **Any error messages shown in the UI**
4. **Your user ID** (from the URL or console)
