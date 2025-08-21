#!/bin/bash

echo "🧪 Testing KotaPay Backend Network Connectivity..."
echo ""

# Test backend reachability from network IP
echo "🌐 Testing Network IP Access:"
curl -s http://192.168.204.249:3000/health && echo " ✅ Backend accessible via network IP" || echo " ❌ Backend not accessible"

echo ""
echo "🏥 Testing Health Endpoint:"
curl -s http://192.168.204.249:3000/health | python3 -m json.tool 2>/dev/null || echo "Failed to get JSON response"

echo ""
echo "🏦 Testing API Endpoint:"
curl -s http://192.168.204.249:3000/api/paystack/banks | python3 -m json.tool 2>/dev/null | head -10

echo ""
echo "✅ Backend should now be accessible from your React Native app!"
echo "📱 Try navigating to PaystackTestScreen and testing the endpoints"
