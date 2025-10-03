// apicalls/candidates.js
import { axiosInstance } from "./index";

// Get candidate by ID
export const GetCandidateById = async (id) => {
  try {
    const response = await axiosInstance.get(`/candidates/${id}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Get candidate with blockchain data
export const GetCandidateWithBlockchainData = async (id) => {
  try {
    const response = await axiosInstance.get(`/candidates/${id}/blockchain`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Register new candidate (Admin only)
export const RegisterCandidate = async (payload) => {
  try {
    const response = await axiosInstance.post("/candidates", payload);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Update candidate (Admin only)
export const UpdateCandidate = async (id, payload) => {
  try {
    const response = await axiosInstance.put(`/candidates/${id}`, payload);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Delete candidate (Admin only)
export const DeleteCandidate = async (candidateId) => {
  try {
    const response = await axiosInstance.delete(`/candidates/${candidateId}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Get candidates by election
export const GetCandidatesByElection = async (electionId) => {
  try {
    const response = await axiosInstance.get(`/candidates/election/${electionId}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};
