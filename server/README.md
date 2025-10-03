# Blockchain Voting System - Backend

A secure, transparent, and tamper-proof voting system built with MERN stack and Ethereum blockchain.

## Features

- **Blockchain Integration**: Votes stored immutably on Ethereum blockchain
- **User Authentication**: JWT-based authentication with role-based access control
- **Election Management**: Create, manage, and monitor elections
- **Candidate Management**: Add and manage candidates for elections
- **Secure Voting**: One person, one vote with blockchain verification
- **Real-time Results**: Live vote counting and result declaration
- **Vote Verification**: Voters can verify their votes on the blockchain
- **Admin Dashboard**: Comprehensive statistics and analytics

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Blockchain**: Ethereum (Solidity), Web3.js
- **Authentication**: JWT, bcrypt
- **Local Blockchain**: Ganache (for development)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Ganache (or any Ethereum test network)
- Truffle (for smart contract compilation and deployment)

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configurations:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/eVoting
JWT_SECRET=your-secret-key
BLOCKCHAIN_PROVIDER_URL=http://localhost:7545
CLIENT_URL=http://localhost:3000
```

4. **Start MongoDB**
```bash
mongod
```

5. **Start Ganache**
- Open Ganache and create a new workspace
- Note the RPC Server URL (usually http://127.0.0.1:7545)

6. **Compile and Deploy Smart Contract**
```bash
# In the root directory
truffle compile
truffle migrate --reset
```

7. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── userController.js  # User management
│   ├── electionController.js
│   ├── candidateController.js
│   └── voteController.js
├── models/
│   ├── User.js
│   ├── Election.js
│   ├── Candidate.js
│   └── Vote.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── electionRoutes.js
│   ├── candidateRoutes.js
│   └── voteRoutes.js
├── middleware/
│   └── auth.js            # Authentication middleware
├── utils/
│   └── web3Utils.js       # Blockchain utilities
├── .env.example
├── server.js
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/link-wallet` - Link wallet address

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/role` - Update user role (Admin)
- `PUT /api/users/:id/verify` - Verify user (Admin)

### Elections
- `POST /api/elections` - Create election (Admin)
- `GET /api/elections` - Get all elections
- `GET /api/elections/:id` - Get election by ID
- `PUT /api/elections/:id` - Update election (Admin)
- `POST /api/elections/:id/register-voter` - Register voter (Admin)
- `POST /api/elections/:id/register-voters-bulk` - Bulk register voters (Admin)
- `GET /api/elections/:id/results` - Get election results
- `POST /api/elections/:id/declare-results` - Declare results (Admin)
- `GET /api/elections/:id/stats` - Get election statistics

### Candidates
- `POST /api/candidates` - Add candidate (Admin)
- `GET /api/candidates/election/:electionId` - Get candidates for election
- `GET /api/candidates/:id` - Get candidate by ID
- `PUT /api/candidates/:id` - Update candidate (Admin)
- `DELETE /api/candidates/:id` - Delete candidate (Admin)

### Votes
- `POST /api/votes` - Cast vote
- `POST /api/votes/verify` - Verify vote on blockchain
- `GET /api/votes/check/:electionId` - Check if voted
- `GET /api/votes/receipt/:electionId` - Get vote receipt
- `GET /api/votes/history` - Get voter history
- `GET /api/votes/election/:electionId` - Get all votes for election (Admin)
- `GET /api/votes/integrity/:electionId` - Verify vote integrity (Admin)

## Testing

Run the comprehensive test suite:
```bash
npm test
```

## Smart Contract

The Voting smart contract (`contracts/Voting.sol`) handles:
- Election creation
- Candidate management
- Voter registration
- Vote casting with validation
- Result calculation
- Immutable vote storage

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Blockchain immutability
- Vote anonymity
- Double voting prevention
- Blockchain verification for all votes

## Development Workflow

1. Start MongoDB
2. Start Ganache
3. Deploy smart contracts
4. Start backend server
5. Test APIs using Postman or your frontend

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB instance
3. Deploy smart contract to mainnet/testnet
4. Update blockchain provider URL
5. Use proper JWT secrets
6. Enable HTTPS
7. Set up proper CORS policies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Support

For issues and questions, please create an issue on GitHub.
