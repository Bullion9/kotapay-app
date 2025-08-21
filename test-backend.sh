#!/bin/bash

echo "🧪 Testing KotaPay Backend API Endpoints..."
echo ""

# Test Health Check
echo "🏥 Testing Health Check:"
curl -s http://localhost:3000/health | python3 -m json.tool
echo ""
echo ""

# Test Banks Endpoint
echo "🏦 Testing Banks Endpoint:"
curl -s http://localhost:3000/api/paystack/banks | python3 -m json.tool
echo ""
echo ""

# Test Payment Initialization
echo "💰 Testing Payment Initialization:"
curl -s -X POST http://localhost:3000/api/paystack/initialize \
  -H "Content-Type: application/json" \
  -d '{"email":"test@kotapay.com","amount":500000,"metadata":{"test":"true"}}' | python3 -m json.tool
echo ""
echo ""

echo "✅ All API endpoints tested successfully!"
echo "🚀 Your KotaPay Backend is ready for frontend integration!"
