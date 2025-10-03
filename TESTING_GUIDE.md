# Blockchain Voting System - Complete Testing Guide

## Pre-Testing Setup

### 1. Kill All Existing Processes
```bash
# Kill all node processes
tasklist | findstr node.exe
# Kill each PID: taskkill /F /PID <pid>
```

### 2. Start Ganache (Blockchain)
- Open Ganache GUI application
- Create/Open workspace on `http://localhost:7545`
- Note down account addresses for testing

### 3. Configure Email (Optional but Recommended)
Edit `server/.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4. Start Backend Server
```bash
cd server
npm start
```
Expected output:
- "🚀 Server running on port 5001"
- "Election status scheduler started"
- "MongoDB connected"

### 5. Start Frontend Client
```bash
cd client
npm run dev
```
Expected output:
- "VITE ready"
- "Local: http://localhost:5173"

---

## Test Suite 1: User Registration & Verification

### Test 1.1: Register New User (Auto Wallet Assignment)
**Steps:**
1. Open http://localhost:5173/register
2. Fill form:
   - Name: "Test User 1"
   - Email: "testuser1@example.com"
   - Password: "Password123!"
   - **DO NOT** provide wallet address
3. Click "Register"

**Expected Results:**
- ✅ Registration successful
- ✅ Auto-generated wallet address displayed (format: `0x...`)
- ✅ Email sent with wallet address (check email if configured)
- ✅ User can login but `isVerified: false`

**Backend Verification:**
```bash
curl http://localhost:5001/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"testuser1@example.com\",\"password\":\"Password123!\"}"
```
Check response: `isVerified: false`, `walletAddress: "0x..."`

---

### Test 1.2: Admin Verification & Email Notification
**Steps:**
1. Login as admin (create admin user first if needed)
2. Go to Admin Panel → Users tab
3. Find "Test User 1"
4. Click "Verify" button
5. Confirm verification

**Expected Results:**
- ✅ User status changes to "Verified"
- ✅ Email sent to user with verification notification (check email)
- ✅ User can now participate in elections

**Backend Verification:**
```bash
# Get user info (use token from login)
curl http://localhost:5001/api/auth/me -H "Authorization: Bearer <token>"
```
Check: `isVerified: true`

---

## Test Suite 2: Election Creation & Announcements

### Test 2.1: Create Election
**Steps:**
1. Login as admin
2. Go to Admin Panel → Elections tab
3. Click "Create New Election"
4. Fill form:
   - Title: "Student Council Election 2025"
   - Description: "Annual student council election"
   - Start Time: (Current time + 1 hour)
   - End Time: (Current time + 2 days)
5. Click "Create Election"

**Expected Results:**
- ✅ Election created successfully
- ✅ Status: "scheduled"
- ✅ `candidateRegistrationDeadline`: 48 hours from now
- ✅ All verified users receive email notification with:
  - Election title & description
  - Candidate registration deadline
  - Voting period dates

**Backend Verification:**
```bash
curl http://localhost:5001/api/elections
```
Check:
- Election exists
- Status: "scheduled"
- `candidateRegistrationDeadline` is set

---

## Test Suite 3: Candidate Registration

### Test 3.1: User Self-Registration as Candidate
**Steps:**
1. Login as verified user (Test User 1)
2. Go to "Elections" or "Polling" page
3. Find "Student Council Election 2025"
4. Click "Register as Candidate"
5. Fill form:
   - Candidate ID: 1
   - Name: "Test User 1"
   - Party: "Independent"
   - Manifesto: "I will improve campus facilities"
6. Submit

**Expected Results:**
- ✅ Candidate registration submitted
- ✅ Message: "Awaiting admin verification"
- ✅ Candidate appears in admin panel with `isVerified: false`

**Backend Verification:**
```bash
curl http://localhost:5001/api/candidates
```
Check: Candidate exists with `isVerified: false`, `isActive: false`

---

### Test 3.2: Admin Verify Candidate
**Steps:**
1. Login as admin
2. Go to Admin Panel → Candidates tab
3. Find "Test User 1" candidate
4. Click "Verify"
5. Confirm

**Expected Results:**
- ✅ Candidate status: `isVerified: true`, `isActive: true`
- ✅ Candidate appears in election candidate list

---

### Test 3.3: Candidate Registration After Deadline
**Steps:**
1. Wait 48 hours OR manually update `candidateRegistrationDeadline` in database to past time
2. Try to register as candidate

**Expected Results:**
- ❌ Registration fails
- ❌ Error: "Candidate registration deadline has passed"

---

## Test Suite 4: Election Status Transitions

### Test 4.1: Auto-Activation After 48 Hours
**Automated by Scheduler - runs every minute**

**Steps:**
1. Wait 48 hours after election creation
2. Check election status

**Expected Results:**
- ✅ If election has verified candidates:
  - Status changes to "upcoming" (if voting not started)
  - Status changes to "ongoing" (if voting started)
- ✅ If no candidates:
  - Status remains "scheduled"

**Manual Test (Skip 48 hours wait):**
```bash
# Update candidateRegistrationDeadline to past time in MongoDB
# Wait 1 minute for scheduler to run
# Check election status
curl http://localhost:5001/api/elections
```

---

### Test 4.2: Voting Period Start
**Steps:**
1. Wait until election `startTime`
2. Check election status

**Expected Results:**
- ✅ Status changes to "ongoing"
- ✅ Users can now vote

---

### Test 4.3: Voting Period End
**Steps:**
1. Wait until election `endTime`
2. Check election status

**Expected Results:**
- ✅ Status changes to "completed"
- ✅ Voting disabled
- ✅ Results visible

---

## Test Suite 5: Voting on Blockchain

### Test 5.1: Cast Vote
**Steps:**
1. Login as verified user
2. Go to "Polling" page
3. Find "Student Council Election 2025" (status: "ongoing")
4. Select a candidate
5. Click "Vote"
6. Confirm vote

**Expected Results:**
- ✅ Vote recorded on blockchain
- ✅ User `hasVoted: true` in database
- ✅ Cannot vote again (double-vote prevented)
- ✅ Transaction visible in Ganache

**Backend Verification:**
```bash
# Check blockchain
curl http://localhost:5001/api/elections/<electionId>/results
```
Check: Vote count increased for selected candidate

**Ganache Verification:**
- Check "Transactions" tab
- See transaction for `vote()` function call

---

### Test 5.2: Prevent Double Voting
**Steps:**
1. After voting, try to vote again

**Expected Results:**
- ❌ Vote button disabled OR
- ❌ Error: "You have already voted"

---

### Test 5.3: Unverified User Cannot Vote
**Steps:**
1. Register new user (don't verify)
2. Login
3. Try to vote

**Expected Results:**
- ❌ Voting disabled
- ❌ Message: "Only verified users can vote"

---

## Test Suite 6: Results from Blockchain

### Test 6.1: View Results (Ongoing Election)
**Steps:**
1. Login as any user
2. Go to "Results" page
3. Select ongoing election

**Expected Results:**
- ✅ Real-time vote counts from blockchain
- ✅ Candidate rankings
- ✅ Vote counts match blockchain

---

### Test 6.2: View Results (Completed Election)
**Steps:**
1. After election ends
2. Go to "Results" page

**Expected Results:**
- ✅ Final vote counts from blockchain
- ✅ Winner declared
- ✅ Results are immutable

---

### Test 6.3: Admin Declare Results
**Steps:**
1. Login as admin
2. Go to Admin Panel → Elections
3. Click "Declare Results" for completed election

**Expected Results:**
- ✅ `resultsPublished: true`
- ✅ Results officially declared

---

## Test Suite 7: Blockchain Integration

### Test 7.1: Verify Election on Blockchain
**Backend Test:**
```bash
# Check election exists on blockchain
curl http://localhost:5001/api/elections/<electionId>/stats
```

**Ganache Verification:**
- Check "Contracts" tab
- See `Voting` contract deployed
- See `createElection`, `addCandidate`, `vote` transactions

---

### Test 7.2: Verify Candidate on Blockchain
**Backend Test:**
```bash
curl http://localhost:5001/api/candidates/<candidateId>/blockchain
```
Check: Blockchain data matches database

---

### Test 7.3: Results Data Consistency
**Test:**
1. Get results from database: `GET /api/elections/<id>/results`
2. Get results from blockchain via web3Utils
3. Compare vote counts

**Expected Results:**
- ✅ Vote counts match exactly
- ✅ Blockchain is source of truth

---

## Test Suite 8: Admin Functions

### Test 8.1: View All Users
**Steps:**
1. Login as admin
2. Go to Admin Panel → Users

**Expected Results:**
- ✅ List of all users
- ✅ Verification status visible
- ✅ Can filter by verified/unverified

---

### Test 8.2: Manage Candidates
**Steps:**
1. Admin Panel → Candidates
2. Verify/reject candidate applications

**Expected Results:**
- ✅ Can verify candidates
- ✅ Can reject with notes
- ✅ Only verified candidates appear in voting

---

### Test 8.3: Dashboard Statistics
**Steps:**
1. Admin Panel → Dashboard

**Expected Results:**
- ✅ Total users count
- ✅ Total elections count
- ✅ Active elections count
- ✅ Total votes cast

---

## Test Suite 9: Error Handling

### Test 9.1: Invalid Login
**Steps:**
1. Try login with wrong password

**Expected Results:**
- ❌ Error: "Invalid credentials"

---

### Test 9.2: Duplicate Email Registration
**Steps:**
1. Register with existing email

**Expected Results:**
- ❌ Error: "User already exists"

---

### Test 9.3: Vote Without Verification
**Steps:**
1. Unverified user tries to vote

**Expected Results:**
- ❌ Voting disabled
- ❌ Clear message shown

---

## Test Suite 10: Security Tests

### Test 10.1: Protected Routes
**Steps:**
1. Try accessing `/api/admin/*` without token

**Expected Results:**
- ❌ 401 Unauthorized

---

### Test 10.2: Role-Based Access
**Steps:**
1. Regular user tries to access admin endpoints

**Expected Results:**
- ❌ 403 Forbidden

---

### Test 10.3: Blockchain Wallet Security
**Test:**
1. Check that wallet addresses are unique
2. Verify wallet assignment is immutable

**Expected Results:**
- ✅ No duplicate wallets
- ✅ Wallet cannot be changed after assignment

---

## Critical Issues to Fix

### Issue 1: Server Port Conflict
**Problem:** Multiple server instances running on port 5001

**Fix:**
```bash
# Kill all node processes
taskkill /F /IM node.exe
# Start fresh
cd server && npm start
```

---

### Issue 2: Email Configuration
**Problem:** Emails won't send without proper configuration

**Fix:**
1. Get Gmail App Password (not regular password)
2. Update `.env` file
3. Test email sending

---

### Issue 3: Ganache Not Running
**Problem:** Blockchain connection fails

**Fix:**
1. Start Ganache on http://localhost:7545
2. Ensure contract is deployed
3. Check `BLOCKCHAIN_PROVIDER_URL` in `.env`

---

## Success Criteria

### ✅ Complete System is Working When:
1. Users can register and get auto-assigned wallets
2. Admin can verify users, users receive emails
3. Admin creates election, all users receive announcement emails
4. Verified users can register as candidates within 48 hours
5. Election auto-starts after 48 hours (if has candidates)
6. Verified users can vote during voting period
7. Votes are recorded on blockchain (visible in Ganache)
8. Results are fetched from blockchain and displayed correctly
9. Double voting is prevented
10. Election status transitions automatically (scheduled → upcoming → ongoing → completed)

---

## Troubleshooting

### Server Won't Start
- Kill all node processes
- Check port 5001 is free: `netstat -ano | findstr :5001`
- Delete `node_modules` and run `npm install`

### Blockchain Connection Failed
- Start Ganache
- Check `.env` has correct `BLOCKCHAIN_PROVIDER_URL`
- Re-deploy contract if needed

### Emails Not Sending
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`
- Use Gmail App Password, not regular password
- Check console for email errors

### Frontend Can't Connect to Backend
- Check CORS settings in `server.js`
- Verify `CLIENT_URL` in `.env`
- Check backend is running on port 5001

---

## Quick Test Commands

```bash
# Test backend health
curl http://localhost:5001/api/health

# Test frontend
curl http://localhost:5173

# Register user
curl -X POST http://localhost:5001/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"pass123\"}"

# Login
curl -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"pass123\"}"

# Get elections
curl http://localhost:5001/api/elections

# Get candidates
curl http://localhost:5001/api/candidates
```
