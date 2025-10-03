import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ArrowRightLeft,
  User,
  LogOut,
  BanknoteArrowDown,
  Menu,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  ChevronDown,
  Trophy,
  Shield,
  Calendar,
  CheckCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { GetAllElections, GetElectionResults } from "../apicalls/results";
import { showLoading, hideLoading } from "../redux/loaderSlice";
import { toast } from "react-toastify";

const MobileCandidateCard = ({
  candidate,
  totalVotes,
  isWinner,
  getPercentage,
  rank,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`bg-gray-800/60 backdrop-blur-xl border ${
        isWinner ? "border-amber-500/60" : "border-gray-700/60"
      } rounded-xl p-4 mb-4 ${isWinner ? "ring-2 ring-amber-500/30" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 ${
              isWinner ? "bg-amber-600/30" : "bg-blue-600/20"
            } rounded-full flex items-center justify-center`}
          >
            {isWinner ? (
              <Trophy className="w-5 h-5 text-amber-400" />
            ) : (
              <User className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-white text-sm">
                {candidate.name}
              </p>
              {isWinner && (
                <span className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">
                  WINNER
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Rank #{rank} • {candidate.party}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`font-bold text-lg ${
              isWinner ? "text-amber-400" : "text-blue-400"
            }`}
          >
            {candidate.voteCount?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-400">
            {getPercentage(candidate.voteCount || 0, totalVotes)}%
          </p>
        </div>
      </div>

      <div className="mb-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              isWinner ? "bg-amber-500" : "bg-blue-500"
            }`}
            style={{
              width: `${getPercentage(candidate.voteCount || 0, totalVotes)}%`,
            }}
          ></div>
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-gray-400 hover:text-white transition-colors"
      >
        <span className="text-xs">Position: {candidate.position}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && candidate.biography && (
        <div className="mt-3 pt-3 border-t border-gray-700/60">
          <p className="text-xs text-gray-400">{candidate.biography}</p>
        </div>
      )}
    </div>
  );
};

