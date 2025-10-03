const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

// Import models
const User = require('../server/models/User');
const Election = require('../server/models/Election');
const Candidate = require('../server/models/Candidate');

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yuvraj:yuvraj@cluster0.o9dzamn.mongodb.net/Capstone-BBV';
console.log('📍 Using MongoDB URI:', MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

// Read JSON files
const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8'));
const electionsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'elections.json'), 'utf8'));
const candidatesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'candidates.json'), 'utf8'));

// Hash passwords for users
async function hashPasswords(users) {
  const hashedUsers = [];
  for (const user of users) {
    const hashedPassword = await bcrypt.hash('password123', 10); // Default password for all test users
    hashedUsers.push({
      ...user,
      password: hashedPassword
    });
  }
  return hashedUsers;
}

async function importData() {
  try {
    // Disable buffering to avoid timeout issues
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferTimeoutMS', 30000);

    // Connect to MongoDB with increased timeout and additional options
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });
    console.log('✅ Connected to MongoDB successfully!');

    // Clear existing data with timeout handling
    console.log('\n🗑️  Clearing existing data...');
    try {
      await Promise.all([
        User.deleteMany({}).maxTimeMS(20000),
        Election.deleteMany({}).maxTimeMS(20000),
        Candidate.deleteMany({}).maxTimeMS(20000)
      ]);
      console.log('✅ Existing data cleared!');
    } catch (clearError) {
      console.log('⚠️  Warning: Could not clear all existing data. Proceeding with import...');
      console.log('   (This is OK if collections are empty or don\'t exist yet)');
    }

    // Import Users
    console.log('\n👥 Importing users...');
    const hashedUsers = await hashPasswords(usersData);
    const insertedUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Imported ${insertedUsers.length} users`);
    console.log('   Default password for all users: password123');

    // Import Elections
    console.log('\n🗳️  Importing elections...');
    const insertedElections = await Election.insertMany(electionsData);
    console.log(`✅ Imported ${insertedElections.length} elections`);

    // Link candidates to first election and import
    console.log('\n🎯 Importing candidates...');
    const firstElectionId = insertedElections[0]._id;
    const candidatesWithElection = candidatesData.map(candidate => ({
      ...candidate,
      electionId: firstElectionId
    }));
    const insertedCandidates = await Candidate.insertMany(candidatesWithElection);
    console.log(`✅ Imported ${insertedCandidates.length} candidates`);

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Users imported: ${insertedUsers.length}`);
    console.log(`✅ Elections imported: ${insertedElections.length}`);
    console.log(`✅ Candidates imported: ${insertedCandidates.length}`);
    console.log('\n📝 Test Credentials:');
    console.log('─'.repeat(60));
    console.log('Admin Account:');
    console.log('  Email: admin@electoral.com');
    console.log('  Password: password123');
    console.log('  Role: admin');
    console.log('\nVoter Accounts:');
    console.log('  Email: john@example.com');
    console.log('  Email: jane@example.com');
    console.log('  Email: michael@example.com');
    console.log('  Email: sarah@example.com');
    console.log('  Password (all): password123');
    console.log('\n🎯 Active Election:');
    console.log(`  Name: ${insertedElections[0].name}`);
    console.log(`  Candidates: ${insertedCandidates.length}`);
    console.log('='.repeat(60));

    console.log('\n🎉 Data import completed successfully!');
    console.log('🚀 You can now start testing your application!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

// Run the import
importData();
