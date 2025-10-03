//apicalls for user
import axios from "axios";
import { axiosInstance } from "./index";

//login User
export const LoginUser = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/auth/login", payload);
    return data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

//Register User
export const RegisterUser = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/auth/register", payload);
    return data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

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
export const GetAllUsers = async () => {
  try {
    const { data} = await axiosInstance.get("/users");
    return data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

//update user verified status
export const UpdateUserVerifiedStatus = async (payload) => {
  try {
    const { data } = await axiosInstance.put(
      `/users/${payload.userId}/verify`,
      { isVerified: payload.isVerified }
    );
    return data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

//cast vote
export const CastVote = async (payload) => {
  try {
    const { data } = await axiosInstance.post("/votes", payload);
    return data;
  } catch (error) {
    console.error("CastVote error:", error);
    return error.response?.data || { success: false, message: error.message };
  }
};

//get voting status
export const GetVotingStatus = async (electionId) => {
  try {
    const { data } = await axiosInstance.get(`/votes/check/${electionId}`);
    return data;
  } catch (error) {
    console.error("GetVotingStatus error:", error);
    return error.response?.data || { success: false, message: error.message };
  }
};
