#!/bin/bash

echo "🏗️ Creating KotaPay Backend Server"
echo "================================="

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

# Create backend directory
BACKEND_DIR="/Users/bullionhead/Desktop/kotapay-backend"

print_status "info" "Creating backend directory at $BACKEND_DIR"

if [ -d "$BACKEND_DIR" ]; then
    print_status "warning" "Backend directory already exists. Cleaning up..."
    rm -rf "$BACKEND_DIR"
fi

mkdir -p "$BACKEND_DIR"
cd "$BACKEND_DIR"

print_status "success" "Created backend directory"

# Initialize Node.js project
print_status "info" "Initializing Node.js project..."

cat > package.json << 'EOF'
{
  "name": "kotapay-backend",
  "version": "1.0.0",
  "description": "KotaPay Backend Server with Paystack Integration",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "keywords": ["paystack", "payment", "api", "kotapay"],
  "author": "KotaPay Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "axios": "^1.5.0",
    "crypto": "^1.0.1",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

print_status "success" "Created package.json"

# Create directory structure
mkdir -p src/{routes,controllers,middleware,utils,config}
mkdir -p tests

# Create main server file
print_status "info" "Creating main server file..."

cat > src/index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const paystackRoutes = require('./routes/paystack');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transactions');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081', 'exp://192.168.3.249:8081'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/api/paystack', paystackRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'KotaPay Backend API',
        version: '1.0.0',
        status: 'running',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            health: '/health',
            paystack: '/api/paystack',
            wallet: '/api/wallet',
            transactions: '/api/transactions'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path
    });
});

