// Supabase Configuration
// Replace these values with your actual Supabase project credentials
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || "your_supabase_project_url",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "your_supabase_anon_key",
};

// Mapbox Configuration
// Replace with your actual Mapbox access token
export const mapboxConfig = {
  accessToken:
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "your_mapbox_access_token",
};

// Instructions:
// 1. Create a .env.local file in the root directory
// 2. Add the following variables:
//    VITE_SUPABASE_URL=your_actual_supabase_url
//    VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
//    VITE_MAPBOX_ACCESS_TOKEN=your_actual_mapbox_access_token
// 3. Replace the values with your actual project credentials
// 4. Get your Mapbox token from https://account.mapbox.com/access-tokens/
