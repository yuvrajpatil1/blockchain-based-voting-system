// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    address public owner;
    uint256 public electionCount;

    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
        bool isActive;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedFor;
        uint256 registrationTime;
    }

    struct Election {
        uint256 id;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 totalVotes;
        bool isActive;
        mapping(uint256 => Candidate) candidates;
        uint256[] candidateIds;
        mapping(address => Voter) voters;
        address[] voterAddresses;
    }

    mapping(uint256 => Election) public elections;

    event ElectionCreated(uint256 indexed electionId, string name, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name, string party);
    event VoterRegistered(uint256 indexed electionId, address indexed voter);
    event VoteCast(uint256 indexed electionId, address indexed voter, uint256 indexed candidateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier electionExists(uint256 _electionId) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        _;
    }

    modifier votingActive(uint256 _electionId) {
        Election storage election = elections[_electionId];
        require(block.timestamp >= election.startTime, "Voting has not started");
        require(block.timestamp <= election.endTime, "Voting has ended");
        require(election.isActive, "Election is not active");
        _;
    }

    constructor() {
        owner = msg.sender;
        electionCount = 0;
    }

    // --- Create and manage elections ---
    function createElection(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) public onlyOwner returns (uint256) {
        require(_startTime < _endTime, "Start time must be before end time");

        electionCount++;
        Election storage newElection = elections[electionCount];
        newElection.id = electionCount;
        newElection.name = _name;
        newElection.description = _description;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.totalVotes = 0;
        newElection.isActive = true;

        emit ElectionCreated(electionCount, _name, _startTime, _endTime);
        return electionCount;
    }

    function addCandidate(
        uint256 _electionId,
        uint256 _candidateId,
        string memory _name,
        string memory _party
    ) public onlyOwner electionExists(_electionId) {
        Election storage election = elections[_electionId];
        require(!election.candidates[_candidateId].isActive, "Candidate already exists");

        election.candidates[_candidateId] = Candidate({
            id: _candidateId,
            name: _name,
            party: _party,
            voteCount: 0,
            isActive: true
        });

        election.candidateIds.push(_candidateId);

        emit CandidateAdded(_electionId, _candidateId, _name, _party);
    }

    // --- Register voters ---
    function registerVoter(uint256 _electionId, address _voterAddress) 
        public onlyOwner electionExists(_electionId) 
    {
        Election storage election = elections[_electionId];
        require(!election.voters[_voterAddress].isRegistered, "Voter already registered");

        election.voters[_voterAddress] = Voter({
            isRegistered: true,
            hasVoted: false,
            votedFor: 0,
            registrationTime: block.timestamp
        });

        election.voterAddresses.push(_voterAddress);

        emit VoterRegistered(_electionId, _voterAddress);
    }

    // --- Voting logic ---
    function vote(uint256 _electionId, uint256 _candidateId) 
        public electionExists(_electionId) votingActive(_electionId) 
    {
        Election storage election = elections[_electionId];
        Voter storage voter = election.voters[msg.sender];

        require(voter.isRegistered, "Voter not registered");
        require(!voter.hasVoted, "Already voted");
        require(election.candidates[_candidateId].isActive, "Invalid candidate");

        voter.hasVoted = true;
        voter.votedFor = _candidateId;

        election.candidates[_candidateId].voteCount++;
        election.totalVotes++;

        emit VoteCast(_electionId, msg.sender, _candidateId);
    }

    // --- View results ---
    function getResults(uint256 _electionId) 
        public view electionExists(_electionId) 
        returns (uint256[] memory, uint256[] memory) 
    {
        Election storage election = elections[_electionId];
        uint256 candidateCount = election.candidateIds.length;

        uint256[] memory candidateIds = new uint256[](candidateCount);
        uint256[] memory voteCounts = new uint256[](candidateCount);

        for (uint256 i = 0; i < candidateCount; i++) {
            uint256 candidateId = election.candidateIds[i];
            candidateIds[i] = candidateId;
            voteCounts[i] = election.candidates[candidateId].voteCount;
        }

        return (candidateIds, voteCounts);
    }

    function getWinner(uint256 _electionId)
        public view electionExists(_electionId)
        returns (uint256, string memory, string memory, uint256)
    {
        Election storage election = elections[_electionId];
        require(election.candidateIds.length > 0, "No candidates in election");
        
        uint256 maxVotes = 0;
        uint256 winningCandidateId = election.candidateIds[0];

        for (uint256 i = 0; i < election.candidateIds.length; i++) {
            uint256 candidateId = election.candidateIds[i];
            if (election.candidates[candidateId].voteCount > maxVotes) {
                maxVotes = election.candidates[candidateId].voteCount;
                winningCandidateId = candidateId;
            }
        }

        Candidate storage winner = election.candidates[winningCandidateId];
        return (winner.id, winner.name, winner.party, winner.voteCount);
    }

    // --- Get individual candidate ---
    function getCandidate(uint256 _electionId, uint256 _candidateId)
        public view electionExists(_electionId)
        returns (uint256, string memory, string memory, uint256, bool)
    {
        Election storage election = elections[_electionId];
        Candidate storage candidate = election.candidates[_candidateId];
        
        return (
            candidate.id,
            candidate.name,
            candidate.party,
            candidate.voteCount,
            candidate.isActive
        );
    }

    // --- Get individual voter ---
    function getVoter(uint256 _electionId, address _voterAddress)
        public view electionExists(_electionId)
        returns (bool, bool, uint256, uint256)
    {
        Election storage election = elections[_electionId];
        Voter storage voter = election.voters[_voterAddress];
        
        return (
            voter.isRegistered,
            voter.hasVoted,
            voter.votedFor,
            voter.registrationTime
        );
    }

    // --- Check if voting is active ---
    function isVotingActive(uint256 _electionId) 
        public view electionExists(_electionId) 
        returns (bool) 
    {
        Election storage election = elections[_electionId];
        return (
            election.isActive &&
            block.timestamp >= election.startTime &&
            block.timestamp <= election.endTime
        );
    }

    // --- End election ---
    function endElection(uint256 _electionId) public onlyOwner electionExists(_electionId) {
        elections[_electionId].isActive = false;
    }
}