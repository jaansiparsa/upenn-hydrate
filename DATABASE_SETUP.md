# Supabase Database Setup for Hydrate

This guide will help you set up the Supabase database for the Hydrate water fountain mapping application.

## 🗄️ Database Setup

### 1. Update Existing Fountains Table

Since you already have a `fountains` table, run the SQL script in `supabase-migrations/003_update_existing_fountains_table.sql` in your Supabase SQL editor:

```sql
-- The script adds:
-- - status column (working, maintenance, out_of_order)
-- - type column (indoor, outdoor)
-- - last_checked timestamp
-- - image_url for fountain images
-- - Proper indexes and constraints
-- - Sample data with new fields
```

### 2. Create Storage Bucket for Images

Run the SQL script in `supabase-migrations/002_create_storage_bucket.sql` in your Supabase SQL editor:

```sql
-- The script creates:
-- - fountain-images storage bucket
-- - Public read access policies
-- - Authenticated user upload/update/delete policies
```

### 3. Table Structure

The updated `fountains` table includes:

**Existing columns:**

- `id` (UUID) - Primary key
- `name` (TEXT) - Fountain name
- `building` (TEXT) - Building name
- `floor` (TEXT) - Floor location
- `latitude` (DOUBLE PRECISION) - Latitude coordinate
- `longitude` (DOUBLE PRECISION) - Longitude coordinate
- `description` (TEXT) - Optional description
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time

**New columns added:**

- `status` (TEXT) - 'working', 'maintenance', or 'out_of_order'
- `type` (TEXT) - 'indoor' or 'outdoor'
- `last_checked` (TIMESTAMP) - When fountain was last checked
- `image_url` (TEXT) - URL to fountain image in Supabase Storage

### 4. Row Level Security (RLS)

The table has RLS enabled with policies for:

- **Public read access** - Anyone can view fountains
- **Authenticated write access** - Only authenticated users can modify

## 🔧 API Functions

The `fountainService.ts` provides these functions:

### Read Operations

- `getFountains()` - Fetch all fountains
- `getFountain(id)` - Fetch single fountain

### Write Operations

- `createFountain(data)` - Create new fountain
- `updateFountain(id, updates)` - Update fountain
- `deleteFountain(id)` - Delete fountain

### Image Operations

- `uploadFountainImage(file, fountainId)` - Upload fountain image
- `deleteFountainImage(imageUrl)` - Delete fountain image

### Real-time

- `subscribeToFountains(callback)` - Listen for changes

## 📍 Adding New Fountains

### Via Supabase Dashboard

1. Go to Table Editor → fountains
2. Click "Insert" → "Insert row"
3. Fill in the required fields:
   - `name`: Fountain name
   - `building`: Building name
   - `floor`: Floor location
   - `latitude`: Latitude coordinate (e.g., 39.9522)
   - `longitude`: Longitude coordinate (e.g., -75.1932)
   - `description`: Optional description
   - `status`: working/maintenance/out_of_order
   - `type`: indoor/outdoor
   - `last_checked`: Optional timestamp
   - `image_url`: Optional image URL

### Via Code

```typescript
import { createFountain } from "./services/fountainService";

const newFountain = await createFountain({
  name: "New Fountain",
  building: "Main Building",
  floor: "Ground Floor",
  latitude: 39.9522,
  longitude: -75.1932,
  description: "A new water fountain",
  status: "working",
  type: "indoor",
  last_checked: new Date().toISOString(),
  image_url:
    "https://your-project.supabase.co/storage/v1/object/public/fountain-images/fountain-id.jpg",
});
```

## 🖼️ Image Management

### Uploading Images

1. **Via Supabase Dashboard**:

   - Go to Storage → fountain-images bucket
   - Click "Upload file"
   - Name the file with the fountain ID (e.g., `uuid.jpg`)

2. **Via Code**:

   ```typescript
   import {
     uploadFountainImage,
     updateFountain,
   } from "./services/fountainService";

   // Upload image and get URL
   const imageUrl = await uploadFountainImage(file, fountainId);

   // Update fountain with image URL
   await updateFountain(fountainId, { image_url: imageUrl });
   ```

### Image Requirements

- **Supported formats**: JPG, PNG, WebP
- **Recommended size**: 800x600px or similar aspect ratio
- **File naming**: Use fountain ID as filename (e.g., `uuid.jpg`)
- **Storage bucket**: `fountain-images`

### Image URLs

Images are served from: `https://your-project.supabase.co/storage/v1/object/public/fountain-images/filename.jpg`

## 🔄 Real-time Updates

The app automatically updates when fountain data changes:

- Status updates appear immediately
- New fountains show up instantly
- Deleted fountains are removed from map

## 🎨 Customization

### Adding New Status Types

1. Update the database CHECK constraint:

   ```sql
   ALTER TABLE fountains DROP CONSTRAINT fountains_status_check;
   ALTER TABLE fountains ADD CONSTRAINT fountains_status_check
   CHECK (status IN ('working', 'maintenance', 'out_of_order', 'new_status'));
   ```

2. Update TypeScript types in `fountainService.ts`

3. Update marker colors in `Map.tsx`

### Adding New Fountain Types

1. Update the database CHECK constraint:

   ```sql
   ALTER TABLE fountains DROP CONSTRAINT fountains_type_check;
   ALTER TABLE fountains ADD CONSTRAINT fountains_type_check
   CHECK (type IN ('indoor', 'outdoor', 'new_type'));
   ```

2. Update TypeScript types and marker icons

## 🚀 Production Considerations

1. **Security**: Review RLS policies for your use case
2. **Performance**: Add more indexes if needed
3. **Backup**: Set up regular database backups
4. **Monitoring**: Monitor query performance
5. **Scaling**: Consider read replicas for high traffic

## 🐛 Troubleshooting

### Common Issues

1. **"Permission denied"**: Check RLS policies
2. **"Invalid coordinates"**: Ensure POINT format is correct
3. **"Real-time not working"**: Check Supabase real-time settings
4. **"Markers not showing"**: Verify coordinates are valid lat/lng

### Debug Tips

- Check browser console for errors
- Use Supabase dashboard to verify data
- Test API calls in Supabase API docs
- Check network tab for failed requests
