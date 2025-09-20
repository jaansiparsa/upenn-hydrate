#!/bin/bash

# Database seeding script for Hydrate application
# This script seeds the database with sample users and ratings

echo "🌱 Starting database seeding for Hydrate..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Available seeding scripts:"
echo "1. 009_seed_ratings_and_users.sql - Seeds with specific fountain names"
echo "2. 010_flexible_seed_ratings.sql - Seeds with any existing fountains"
echo ""

read -p "Which seeding script would you like to run? (1 or 2): " choice

case $choice in
    1)
        echo "🚀 Running specific fountain seeding script..."
        echo "📝 Copy the contents of supabase-migrations/009_seed_ratings_and_users.sql"
        echo "📝 Paste it into your Supabase SQL editor and run it"
        echo ""
        echo "This script will create:"
        echo "• 8 sample users with realistic profiles"
        echo "• 15 ratings across 4 specific fountains"
        echo "• Proper badge assignments based on rating counts"
        ;;
    2)
        echo "🚀 Running flexible seeding script..."
        echo "📝 Copy the contents of supabase-migrations/010_flexible_seed_ratings.sql"
        echo "📝 Paste it into your Supabase SQL editor and run it"
        echo ""
        echo "This script will create:"
        echo "• 10 sample users with realistic profiles"
        echo "• Random ratings for any existing fountains in your database"
        echo "• Realistic ratings based on fountain status"
        echo "• Proper badge assignments based on rating counts"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1 or 2."
        exit 1
        ;;
esac

echo ""
echo "📖 Instructions:"
echo "1. Open your Supabase dashboard"
echo "2. Go to the SQL Editor"
echo "3. Copy and paste the selected script"
echo "4. Run the script"
echo "5. Check the results in your application!"
echo ""
echo "✅ Seeding script ready! Happy testing! 🎉"
