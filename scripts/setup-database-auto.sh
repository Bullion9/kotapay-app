#!/bin/bash
# Script to setup KotaPay database using backend API key

echo "🔧 KotaPay Database Setup"
echo "========================"

# Check if backend directory exists
BACKEND_DIR="/Users/bullionhead/Desktop/backend"
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found at: $BACKEND_DIR"
    echo "Please check the backend path and try again."
    exit 1
fi

echo "📂 Looking for API key in backend directory..."

# Common files where API keys might be stored
API_KEY_FILES=(
    "$BACKEND_DIR/.env"
    "$BACKEND_DIR/.env.local" 
    "$BACKEND_DIR/config.js"
    "$BACKEND_DIR/config/appwrite.js"
    "$BACKEND_DIR/src/config/appwrite.js"
    "$BACKEND_DIR/appwrite.json"
)

API_KEY=""

# Search for API key in common files
for file in "${API_KEY_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "🔍 Checking: $file"
        
        # Look for various API key patterns
        API_KEY=$(grep -E "(APPWRITE_API_KEY|API_KEY|appwrite.*key)" "$file" | head -1 | sed 's/.*[=:][[:space:]]*//' | tr -d '"' | tr -d "'")
        
        if [ ! -z "$API_KEY" ] && [ "$API_KEY" != "your_api_key_here" ]; then
            echo "✅ Found API key in: $file"
            break
        fi
    fi
done

if [ -z "$API_KEY" ] || [ "$API_KEY" = "your_api_key_here" ]; then
    echo "❌ No valid API key found in backend files"
    echo ""
    echo "💡 Manual setup options:"
    echo "1. Get your API key from: https://cloud.appwrite.io/project-675b34f600151bb4bb8c/settings/keys"
    echo "2. Run: APPWRITE_API_KEY=your_key node setup-database.js"
    echo "3. Or: node setup-database.js your_key"
    exit 1
fi

echo "🚀 Setting up database with found API key..."
cd /Users/bullionhead/Desktop/kotapay

# Run the database setup script
node setup-database.js "$API_KEY"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Database setup completed successfully!"
    echo "✅ All KotaPay collections are ready for use!"
else
    echo ""
    echo "❌ Database setup failed. Please check the error messages above."
    echo "💡 You may need to:"
    echo "   - Verify your API key has proper permissions"
    echo "   - Check your internet connection"
    echo "   - Ensure the database 'kotapay-db' exists in your Appwrite project"
fi
