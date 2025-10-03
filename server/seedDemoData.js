require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Election = require("./models/Election");
const Candidate = require("./models/Candidate");
const Vote = require("./models/Vote");
const web3Utils = require("./utils/web3Utils");

async function seedDemoData() {
  try {
    console.log("🌱 Starting demo data seeding...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Initialize Web3
    await web3Utils.initialize();
    console.log("✅ Connected to blockchain\n");

    // Get Ganache accounts
    const accounts = await web3Utils.web3.eth.getAccounts();
    console.log(`✅ Found ${accounts.length} Ganache accounts\n`);

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Election.deleteMany({});
    await Candidate.deleteMany({});
    await Vote.deleteMany({});
    console.log("✅ Database cleared\n");

    // Hash password (1234567890 for all users)
    const hashedPassword = await bcrypt.hash("1234567890", 10);

    // Create demo users with Ganache wallet addresses
    console.log("👥 Creating demo users...");
    const users = [
      {
        name: "Yuvraj Patil",
        email: "yuvraj.patil@example.com",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        walletAddress: accounts[1],
        voterId: "VID001",
      },
      {
        name: "Rohan Patil",
        email: "rohan.patil@example.com",
        password: hashedPassword,
        role: "voter",
        isVerified: true,
        walletAddress: accounts[2],
        voterId: "VID002",
      },
      {
        name: "Suraj Shivankar",
        email: "suraj.shivankar@example.com",
        password: hashedPassword,
        role: "voter",
        isVerified: true,
        walletAddress: accounts[3],
        voterId: "VID003",
      },
      {
        name: "Harshita Patil",
        email: "harshita.patil@example.com",
        password: hashedPassword,
        role: "voter",
        isVerified: true,
        walletAddress: accounts[4],
        voterId: "VID004",
      },
      {
        name: "Vasundhara Mali",
        email: "vasundhara.mali@example.com",
        password: hashedPassword,
        role: "voter",
        isVerified: true,
        walletAddress: accounts[5],
        voterId: "VID005",
      },
      {
        name: "Raj Ghodake",
        email: "raj.ghodake@example.com",
        password: hashedPassword,
        role: "voter",
        isVerified: true,
        walletAddress: accounts[6],
        voterId: "VID006",
      },
      {
        name: "Tejas Yadav",
        email: "tejas.yadav@example.com",
        password: hashedPassword,
        role: "voter",
        isVerified: true,
        walletAddress: accounts[7],
        voterId: "VID007",
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log("✅ Created 7 demo users");
    console.log("   - Admin: Yuvraj Patil (yuvraj.patil@example.com)");
    console.log("   - Voters: 6 users");
    console.log("   - Password: 1234567890\n");

    // Create demo elections
    console.log("🗳️  Creating demo elections...");

    // Election 1: Ongoing College Election
    const now = Date.now();
    const ongoingStart = Math.floor((now - 24 * 60 * 60 * 1000) / 1000); // Started yesterday
    const ongoingEnd = Math.floor((now + 2 * 24 * 60 * 60 * 1000) / 1000); // Ends in 2 days

    const ongoingElectionBC = await web3Utils.createElection(
      "College Student Council Election 2025",
      "Annual student council election for leadership positions",
      ongoingStart,
      ongoingEnd
    );
    const ongoingElectionId =
      ongoingElectionBC.events.ElectionCreated.returnValues.electionId;

    const ongoingElection = await Election.create({
      title: "College Student Council Election 2025",
      description: "Annual student council election for leadership positions",
      electionId: ongoingElectionId,
      createdBy: createdUsers[0]._id,
      candidateRegistrationDeadline: new Date(now - 12 * 60 * 60 * 1000), // 12 hours ago
      startTime: new Date(ongoingStart * 1000),
      endTime: new Date(ongoingEnd * 1000),
      status: "ongoing",
      isPublic: true,
    });
    console.log(
      "✅ Created ongoing election: College Student Council Election 2025"
    );

    // Election 2: Upcoming Sports Committee Election
    const upcomingStart = Math.floor((now + 3 * 24 * 60 * 60 * 1000) / 1000); // Starts in 3 days
    const upcomingEnd = Math.floor((now + 5 * 24 * 60 * 60 * 1000) / 1000); // Ends in 5 days

    const upcomingElectionBC = await web3Utils.createElection(
      "Sports Committee Election 2025",
      "Election for sports committee representatives",
      upcomingStart,
      upcomingEnd
    );
    const upcomingElectionId =
      upcomingElectionBC.events.ElectionCreated.returnValues.electionId;

    const upcomingElection = await Election.create({
      title: "Sports Committee Election 2025",
      description: "Election for sports committee representatives",
      electionId: upcomingElectionId,
      createdBy: createdUsers[0]._id,
      candidateRegistrationDeadline: new Date(now + 36 * 60 * 60 * 1000), // 36 hours from now
      startTime: new Date(upcomingStart * 1000),
      endTime: new Date(upcomingEnd * 1000),
      status: "scheduled",
      isPublic: true,
    });
    console.log(
      "✅ Created scheduled election: Sports Committee Election 2025\n"
    );

    // Add candidates to ongoing election
    console.log("👤 Adding candidates to College Student Council Election...");

    // Candidate 1: Rohan Patil
    await web3Utils.addCandidate(
      ongoingElectionId,
      1,
      "Rohan Patil",
      "Progressive Students Forum"
    );
    const candidate1 = await Candidate.create({
      electionId: ongoingElection._id,
      candidateId: 1,
      name: "Rohan Patil",
      party: "Progressive Students Forum",
      manifesto:
        "I promise to improve campus facilities, organize more cultural events, and establish a student grievance portal.",
      userId: createdUsers[1]._id,
      isVerified: true,
      isActive: true,
    });
    console.log("   ✅ Added: Rohan Patil - Progressive Students Forum");

    // Candidate 2: Harshita Patil
    await web3Utils.addCandidate(
      ongoingElectionId,
      2,
      "Harshita Patil",
      "Students Unity Alliance"
    );
    const candidate2 = await Candidate.create({
      electionId: ongoingElection._id,
      candidateId: 2,
      name: "Harshita Patil",
      party: "Students Unity Alliance",
      manifesto:
        "Focus on academic excellence, mental health support, and better library resources.",
      userId: createdUsers[3]._id,
      isVerified: true,
      isActive: true,
    });
    console.log("   ✅ Added: Harshita Patil - Students Unity Alliance");

    // Candidate 3: Suraj Shivankar
    await web3Utils.addCandidate(
      ongoingElectionId,
      3,
      "Suraj Shivankar",
      "Independent"
    );
    const candidate3 = await Candidate.create({
      electionId: ongoingElection._id,
      candidateId: 3,
      name: "Suraj Shivankar",
      party: "Independent",
      manifesto:
        "Transparent governance, improved sports facilities, and student-led initiatives.",
      userId: createdUsers[2]._id,
      isVerified: true,
      isActive: true,
    });
    console.log("   ✅ Added: Suraj Shivankar - Independent\n");

    // Add candidates to upcoming election
    console.log("👤 Adding candidates to Sports Committee Election...");

    // Candidate 1: Vasundhara Mali
    await web3Utils.addCandidate(
      upcomingElectionId,
      1,
      "Vasundhara Mali",
      "Sports Enthusiasts"
    );
    const candidate4 = await Candidate.create({
      electionId: upcomingElection._id,
      candidateId: 1,
      name: "Vasundhara Mali",
      party: "Sports Enthusiasts",
      manifesto:
        "Promote inter-college tournaments, upgrade equipment, and increase sports budget.",
      userId: createdUsers[4]._id,
      isVerified: true,
      isActive: true,
    });
    console.log("   ✅ Added: Vasundhara Mali - Sports Enthusiasts");

    // Candidate 2: Raj Ghodake
    await web3Utils.addCandidate(
      upcomingElectionId,
      2,
      "Raj Ghodake",
      "Athletic Association"
    );
    const candidate5 = await Candidate.create({
      electionId: upcomingElection._id,
      candidateId: 2,
      name: "Raj Ghodake",
      party: "Athletic Association",
      manifesto:
        "Build new sports complex, organize fitness programs, and support student athletes.",
      userId: createdUsers[5]._id,
      isVerified: true,
      isActive: true,
    });
    console.log("   ✅ Added: Raj Ghodake - Athletic Association\n");

    // Register voters to ongoing election
    console.log("📝 Registering voters to ongoing election...");
    for (let i = 1; i < 7; i++) {
      // Register all voters except admin
      await web3Utils.registerVoter(
        ongoingElectionId,
        createdUsers[i].walletAddress
      );
    }
    console.log("✅ Registered 6 voters to College Student Council Election\n");

    // Cast some demo votes
    console.log("🗳️  Casting demo votes...");

    // Vote 1: Rohan votes for Harshita
    const tx1 = await web3Utils.castVote(
      ongoingElectionId,
      2,
      createdUsers[1].walletAddress
    );
    const voteHash1 = web3Utils.web3.utils.sha3(
      `${ongoingElectionId}-${createdUsers[1]._id}-${2}`
    );
    await Vote.create({
      electionId: ongoingElection._id,
      voterId: createdUsers[1]._id,
      candidateId: 2,
      voteHash: voteHash1,
      transactionHash: tx1.transactionHash,
      blockNumber: Number(tx1.blockNumber),
    });
    await User.findByIdAndUpdate(createdUsers[1]._id, { hasVoted: true });
    console.log("   ✅ Rohan Patil voted for Harshita Patil");

    // Vote 2: Vasundhara votes for Rohan
    const tx2 = await web3Utils.castVote(
      ongoingElectionId,
      1,
      createdUsers[4].walletAddress
    );
    const voteHash2 = web3Utils.web3.utils.sha3(
      `${ongoingElectionId}-${createdUsers[4]._id}-${1}`
    );
    await Vote.create({
      electionId: ongoingElection._id,
      voterId: createdUsers[4]._id,
      candidateId: 1,
      voteHash: voteHash2,
      transactionHash: tx2.transactionHash,
      blockNumber: Number(tx2.blockNumber),
    });
    await User.findByIdAndUpdate(createdUsers[4]._id, { hasVoted: true });
    console.log("   ✅ Vasundhara Mali voted for Rohan Patil");

    // Vote 3: Raj votes for Suraj
    const tx3 = await web3Utils.castVote(
      ongoingElectionId,
      3,
      createdUsers[5].walletAddress
    );
    const voteHash3 = web3Utils.web3.utils.sha3(
      `${ongoingElectionId}-${createdUsers[5]._id}-${3}`
    );
    await Vote.create({
      electionId: ongoingElection._id,
      voterId: createdUsers[5]._id,
      candidateId: 3,
      voteHash: voteHash3,
      transactionHash: tx3.transactionHash,
      blockNumber: Number(tx3.blockNumber),
    });
    await User.findByIdAndUpdate(createdUsers[5]._id, { hasVoted: true });
    console.log("   ✅ Raj Ghodake voted for Suraj Shivankar");

    // Vote 4: Tejas votes for Rohan
    const tx4 = await web3Utils.castVote(
      ongoingElectionId,
      1,
      createdUsers[6].walletAddress
    );
    const voteHash4 = web3Utils.web3.utils.sha3(
      `${ongoingElectionId}-${createdUsers[6]._id}-${1}`
    );
    await Vote.create({
      electionId: ongoingElection._id,
      voterId: createdUsers[6]._id,
      candidateId: 1,
      voteHash: voteHash4,
      transactionHash: tx4.transactionHash,
      blockNumber: Number(tx4.blockNumber),
    });
    await User.findByIdAndUpdate(createdUsers[6]._id, { hasVoted: true });
    console.log("   ✅ Tejas Yadav voted for Rohan Patil\n");

    // Vote 5: Suraj votes for Harshita
    const tx5 = await web3Utils.castVote(
      ongoingElectionId,
      2,
      createdUsers[2].walletAddress
    );
    const voteHash5 = web3Utils.web3.utils.sha3(
      `${ongoingElectionId}-${createdUsers[2]._id}-${2}`
    );
    await Vote.create({
      electionId: ongoingElection._id,
      voterId: createdUsers[2]._id,
      candidateId: 2,
      voteHash: voteHash5,
      transactionHash: tx5.transactionHash,
      blockNumber: Number(tx5.blockNumber),
    });
    await User.findByIdAndUpdate(createdUsers[2]._id, { hasVoted: true });
    console.log("   ✅ Suraj Shivankar voted for Harshita Patil");

    // Vote 6: Harshita votes for Rohan
    const tx6 = await web3Utils.castVote(
      ongoingElectionId,
      1,
      createdUsers[3].walletAddress
    );
    const voteHash6 = web3Utils.web3.utils.sha3(
      `${ongoingElectionId}-${createdUsers[3]._id}-${1}`
    );
    await Vote.create({
      electionId: ongoingElection._id,
      voterId: createdUsers[3]._id,
      candidateId: 1,
      voteHash: voteHash6,
      transactionHash: tx6.transactionHash,
      blockNumber: Number(tx6.blockNumber),
    });
    await User.findByIdAndUpdate(createdUsers[3]._id, { hasVoted: true });
    console.log("   ✅ Harshita Patil voted for Rohan Patil\n");

    // Update vote counts for ongoing election
    await Candidate.findByIdAndUpdate(candidate1._id, { voteCount: 3 });
    await Candidate.findByIdAndUpdate(candidate2._id, { voteCount: 2 });
    await Candidate.findByIdAndUpdate(candidate3._id, { voteCount: 1 });
    await Election.findByIdAndUpdate(ongoingElection._id, { totalVotes: 6 });

    // Create a completed election with results
    console.log("🗳️  Creating completed election with results...");
    const completedStart = Math.floor((now - 7 * 24 * 60 * 60 * 1000) / 1000); // Started 7 days ago
    const completedEnd = Math.floor((now + 1 * 60 * 60 * 1000) / 1000); // Ends in 1 hour (still active for voting)

    const completedElectionBC = await web3Utils.createElection(
      "Cultural Committee Election 2024",
      "Annual cultural committee election for organizing college events",
      completedStart,
      completedEnd
    );
    const completedElectionId =
      completedElectionBC.events.ElectionCreated.returnValues.electionId;

    const completedElection = await Election.create({
      title: "Cultural Committee Election 2024",
      description:
        "Annual cultural committee election for organizing college events",
      electionId: completedElectionId,
      createdBy: createdUsers[0]._id,
      candidateRegistrationDeadline: new Date(now - 9 * 24 * 60 * 60 * 1000), // 9 days ago
      startTime: new Date(completedStart * 1000),
      endTime: new Date(completedEnd * 1000),
      status: "ongoing", // Keep as ongoing so votes can be cast
      isPublic: true,
      resultsPublished: true,
    });
    console.log(
      "✅ Created completed election: Cultural Committee Election 2024\n"
    );

    // Add candidates to completed election
    console.log("👤 Adding candidates to Cultural Committee Election...");

    await web3Utils.addCandidate(
      completedElectionId,
      1,
      "Tejas Yadav",
      "Cultural Enthusiasts"
    );
    const candidate6 = await Candidate.create({
      electionId: completedElection._id,
      candidateId: 1,
      name: "Tejas Yadav",
      party: "Cultural Enthusiasts",
      manifesto:
        "Organize more cultural events, inter-college competitions, and talent shows.",
      userId: createdUsers[6]._id,
      isVerified: true,
      isActive: true,
    });
    console.log("   ✅ Added: Tejas Yadav - Cultural Enthusiasts");

    await web3Utils.addCandidate(
      completedElectionId,
      2,
      "Vasundhara Mali",
      "Arts & Culture Forum"
    );
    const candidate7 = await Candidate.create({
      electionId: completedElection._id,
      candidateId: 2,
      name: "Vasundhara Mali",
      party: "Arts & Culture Forum",
      manifesto:
        "Promote traditional arts, music festivals, and cultural exchange programs.",
      userId: createdUsers[4]._id,
      isVerified: true,
      isActive: true,
    });
    console.log("   ✅ Added: Vasundhara Mali - Arts & Culture Forum\n");

    // Register all voters except admin to completed election
    console.log("📝 Registering voters to completed election...");
    for (let i = 1; i < 7; i++) {
      await web3Utils.registerVoter(
        completedElectionId,
        createdUsers[i].walletAddress
      );
    }
    console.log("✅ Registered 6 voters to Cultural Committee Election\n");

    // Cast votes for completed election
    console.log("🗳️  Casting votes for completed election...");

    // Vote 1: Rohan votes for Tejas
    const ctx1 = await web3Utils.castVote(
      completedElectionId,
      1,
      createdUsers[1].walletAddress
    );
    const cvoteHash1 = web3Utils.web3.utils.sha3(
      `${completedElectionId}-${createdUsers[1]._id}-${1}`
    );
    await Vote.create({
      electionId: completedElection._id,
      voterId: createdUsers[1]._id,
      candidateId: 1,
      voteHash: cvoteHash1,
      transactionHash: ctx1.transactionHash,
      blockNumber: Number(ctx1.blockNumber),
    });
    console.log("   ✅ Rohan Patil voted for Tejas Yadav");

    // Vote 2: Suraj votes for Vasundhara
    const ctx2 = await web3Utils.castVote(
      completedElectionId,
      2,
      createdUsers[2].walletAddress
    );
    const cvoteHash2 = web3Utils.web3.utils.sha3(
      `${completedElectionId}-${createdUsers[2]._id}-${2}`
    );
    await Vote.create({
      electionId: completedElection._id,
      voterId: createdUsers[2]._id,
      candidateId: 2,
      voteHash: cvoteHash2,
      transactionHash: ctx2.transactionHash,
      blockNumber: Number(ctx2.blockNumber),
    });
    console.log("   ✅ Suraj Shivankar voted for Vasundhara Mali");

    // Vote 3: Harshita votes for Vasundhara
    const ctx3 = await web3Utils.castVote(
      completedElectionId,
      2,
      createdUsers[3].walletAddress
    );
    const cvoteHash3 = web3Utils.web3.utils.sha3(
      `${completedElectionId}-${createdUsers[3]._id}-${2}`
    );
    await Vote.create({
      electionId: completedElection._id,
      voterId: createdUsers[3]._id,
      candidateId: 2,
      voteHash: cvoteHash3,
      transactionHash: ctx3.transactionHash,
      blockNumber: Number(ctx3.blockNumber),
    });
    console.log("   ✅ Harshita Patil voted for Vasundhara Mali");

    // Vote 4: Raj votes for Tejas
    const ctx4 = await web3Utils.castVote(
      completedElectionId,
      1,
      createdUsers[5].walletAddress
    );
    const cvoteHash4 = web3Utils.web3.utils.sha3(
      `${completedElectionId}-${createdUsers[5]._id}-${1}`
    );
    await Vote.create({
      electionId: completedElection._id,
      voterId: createdUsers[5]._id,
      candidateId: 1,
      voteHash: cvoteHash4,
      transactionHash: ctx4.transactionHash,
      blockNumber: Number(ctx4.blockNumber),
    });
    console.log("   ✅ Raj Ghodake voted for Tejas Yadav");

    // Vote 5: Tejas votes for Vasundhara
    const ctx5 = await web3Utils.castVote(
      completedElectionId,
      2,
      createdUsers[6].walletAddress
    );
    const cvoteHash5 = web3Utils.web3.utils.sha3(
      `${completedElectionId}-${createdUsers[6]._id}-${2}`
    );
    await Vote.create({
      electionId: completedElection._id,
      voterId: createdUsers[6]._id,
      candidateId: 2,
      voteHash: cvoteHash5,
      transactionHash: ctx5.transactionHash,
      blockNumber: Number(ctx5.blockNumber),
    });
    console.log("   ✅ Tejas Yadav voted for Vasundhara Mali\n");

    // Update vote counts for completed election
    await Candidate.findByIdAndUpdate(candidate6._id, { voteCount: 2 });
    await Candidate.findByIdAndUpdate(candidate7._id, { voteCount: 3 });
    await Election.findByIdAndUpdate(completedElection._id, {
      totalVotes: 5,
      status: "completed",
      resultsPublished: true,
    });
    console.log("✅ Marked Cultural Committee Election as completed\n");

    console.log(
      "================================================================================"
    );
    console.log("✅ DEMO DATA SEEDING COMPLETED SUCCESSFULLY!");
    console.log(
      "================================================================================\n"
    );

    console.log("📊 SUMMARY:");
    console.log("   👥 Users: 7 (1 admin + 6 voters)");
    console.log("   🗳️  Elections: 3 (1 ongoing + 1 scheduled + 1 completed)");
    console.log("   👤 Candidates: 7 total");
    console.log("   ✅ Total Votes Cast: 11\n");

    console.log("🔑 LOGIN CREDENTIALS:");
    console.log("   Email: yuvraj.patil@example.com (Admin)");
    console.log("   Password: 1234567890\n");
    console.log("   Other users: [name]@example.com / 1234567890\n");

    console.log("📈 ELECTION RESULTS:\n");

    console.log(
      "   🟢 Ongoing: College Student Council Election 2025 (6 votes)"
    );
    console.log("      1. Rohan Patil - 3 votes (50%)");
    console.log("      2. Harshita Patil - 2 votes (33%)");
    console.log("      3. Suraj Shivankar - 1 vote (17%)\n");

    console.log("   ⚪ Completed: Cultural Committee Election 2024 (5 votes)");
    console.log("      🏆 WINNER: Vasundhara Mali - 3 votes (60%)");
    console.log("      2. Tejas Yadav - 2 votes (40%)\n");

    console.log("   🟡 Scheduled: Sports Committee Election 2025");
    console.log("      Candidates: Vasundhara Mali, Raj Ghodake");
    console.log("      Status: Registration open\n");

    console.log("🎯 Demo is ready! Open http://localhost:5173 to start.\n");

    // Verify data was saved
    const userCount = await User.countDocuments();
    const electionCount = await Election.countDocuments();
    const candidateCount = await Candidate.countDocuments();
    const voteCount = await Vote.countDocuments();

    console.log("✅ Data verification:");
    console.log(`   Users in DB: ${userCount}`);
    console.log(`   Elections in DB: ${electionCount}`);
    console.log(`   Candidates in DB: ${candidateCount}`);
    console.log(`   Votes in DB: ${voteCount}\n`);

    console.log("✅ Database disconnected");
  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    process.exit(1);
  }
}

seedDemoData();