app.listen(PORT, () => {
    console.log(`🚀 KotaPay Backend Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    console.log(`💳 Paystack Environment: ${process.env.PAYSTACK_SECRET_KEY ? 'LIVE' : 'TEST'}`);
});

module.exports = app;
EOF

# Create health check route
cat > src/routes/health.js << 'EOF'
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        checks: {
            paystack: process.env.PAYSTACK_SECRET_KEY ? 'configured' : 'not configured',
            database: 'connected', // Update when you add database
            redis: 'not configured' // Update if you add Redis
        }
    };
    
    try {
        res.status(200).json(healthCheck);
    } catch (error) {
        healthCheck.message = error;
        res.status(503).json(healthCheck);
    }
});

module.exports = router;
EOF

# Create Paystack routes
cat > src/routes/paystack.js << 'EOF'
const express = require('express');
const router = express.Router();
const paystackController = require('../controllers/paystackController');

// Initialize payment
router.post('/initialize', paystackController.initializePayment);

// Verify payment
router.get('/verify/:reference', paystackController.verifyPayment);

// Get banks
router.get('/banks', paystackController.getBanks);

// Create transfer recipient
router.post('/transfer-recipient', paystackController.createTransferRecipient);

// Initiate transfer
router.post('/transfer', paystackController.initiateTransfer);

// Webhook endpoint
router.post('/webhook', paystackController.handleWebhook);

module.exports = router;
EOF

# Create wallet routes
cat > src/routes/wallet.js << 'EOF'
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

// Get wallet balance
router.get('/balance/:userId', walletController.getBalance);

// Credit wallet
router.post('/credit', walletController.creditWallet);

// Debit wallet
router.post('/debit', walletController.debitWallet);

// Transfer between wallets
router.post('/transfer', walletController.transferFunds);

module.exports = router;
EOF

# Create transaction routes
cat > src/routes/transactions.js << 'EOF'
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Get transaction history
router.get('/history/:userId', transactionController.getTransactionHistory);

// Get transaction details
router.get('/:transactionId', transactionController.getTransactionDetails);

// Create transaction record
router.post('/create', transactionController.createTransaction);

module.exports = router;
EOF

# Create Paystack controller
cat > src/controllers/paystackController.js << 'EOF'
const axios = require('axios');
const crypto = require('crypto');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystackAPI = axios.create({
    baseURL: PAYSTACK_BASE_URL,
    headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
    }
});

const initializePayment = async (req, res) => {
    try {
        const { email, amount, currency = 'NGN', metadata } = req.body;
        
        if (!email || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Email and amount are required'
            });
        }

        const response = await paystackAPI.post('/transaction/initialize', {
            email,
            amount: amount * 100, // Convert to kobo
            currency,
            metadata
        });

        res.json({
            success: true,
            data: response.data.data
        });
    } catch (error) {
        console.error('Paystack initialization error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Payment initialization failed',
            error: error.response?.data?.message || error.message
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;
        
        const response = await paystackAPI.get(`/transaction/verify/${reference}`);
        
        res.json({
            success: true,
            data: response.data.data
        });
    } catch (error) {
        console.error('Paystack verification error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.response?.data?.message || error.message
        });
    }
};

const getBanks = async (req, res) => {
    try {
        const response = await paystackAPI.get('/bank');
        
        res.json({
            success: true,
            data: response.data.data
        });
    } catch (error) {
        console.error('Get banks error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banks',
            error: error.response?.data?.message || error.message
        });
    }
};

const createTransferRecipient = async (req, res) => {
    try {
        const { name, account_number, bank_code, currency = 'NGN' } = req.body;
        
        const response = await paystackAPI.post('/transferrecipient', {
            type: 'nuban',
            name,
            account_number,
            bank_code,
            currency
        });
        
        res.json({
            success: true,
            data: response.data.data
        });
    } catch (error) {
        console.error('Create transfer recipient error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create transfer recipient',
            error: error.response?.data?.message || error.message
        });
    }
};

const initiateTransfer = async (req, res) => {
    try {
        const { source = 'balance', amount, recipient, reason } = req.body;
        
        const response = await paystackAPI.post('/transfer', {
            source,
            amount: amount * 100, // Convert to kobo
            recipient,
            reason
        });
        
        res.json({
            success: true,
            data: response.data.data
        });
    } catch (error) {
        console.error('Transfer initiation error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Transfer initiation failed',
            error: error.response?.data?.message || error.message
        });
    }
};

const handleWebhook = (req, res) => {
    try {
        const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY)
                          .update(JSON.stringify(req.body))
                          .digest('hex');
        
        if (hash === req.headers['x-paystack-signature']) {
            const event = req.body;
            
            // Handle different event types
            switch (event.event) {
                case 'charge.success':
                    console.log('Payment successful:', event.data.reference);
                    // Update your database here
                    break;
                case 'transfer.success':
                    console.log('Transfer successful:', event.data.reference);
                    // Update your database here
                    break;
                case 'transfer.failed':
                    console.log('Transfer failed:', event.data.reference);
                    // Handle failed transfer
                    break;
                default:
                    console.log('Unhandled event:', event.event);
            }
            
            res.status(200).send('OK');
        } else {
            res.status(400).send('Invalid signature');
        }
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Webhook processing failed');
    }
};

module.exports = {
    initializePayment,
    verifyPayment,
    getBanks,
    createTransferRecipient,
    initiateTransfer,
    handleWebhook
};
EOF

# Create wallet controller
cat > src/controllers/walletController.js << 'EOF'
// Placeholder wallet controller - integrate with your database
const wallets = new Map(); // In-memory storage for demo

const getBalance = async (req, res) => {
    try {
        const { userId } = req.params;
        const balance = wallets.get(userId) || { balance: 0, currency: 'NGN' };
        
        res.json({
            success: true,
            data: balance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get balance',
            error: error.message
        });
    }
};

const creditWallet = async (req, res) => {
    try {
        const { userId, amount, reference, description } = req.body;
        
        const currentBalance = wallets.get(userId) || { balance: 0, currency: 'NGN' };
        const newBalance = currentBalance.balance + amount;
        
        wallets.set(userId, {
            ...currentBalance,
            balance: newBalance,
            lastUpdated: new Date().toISOString()
        });
        
        res.json({
            success: true,
            message: 'Wallet credited successfully',
            data: {
                userId,
                amount,
                newBalance,
                reference,
                description
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to credit wallet',
            error: error.message
        });
    }
};

const debitWallet = async (req, res) => {
    try {
        const { userId, amount, reference, description } = req.body;
        
        const currentBalance = wallets.get(userId) || { balance: 0, currency: 'NGN' };
        
        if (currentBalance.balance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }
        
        const newBalance = currentBalance.balance - amount;
        
        wallets.set(userId, {
            ...currentBalance,
            balance: newBalance,
            lastUpdated: new Date().toISOString()
        });
        
        res.json({
            success: true,
            message: 'Wallet debited successfully',
            data: {
                userId,
                amount,
                newBalance,
                reference,
                description
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to debit wallet',
            error: error.message
        });
    }
};

const transferFunds = async (req, res) => {
    try {
        const { fromUserId, toUserId, amount, reference, description } = req.body;
        
        // Check sender balance
        const senderBalance = wallets.get(fromUserId) || { balance: 0, currency: 'NGN' };
        if (senderBalance.balance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }
        
        // Debit sender
        const newSenderBalance = senderBalance.balance - amount;
        wallets.set(fromUserId, {
            ...senderBalance,
            balance: newSenderBalance,
            lastUpdated: new Date().toISOString()
        });
        
        // Credit receiver
        const receiverBalance = wallets.get(toUserId) || { balance: 0, currency: 'NGN' };
        const newReceiverBalance = receiverBalance.balance + amount;
        wallets.set(toUserId, {
            ...receiverBalance,
            balance: newReceiverBalance,
            lastUpdated: new Date().toISOString()
        });
        
        res.json({
            success: true,
            message: 'Transfer completed successfully',
            data: {
                fromUserId,
                toUserId,
                amount,
                reference,
                description,
                senderNewBalance: newSenderBalance,
                receiverNewBalance: newReceiverBalance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Transfer failed',
            error: error.message
        });
    }
};

module.exports = {
    getBalance,
    creditWallet,
    debitWallet,
    transferFunds
};
EOF

# Create transaction controller
cat > src/controllers/transactionController.js << 'EOF'
// Placeholder transaction controller - integrate with your database
const transactions = new Map(); // In-memory storage for demo

const getTransactionHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        // Get user transactions (demo data)
        const userTransactions = Array.from(transactions.values())
            .filter(tx => tx.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedTransactions = userTransactions.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                transactions: paginatedTransactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: userTransactions.length,
                    totalPages: Math.ceil(userTransactions.length / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get transaction history',
            error: error.message
        });
    }
};

const getTransactionDetails = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = transactions.get(transactionId);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get transaction details',
            error: error.message
        });
    }
};

const createTransaction = async (req, res) => {
    try {
        const {
            userId,
            type,
            amount,
            currency = 'NGN',
            reference,
            description,
            metadata
        } = req.body;
        
        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const transaction = {
            id: transactionId,
            userId,
            type,
            amount,
            currency,
            reference,
            description,
            metadata,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        transactions.set(transactionId, transaction);
        
        res.json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create transaction',
            error: error.message
        });
    }
};

module.exports = {
    getTransactionHistory,
    getTransactionDetails,
    createTransaction
};
EOF

# Create environment file
cat > .env << 'EOF'
# Server Configuration
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.3.249:8081

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here

# Database Configuration (if using)
# DATABASE_URL=your_database_url_here

# Redis Configuration (if using)
# REDIS_URL=your_redis_url_here
EOF

# Create .env.example
cp .env .env.example
sed -i '' 's/your_paystack_secret_key_here/sk_live_xxxxxxxxxx/' .env.example
sed -i '' 's/your_paystack_public_key_here/pk_live_xxxxxxxxxx/' .env.example

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
tmp/
temp/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

# Create README
cat > README.md << 'EOF'
# KotaPay Backend Server

A production-ready Node.js backend server for KotaPay with Paystack integration.

## Features

- 🔐 Secure Paystack payment processing
- 💰 Wallet management system
- 📊 Transaction tracking
- 🔒 Rate limiting and security headers
- 📝 Comprehensive logging
- 🏥 Health check endpoints
- 🔄 Webhook handling

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Paystack keys
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Paystack Integration
- `POST /api/paystack/initialize` - Initialize payment
- `GET /api/paystack/verify/:reference` - Verify payment
- `GET /api/paystack/banks` - Get bank list
- `POST /api/paystack/transfer-recipient` - Create transfer recipient
- `POST /api/paystack/transfer` - Initiate transfer
- `POST /api/paystack/webhook` - Webhook endpoint

### Wallet Management
- `GET /api/wallet/balance/:userId` - Get wallet balance
- `POST /api/wallet/credit` - Credit wallet
- `POST /api/wallet/debit` - Debit wallet
- `POST /api/wallet/transfer` - Transfer between wallets

### Transactions
- `GET /api/transactions/history/:userId` - Transaction history
- `GET /api/transactions/:transactionId` - Transaction details
- `POST /api/transactions/create` - Create transaction record

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 3000) | No |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | Yes |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins | No |

## Security

- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- Request body size limits
- Input validation

## Testing

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## Production Deployment

1. Set environment to production:
```bash
export NODE_ENV=production
```

2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start src/index.js --name kotapay-backend
```

3. Set up SSL/TLS termination (nginx/cloudflare)

4. Configure webhook endpoint with Paystack

## License

MIT
EOF

print_status "success" "Backend project structure created!"

echo ""
print_status "info" "Next steps:"
echo "1. cd $BACKEND_DIR"
echo "2. npm install"
echo "3. Edit .env with your Paystack keys"
echo "4. npm run dev"

echo ""
print_status "success" "Backend server ready for use!"
