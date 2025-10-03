require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Election = require('./models/Election');
const Candidate = require('./models/Candidate');
const Vote = require('./models/Vote');

async function seedSimple() {
  try {
    console.log('🌱 Starting simple database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Election.deleteMany({});
    await Candidate.deleteMany({});
    await Vote.deleteMany({});
    console.log('✅ Database cleared\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('1234567890', 10);

    // Create users
    console.log('👥 Creating demo users...');
    const users = await User.insertMany([
      {
        name: 'Yuvraj Patil',
        email: 'yuvraj.patil@example.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        walletAddress: '0x1234567890123456789012345678901234567890',
        voterId: 'VID001',
        hasVoted: false
      },
      {
        name: 'Rohan Patil',
        email: 'rohan.patil@example.com',
        password: hashedPassword,
        role: 'voter',
        isVerified: true,
        walletAddress: '0x2234567890123456789012345678901234567890',
        voterId: 'VID002',
        hasVoted: true
      },
      {
        name: 'Suraj Shivankar',
        email: 'suraj.shivankar@example.com',
        password: hashedPassword,
        role: 'voter',
        isVerified: true,
        walletAddress: '0x3234567890123456789012345678901234567890',
        voterId: 'VID003',
        hasVoted: true
      },
      {
        name: 'Harshita Patil',
        email: 'harshita.patil@example.com',
        password: hashedPassword,
        role: 'voter',
        isVerified: true,
        walletAddress: '0x4234567890123456789012345678901234567890',
        voterId: 'VID004',
        hasVoted: true
      },
      {
        name: 'Vasundhara Mali',
        email: 'vasundhara.mali@example.com',
        password: hashedPassword,
        role: 'voter',
        isVerified: true,
        walletAddress: '0x5234567890123456789012345678901234567890',
        voterId: 'VID005',
        hasVoted: true
      },
      {
        name: 'Raj Ghodake',
        email: 'raj.ghodake@example.com',
        password: hashedPassword,
        role: 'voter',
        isVerified: true,
        walletAddress: '0x6234567890123456789012345678901234567890',
        voterId: 'VID006',
        hasVoted: true
      },
      {
        name: 'Tejas Yadav',
        email: 'tejas.yadav@example.com',
        password: hashedPassword,
        role: 'voter',
        isVerified: true,
        walletAddress: '0x7234567890123456789012345678901234567890',
        voterId: 'VID007',
        hasVoted: true
      }
    ]);
    console.log('✅ Created 7 users\n');

    // Create elections
    console.log('🗳️  Creating elections...');
    const now = Date.now();

    const elections = await Election.insertMany([
      // Ongoing election
      {
        title: 'College Student Council Election 2025',
        description: 'Annual student council election for leadership positions',
        electionId: 1,
        createdBy: users[0]._id,
        candidateRegistrationDeadline: new Date(now - 12 * 60 * 60 * 1000),
        startTime: new Date(now - 24 * 60 * 60 * 1000),
        endTime: new Date(now + 2 * 24 * 60 * 60 * 1000),
        status: 'ongoing',
        isPublic: true,
        totalVotes: 6
      },
      // Scheduled election
      {
        title: 'Sports Committee Election 2025',
        description: 'Election for sports committee representatives',
        electionId: 2,
        createdBy: users[0]._id,
        candidateRegistrationDeadline: new Date(now + 36 * 60 * 60 * 1000),
        startTime: new Date(now + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(now + 5 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        isPublic: true,
        totalVotes: 0
      },
      // Completed election
      {
        title: 'Cultural Committee Election 2024',
        description: 'Annual cultural committee election for organizing college events',
        electionId: 3,
        createdBy: users[0]._id,
        candidateRegistrationDeadline: new Date(now - 9 * 24 * 60 * 60 * 1000),
        startTime: new Date(now - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(now - 2 * 24 * 60 * 60 * 1000),
        status: 'completed',
        isPublic: true,
        resultsPublished: true,
        totalVotes: 5
      }
    ]);
    console.log('✅ Created 3 elections\n');

    // Create candidates
    console.log('👤 Creating candidates...');
    const candidates = await Candidate.insertMany([
      // Ongoing election candidates
      {
        electionId: elections[0]._id,
        candidateId: 1,
        name: 'Rohan Patil',
        party: 'Progressive Students Forum',
        manifesto: 'I promise to improve campus facilities, organize more cultural events, and establish a student grievance portal.',
        userId: users[1]._id,
        isVerified: true,
        isActive: true,
        voteCount: 3
      },
      {
        electionId: elections[0]._id,
        candidateId: 2,
        name: 'Harshita Patil',
        party: 'Students Unity Alliance',
        manifesto: 'Focus on academic excellence, mental health support, and better library resources.',
        userId: users[3]._id,
        isVerified: true,
        isActive: true,
        voteCount: 2
      },
      {
        electionId: elections[0]._id,
        candidateId: 3,
        name: 'Suraj Shivankar',
        party: 'Independent',
        manifesto: 'Transparent governance, improved sports facilities, and student-led initiatives.',
        userId: users[2]._id,
        isVerified: true,
        isActive: true,
        voteCount: 1
      },
      // Scheduled election candidates
      {
        electionId: elections[1]._id,
        candidateId: 1,
        name: 'Vasundhara Mali',
        party: 'Sports Enthusiasts',
        manifesto: 'Promote inter-college tournaments, upgrade equipment, and increase sports budget.',
        userId: users[4]._id,
        isVerified: true,
        isActive: true,
        voteCount: 0
      },
      {
        electionId: elections[1]._id,
        candidateId: 2,
        name: 'Raj Ghodake',
        party: 'Athletic Association',
        manifesto: 'Build new sports complex, organize fitness programs, and support student athletes.',
        userId: users[5]._id,
        isVerified: true,
        isActive: true,
        voteCount: 0
      },
      // Completed election candidates
      {
        electionId: elections[2]._id,
        candidateId: 1,
        name: 'Tejas Yadav',
        party: 'Cultural Enthusiasts',
        manifesto: 'Organize more cultural events, inter-college competitions, and talent shows.',
        userId: users[6]._id,
        isVerified: true,
        isActive: true,
        voteCount: 2
      },
      {
        electionId: elections[2]._id,
        candidateId: 2,
        name: 'Vasundhara Mali',
        party: 'Arts & Culture Forum',
        manifesto: 'Promote traditional arts, music festivals, and cultural exchange programs.',
        userId: users[4]._id,
        isVerified: true,
        isActive: true,
        voteCount: 3
      }
    ]);
    console.log('✅ Created 7 candidates\n');

    // Create votes
    console.log('🗳️  Creating votes...');
    const votes = await Vote.insertMany([
      // Ongoing election votes
      {
        electionId: elections[0]._id,
        voterId: users[1]._id,
        candidateId: 2,
        voteHash: '0xvote1hash',
        transactionHash: '0xtx1',
        blockNumber: 1000
      },
      {
        electionId: elections[0]._id,
        voterId: users[2]._id,
        candidateId: 2,
        voteHash: '0xvote2hash',
        transactionHash: '0xtx2',
        blockNumber: 1001
      },
      {
        electionId: elections[0]._id,
        voterId: users[3]._id,
        candidateId: 1,
        voteHash: '0xvote3hash',
        transactionHash: '0xtx3',
        blockNumber: 1002
      },
      {
        electionId: elections[0]._id,
        voterId: users[4]._id,
        candidateId: 1,
        voteHash: '0xvote4hash',
        transactionHash: '0xtx4',
        blockNumber: 1003
      },
      {
        electionId: elections[0]._id,
        voterId: users[5]._id,
        candidateId: 3,
        voteHash: '0xvote5hash',
        transactionHash: '0xtx5',
        blockNumber: 1004
      },
      {
        electionId: elections[0]._id,
        voterId: users[6]._id,
        candidateId: 1,
        voteHash: '0xvote6hash',
        transactionHash: '0xtx6',
        blockNumber: 1005
      },
      // Completed election votes
      {
        electionId: elections[2]._id,
        voterId: users[1]._id,
        candidateId: 1,
        voteHash: '0xvote7hash',
        transactionHash: '0xtx7',
        blockNumber: 1006
      },
      {
        electionId: elections[2]._id,
        voterId: users[2]._id,
        candidateId: 2,
        voteHash: '0xvote8hash',
        transactionHash: '0xtx8',
        blockNumber: 1007
      },
      {
        electionId: elections[2]._id,
        voterId: users[3]._id,
        candidateId: 2,
        voteHash: '0xvote9hash',
        transactionHash: '0xtx9',
        blockNumber: 1008
      },
      {
        electionId: elections[2]._id,
        voterId: users[5]._id,
        candidateId: 1,
        voteHash: '0xvote10hash',
        transactionHash: '0xtx10',
        blockNumber: 1009
      },
      {
        electionId: elections[2]._id,
        voterId: users[6]._id,
        candidateId: 2,
        voteHash: '0xvote11hash',
        transactionHash: '0xtx11',
        blockNumber: 1010
      }
    ]);
    console.log('✅ Created 11 votes\n');

    // Verify data
    const userCount = await User.countDocuments();
    const electionCount = await Election.countDocuments();
    const candidateCount = await Candidate.countDocuments();
    const voteCount = await Vote.countDocuments();

    console.log('================================================================================');
    console.log('✅ DEMO DATA LOADED SUCCESSFULLY!');
    console.log('================================================================================\n');

    console.log('📊 DATA VERIFICATION:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Elections: ${electionCount}`);
    console.log(`   Candidates: ${candidateCount}`);
    console.log(`   Votes: ${voteCount}\n`);

    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('   Admin: yuvraj.patil@example.com / 1234567890');
    console.log('   All users: [name]@example.com / 1234567890\n');

    console.log('📈 ELECTION SUMMARY:\n');
    console.log('   🟢 Ongoing: College Student Council Election 2025');
    console.log('      - Rohan Patil: 3 votes');
    console.log('      - Harshita Patil: 2 votes');
    console.log('      - Suraj Shivankar: 1 vote\n');

    console.log('   ⚪ Completed: Cultural Committee Election 2024');
    console.log('      - 🏆 Vasundhara Mali: 3 votes (WINNER)');
    console.log('      - Tejas Yadav: 2 votes\n');

    console.log('   🟡 Scheduled: Sports Committee Election 2025');
    console.log('      - Vasundhara Mali, Raj Ghodake (No votes yet)\n');

    console.log('🎯 Database is ready! Start your server and login at http://localhost:5173\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedSimple();
