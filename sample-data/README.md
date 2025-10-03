# Sample Data for Blockchain Voting System

This folder contains sample data to quickly populate your MongoDB database for testing.

## 📁 Files Included

1. **users.json** - 5 test users (1 admin, 4 voters)
2. **elections.json** - 3 elections (1 active, 1 upcoming, 1 completed)
3. **candidates.json** - 6 candidates (4 for President, 2 for Senator)
4. **import-data.js** - Automated import script

## 🚀 Quick Start

### Option 1: Automated Import (Recommended)

Run the import script from the sample-data directory:

```bash
cd C:\Users\yuvra\OneDrive\Desktop\CapstonePersonal\sample-data
node import-data-direct.js
```

**Note:** This uses the native MongoDB driver for better reliability and handles network timeouts properly.

This will:
- ✅ Connect to your MongoDB
- ✅ Clear existing data
- ✅ Import all users, elections, and candidates
- ✅ Hash passwords securely
- ✅ Link candidates to elections

### Option 2: Manual Import via MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb+srv://yuvraj:yuvraj@cluster0.o9dzamn.mongodb.net/Capstone-BBV`
3. For each collection (users, elections, candidates):
   - Click "ADD DATA" → "Import JSON file"
   - Select the corresponding JSON file
   - Click "Import"

**Note:** For users, you'll need to hash the passwords manually or use Option 1.

### Option 3: Manual Import via MongoDB Shell

```bash
# Connect to MongoDB
mongosh "mongodb+srv://yuvraj:yuvraj@cluster0.o9dzamn.mongodb.net/Capstone-BBV"

# Import users
db.users.insertMany(<paste users.json content>)

# Import elections
db.elections.insertMany(<paste elections.json content>)

# Import candidates
db.candidates.insertMany(<paste candidates.json content>)
```

## 🔐 Test Credentials

### Admin Account
- **Email:** admin@electoral.com
- **Password:** password123
- **Role:** admin
- **Wallet:** 0x742d35Cc6636C0532925a3b8D0cD1fE95B1b62BA

### Voter Accounts
All voter accounts use the same password: **password123**

| Name | Email | Wallet Address |
|------|-------|----------------|
| John Doe | john@example.com | 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063 |
| Jane Smith | jane@example.com | 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 |
| Michael Chen | michael@example.com | 0xc2132D05D31c914a87C6611C10748AEb04B58e8F |
| Sarah Johnson | sarah@example.com | 0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6 |

## 🗳️ Elections Included

### 1. 2025 Presidential Election (ACTIVE)
- **Status:** Active
- **Dates:** March 1 - March 31, 2025
- **Candidates:** 4 presidential candidates
- **Description:** National Presidential Election

### 2. 2025 Senate Election - District A (UPCOMING)
- **Status:** Upcoming
- **Dates:** April 1 - April 30, 2025
- **Candidates:** 2 senate candidates
- **Description:** Senate election for District A

### 3. 2024 Governor Election (COMPLETED)
- **Status:** Completed
- **Dates:** November 2024
- **Description:** Past election for testing results view

## 👥 Candidates Included

### Presidential Candidates
1. **Sarah Anderson** - Progressive Alliance
2. **Michael Roberts** - Conservative Union
3. **Dr. Emily Chen** - Independent
4. **James Martinez** - Green Party

### Senate Candidates
1. **Lisa Thompson** - Progressive Alliance
2. **Robert Williams** - Conservative Union

All candidates have:
- ✅ Complete biographies
- ✅ Manifestos
- ✅ Experience details
- ✅ Education background
- ✅ Social media links
- ✅ Verified status

## 📊 Data Structure

### Users Collection
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  walletAddress: String,
  role: "voter" | "admin",
  isVerified: Boolean,
  voterId: String,
  phoneNumber: String,
  hasVoted: Boolean
}
```

### Elections Collection
```javascript
{
  title: String,
  description: String,
  electionId: String (unique),
  createdBy: ObjectId (ref: User),
  startTime: Date,
  endTime: Date,
  status: "scheduled" | "upcoming" | "ongoing" | "completed" | "suspended" | "cancelled",
  isPublic: Boolean,
  allowedVoters: [ObjectId],
  resultsPublished: Boolean,
  resultsPublishTime: Date,
  isArchived: Boolean,
  totalVotes: Number
}
```

### Candidates Collection
```javascript
{
  electionId: ObjectId (ref: Election),
  candidateId: Number,
  name: String,
  party: String,
  manifesto: String,
  imageUrl: String,
  status: "active" | "withdrawn" | "disqualified",
  withdrawalReason: String,
  voteCount: Number
}
```

## 🧪 Testing Workflow

1. **Import the data** using Option 1 above
2. **Start your backend server**
   ```bash
   cd server
   npm start
   ```
3. **Start Ganache** (for blockchain)
   ```bash
   ganache-cli -p 7545
   ```
4. **Start your frontend**
   ```bash
   cd client
   npm run dev
   ```
5. **Login as admin** (admin@electoral.com / password123)
   - View all users and candidates
   - Manage elections
   - Verify candidates
6. **Login as voter** (john@example.com / password123)
   - View active elections
   - Vote for candidates
   - View results

## 🔄 Resetting Data

To reset and re-import fresh data:

```bash
node sample-data/import-data.js
```

This will clear all existing data and import fresh copies.

## ⚠️ Important Notes

1. **Passwords:** All test accounts use `password123` - change this in production!
2. **Wallet Addresses:** These are sample Ethereum addresses - ensure they match your Ganache accounts for blockchain operations
3. **Elections:** The active election (Presidential 2025) is set up and ready for voting
4. **Candidates:** All candidates are pre-verified and active

## 📝 Customization

To add more data:
1. Edit the JSON files with your own data
2. Follow the existing data structure
3. Run the import script again

## 🆘 Troubleshooting

**Issue:** "Cannot connect to MongoDB" or "Operation buffering timed out"
- **Solution 1:** Check your `MONGO_URI` in `.env` file
- **Solution 2:** Add your IP address to MongoDB Atlas Network Access:
  - Go to: https://cloud.mongodb.com/
  - Navigate to: Network Access → Add IP Address
  - Click "Add Current IP Address" or "Allow Access from Anywhere" (0.0.0.0/0)
- **Solution 3:** Check your internet connection
- **Solution 4:** Use `import-data-direct.js` which has better timeout handling

**Issue:** "Passwords not hashing"
- **Solution:** Use the automated import script (Option 1) instead of manual import

**Issue:** "Candidates not showing in elections"
- **Solution:** Ensure `electionId` in candidates matches an actual election `_id`

**Issue:** "E11000 duplicate key error"
- **Solution:** Clear your existing data first or run the import script again (it clears data automatically)

## 📞 Support

If you encounter any issues with the sample data, check:
1. MongoDB connection string is correct
2. All dependencies are installed (`npm install` in root and server)
3. Database name is `Capstone-BBV`

---

**Happy Testing! 🎉**
