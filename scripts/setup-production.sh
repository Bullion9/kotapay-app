#!/bin/bash

echo "🚀 KotaPay Production Setup"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() {
    case $1 in
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️ $2${NC}" ;;
        "info") echo -e "${BLUE}ℹ️ $2${NC}" ;;
        "input") echo -e "${PURPLE}📝 $2${NC}" ;;
    esac
}

echo ""
print_status "info" "This script will help you configure KotaPay for production with live Paystack API"
echo ""

# Step 1: Check current configuration
print_status "info" "Step 1: Checking current configuration"
echo "======================================="

if [ -f ".env" ]; then
    print_status "success" "Found .env file"
    
    # Check if Paystack keys are configured
    if grep -q "EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_" .env 2>/dev/null; then
        print_status "warning" "Currently using Paystack TEST keys"
    elif grep -q "EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_" .env 2>/dev/null; then
        print_status "success" "Found Paystack LIVE keys"
    else
        print_status "error" "Paystack keys not configured"
    fi
    
    # Check environment mode
    if grep -q "EXPO_PUBLIC_APP_ENV=production" .env 2>/dev/null; then
        print_status "success" "App is set to production mode"
    else
        print_status "warning" "App is not in production mode"
    fi
else
    print_status "error" ".env file not found"
    exit 1
fi

echo ""

# Step 2: Paystack Configuration
print_status "info" "Step 2: Paystack Configuration"
echo "==============================="

echo "Do you want to configure live Paystack keys? (y/n)"
read -r configure_paystack

if [[ $configure_paystack =~ ^[Yy]$ ]]; then
    print_status "input" "Enter your Paystack PUBLIC key (pk_live_...): "
    read -r paystack_public_key
    
    if [[ $paystack_public_key =~ ^pk_live_ ]]; then
        print_status "success" "Valid live public key format"
        
        # Update .env file
        if grep -q "EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=" .env; then
            sed -i '' "s/EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=.*/EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=$paystack_public_key/" .env
        else
            echo "EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=$paystack_public_key" >> .env
        fi
        print_status "success" "Updated Paystack public key in .env"
    else
        print_status "error" "Invalid public key format. Should start with 'pk_live_'"
    fi
    
    print_status "input" "Enter your Paystack SECRET key (sk_live_...): "
    read -r paystack_secret_key
    
    if [[ $paystack_secret_key =~ ^sk_live_ ]]; then
        print_status "success" "Valid live secret key format"
        
        # Update .env file
        if grep -q "EXPO_PUBLIC_PAYSTACK_SECRET_KEY=" .env; then
            sed -i '' "s/EXPO_PUBLIC_PAYSTACK_SECRET_KEY=.*/EXPO_PUBLIC_PAYSTACK_SECRET_KEY=$paystack_secret_key/" .env
        else
            echo "EXPO_PUBLIC_PAYSTACK_SECRET_KEY=$paystack_secret_key" >> .env
        fi
        print_status "success" "Updated Paystack secret key in .env"
    else
        print_status "error" "Invalid secret key format. Should start with 'sk_live_'"
    fi
fi

echo ""

# Step 3: Backend Configuration
print_status "info" "Step 3: Backend Configuration"
echo "============================="

echo "What's your backend server URL?"
echo "1. Local development (http://localhost:3000)"
echo "2. Local network (http://YOUR_IP:3000)"
echo "3. Production server (https://your-domain.com)"
echo "4. Custom URL"
echo ""
print_status "input" "Choose option (1-4): "
read -r backend_option

case $backend_option in
    1)
        backend_url="http://localhost:3000"
        print_status "success" "Using localhost backend"
        ;;
    2)
        # Get local IP
        if command -v ipconfig &> /dev/null; then
            local_ip=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "192.168.1.100")
        else
            local_ip="192.168.1.100"
        fi
        backend_url="http://$local_ip:3000"
        print_status "success" "Using local network backend: $backend_url"
        ;;
    3)
        print_status "input" "Enter your production domain (e.g., https://api.kotapay.com): "
        read -r backend_url
        print_status "success" "Using production backend: $backend_url"
        ;;
    4)
        print_status "input" "Enter your custom backend URL: "
        read -r backend_url
        print_status "success" "Using custom backend: $backend_url"
        ;;
    *)
        print_status "error" "Invalid option"
        exit 1
        ;;
esac

# Update backend URLs in .env
sed -i '' "s|EXPO_PUBLIC_API_BASE_URL=.*|EXPO_PUBLIC_API_BASE_URL=$backend_url/api|" .env
sed -i '' "s|EXPO_PUBLIC_HEALTH_CHECK_URL=.*|EXPO_PUBLIC_HEALTH_CHECK_URL=$backend_url/health|" .env

echo ""

# Step 4: Set Production Mode
print_status "info" "Step 4: Production Mode"
echo "======================="

echo "Do you want to enable production mode? (y/n)"
echo "Note: This will disable debug logs and enable production optimizations"
read -r enable_production

if [[ $enable_production =~ ^[Yy]$ ]]; then
    sed -i '' "s/EXPO_PUBLIC_APP_ENV=.*/EXPO_PUBLIC_APP_ENV=production/" .env
    print_status "success" "Enabled production mode"
else
    sed -i '' "s/EXPO_PUBLIC_APP_ENV=.*/EXPO_PUBLIC_APP_ENV=development/" .env
    print_status "warning" "Keeping development mode"
fi

echo ""

# Step 5: Test Connections
print_status "info" "Step 5: Testing Connections"
echo "==========================="

echo "Do you want to test the backend connection now? (y/n)"
read -r test_connection

if [[ $test_connection =~ ^[Yy]$ ]]; then
    print_status "info" "Testing backend connection..."
    
    # Test health endpoint
    if curl -s "$backend_url/health" > /dev/null 2>&1; then
        print_status "success" "Backend is reachable"
    else
        print_status "error" "Backend is not reachable at $backend_url"
        echo ""
        print_status "warning" "Make sure your backend server is running!"
        echo "To start your backend:"
        echo "1. cd /Users/bullionhead/Desktop/backend"
        echo "2. npm start"
    fi
    
    # Test Paystack (if configured)
    if [[ $configure_paystack =~ ^[Yy]$ ]]; then
        print_status "info" "Testing Paystack connection..."
        if curl -s "https://api.paystack.co/" > /dev/null 2>&1; then
            print_status "success" "Paystack API is reachable"
        else
            print_status "error" "Paystack API is not reachable"
        fi
    fi
fi

echo ""

# Step 6: Summary
print_status "info" "Setup Summary"
echo "============="

echo ""
echo "📋 Current Configuration:"
echo "========================"
echo "Backend URL: $backend_url"
echo "Environment: $(grep 'EXPO_PUBLIC_APP_ENV=' .env | cut -d'=' -f2)"

if grep -q "pk_live_" .env 2>/dev/null; then
    echo "Paystack: LIVE keys configured ✅"
elif grep -q "pk_test_" .env 2>/dev/null; then
    echo "Paystack: TEST keys configured ⚠️"
else
    echo "Paystack: Not configured ❌"
fi

echo ""
echo "🚀 Next Steps:"
echo "============="
echo "1. Make sure your backend server is running"
echo "2. Test the app with: npm run start"
echo "3. Use the connection tester in your app"
echo "4. Build for production when ready"

echo ""
print_status "success" "KotaPay production setup complete!"

echo ""
echo "📱 To test connections in your app, use:"
echo "import BackendConnectionService from './src/services/BackendConnectionService';"
echo "const connectionService = BackendConnectionService.getInstance();"
echo "await connectionService.testAllConnections();"
