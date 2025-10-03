import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ArrowRightLeft,
  BarChart3,
  User,
  LogOut,
  Menu,
  Users,
  Search,
  Filter,
  UserCheck,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  Award,
  Calendar,
  MapPin,
  Briefcase,
  BanknoteArrowDown,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { GetAllElections } from "../apicalls/results";
import { GetCandidatesByElection } from "../apicalls/candidates";
import { CastVote } from "../apicalls/results";
import { showLoading, hideLoading } from "../redux/loaderSlice";
import { toast } from "react-toastify";

export default function PollingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.users);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    location.pathname.split("/")[1] || "polling"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParty, setFilterParty] = useState("all");
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 4;

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

  // Fetch elections on component mount
  useEffect(() => {
    fetchElections();
  }, []);

  // Fetch candidates when election is selected
  useEffect(() => {
    if (selectedElection) {
      fetchCandidates(selectedElection._id);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      dispatch(showLoading());
      const response = await GetAllElections();
      dispatch(hideLoading());

      if (response.success) {
        // Filter for active/ongoing elections
        const activeElections = response.data.filter(
          (election) => election.status === "active" || election.status === "ongoing"
        );
        setElections(activeElections);

        // Auto-select first ongoing/active election (prioritize "ongoing")
        if (activeElections.length > 0 && !selectedElection) {
          const ongoingElection = activeElections.find(e => e.status === "ongoing");
          setSelectedElection(ongoingElection || activeElections[0]);
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

  const fetchCandidates = async (electionId) => {
    try {
      dispatch(showLoading());
      const response = await GetCandidatesByElection(electionId);
      dispatch(hideLoading());

      if (response.success) {
        setCandidates(response.data);
      } else {
        toast.error(response.message || "Failed to fetch candidates");
        setCandidates([]);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error fetching candidates:", error);
      toast.error("Failed to fetch candidates");
      setCandidates([]);
    }
  };

  const handleVote = async (candidateId) => {
    if (!selectedElection) {
      toast.error("Please select an election first");
      return;
    }

    if (user?.hasVoted) {
      toast.warning("You have already voted in this election!");
      return;
    }

    if (!window.confirm("Are you sure you want to vote for this candidate? This action cannot be undone.")) {
      return;
    }

    try {
      setVotingInProgress(true);
      dispatch(showLoading());

      const voteData = {
        electionId: selectedElection._id,
        candidateId: candidateId,
        voterId: user._id,
        walletAddress: user.walletAddress,
      };

      const response = await CastVote(voteData);
      dispatch(hideLoading());

      if (response.success) {
        toast.success("Vote cast successfully!", {
          icon: "✅",
        });
        setSelectedCandidate(candidateId);

        // Refresh candidates to get updated vote counts
        fetchCandidates(selectedElection._id);

        // Update user voting status
        window.location.reload(); // Reload to get updated user data
      } else {
        toast.error(response.message || "Failed to cast vote");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error casting vote:", error);
      toast.error(error.message || "Failed to cast vote");
    } finally {
      setVotingInProgress(false);
    }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.party?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesParty =
      filterParty === "all" || candidate.party === filterParty;

    return matchesSearch && matchesParty;
  });

  // Pagination logic
  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(
    indexOfFirstCandidate,
    indexOfLastCandidate
  );
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Get unique parties from candidates
  const parties = ["all", ...new Set(candidates.map((c) => c.party).filter(Boolean))];

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
                  Cast Your Vote
                </h1>
                <p className="text-gray-400 mt-1">
                  Select your preferred candidate below
                </p>
              </div>

              {user?.hasVoted && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">You have voted</span>
                </div>
              )}
            </div>

            {/* Election Selection */}
            {elections.length > 0 && (
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-100 mb-4">
                  Active Elections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <h3 className="font-semibold text-white">{election.title || election.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {election.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(election.startTime || election.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ends {new Date(election.endTime || election.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search and Filter */}
            {selectedElection && candidates.length > 0 && (
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={filterParty}
                      onChange={(e) => setFilterParty(e.target.value)}
                      className="pl-10 pr-8 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
                    >
                      {parties.map((party) => (
                        <option key={party} value={party} className="bg-gray-800">
                          {party === "all" ? "All Parties" : party}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Candidates Grid */}
            {!selectedElection ? (
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-12 text-center">
                <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  Please select an election to view candidates
                </p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-12 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No candidates registered for this election yet
                </p>
              </div>
            ) : currentCandidates.length === 0 ? (
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-12 text-center">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No candidates match your search criteria
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentCandidates.map((candidate) => (
                    <div
                      key={candidate._id}
                      className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/60 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                            {candidate.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-white truncate">
                              {candidate.name}
                            </h3>
                            <p className="text-amber-400 text-sm">{candidate.party}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                                {candidate.position}
                              </span>
                              {candidate.voteCount !== undefined && (
                                <span className="px-2 py-1 bg-amber-600/20 rounded text-xs text-amber-400">
                                  {candidate.voteCount} votes
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {candidate.biography && (
                          <p className="mt-4 text-gray-400 text-sm line-clamp-3">
                            {candidate.biography}
                          </p>
                        )}

                        <button
                          onClick={() => handleVote(candidate.candidateId)}
                          disabled={user?.hasVoted || votingInProgress}
                          className={`w-full mt-4 px-6 py-3 rounded-lg font-medium transition-all ${
                            user?.hasVoted || votingInProgress
                              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                          }`}
                        >
                          {votingInProgress ? (
                            <span className="flex items-center justify-center">
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Casting Vote...
                            </span>
                          ) : user?.hasVoted ? (
                            "Already Voted"
                          ) : (
                            "Vote for this Candidate"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