export default function ResultsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.users);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    location.pathname.split("/")[1] || "results"
  );
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState(null);
  const [activeTabContent, setActiveTabContent] = useState("live");

  const userMenu = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
      path: "/dashboard",
    },
    {
      id: "polling",
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
        navigate("/logout");
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
      id: "admin",
      icon: Users,
      label: "Admin",
      onClick: () => navigate("/admin"),
      path: "/admin",
    },
    {
      id: "polling",
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
        navigate("/logout");
      },
      path: "/logout",
    },
  ];

  const menuToRender = user?.role === "admin" ? adminMenu : userMenu;

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchResults(selectedElection._id);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      dispatch(showLoading());
      const response = await GetAllElections();
      dispatch(hideLoading());

      if (response.success) {
        setElections(response.data);

        // Auto-select first ongoing/active election, or first election if none ongoing
        if (response.data.length > 0 && !selectedElection) {
          const activeElection = response.data.find(e =>
            e.status === "ongoing" || e.status === "active"
          );
          setSelectedElection(activeElection || response.data[0]);
        }
      } else {
        toast.error(response.message || "Failed to fetch elections");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error fetching elections:", error);
      toast.error("Failed to fetch elections");
    }
  };

  const fetchResults = async (electionId) => {
    try {
      dispatch(showLoading());
      const response = await GetElectionResults(electionId);
      dispatch(hideLoading());

      if (response.success) {
        setResults(response.data);
      } else {
        toast.error(response.message || "Failed to fetch results");
        setResults(null);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error fetching results:", error);
      toast.error("Failed to fetch results");
      setResults(null);
    }
  };

  const getPercentage = (votes, total) => {
    if (!total || total === 0) return 0;
    return ((votes / total) * 100).toFixed(2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedCandidates = results?.results || results?.candidates
    ? [...(results.results || results.candidates)].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
    : [];

  const winner = sortedCandidates[0];
  const totalVotes = sortedCandidates.reduce(
    (sum, c) => sum + (c.voteCount || 0),
    0
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#1e0b06] to-black text-white flex overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900/50 backdrop-blur-md border-b border-gray-700/60 z-30">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-300 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-100">Electoral</h1>
          <div className="w-10" />
        </div>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        menuItems={menuToRender}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 pt-20 lg:pt-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">
                  Election Results
                </h1>
                <p className="text-gray-400 mt-1">
                  View live election results and statistics
                </p>
              </div>
            </div>

            {/* Election Selection */}
            {elections.length > 0 && (
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-100 mb-4">
                  Select Election
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {elections.map((election) => (
                    <button
                      key={election._id}
                      onClick={() => setSelectedElection(election)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedElection?._id === election._id
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white">
                          {election.title || election.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            election.status === "active" || election.status === "ongoing"
                              ? "bg-green-600/20 text-green-400"
                              : election.status === "completed"
                              ? "bg-blue-600/20 text-blue-400"
                              : "bg-gray-600/20 text-gray-400"
                          }`}
                        >
                          {election.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {election.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(election.startTime || election.startDate)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Display */}
            {!selectedElection ? (
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  Please select an election to view results
                </p>
              </div>
            ) : !results ? (
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-12 text-center">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-400 text-lg">Loading results...</p>
              </div>
            ) : sortedCandidates.length === 0 ? (
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-12 text-center">
                <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No results available for this election yet
                </p>
              </div>
            ) : (
              <>
                {/* Election Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Votes</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {totalVotes.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Candidates</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {sortedCandidates.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Leading Candidate</p>
                        <p className="text-xl font-bold text-white mt-1 truncate">
                          {winner?.name || "N/A"}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-600/20 rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-amber-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Winner Card - Desktop */}
                {winner && (
                  <div className="hidden md:block bg-gradient-to-r from-amber-600/20 to-orange-600/20 backdrop-blur-xl border border-amber-500/60 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-amber-600/30 rounded-full flex items-center justify-center">
                          <Trophy className="w-8 h-8 text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-bold text-white">
                              {winner.name}
                            </h3>
                            <span className="px-3 py-1 bg-amber-600 text-white text-sm font-bold rounded-full">
                              LEADING
                            </span>
                          </div>
                          <p className="text-amber-400">{winner.party}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-amber-400">
                          {winner.voteCount?.toLocaleString() || 0}
                        </p>
                        <p className="text-gray-400">
                          {getPercentage(winner.voteCount || 0, totalVotes)}% of votes
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidates List - Desktop */}
                <div className="hidden md:block bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-900/50">
                        <tr>
                          <th className="text-left p-4 text-gray-400 font-semibold">
                            Rank
                          </th>
                          <th className="text-left p-4 text-gray-400 font-semibold">
                            Candidate
                          </th>
                          <th className="text-left p-4 text-gray-400 font-semibold">
                            Party
                          </th>
                          <th className="text-left p-4 text-gray-400 font-semibold">
                            Votes
                          </th>
                          <th className="text-left p-4 text-gray-400 font-semibold">
                            Percentage
                          </th>
                          <th className="text-left p-4 text-gray-400 font-semibold">
                            Progress
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedCandidates.map((candidate, index) => {
                          const isWinner = index === 0;
                          return (
                            <tr
                              key={candidate._id || candidate.candidateId || index}
                              className={`border-t border-gray-700/60 ${
                                isWinner ? "bg-amber-600/10" : "hover:bg-gray-800/50"
                              }`}
                            >
                              <td className="p-4">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                    isWinner
                                      ? "bg-amber-600 text-white"
                                      : "bg-gray-700 text-gray-300"
                                  }`}
                                >
                                  {index + 1}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center font-bold">
                                    {candidate.name?.[0]?.toUpperCase() || "?"}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-white">
                                      {candidate.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {candidate.position}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-gray-300">{candidate.party}</td>
                              <td className="p-4">
                                <p
                                  className={`font-bold ${
                                    isWinner ? "text-amber-400" : "text-blue-400"
                                  }`}
                                >
                                  {candidate.voteCount?.toLocaleString() || 0}
                                </p>
                              </td>
                              <td className="p-4 text-gray-300">
                                {getPercentage(candidate.voteCount || 0, totalVotes)}%
                              </td>
                              <td className="p-4">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      isWinner ? "bg-amber-500" : "bg-blue-500"
                                    }`}
                                    style={{
                                      width: `${getPercentage(
                                        candidate.voteCount || 0,
                                        totalVotes
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Candidates List - Mobile */}
                <div className="md:hidden space-y-4">
                  {sortedCandidates.map((candidate, index) => (
                    <MobileCandidateCard
                      key={candidate._id}
                      candidate={candidate}
                      totalVotes={totalVotes}
                      isWinner={index === 0}
                      getPercentage={getPercentage}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
