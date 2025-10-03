// apicalls/admin.js
import { axiosInstance } from "./index";

//get user info
export const GetUserInfo = async () => {
  try {
    const { data } = await axiosInstance.get("/auth/me");
    return data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

//get all users
export const GetAllUsers = async (params = {}) => {
  try {
    const { data } = await axiosInstance.get("/users", { params });
    return data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Update user status
export const UpdateUserStatus = async (userId, isActive) => {
  try {
    const response = await axiosInstance.put(`/users/${userId}/status`, { isActive });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Verify user
export const VerifyUser = async (userId) => {
  try {
    const response = await axiosInstance.put(
      `/users/${userId}/verify`,
      { isVerified: true }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Reset user vote
export const ResetUserVote = async (userId, reason) => {
  try {
    const response = await axiosInstance.post(`/users/${userId}/reset-vote`, { reason });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Get all candidates
export const GetAllCandidates = async () => {
  try {
    const response = await axiosInstance.get("/candidates");
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Update candidate verification status
export const UpdateCandidateVerifiedStatus = async (payload) => {
  try {
    const response = await axiosInstance.put("/candidates/verify", payload);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Get admin dashboard statistics
export const GetAdminDashboard = async () => {
  try {
    const response = await axiosInstance.get("/elections/dashboard/stats");
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Get system health
export const GetSystemHealth = async () => {
  try {
    const response = await axiosInstance.get("/health");
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Get voting analytics
export const GetVotingAnalytics = async () => {
  try {
    const response = await axiosInstance.get("/elections/analytics");
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Get audit logs
export const GetAuditLogs = async (params) => {
  try {
    const response = await axiosInstance.get("/admin/audit-logs", { params });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Export user data
export const ExportUserData = async (format = "json") => {
  try {
    const response = await axiosInstance.get(`/admin/export/users?format=${format}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Create admin user
export const CreateAdminUser = async (adminData) => {
  try {
    const response = await axiosInstance.post("/admin/create", adminData);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Emergency clear votes
export const EmergencyClearVotes = async (confirmationCode) => {
  try {
    const response = await axiosInstance.post("/admin/emergency/clear-votes", { confirmationCode });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// ==================== ELECTION MANAGEMENT ====================

// Create election
export const CreateElection = async (electionData) => {
  try {
    const response = await axiosInstance.post("/elections", electionData);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Get all elections
export const GetAllElections = async () => {
  try {
    const response = await axiosInstance.get("/elections");
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Update election
export const UpdateElection = async (electionId, updateData) => {
  try {
    const response = await axiosInstance.put(`/elections/${electionId}`, updateData);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Delete election
export const DeleteElection = async (electionId) => {
  try {
    const response = await axiosInstance.delete(`/elections/${electionId}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// End election
export const EndElection = async (electionId) => {
  try {
    const response = await axiosInstance.put(`/elections/${electionId}/end`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Activate election (make it live for voting)
export const ActivateElection = async (electionId) => {
  try {
    const response = await axiosInstance.put(`/elections/${electionId}/activate`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Declare election results
export const DeclareElectionResults = async (electionId) => {
  try {
    const response = await axiosInstance.post(`/elections/${electionId}/declare-results`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Get election results
export const GetElectionResults = async (electionId) => {
  try {
    const response = await axiosInstance.get(`/elections/${electionId}/results`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Register voter to election
export const RegisterVoterToElection = async (electionId, userId) => {
  try {
    const response = await axiosInstance.post(`/elections/${electionId}/register-voter`, { userId });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};
