# Frontend Testing Checklist - Blockchain Voting System

## ✅ System Status
- **Backend:** Running on http://localhost:5001 ✅
- **Frontend:** Running on http://localhost:5173 ✅
- **Blockchain:** Connected (Ganache) ✅
- **Database:** MongoDB Connected ✅

---

## Test 1: User Registration with Auto Wallet Assignment

### Steps:
1. Open browser: http://localhost:5173/register
2. Fill registration form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "Password123!"
   - **Leave wallet address EMPTY**
3. Click "Register"

### Expected Results:
- ✅ Success message appears
- ✅ User redirected to login or dashboard
- ✅ Auto-generated wallet address assigned (check console or profile)
- ✅ Email sent with wallet address (if email configured)

### Verification:
```bash
# Check user in database
curl http://localhost:5001/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'
```
Response should show: `walletAddress: "0x..."`

---

## Test 2: Admin Login & Dashboard Access

### Steps:
1. Go to http://localhost:5173/login
2. Login as admin:
   - Email: (your admin email from test)
   - Password: (your admin password)
3. Check sidebar menu

### Expected Results:
- ✅ Admin menu visible in sidebar
- ✅ Tabs: Dashboard, Users, Candidates, Elections, etc.
- ✅ "BE A CANDIDATE" button visible (optional for admin)

### What to Check:
- Admin menu items are different from regular user menu
- Can access /admin route
- Can see admin-only features

---

## Test 3: User Verification by Admin

### Steps:
1. As admin, go to Admin Panel → Users tab
2. Find unverified user (John Doe)
3. Click "Verify" button
4. Confirm verification

### Expected Results:
- ✅ User status changes to "Verified" ✅
- ✅ Green checkmark or badge appears
- ✅ Email sent to user (if configured)
- ✅ User can now vote and register as candidate

### Frontend Check:
- Status badge updates immediately
- No page refresh needed
- Toast notification appears

---

## Test 4: Create Election (Admin)

### Steps:
1. Admin Panel → Elections tab
2. Click "Create New Election"
3. Fill form:
   - Title: "Test Election 2025"
   - Description: "Testing election creation"
   - Start Time: (tomorrow)
   - End Time: (tomorrow + 1 day)
4. Click "Create"

### Expected Results:
- ✅ Success message
- ✅ Election appears in list with status "scheduled"
- ✅ `candidateRegistrationDeadline` = 48 hours from now
- ✅ All verified users receive email announcement

### Frontend Verification:
- Election card shows correct dates
- Status badge shows "Scheduled"
- Countdown timer shows time until candidate deadline

---

## Test 5: Candidate Self-Registration

### Steps:
1. Login as verified user (John Doe)
2. Click "BE A CANDIDATE" button
3. Fill candidate form:
   - **Election should auto-select** (latest scheduled)
   - Name: Auto-filled from profile
   - Party: "Independent"
   - Manifesto: "I will improve the system"
   - (Optional) Fill other fields
4. Submit

### Expected Results:
- ✅ No errors about missing electionId or candidateId
- ✅ Success message: "Awaiting admin approval"
- ✅ Candidate appears in admin panel with "Unverified" badge
- ✅ No transaction PIN required (or ignored if shown)

### What Should NOT Happen:
- ❌ No error: "Please provide electionId"
- ❌ No error: "Please provide candidateId"
- ❌ No blockchain transaction PIN popup

---

## Test 6: Admin Verify Candidate

### Steps:
1. As admin, go to Candidates tab
2. Find John Doe's candidate application
3. Click "Verify" or "Approve"
4. Confirm

### Expected Results:
- ✅ Candidate status: "Verified" ✅
- ✅ Appears in election candidate list
- ✅ Ready for voting when election starts

---

## Test 7: View Elections (Public)

### Steps:
1. Go to "Polling" or "Elections" page
2. View election list

### Expected Results:
- ✅ All elections displayed
- ✅ Election cards show:
  - Title, description
  - Status badge (Scheduled/Ongoing/Completed)
  - Start/end dates
  - Candidate count
- ✅ Countdown timer for scheduled elections

### Check Status Display:
- **Scheduled:** Yellow/Orange badge, "Registration open"
- **Upcoming:** Blue badge, "Starting soon"
- **Ongoing:** Green badge, "Vote now"
- **Completed:** Gray badge, "Ended"

---

## Test 8: View Results (No 403 Error)

### Steps:
1. Go to "Results" page
2. Select any ongoing or completed election
3. View results

### Expected Results:
- ✅ Results load WITHOUT 403 Forbidden error
- ✅ Live vote counts displayed
- ✅ Candidate ranking shown
- ✅ Data fetched from blockchain

### What Should Work:
- Scheduled elections: Only admin can view
- Ongoing elections: All users can view live results
- Completed elections: All users can view final results

### Error Messages:
- ❌ Should NOT see: "Results not yet published" (for ongoing elections)
- ✅ May see: "Election has not started yet" (for scheduled elections)

---

## Test 9: Voting Flow

### Prerequisites:
- Election must be in "ongoing" status
- User must be verified
- User must be registered to election (by admin)

### Steps:
1. Login as verified user
2. Go to "Polling" page
3. Find ongoing election
4. View candidate list
5. Select a candidate
6. Click "Vote" or "Submit Vote"
7. Confirm vote

### Expected Results:
- ✅ Vote submitted successfully
- ✅ Transaction sent to blockchain (check Ganache)
- ✅ User `hasVoted: true`
- ✅ Cannot vote again (button disabled)
- ✅ Vote receipt or confirmation shown

### Ganache Verification:
- Open Ganache → Transactions
- See new transaction for `vote()` function
- Transaction successful

---

