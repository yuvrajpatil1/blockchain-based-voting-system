const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

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
    const hashedPassword = await bcrypt.hash('password123', 10);
    hashedUsers.push({
      ...user,
      password: hashedPassword
    });
  }
  return hashedUsers;
}

async function importData() {
  const client = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
  });

  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');

    const db = client.db('Capstone-BBV');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    try {
      await db.collection('users').deleteMany({});
      await db.collection('elections').deleteMany({});
      await db.collection('candidates').deleteMany({});
      console.log('✅ Existing data cleared!');
    } catch (clearError) {
      console.log('⚠️  Warning: Could not clear all existing data. Proceeding with import...');
    }

    // Import Users
    console.log('\n👥 Importing users...');
    const hashedUsers = await hashPasswords(usersData);
    const userResult = await db.collection('users').insertMany(hashedUsers);
    console.log(`✅ Imported ${userResult.insertedCount} users`);
    console.log('   Default password for all users: password123');

    // Get admin user for createdBy field
    const adminUser = await db.collection('users').findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found. Cannot create elections.');
    }

    // Import Elections with createdBy field
    console.log('\n🗳️  Importing elections...');
    const electionsWithCreator = electionsData.map(election => ({
      ...election,
      createdBy: adminUser._id
    }));
    const electionResult = await db.collection('elections').insertMany(electionsWithCreator);
    console.log(`✅ Imported ${electionResult.insertedCount} elections`);

    // Get first election ID
    const firstElection = await db.collection('elections').findOne({});

    // Link candidates to first election and import
    console.log('\n🎯 Importing candidates...');
    const candidatesWithElection = candidatesData.map(candidate => ({
      ...candidate,
      electionId: firstElection._id
    }));
    const candidateResult = await db.collection('candidates').insertMany(candidatesWithElection);
    console.log(`✅ Imported ${candidateResult.insertedCount} candidates`);

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Users imported: ${userResult.insertedCount}`);
    console.log(`✅ Elections imported: ${electionResult.insertedCount}`);
    console.log(`✅ Candidates imported: ${candidateResult.insertedCount}`);
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
    console.log(`  Title: ${firstElection.title}`);
    console.log(`  Status: ${firstElection.status}`);
    console.log(`  Candidates: ${candidateResult.insertedCount}`);
    console.log('='.repeat(60));

    console.log('\n🎉 Data import completed successfully!');
    console.log('🚀 You can now start testing your application!\n');

  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('\n⚠️  Network connectivity issue detected!');
      console.log('📝 Possible solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Add your IP address to MongoDB Atlas Network Access');
      console.log('   3. Go to: https://cloud.mongodb.com/');
      console.log('   4. Navigate to: Network Access → Add IP Address');
      console.log('   5. Click "Add Current IP Address" or "Allow Access from Anywhere" (0.0.0.0/0)');
    }
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the import
importData().catch(console.error);
