const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

// Check and update election statuses
const updateElectionStatuses = async () => {
  try {
    const now = new Date();

    // Find elections with candidateRegistrationDeadline passed but still in 'scheduled' status
    const electionsToActivate = await Election.find({
      candidateRegistrationDeadline: { $lte: now },
      status: 'scheduled'
    });

    for (const election of electionsToActivate) {
      // Check if election has at least one verified candidate
      const candidateCount = await Candidate.countDocuments({
        electionId: election._id,
        isVerified: true,
        isActive: true
      });

      if (candidateCount === 0) {
        console.log(`Election ${election.title} has no candidates. Keeping in scheduled status.`);
        continue;
      }

      // Check if voting period has started
      if (now >= election.startTime && now <= election.endTime) {
        election.status = 'ongoing';
        await election.save();
        console.log(`Election ${election.title} status changed to 'ongoing' (voting started)`);
      } else if (now < election.startTime) {
        election.status = 'upcoming';
        await election.save();
        console.log(`Election ${election.title} status changed to 'upcoming' (registration closed, voting not started)`);
      }
    }

    // Update upcoming elections to ongoing when voting starts
    const upcomingElections = await Election.find({
      status: 'upcoming',
      startTime: { $lte: now },
      endTime: { $gte: now }
    });

    for (const election of upcomingElections) {
      election.status = 'ongoing';
      await election.save();
      console.log(`Election ${election.title} status changed to 'ongoing' (voting started)`);
    }

    // Update ongoing elections to completed when voting ends
    const ongoingElections = await Election.find({
      status: 'ongoing',
      endTime: { $lt: now }
    });

    for (const election of ongoingElections) {
      election.status = 'completed';
      await election.save();
      console.log(`Election ${election.title} status changed to 'completed' (voting ended)`);
    }

  } catch (error) {
    console.error('Error updating election statuses:', error);
  }
};

// Start the scheduler (runs every minute)
const startElectionScheduler = () => {
  console.log('Election status scheduler started');

  // Run immediately on startup
  updateElectionStatuses();

  // Run every minute
  setInterval(updateElectionStatuses, 60 * 1000);
};

module.exports = {
  startElectionScheduler,
  updateElectionStatuses
};
