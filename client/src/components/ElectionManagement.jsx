import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  PlayCircle,
  StopCircle,
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/loaderSlice";
import {
  GetAllElections,
  CreateElection,
  UpdateElection,
  DeleteElection,
  EndElection,
  DeclareElectionResults,
} from "../apicalls/admin";

const CreateElectionModal = ({ isOpen, onClose, onSubmit, election = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "pending",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (election) {
      setFormData({
        name: election.name || "",
        description: election.description || "",
        startDate: election.startDate ? new Date(election.startDate).toISOString().slice(0, 16) : "",
        endDate: election.endDate ? new Date(election.endDate).toISOString().slice(0, 16) : "",
        status: election.status || "pending",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "pending",
      });
    }
  }, [election, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Election name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-amber-400" />
          {election ? "Edit Election" : "Create New Election"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Election Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Presidential Election 2024"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter election description..."
              rows="4"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
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
              {election ? "Update Election" : "Create Election"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ElectionCard = ({ election, onEdit, onDelete, onEnd, onDeclareResults, formatDate }) => {
  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-900/30 text-yellow-400 border-yellow-400/30",
      active: "bg-green-900/30 text-green-400 border-green-400/30",
      completed: "bg-blue-900/30 text-blue-400 border-blue-400/30",
    };
    return badges[status] || "bg-gray-900/30 text-gray-400 border-gray-400/30";
  };

  const getStatusIcon = (status) => {
    if (status === "active") return <PlayCircle className="w-4 h-4" />;
    if (status === "completed") return <CheckCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const isActive = election.status === "active";
  const isCompleted = election.status === "completed";
  const isPending = election.status === "pending";

  return (
    <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-6 hover:bg-gray-800/80 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-xl font-bold text-white mb-2">{election.name}</h4>
          <p className="text-gray-400 text-sm mb-3">{election.description}</p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
            election.status
          )}`}
        >
          {getStatusIcon(election.status)}
          <span className="ml-1 capitalize">{election.status}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-400">
          <Calendar className="w-4 h-4 mr-2" />
          <div>
            <p className="text-xs text-gray-500">Start</p>
            <p className="text-white">{formatDate(election.startDate)}</p>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <Calendar className="w-4 h-4 mr-2" />
          <div>
            <p className="text-xs text-gray-500">End</p>
            <p className="text-white">{formatDate(election.endDate)}</p>
          </div>
        </div>
      </div>

      {election.totalVotes !== undefined && (
        <div className="flex items-center text-sm text-gray-400 mb-4">
          <Users className="w-4 h-4 mr-2 text-amber-400" />
          <span className="text-white font-semibold">{election.totalVotes || 0}</span>
          <span className="ml-1">total votes cast</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!isCompleted && (
          <button
            onClick={() => onEdit(election)}
            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </button>
        )}

        {isActive && (
          <button
            onClick={() => onEnd(election._id)}
            className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-400/30 text-orange-400 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <StopCircle className="w-3 h-3 mr-1" />
            End Election
          </button>
        )}

        {isCompleted && !election.resultsAnnounced && (
          <button
            onClick={() => onDeclareResults(election._id)}
            className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 text-green-400 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <Trophy className="w-3 h-3 mr-1" />
            Declare Results
          </button>
        )}

        {isPending && (
          <button
            onClick={() => onDelete(election._id)}
            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-400/30 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </button>
        )}
      </div>

      {election.resultsAnnounced && (
        <div className="mt-4 pt-4 border-t border-gray-700/60">
          <div className="flex items-center text-green-400 text-sm">
            <Trophy className="w-4 h-4 mr-2" />
            <span className="font-medium">Results Declared</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ElectionManagement() {
  const dispatch = useDispatch();
  const [elections, setElections] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchElections = async () => {
    try {
      dispatch(showLoading());
      const response = await GetAllElections();
      dispatch(hideLoading());
      if (response.success) {
        // Transform backend field names to match frontend expectations
        const transformedData = (response.data || []).map(election => ({
          ...election,
          name: election.title,
          startDate: election.startTime,
          endDate: election.endTime
        }));
        setElections(transformedData);
      } else {
        alert(response.message || "Failed to fetch elections");
      }
    } catch (error) {
      dispatch(hideLoading());
      alert("Error fetching elections");
    }
  };

  const handleCreateElection = async (electionData) => {
    try {
      dispatch(showLoading());
      // Transform frontend field names to match backend expectations
      const payload = {
        title: electionData.name,
        description: electionData.description,
        startTime: electionData.startDate,
        endTime: electionData.endDate
      };
      const response = await CreateElection(payload);
      dispatch(hideLoading());
      if (response.success) {
        alert("Election created successfully!");
        setShowCreateModal(false);
        fetchElections();
      } else {
        alert(response.message || "Failed to create election");
      }
    } catch (error) {
      dispatch(hideLoading());
      alert("Error creating election");
    }
  };

  const handleUpdateElection = async (electionData) => {
    if (!editingElection) return;
    try {
      dispatch(showLoading());
      // Transform frontend field names to match backend expectations
      const payload = {
        title: electionData.name,
        description: electionData.description,
        startTime: electionData.startDate,
        endTime: electionData.endDate
      };
      const response = await UpdateElection(editingElection._id, payload);
      dispatch(hideLoading());
      if (response.success) {
        alert("Election updated successfully!");
        setEditingElection(null);
        setShowCreateModal(false);
        fetchElections();
      } else {
        alert(response.message || "Failed to update election");
      }
    } catch (error) {
      dispatch(hideLoading());
      alert("Error updating election");
    }
  };

  const handleDeleteElection = async (electionId) => {
    if (!confirm("Are you sure you want to delete this election?")) return;

    try {
      dispatch(showLoading());
      const response = await DeleteElection(electionId);
      dispatch(hideLoading());
      if (response.success) {
        alert("Election deleted successfully!");
        fetchElections();
      } else {
        alert(response.message || "Failed to delete election");
      }
    } catch (error) {
      dispatch(hideLoading());
      alert("Error deleting election");
    }
  };

  const handleEndElection = async (electionId) => {
    if (!confirm("Are you sure you want to end this election?")) return;

    try {
      dispatch(showLoading());
      const response = await EndElection(electionId);
      dispatch(hideLoading());
      if (response.success) {
        alert("Election ended successfully!");
        fetchElections();
      } else {
        alert(response.message || "Failed to end election");
      }
    } catch (error) {
      dispatch(hideLoading());
      alert("Error ending election");
    }
  };

  const handleDeclareResults = async (electionId) => {
    if (!confirm("Are you sure you want to declare the results for this election?")) return;

    try {
      dispatch(showLoading());
      const response = await DeclareElectionResults(electionId);
      dispatch(hideLoading());
      if (response.success) {
        alert("Results declared successfully!");
        fetchElections();
      } else {
        alert(response.message || "Failed to declare results");
      }
    } catch (error) {
      dispatch(hideLoading());
      alert("Error declaring results");
    }
  };

  const handleEdit = (election) => {
    setEditingElection(election);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingElection(null);
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const filteredElections = elections.filter((election) => {
    if (filterStatus === "all") return true;
    return election.status === filterStatus;
  });

  const stats = {
    total: elections.length,
    pending: elections.filter((e) => e.status === "pending").length,
    active: elections.filter((e) => e.status === "active").length,
    completed: elections.filter((e) => e.status === "completed").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-100 flex items-center">
          <Calendar className="w-8 h-8 mr-3 text-amber-400" />
          ELECTION MANAGEMENT
        </h2>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Election
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Elections</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </div>
            <PlayCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["all", "pending", "active", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filterStatus === status
                ? "bg-amber-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== "all" && (
              <span className="ml-2 text-xs">
                ({stats[status]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Elections Grid */}
      {filteredElections.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredElections.map((election) => (
            <ElectionCard
              key={election._id}
              election={election}
              onEdit={handleEdit}
              onDelete={handleDeleteElection}
              onEnd={handleEndElection}
              onDeclareResults={handleDeclareResults}
              formatDate={formatDate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-xl">
          <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">
            No {filterStatus !== "all" ? filterStatus : ""} elections found
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {filterStatus === "all"
              ? "Create your first election to get started"
              : `No elections with status "${filterStatus}"`}
          </p>
        </div>
      )}

      {/* Create/Edit Election Modal */}
      <CreateElectionModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={editingElection ? handleUpdateElection : handleCreateElection}
        election={editingElection}
      />
    </div>
  );
}
