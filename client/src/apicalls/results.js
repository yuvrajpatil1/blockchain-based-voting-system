// apicalls/results.js
import { axiosInstance } from "./index";

// Get all elections
export const GetAllElections = async () => {
  try {
    const response = await axiosInstance.get("/elections");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch elections",
    };
  }
};

// Get specific election by ID
export const GetElectionById = async (electionId) => {
  try {
    const response = await axiosInstance.get(`/elections/${electionId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch election details",
    };
  }
};

// Get election results
export const GetElectionResults = async (electionId) => {
  try {
    const response = await axiosInstance.get(`/elections/${electionId}/results`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch election results",
    };
  }
};

// Get election statistics
export const GetElectionStatistics = async (electionId) => {
  try {
    const response = await axiosInstance.get(`/elections/${electionId}/stats`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch election statistics",
    };
  }
};

// Get all candidates for an election
export const GetElectionCandidates = async (electionId) => {
  try {
    const response = await axiosInstance.get(`/candidates/election/${electionId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch candidates",
    };
  }
};

// Create new election (Admin only)
export const CreateElection = async (payload) => {
  try {
    const response = await axiosInstance.post("/elections", payload);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create election",
    };
  }
};

// Update election (Admin only)
export const UpdateElection = async (electionId, payload) => {
  try {
    const response = await axiosInstance.put(`/elections/${electionId}`, payload);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update election",
    };
  }
};

// Delete election (Admin only)
export const DeleteElection = async (electionId) => {
  try {
    const response = await axiosInstance.delete(`/elections/${electionId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete election",
    };
  }
};

// Declare results (Admin only)
export const DeclareResults = async (electionId) => {
  try {
    const response = await axiosInstance.post(`/elections/${electionId}/declare-results`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to declare results",
    };
  }
};

// End election (Admin only)
export const EndElection = async (electionId) => {
  try {
    const response = await axiosInstance.put(`/elections/${electionId}/end`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to end election",
    };
  }
};

// Cast vote
export const CastVote = async (voteData) => {
  try {
    const response = await axiosInstance.post("/votes", voteData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to cast vote",
    };
  }
};

// Check vote status
export const CheckVoteStatus = async (electionId) => {
  try {
    const response = await axiosInstance.get(`/votes/check/${electionId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to check vote status",
    };
  }
};

// Get vote receipt
export const GetVoteReceipt = async (electionId) => {
  try {
    const response = await axiosInstance.get(`/votes/receipt/${electionId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get vote receipt",
    };
  }
};

// Verify vote
export const VerifyVote = async (voteData) => {
  try {
    const response = await axiosInstance.post("/votes/verify", voteData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to verify vote",
    };
  }
};
