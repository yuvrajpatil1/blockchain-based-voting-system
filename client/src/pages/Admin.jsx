import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ArrowRightLeft,
  BanknoteArrowDown,
  User,
  LogOut,
  Menu,
  Users,
  Shield,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  ChevronDown,
  CheckCircle,
  XCircle,
  Award,
  Crown,
  Building,
  BarChart3,
  Download,
  RefreshCw,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  Settings,
  FileText,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import ElectionManagement from "../components/ElectionManagement";
import { hideLoading, showLoading } from "../redux/loaderSlice";
import {
  GetAllUsers,
  UpdateUserStatus,
  VerifyUser,
  ResetUserVote,
  GetAllCandidates,
  UpdateCandidateVerifiedStatus,
  GetAdminDashboard,
  GetSystemHealth,
  GetVotingAnalytics,
  GetAuditLogs,
  ExportUserData,
  CreateAdminUser,
  EmergencyClearVotes,
  GetAllElections,
  CreateElection,
  UpdateElection,
  DeleteElection,
  EndElection,
  DeclareElectionResults,
} from "../apicalls/admin";

const MobileUserCard = ({
  user,
  formatDate,
  onUpdateStatus,
  onVerifyUser,
  onResetVote,
  onSelectUser,
  isSelected,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectUser(user._id)}
            className="rounded"
          />
          <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${
              user.role === "admin"
                ? "bg-purple-900/30 text-purple-400 border-purple-400/30"
                : "bg-blue-900/30 text-blue-400 border-blue-400/30"
            }`}
          >
            {user.role === "admin" ? (
              <Shield className="w-3 h-3 mr-1" />
            ) : (
              <User className="w-3 h-3 mr-1" />
            )}
            <span>{user.role === "admin" ? "Admin" : "User"}</span>
          </span>
          <div className="flex items-center mt-1 text-xs">
            {user.isActive ? (
              <span className="text-green-400 flex items-center">
                <UserCheck className="w-3 h-3 mr-1" />
                Active
              </span>
            ) : (
              <span className="text-red-400 flex items-center">
                <UserX className="w-3 h-3 mr-1" />
                Inactive
              </span>
            )}
            {user.isVerified && (
              <span className="text-blue-400 flex items-center ml-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {user.isActive ? (
          <button
            onClick={() => onUpdateStatus(user._id, false)}
            className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-400/30 text-red-400 rounded-lg text-xs font-medium transition-colors"
          >
            <XCircle className="w-4 h-4 mr-1 inline" />
            Deactivate
          </button>
        ) : (
          <button
            onClick={() => onUpdateStatus(user._id, true)}
            className="px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 text-green-400 rounded-lg text-xs font-medium transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-1 inline" />
            Activate
          </button>
        )}

        {!user.isVerified && (
          <button
            onClick={() => onVerifyUser(user._id)}
            className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 text-blue-400 rounded-lg text-xs font-medium transition-colors"
          >
            <UserCheck className="w-4 h-4 mr-1 inline" />
            Verify
          </button>
        )}

        {user.hasVoted && (
          <button
            onClick={() => onResetVote(user._id)}
            className="px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-400/30 text-yellow-400 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1 inline" />
            Reset Vote
          </button>
        )}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-gray-400 hover:text-white transition-colors"
      >
        <span className="text-xs">
          ID: {user.userId || user._id?.slice(0, 8)}...
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-700/60 space-y-2">
          {user.phone && (
            <p className="text-xs text-gray-400 flex items-center">
              <Phone className="w-3 h-3 mr-2" />
              <strong>Phone:</strong> <span className="ml-1">{user.phone}</span>
            </p>
          )}
          <p className="text-xs text-gray-400 flex items-center">
            <Calendar className="w-3 h-3 mr-2" />
            <strong>Joined:</strong>{" "}
            <span className="ml-1">{formatDate(user.createdAt)}</span>
          </p>
          {user.hasVoted && user.votedFor && (
            <p className="text-xs text-gray-400">
              <strong>Voted For:</strong> {user.votedFor.name} (
              {user.votedFor.party})
            </p>
          )}
          {user.lastLogin && (
            <p className="text-xs text-gray-400">
              <strong>Last Login:</strong> {formatDate(user.lastLogin)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const MobileCandidateCard = ({ candidate, formatDate, onUpdateStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">
              {/* Fixed: Use firstName and lastName consistently */}
              {candidate.firstName && candidate.lastName
                ? `${candidate.firstName} ${candidate.lastName}`
                : candidate.name || "Unknown Candidate"}
            </p>
            <p className="text-xs text-gray-400">{candidate.email}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border bg-emerald-900/30 text-emerald-400 border-emerald-400/30">
            <Crown className="w-3 h-3 mr-1" />
            <span>Candidate</span>
          </span>
          <p className="text-xs text-gray-400 mt-1">
            {/* Fixed: Check isVerified instead of isActive for verification status */}
            {candidate.isVerified ? (
              <span className="text-green-400 flex items-center">
                <UserCheck className="w-3 h-3 mr-1" />
                Verified
              </span>
            ) : (
              <span className="text-yellow-400 flex items-center">
                <UserX className="w-3 h-3 mr-1" />
                Pending
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mb-3">
        {/* Fixed: Use isVerified for verification actions */}
        {candidate.isVerified ? (
          <button
            onClick={() => onUpdateStatus(candidate._id, false)}
            className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-400/30 text-red-400 rounded-lg text-xs font-medium transition-colors"
          >
            <XCircle className="w-4 h-4 mr-2 inline" />
            Reject Verification
          </button>
        ) : (
          <button
            onClick={() => onUpdateStatus(candidate._id, true)}
            className="w-full px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 text-green-400 rounded-lg text-xs font-medium transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2 inline" />
            Verify Candidate
          </button>
        )}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-gray-400 hover:text-white transition-colors"
      >
        {/* Fixed: Use votes instead of voteCount */}
        <span className="text-xs">Votes: {candidate.votes || 0}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-700/60 space-y-2">
          {candidate.party && (
            <p className="text-xs text-gray-400 flex items-center">
              <Building className="w-3 h-3 mr-2" />
              <strong>Party:</strong>{" "}
              <span className="ml-1">{candidate.party}</span>
            </p>
          )}
          {candidate.position && (
            <p className="text-xs text-gray-400">
              <strong>Position:</strong> {candidate.position}
            </p>
          )}
          {/* Fixed: Use registrationNumber instead of candidateId */}
          {candidate.registrationNumber && (
            <p className="text-xs text-gray-400">
              <strong>Registration #:</strong> {candidate.registrationNumber}
            </p>
          )}
          <p className="text-xs text-gray-400 flex items-center">
            <Calendar className="w-3 h-3 mr-2" />
            <strong>Registered:</strong>{" "}
            <span className="ml-1">{formatDate(candidate.createdAt)}</span>
          </p>
          {candidate.biography && (
            <div className="text-xs text-gray-400">
              <strong>Biography:</strong>
              <p className="mt-1 text-gray-300 text-xs leading-relaxed">
                {candidate.biography.length > 100
                  ? `${candidate.biography.substring(0, 100)}...`
                  : candidate.biography}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CreateAdminModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">
          Create Admin User
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
              {errors.firstName && (
                <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [activeTabContent, setActiveTabContent] = useState("all");
  const [users, setUsers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [votingAnalytics, setVotingAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const { user } = useSelector((state) => state.users);

  const userMenu = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
      path: "/dashboard",
    },
    {
      id: "transactions",
      icon: ArrowRightLeft,
      label: "Polling",
      onClick: () => navigate("/polling"),
      path: "/polling",
    },
    {
      id: "results",
      icon: BanknoteArrowDown,
      label: "Results",
      onClick: () => navigate("/results"),
      path: "/results",
    },
    {
      id: "logout",
      icon: LogOut,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
      path: "/logout",
    },
  ];

  const adminMenu = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
      path: "/dashboard",
    },
    {
      id: "users",
      icon: Users,
      label: "Admin",
      onClick: () => console.log("Navigate to users"),
      path: "/users",
    },
    {
      id: "transactions",
      icon: ArrowRightLeft,
      label: "Polling",
      onClick: () => navigate("/polling"),
      path: "/polling",
    },
    {
      id: "results",
      icon: BanknoteArrowDown,
      label: "Results",
      onClick: () => navigate("/results"),
      path: "/results",
    },
    {
      id: "logout",
      icon: LogOut,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/login");
      },
      path: "/logout",
    },
  ];

  const menuToRender = user?.role === "admin" ? adminMenu : userMenu;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      dispatch(showLoading());
      const response = await UpdateUserStatus(userId, isActive);
      dispatch(hideLoading());
      if (response.success) {
        getUsersData();
      } else {
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };

  const verifyUser = async (userId) => {
    try {
      dispatch(showLoading());
      const response = await VerifyUser(userId);
      dispatch(hideLoading());
      if (response.success) {
        getUsersData();
      } else {
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };

  const resetUserVote = async (userId) => {
    const reason = prompt("Enter reason for vote reset:");
    if (!reason) return;

    try {
      dispatch(showLoading());
      const response = await ResetUserVote(userId, reason);
      dispatch(hideLoading());
      if (response.success) {
        alert(response.message);
        getUsersData();
      } else {
        alert(response.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      alert(error.message);
    }
  };

  // Fixed updateCandidateStatus function in AdminsPage component
  const updateCandidateStatus = async (candidateId, isVerified) => {
    try {
      dispatch(showLoading());
      const response = await UpdateCandidateVerifiedStatus({
        selectedCandidate: candidateId, // Fixed: pass candidateId directly
        isVerified: isVerified,
        verificationNotes: isVerified
          ? "Approved by admin"
          : "Rejected by admin",
      });
      dispatch(hideLoading());
      if (response.success) {
        alert(response.message);
        getCandidatesData();
      } else {
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error updating candidate status:", error);
    }
  };

  const createAdminUser = async (adminData) => {
    try {
      dispatch(showLoading());
      const response = await CreateAdminUser(adminData);
      dispatch(hideLoading());
      if (response.success) {
        alert(response.message);
        setShowCreateAdminModal(false);
        getUsersData();
      } else {
        alert(response.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      alert("Failed to create admin user");
    }
  };

  const handleEmergencyClearVotes = async () => {
    const confirmationCode = prompt(
      "⚠️ EMERGENCY ACTION ⚠️\n\nThis will clear ALL votes in the system!\n\nEnter confirmation code (type 'CLEAR_ALL_VOTES'):"
    );

    if (confirmationCode !== "CLEAR_ALL_VOTES") {
      alert("Invalid confirmation code. Operation cancelled.");
      return;
    }

    const finalConfirm = confirm(
      "Are you absolutely sure? This action cannot be undone!"
    );

    if (!finalConfirm) return;

    try {
      dispatch(showLoading());
      const response = await EmergencyClearVotes(confirmationCode);
      dispatch(hideLoading());
      if (response.success) {
        alert(response.message);
        getUsersData();
        getDashboardData();
      } else {
        alert(response.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      alert("Failed to clear votes");
    }
  };

  const getUsersData = async (params = {}) => {
    try {
      setIsLoading(true);
      dispatch(showLoading());
      const response = await GetAllUsers(params);

      if (response.success) {
        setUsers(response.data || []);
      } else {
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
      dispatch(hideLoading());
    }
  };

  const getCandidatesData = async () => {
    try {
      setIsLoading(true);
      dispatch(showLoading());
      const response = await GetAllCandidates();

      if (response.success) {
        setCandidates(response.data || []);
      } else {
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setIsLoading(false);
      dispatch(hideLoading());
    }
  };

  const getDashboardData = async () => {
    try {
      const response = await GetAdminDashboard();
      if (response.success) {
        setDashboardStats(response.dashboard);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    }
  };

  const getSystemHealth = async () => {
    try {
      const response = await GetSystemHealth();
      if (response.success) {
        setSystemHealth(response.system);
      }
    } catch (error) {
      console.error("Error fetching system health:", error);
    }
  };

  const getVotingAnalytics = async () => {
    try {
      const response = await GetVotingAnalytics();
      if (response.success) {
        setVotingAnalytics(response.data);
      }
    } catch (error) {
      console.error("Error fetching voting analytics:", error);
    }
  };

  const getAuditLogs = async () => {
    try {
      dispatch(showLoading());
      const response = await GetAuditLogs({ limit: 50, page: 1 });
      dispatch(hideLoading());
      if (response.success) {
        setAuditLogs(response.data || []);
        setShowAuditLogs(true);
      } else {
        alert("Failed to fetch audit logs");
      }
    } catch (error) {
      dispatch(hideLoading());
      alert("Failed to fetch audit logs");
    }
  };

  const handleExportUsers = async (format = "json") => {
    try {
      dispatch(showLoading());
      const response = await ExportUserData(format);
      dispatch(hideLoading());

      if (response.success) {
        if (format === "csv") {
          const blob = new Blob([response.data], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "users-export.csv";
          a.click();
        } else {
          const blob = new Blob([JSON.stringify(response.data, null, 2)], {
            type: "application/json",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "users-export.json";
          a.click();
        }
        alert("Export completed successfully");
      } else {
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = (checked) => {
    if (checked) {
      setSelectedUsers(getFilteredUsers().map((u) => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkVerify = async () => {
    if (selectedUsers.length === 0) return;

    try {
      dispatch(showLoading());
      const promises = selectedUsers.map((userId) => VerifyUser(userId));
      await Promise.all(promises);
      dispatch(hideLoading());
      alert(`Successfully verified ${selectedUsers.length} users`);
      setSelectedUsers([]);
      getUsersData();
    } catch (error) {
      dispatch(hideLoading());
      alert("Failed to verify users");
    }
  };

  const refreshData = () => {
    if (activeTab === "users") {
      getUsersData();
    } else {
      getCandidatesData();
    }
    getDashboardData();
    getSystemHealth();
    getVotingAnalytics();
  };

  useEffect(() => {
    getUsersData();
    getCandidatesData();
    getDashboardData();
    getSystemHealth();
    getVotingAnalytics();
  }, []);

  const getFilteredUsers = () => {
    let filtered = [];
    switch (activeTabContent) {
      case "admins":
        filtered = users.filter((u) => u.role === "admin");
        break;
      case "verified":
        filtered = users.filter((u) => u.isVerified);
        break;
      case "unverified":
        filtered = users.filter((u) => !u.isVerified);
        break;
      case "active":
        filtered = users.filter((u) => u.isActive);
        break;
      case "inactive":
        filtered = users.filter((u) => !u.isActive);
        break;
      default:
        filtered = users;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.userId &&
            user.userId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const getFilteredCandidates = () => {
    let filtered = [];
    switch (activeTabContent) {
      case "verified":
        filtered = candidates.filter((c) => c.isActive);
        break;
      case "unverified":
        filtered = candidates.filter((c) => !c.isActive);
        break;
      default:
        filtered = candidates;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (candidate) =>
          (candidate.name || `${candidate.firstName} ${candidate.lastName}`)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (candidate.party &&
            candidate.party.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (candidate.candidateId &&
            candidate.candidateId
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const currentUsers = getFilteredUsers();
  const currentCandidates = getFilteredCandidates();
  const currentData = activeTab === "users" ? currentUsers : currentCandidates;

  const userStats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    verified: users.filter((u) => u.isVerified).length,
    unverified: users.filter((u) => !u.isVerified).length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  const candidateStats = {
    total: candidates.length,
    verified: candidates.filter((c) => c.isActive).length,
    unverified: candidates.filter((c) => !c.isActive).length,
  };

  const stats = activeTab === "users" ? userStats : candidateStats;

  return (
    <div className="min-h-dvh bg-gradient-to-tr from-black via-[#1e0b06] to-black text-white flex">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        menuItems={menuToRender}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col min-h-dvh">
        <header className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900/50 backdrop-blur-md border-b border-gray-700/60 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden mr-3 lg:mr-4 p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
            <div className="text-3xl lg:text-sm text-center text-gray-400">
              <span className="font-semibold text-white">Admin Panel</span>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <main className="mt-12 lg:mt-0 flex-1 p-4 lg:p-4 max-w-dvw">
          <div className="max-w-7xl mx-auto mt-2 no-scrollbar">
            {/* Dashboard Stats */}
            {dashboardStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">
                        {dashboardStats.overview?.totalUsers || 0}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-amber-400" />
                  </div>
                </div>

                <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Voters</p>
                      <p className="text-2xl font-bold text-white">
                        {dashboardStats.overview?.totalVoters || 0}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Candidates</p>
                      <p className="text-2xl font-bold text-white">
                        {dashboardStats.overview?.totalCandidates || 0}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Turnout</p>
                      <p className="text-2xl font-bold text-white">
                        {dashboardStats.overview?.voterTurnout || 0}%
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              </div>
            )}

            {/* System Health */}
            {systemHealth && (
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-green-400 mr-2" />
                    <span className="text-white font-medium">
                      System Status:{" "}
                    </span>
                    <span
                      className={`ml-2 ${
                        systemHealth.status === "operational"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {systemHealth.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <span>DB: {systemHealth.database || "Unknown"}</span>
                    <span className="mx-2">|</span>
                    <span>
                      Uptime: {Math.floor((systemHealth.uptime || 0) / 3600)}h
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Render Election Management if elections tab is active */}
            {activeTab === "elections" ? (
              <ElectionManagement />
            ) : (
              <>
                {/* Header with Search and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">
                    {activeTab === "users"
                      ? "USER MANAGEMENT"
                      : "CANDIDATE MANAGEMENT"}
                  </h1>

                  <div className="flex gap-2 flex-wrap items-center">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 w-48"
                      />
                    </div>

                    {/* Tab Buttons */}
                    <button
                      onClick={() => {
                        setActiveTab("users");
                        setActiveTabContent("all");
                        setSearchTerm("");
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                        activeTab === "users"
                          ? "bg-amber-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                    >
                      <Users className="w-4 h-4 inline mr-2" />
                      Users
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("candidates");
                        setActiveTabContent("all");
                        setSearchTerm("");
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                        activeTab === "candidates"
                          ? "bg-amber-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                    >
                      <Award className="w-4 h-4 inline mr-2" />
                      Candidates
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("elections");
                        setActiveTabContent("all");
                        setSearchTerm("");
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                        activeTab === "elections"
                          ? "bg-amber-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                    >
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Elections
                    </button>

                    {/* Action Buttons */}
                    {activeTab === "users" && (
                      <>
                        <button
                          onClick={() => handleExportUsers("json")}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                          disabled={isLoading}
                        >
                          <Download className="w-4 h-4 inline mr-2" />
                          Export JSON
                        </button>
                        <button
                          onClick={() => handleExportUsers("csv")}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                          disabled={isLoading}
                        >
                          <Download className="w-4 h-4 inline mr-2" />
                          Export CSV
                        </button>
                      </>
                    )}

                    <button
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm lg:text-base"
                      onClick={refreshData}
                      disabled={isLoading}
                    >
                      <RefreshCw
                        className={`w-4 h-4 inline mr-2 ${
                          isLoading ? "animate-spin" : ""
                        }`}
                      />
                      {isLoading ? "REFRESHING..." : "REFRESH"}
                    </button>
                  </div>
                </div>

                {/* Emergency Actions */}
                <div className="bg-red-900/20 border border-red-400/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                      <span className="text-red-400 font-medium">
                        Emergency Actions
                      </span>
                    </div>
                    <button
                      onClick={handleEmergencyClearVotes}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Clear All Votes
                    </button>
                  </div>
                </div>

                {/* Bulk Actions for Users */}
                {activeTab === "users" && selectedUsers.length > 0 && (
                  <div className="bg-amber-600/20 border border-amber-400/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-medium">
                        {selectedUsers.length} users selected
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleBulkVerify}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                        >
                          Bulk Verify
                        </button>
                        <button
                          onClick={() => setSelectedUsers([])}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Content Table/Cards */}
                <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl overflow-hidden mb-6">
                  <div className="flex border-b border-gray-700/60 overflow-x-auto">
                    <button
                      onClick={() => setActiveTabContent("all")}
                      className={`flex-1 min-w-0 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${
                        activeTabContent === "all"
                          ? "bg-amber-600 text-white"
                          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      }`}
                    >
                      {activeTab === "users" ? (
                        <Users className="w-4 h-4 mr-2" />
                      ) : (
                        <Award className="w-4 h-4 mr-2" />
                      )}
                      <span>All ({stats.total})</span>
                    </button>

                    {activeTab === "users" && (
                      <>
                        <button
                          onClick={() => setActiveTabContent("admins")}
                          className={`flex-1 min-w-0 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${
                            activeTabContent === "admins"
                              ? "bg-amber-600 text-white"
                              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                          }`}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          <span>Admins ({stats.admins})</span>
                        </button>

                        <button
                          onClick={() => setActiveTabContent("active")}
                          className={`flex-1 min-w-0 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${
                            activeTabContent === "active"
                              ? "bg-amber-600 text-white"
                              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                          }`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span>Active ({stats.active})</span>
                        </button>

                        <button
                          onClick={() => setActiveTabContent("inactive")}
                          className={`flex-1 min-w-0 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${
                            activeTabContent === "inactive"
                              ? "bg-amber-600 text-white"
                              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                          }`}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          <span>Inactive ({stats.inactive})</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setActiveTabContent("verified")}
                      className={`flex-1 min-w-0 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${
                        activeTabContent === "verified"
                          ? "bg-amber-600 text-white"
                          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      }`}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">
                        {activeTab === "users" ? "Verified" : "Active"} (
                        {stats.verified})
                      </span>
                      <span className="sm:hidden">✓ ({stats.verified})</span>
                    </button>

                    <button
                      onClick={() => setActiveTabContent("unverified")}
                      className={`flex-1 min-w-0 px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${
                        activeTabContent === "unverified"
                          ? "bg-amber-600 text-white"
                          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      }`}
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">
                        {activeTab === "users" ? "Unverified" : "Inactive"} (
                        {stats.unverified})
                      </span>
                      <span className="sm:hidden">✗ ({stats.unverified})</span>
                    </button>
                  </div>

                  {/* Mobile View */}
                  <div className="block lg:hidden">
                    {currentData.length > 0 ? (
                      <div className="p-4">
                        {activeTab === "users"
                          ? currentUsers.map((userItem) => (
                              <MobileUserCard
                                key={userItem._id}
                                user={userItem}
                                formatDate={formatDate}
                                onUpdateStatus={updateUserStatus}
                                onVerifyUser={verifyUser}
                                onResetVote={resetUserVote}
                                onSelectUser={handleSelectUser}
                                isSelected={selectedUsers.includes(
                                  userItem._id
                                )}
                              />
                            ))
                          : currentCandidates.map((candidateItem) => (
                              <MobileCandidateCard
                                key={candidateItem._id}
                                candidate={candidateItem}
                                formatDate={formatDate}
                                onUpdateStatus={updateCandidateStatus}
                              />
                            ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        {activeTab === "users" ? (
                          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        ) : (
                          <Award className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        )}
                        <p className="text-gray-400 text-lg">
                          No {activeTabContent} {activeTab} found
                        </p>
                        <p className="text-gray-500 text-sm px-4">
                          {activeTabContent === "all"
                            ? `No ${activeTab} are registered yet`
                            : `No ${activeTabContent} ${activeTab} found`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-900/60">
                        <tr>
                          {activeTab === "users" && (
                            <th className="px-4 py-4 text-left">
                              <input
                                type="checkbox"
                                onChange={(e) =>
                                  handleSelectAllUsers(e.target.checked)
                                }
                                checked={
                                  selectedUsers.length ===
                                    currentUsers.length &&
                                  currentUsers.length > 0
                                }
                                className="rounded"
                              />
                            </th>
                          )}
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            Email
                          </th>
                          {activeTab === "candidates" && (
                            <>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Party
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Votes
                              </th>
                            </>
                          )}
                          {activeTab === "users" && (
                            <>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Role
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Voted
                              </th>
                            </>
                          )}
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/60">
                        {activeTab === "users"
                          ? currentUsers.map((userItem) => (
                              <tr
                                key={userItem._id}
                                className="hover:bg-gray-700/30 transition-colors"
                              >
                                <td className="px-4 py-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(
                                      userItem._id
                                    )}
                                    onChange={() =>
                                      handleSelectUser(userItem._id)
                                    }
                                    className="rounded"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                                  {userItem.userId || userItem._id?.slice(0, 8)}
                                  ...
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center mr-3">
                                      <User className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-white">
                                        {userItem.firstName} {userItem.lastName}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                    {userItem.email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                                      userItem.role === "admin"
                                        ? "bg-purple-900/30 text-purple-400 border-purple-400/30"
                                        : "bg-blue-900/30 text-blue-400 border-blue-400/30"
                                    }`}
                                  >
                                    {userItem.role === "admin" ? (
                                      <Shield className="w-3 h-3 mr-1" />
                                    ) : (
                                      <User className="w-3 h-3 mr-1" />
                                    )}
                                    <span>
                                      {userItem.role === "admin"
                                        ? "Admin"
                                        : "User"}
                                    </span>
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                                      userItem.hasVoted
                                        ? "bg-green-900/30 text-green-400 border-green-400/30"
                                        : "bg-gray-900/30 text-gray-400 border-gray-400/30"
                                    }`}
                                  >
                                    {userItem.hasVoted ? (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                      <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    <span>
                                      {userItem.hasVoted
                                        ? "Voted"
                                        : "Not Voted"}
                                    </span>
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex flex-col space-y-1">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${
                                        userItem.isActive
                                          ? "bg-green-900/30 text-green-400 border-green-400/30"
                                          : "bg-red-900/30 text-red-400 border-red-400/30"
                                      }`}
                                    >
                                      {userItem.isActive ? (
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                      ) : (
                                        <XCircle className="w-3 h-3 mr-1" />
                                      )}
                                      <span>
                                        {userItem.isActive
                                          ? "Active"
                                          : "Inactive"}
                                      </span>
                                    </span>
                                    {userItem.isVerified && (
                                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border bg-blue-900/30 text-blue-400 border-blue-400/30">
                                        <UserCheck className="w-3 h-3 mr-1" />
                                        <span>Verified</span>
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                  {formatDate(userItem.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex flex-col space-y-2">
                                    {userItem.isActive ? (
                                      <button
                                        onClick={() =>
                                          updateUserStatus(userItem._id, false)
                                        }
                                        className="inline-flex items-center px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-400/30 text-red-400 rounded-lg text-xs font-medium transition-colors"
                                      >
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Deactivate
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          updateUserStatus(userItem._id, true)
                                        }
                                        className="inline-flex items-center px-3 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 text-green-400 rounded-lg text-xs font-medium transition-colors"
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Activate
                                      </button>
                                    )}

                                    {!userItem.isVerified && (
                                      <button
                                        onClick={() => verifyUser(userItem._id)}
                                        className="inline-flex items-center px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 text-blue-400 rounded-lg text-xs font-medium transition-colors"
                                      >
                                        <UserCheck className="w-3 h-3 mr-1" />
                                        Verify
                                      </button>
                                    )}

                                    {userItem.hasVoted && (
                                      <button
                                        onClick={() =>
                                          resetUserVote(userItem._id)
                                        }
                                        className="inline-flex items-center px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-400/30 text-yellow-400 rounded-lg text-xs font-medium transition-colors"
                                      >
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        Reset Vote
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          : currentCandidates.map((candidateItem) => (
                              <tr
                                key={candidateItem._id}
                                className="hover:bg-gray-700/30 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                                  {candidateItem.candidateId ||
                                    candidateItem._id?.slice(0, 8)}
                                  ...
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-emerald-600/20 rounded-full flex items-center justify-center mr-3">
                                      <Award className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-white">
                                        {candidateItem.name ||
                                          `${candidateItem.firstName} ${candidateItem.lastName}`}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                    {candidateItem.email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                  {candidateItem.party ? (
                                    <div className="flex items-center">
                                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                                      {candidateItem.party}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-bold">
                                  {candidateItem.voteCount || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                                      candidateItem.isActive
                                        ? "bg-green-900/30 text-green-400 border-green-400/30"
                                        : "bg-red-900/30 text-red-400 border-red-400/30"
                                    }`}
                                  >
                                    {candidateItem.isActive ? (
                                      <UserCheck className="w-3 h-3 mr-1" />
                                    ) : (
                                      <UserX className="w-3 h-3 mr-1" />
                                    )}
                                    <span>
                                      {candidateItem.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </span>
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                  {formatDate(candidateItem.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {candidateItem.isActive ? (
                                    <button
                                      onClick={() =>
                                        updateCandidateStatus(
                                          candidateItem._id,
                                          false
                                        )
                                      }
                                      className="inline-flex items-center px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-400/30 text-red-400 rounded-lg text-xs font-medium transition-colors"
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Deactivate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        updateCandidateStatus(
                                          candidateItem._id,
                                          true
                                        )
                                      }
                                      className="inline-flex items-center px-3 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 text-green-400 rounded-lg text-xs font-medium transition-colors"
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Activate
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                      </tbody>
                    </table>

                    {currentData.length === 0 && (
                      <div className="text-center py-12">
                        {activeTab === "users" ? (
                          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        ) : (
                          <Award className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        )}
                        <p className="text-gray-400 text-lg">
                          No {activeTabContent} {activeTab} found
                        </p>
                        <p className="text-gray-500 text-sm">
                          {activeTabContent === "all"
                            ? `No ${activeTab} are registered yet`
                            : `No ${activeTabContent} ${activeTab} found`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Voting Analytics */}
                {votingAnalytics && (
                  <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-700/60">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-amber-400" />
                        Voting Analytics
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-2">
                            Hourly Distribution
                          </h4>
                          <div className="space-y-2">
                            {votingAnalytics.hourlyDistribution
                              ?.slice(0, 5)
                              .map((hour, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-gray-400">
                                    {hour._id}:00
                                  </span>
                                  <span className="text-white font-medium">
                                    {hour.count} votes
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-2">
                            Peak Times
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Peak Hour</span>
                              <span className="text-green-400">
                                {votingAnalytics.peakHour?._id || "N/A"}:00
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Peak Votes</span>
                              <span className="text-green-400">
                                {votingAnalytics.peakHour?.count || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-2">
                            Total Statistics
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Total Votes</span>
                              <span className="text-white font-medium">
                                {votingAnalytics.totalVotes || 0}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">
                                Unique Voters
                              </span>
                              <span className="text-white font-medium">
                                {votingAnalytics.uniqueVoters || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Candidates Section */}
                {dashboardStats && dashboardStats.topCandidates && (
                  <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-700/60">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Award className="w-5 h-5 mr-2 text-amber-400" />
                        Top Candidates
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dashboardStats.topCandidates.map(
                          (candidate, index) => (
                            <div
                              key={candidate._id || candidate.candidateId}
                              className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                      index === 0
                                        ? "bg-yellow-600/20 text-yellow-400"
                                        : index === 1
                                        ? "bg-gray-400/20 text-gray-400"
                                        : index === 2
                                        ? "bg-orange-600/20 text-orange-400"
                                        : "bg-emerald-600/20 text-emerald-400"
                                    }`}
                                  >
                                    <Crown className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white text-sm">
                                      {candidate.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {candidate.party}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-white">
                                    {candidate.voteCount}
                                  </p>
                                  <p className="text-xs text-gray-400">votes</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>#{index + 1}</span>
                                <span>ID: {candidate.candidateId}</span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Party Statistics */}
                {dashboardStats && dashboardStats.partyStats && (
                  <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-xl lg:rounded-2xl overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-700/60">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-amber-400" />
                        Party Statistics
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {dashboardStats.partyStats.map((party, index) => (
                          <div
                            key={party._id}
                            className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center mr-3">
                                  <Building className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">
                                    {party._id || "Independent"}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {party.candidateCount} candidate
                                    {party.candidateCount !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-white">
                                  {party.totalVotes}
                                </p>
                                <p className="text-sm text-gray-400">
                                  total votes
                                </p>
                              </div>
                            </div>
                            <div className="w-full bg-gray-600/30 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    dashboardStats.partyStats.length > 0
                                      ? (party.totalVotes /
                                          Math.max(
                                            ...dashboardStats.partyStats.map(
                                              (p) => p.totalVotes
                                            )
                                          )) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit Logs Modal */}
                {showAuditLogs && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-amber-400" />
                          Audit Logs
                        </h3>
                        <button
                          onClick={() => setShowAuditLogs(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <XCircle className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="overflow-y-auto max-h-[60vh]">
                        {auditLogs.length > 0 ? (
                          <div className="p-6 space-y-4">
                            {auditLogs.map((log, index) => (
                              <div
                                key={index}
                                className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      log.action?.includes("CREATE")
                                        ? "bg-green-900/30 text-green-400"
                                        : log.action?.includes("UPDATE")
                                        ? "bg-blue-900/30 text-blue-400"
                                        : log.action?.includes("DELETE")
                                        ? "bg-red-900/30 text-red-400"
                                        : "bg-gray-900/30 text-gray-400"
                                    }`}
                                  >
                                    {log.action}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatDate(log.timestamp)}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-400">User:</span>
                                    <span className="text-white ml-2">
                                      {log.userId?.email ||
                                        log.userId ||
                                        "System"}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-gray-400">
                                      Resource:
                                    </span>
                                    <span className="text-white ml-2">
                                      {log.resource}
                                    </span>
                                  </div>

                                  {log.resourceId && (
                                    <div>
                                      <span className="text-gray-400">
                                        Resource ID:
                                      </span>
                                      <span className="text-white ml-2 font-mono">
                                        {log.resourceId.slice(0, 8)}...
                                      </span>
                                    </div>
                                  )}

                                  {log.ipAddress && (
                                    <div>
                                      <span className="text-gray-400">
                                        IP Address:
                                      </span>
                                      <span className="text-white ml-2">
                                        {log.ipAddress}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {log.details && (
                                  <div className="mt-3">
                                    <span className="text-gray-400">
                                      Details:
                                    </span>
                                    <pre className="text-white text-xs bg-gray-800/50 p-2 rounded mt-1 overflow-x-auto">
                                      {typeof log.details === "string"
                                        ? log.details
                                        : JSON.stringify(log.details, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400">No audit logs found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Create Admin Modal */}
                <CreateAdminModal
                  isOpen={showCreateAdminModal}
                  onClose={() => setShowCreateAdminModal(false)}
                  onSubmit={createAdminUser}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
