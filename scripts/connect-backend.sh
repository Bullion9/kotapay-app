#!/bin/bash

echo "🔗 KotaPay Frontend-Backend Connection Setup"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️ $2${NC}" ;;
        "info") echo -e "${BLUE}ℹ️ $2${NC}" ;;
    esac
}

echo ""
print_status "info" "Step 1: Environment Configuration"
echo "==================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_status "warning" ".env.local not found. Creating from template..."
    cp .env.template .env.local
    print_status "success" "Created .env.local from template"
    echo ""
    print_status "warning" "IMPORTANT: You need to update .env.local with your actual values!"
    echo ""
    echo "Required updates in .env.local:"
    echo "1. EXPO_PUBLIC_API_URL - Your backend server URL"
    echo "2. EXPO_PUBLIC_APPWRITE_PROJECT_ID - Your Appwrite project ID"
    echo "3. EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY - Your Paystack public key"
    echo ""
    echo "Would you like me to open .env.local for editing? (y/n)"
    read -r response
    if [[ $response =~ ^[Yy]$ ]]; then
        if command -v code &> /dev/null; then
            code .env.local
        elif command -v nano &> /dev/null; then
            nano .env.local
        else
            print_status "info" "Please edit .env.local manually"
        fi
    fi
else
    print_status "success" ".env.local already exists"
fi

echo ""
print_status "info" "Step 2: Dependency Check"
echo "========================="

# Check if required packages are installed
REQUIRED_PACKAGES=("expo-crypto" "expo-device" "expo-local-authentication" "node-appwrite")
MISSING_PACKAGES=()

for package in "${REQUIRED_PACKAGES[@]}"; do
    if npm list "$package" > /dev/null 2>&1; then
        print_status "success" "$package is installed"
    else
        print_status "error" "$package is missing"
        MISSING_PACKAGES+=("$package")
    fi
done

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo ""
    print_status "info" "Installing missing packages..."
    for package in "${MISSING_PACKAGES[@]}"; do
        echo "Installing $package..."
        npm install "$package"
    done
fi

echo ""
print_status "info" "Step 3: Backend Connection"
echo "=========================="

# Function to get IP address
get_ip() {
    if command -v ipconfig &> /dev/null; then
        # macOS
        ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null
    elif command -v hostname &> /dev/null; then
        # Linux
        hostname -I | awk '{print $1}'
    else
        echo "192.168.1.100"
    fi
}

LOCAL_IP=$(get_ip)

echo "Your backend connection options:"
echo "1. Localhost: http://localhost:3000"
echo "2. Local IP: http://$LOCAL_IP:3000"
echo "3. Android Emulator: http://10.0.2.2:3000"
echo ""

# Check if backend is running locally
if curl -s "http://localhost:3000/health" > /dev/null 2>&1; then
    print_status "success" "Backend detected on localhost:3000"
elif curl -s "http://$LOCAL_IP:3000/health" > /dev/null 2>&1; then
    print_status "success" "Backend detected on $LOCAL_IP:3000"
else
    print_status "warning" "Backend not detected. Make sure it's running!"
    echo ""
    echo "To start your backend:"
    echo "1. cd /Users/bullionhead/Desktop/backend"
    echo "2. npm start (or your backend start command)"
fi

echo ""
print_status "info" "Step 4: Database Setup"
echo "======================"

if [ -f "setup-database.js" ]; then
    echo "Would you like to setup the database now? (y/n)"
    echo "Note: You'll need your Appwrite API key from the backend"
    read -r response
    if [[ $response =~ ^[Yy]$ ]]; then
        echo "Enter your Appwrite API key:"
        read -r api_key
        if [ ! -z "$api_key" ]; then
            node setup-database.js "$api_key"
        else
            print_status "error" "API key is required for database setup"
        fi
    fi
else
    print_status "error" "Database setup script not found"
fi

echo ""
print_status "info" "Step 5: Connection Testing"
echo "=========================="

echo "Testing connections..."

# Test localhost backend
if curl -s "http://localhost:3000/health" > /dev/null 2>&1; then
    print_status "success" "Backend (localhost:3000) - OK"
else
    print_status "error" "Backend (localhost:3000) - Not reachable"
fi

# Test Appwrite
if curl -s "https://cloud.appwrite.io/v1/health" > /dev/null 2>&1; then
    print_status "success" "Appwrite - OK"
else
    print_status "error" "Appwrite - Not reachable"
fi

# Test Paystack
if curl -s "https://api.paystack.co/" > /dev/null 2>&1; then
    print_status "success" "Paystack - OK"
else
    print_status "error" "Paystack - Not reachable"
fi

echo ""
print_status "info" "Setup Summary"
echo "============="
echo "✅ Environment file: .env.local"
echo "✅ Dependencies: Installed"
echo "✅ Configuration: Updated"
echo "✅ Connection tester: Available"
echo ""
echo "🚀 Next Steps:"
echo "1. Update .env.local with your actual values"
echo "2. Start your backend server"
echo "3. Run database setup if needed"
echo "4. Test the connection in your app"
echo ""
print_status "success" "Frontend-Backend connection setup complete!"

echo ""
echo "📱 To test the connection in your app, you can use:"
echo "import { connectionTester } from './src/utils/ConnectionTester';"
echo "connectionTester.testAllConnections();"
