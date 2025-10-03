const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send verification email to user
const sendVerificationEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'Blockchain Voting System <noreply@votingsystem.com>',
      to: userEmail,
      subject: 'Account Verified - Blockchain Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Account Verified Successfully!</h2>
          <p>Dear ${userName},</p>
          <p>Your account has been verified by the administrator. You can now:</p>
          <ul>
            <li>Participate in elections</li>
            <li>Cast your votes</li>
            <li>View election results</li>
            <li>Register as a candidate (if eligible)</li>
          </ul>
          <p>Please login to the system to access all features.</p>
          <p style="margin-top: 30px;">Best regards,<br/>Blockchain Voting System Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send wallet assignment email
const sendWalletAssignmentEmail = async (userEmail, userName, walletAddress) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'Blockchain Voting System <noreply@votingsystem.com>',
      to: userEmail,
      subject: 'Wallet Address Assigned - Blockchain Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2196F3;">Blockchain Wallet Assigned</h2>
          <p>Dear ${userName},</p>
          <p>A blockchain wallet address has been assigned to your account for secure voting.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Your Wallet Address:</strong><br/>
            <code style="font-size: 14px; word-break: break-all;">${walletAddress}</code>
          </div>
          <p><strong>Important:</strong> This wallet address will be used to record your votes on the blockchain, ensuring transparency and immutability.</p>
          <p style="margin-top: 30px;">Best regards,<br/>Blockchain Voting System Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Wallet assignment email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending wallet assignment email:', error);
    return { success: false, error: error.message };
  }
};

// Send election announcement email
const sendElectionAnnouncementEmail = async (userEmail, userName, election) => {
  try {
    const registrationDeadline = new Date(election.candidateRegistrationDeadline || election.startTime);
    const electionStart = new Date(election.startTime);
    const electionEnd = new Date(election.endTime);

    const mailOptions = {
      from: process.env.EMAIL_USER || 'Blockchain Voting System <noreply@votingsystem.com>',
      to: userEmail,
      subject: `New Election Announced - ${election.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2196F3;">New Election Announced!</h2>
          <p>Dear ${userName},</p>
          <p>A new election has been created and you are eligible to participate.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">${election.title}</h3>
            <p style="margin: 10px 0;"><strong>Description:</strong> ${election.description || 'No description provided'}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
            <p style="margin: 10px 0;"><strong>📅 Candidate Registration Deadline:</strong><br/>${registrationDeadline.toLocaleString()}</p>
            <p style="margin: 10px 0;"><strong>🗳️ Voting Period:</strong><br/>${electionStart.toLocaleString()} - ${electionEnd.toLocaleString()}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0;"><strong>⏰ Important:</strong> If you wish to register as a candidate, you must do so before ${registrationDeadline.toLocaleString()}. After this deadline, candidate registration will close and the election will begin.</p>
          </div>

          <p>You can:</p>
          <ul>
            <li>Register as a candidate (if you meet the requirements)</li>
            <li>Vote once the election starts</li>
            <li>View live results after voting ends</li>
          </ul>

          <p style="margin-top: 30px;">Best regards,<br/>Blockchain Voting System Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Election announcement email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending election announcement email:', error);
    return { success: false, error: error.message };
  }
};

// Send bulk emails to all users
const sendBulkElectionAnnouncement = async (users, election) => {
  try {
    const emailPromises = users.map(user =>
      sendElectionAnnouncementEmail(user.email, user.name, election)
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Election announcement emails: ${successful} sent, ${failed} failed`);
    return { success: true, sent: successful, failed };
  } catch (error) {
    console.error('Error sending bulk election announcements:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendWalletAssignmentEmail,
  sendElectionAnnouncementEmail,
  sendBulkElectionAnnouncement
};