## Test 10: Prevent Double Voting

### Steps:
1. After voting, try to vote again
2. Click vote button

### Expected Results:
- ❌ Vote button disabled
- ❌ Error: "You have already voted"
- ❌ Blockchain rejects transaction

---

## Test 11: Results Display (Real-time)

### Steps:
1. After voting, go to "Results" page
2. View election results

### Expected Results:
- ✅ Vote count increased for selected candidate
- ✅ Real-time data from blockchain
- ✅ Rankings updated
- ✅ Total votes shown

### Check Data Source:
- Results should match Ganache blockchain data
- Not just database counts

---

## Test 12: Election Status Transitions

### Automatic Tests (Wait and Observe):

**After 48 Hours (Candidate Registration Closes):**
- ✅ Election status changes to "upcoming"
- ✅ Can no longer register as candidate
- ✅ Error: "Candidate registration deadline has passed"

**When Start Time Reached:**
- ✅ Election status changes to "ongoing"
- ✅ Voting enabled
- ✅ Green "Vote Now" badge

**When End Time Reached:**
- ✅ Election status changes to "completed"
- ✅ Voting disabled
- ✅ Final results displayed

### Manual Test (Skip Wait):
Update election times in database to test immediately.

---

## Test 13: React Console Checks

### Open Browser Console (F12)

### Should NOT See:
- ❌ "Each child in a list should have a unique 'key' prop"
- ❌ Failed to load resource: 403 (Forbidden) on /api/elections/:id/results
- ❌ Failed to load resource: 400 (Bad Request) on /api/candidates

### May See (Normal):
- Network requests to API
- Redux state updates
- Info logs

---

## Test 14: Responsive Design

### Test Different Screen Sizes:
1. Desktop (1920x1080)
2. Tablet (768x1024)
3. Mobile (375x667)

### Expected Results:
- ✅ Sidebar collapses on mobile
- ✅ Cards stack properly
- ✅ Forms are usable
- ✅ No horizontal scroll
- ✅ Touch-friendly buttons

---

## Test 15: Navigation Flow

### User Journey:
1. **Register** → Auto wallet assigned
2. **Login** → Dashboard
3. **Wait for admin verification** → Email received
4. **Login again** → Can now vote
5. **Register as Candidate** → Awaiting approval
6. **Admin verifies** → Candidate appears
7. **Vote** → Blockchain transaction
8. **View Results** → Live counts

### Check All Links Work:
- ✅ Sidebar navigation
- ✅ Page transitions smooth
- ✅ Back button works
- ✅ Logout works

---

## Common Issues & Fixes

### Issue 1: 403 on Results
**Symptom:** "Results not yet published" error
**Status:** ✅ FIXED
**Verify:** Results load for ongoing elections

### Issue 2: Candidate Registration Fails
**Symptom:** "Please provide electionId" error
**Status:** ✅ FIXED
**Verify:** Can submit without selecting election

### Issue 3: React Key Warning
**Symptom:** Console warning about keys
**Status:** ✅ FIXED
**Verify:** No warnings in console

### Issue 4: Transaction PIN Popup
**Symptom:** Modal asks for PIN
**Status:** ⚠️ PARTIALLY FIXED (shows but optional)
**Verify:** Can submit without entering PIN

---

## Performance Checks

### Page Load Times:
- Homepage: < 2 seconds
- Election list: < 1 second
- Results page: < 3 seconds (blockchain fetch)

### API Response Times:
- Login: < 500ms
- Create election: < 2 seconds (blockchain)
- Cast vote: < 3 seconds (blockchain)
- Get results: < 2 seconds (blockchain)

---

## Security Checks

### Authentication:
- ✅ Cannot access /admin without admin role
- ✅ Cannot vote without verification
- ✅ Cannot access protected routes without login
- ✅ Token expires after 7 days

### Authorization:
- ✅ Regular users cannot verify users
- ✅ Regular users cannot create elections
- ✅ Regular users cannot verify candidates

---

## Final Checklist

Before marking as complete, verify:

- [ ] User registration works with auto wallet
- [ ] Admin can verify users, emails sent
- [ ] Elections created with 48-hour deadline
- [ ] Email announcements sent to all users
- [ ] Users can self-register as candidates
- [ ] Admin can verify candidates
- [ ] Voting works and records on blockchain
- [ ] Results display without 403 errors
- [ ] Double voting prevented
- [ ] Election status auto-transitions
- [ ] No React warnings in console
- [ ] Mobile responsive
- [ ] All navigation works
- [ ] Ganache shows transactions

---

## Success Criteria

✅ **Frontend is functional when:**
1. Users can complete entire journey without backend errors
2. All features accessible through UI
3. Real-time updates work (results, status)
4. Blockchain transactions visible in Ganache
5. No console errors or warnings
6. Mobile/desktop responsive
7. Email notifications work (if configured)

---

## Quick Test Script

Open browser console and run:

```javascript
// Test API connectivity
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend:', d))
  .catch(e => console.log('❌ Backend Error:', e));

// Test election list
fetch('http://localhost:5001/api/elections')
  .then(r => r.json())
  .then(d => console.log('✅ Elections:', d.data.length))
  .catch(e => console.log('❌ Election Error:', e));
```

Expected output:
```
✅ Backend: {success: true, system: {...}}
✅ Elections: 2
```

---

## Browser Compatibility

Test in:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ⚠️ Safari (may have Web3 issues)

---

## Next Steps After Testing

If all tests pass:
1. Configure email credentials in .env
2. Test email notifications end-to-end
3. Deploy to staging environment
4. Perform load testing
5. Security audit
6. Production deployment

---

**Testing completed successfully means your frontend is fully integrated with the blockchain voting backend!** 🎉
