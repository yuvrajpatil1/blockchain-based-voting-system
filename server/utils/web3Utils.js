const { Web3 } = require("web3");
const fs = require("fs");
const path = require("path");

class Web3Utils {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.contractAddress = null;
    this.accounts = [];
    this.defaultAccount = null;
  }

  /** Initialize Web3 connection */
  async initialize() {
    try {
      const providerUrl = process.env.BLOCKCHAIN_PROVIDER_URL || "http://localhost:7545";
      this.web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

      await this.web3.eth.net.isListening();
      console.log("✅ Web3 connection established successfully");

      this.accounts = await this.web3.eth.getAccounts();
      this.defaultAccount = this.accounts[0];

      console.log(`✅ Connected to blockchain with ${this.accounts.length} accounts`);
      console.log("Default account:", this.defaultAccount);

      await this.loadContract();

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Web3:", error);
      throw error;
    }
  }

  /** Load smart contract instance */
  async loadContract() {
    try {
      const rootDir = path.resolve(__dirname, "../../");
      const contractDir = path.join(rootDir, "build", "contracts");
      const files = fs.readdirSync(contractDir);
      const votingFile = files.find((f) => f.toLowerCase() === "voting.json");

      if (!votingFile)
        throw new Error(
          `Voting.json not found in ${contractDir}. Run 'truffle migrate' first.`
        );

      const contractJsonPath = path.join(contractDir, votingFile);
      const contractJson = JSON.parse(
        fs.readFileSync(contractJsonPath, "utf8")
      );

      const networkId = await this.web3.eth.net.getId();
      if (!contractJson.networks[networkId])
        throw new Error(
          `Contract not deployed to current network (networkId: ${networkId}).`
        );

      this.contractAddress = contractJson.networks[networkId].address;
      this.contract = new this.web3.eth.Contract(
        contractJson.abi,
        this.contractAddress
      );

      console.log("✅ Contract loaded at:", this.contractAddress);
      return this.contract;
    } catch (err) {
      console.error("❌ Failed to load contract:", err);
      throw err;
    }
  }

  /** Create a new election */
  async createElection(name, description, startTime, endTime, fromAccount = null) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const account = fromAccount || this.defaultAccount;

      const start = Number(startTime);
      const end = Number(endTime);

      const gasEstimate = await this.contract.methods
        .createElection(name, description, start, end)
        .estimateGas({ from: account });

      const result = await this.contract.methods
        .createElection(name, description, start, end)
        .send({
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2),
          gasPrice: process.env.GAS_PRICE || "20000000000",
        });

      console.log("✅ Election created on blockchain:", result.transactionHash);
      return result;
    } catch (error) {
      console.error("❌ Failed to create election on blockchain:", error);
      throw error;
    }
  }

  /** Add candidate */
  async addCandidate(electionId, candidateId, name, party, fromAccount = null) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const account = fromAccount || this.defaultAccount;

      const eId = Number(electionId);
      const cId = Number(candidateId);

      const gasEstimate = await this.contract.methods
        .addCandidate(eId, cId, name, party)
        .estimateGas({ from: account });

      const result = await this.contract.methods
        .addCandidate(eId, cId, name, party)
        .send({
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2),
          gasPrice: process.env.GAS_PRICE || "20000000000",
        });

      console.log("✅ Candidate added:", result.transactionHash);
      return result;
    } catch (error) {
      console.error("❌ Failed to add candidate:", error);
      throw error;
    }
  }

  /** Register voter */
  async registerVoter(electionId, voterAddress, fromAccount = null) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const account = fromAccount || this.defaultAccount;

      // Convert to number for Web3 v4
      const eId = Number(electionId);

      const gasEstimate = await this.contract.methods
        .registerVoter(eId, voterAddress)
        .estimateGas({ from: account });

      const result = await this.contract.methods
        .registerVoter(eId, voterAddress)
        .send({
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2),
          gasPrice: process.env.GAS_PRICE || "20000000000",
        });

      console.log("✅ Voter registered:", result.transactionHash);
      return result;
    } catch (error) {
      console.error("❌ Failed to register voter:", error);
      throw error;
    }
  }

  /** Cast vote */
  async castVote(electionId, candidateId, voterAddress) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");

      const eId = Number(electionId);
      const cId = Number(candidateId);

      const gasEstimate = await this.contract.methods
        .vote(eId, cId)
        .estimateGas({ from: voterAddress });

      const result = await this.contract.methods.vote(eId, cId).send({
        from: voterAddress,
        gas: Math.floor(Number(gasEstimate) * 1.2),
        gasPrice: process.env.GAS_PRICE || "20000000000",
      });

      console.log("✅ Vote cast:", result.transactionHash);
      return result;
    } catch (error) {
      console.error("❌ Failed to cast vote:", error);
      throw error;
    }
  }

  /** Check if voter is eligible */
  async isVoterEligible(electionId, voterAddress) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const eId = Number(electionId);

      const voter = await this.contract.methods.getVoter(eId, voterAddress).call();
      return voter[0]; // isRegistered
    } catch (error) {
      console.error("❌ Failed to check voter eligibility:", error);
      return false;
    }
  }

  /** Check if voter has voted */
  async hasVoted(electionId, voterAddress) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const eId = Number(electionId);

      const voter = await this.contract.methods.getVoter(eId, voterAddress).call();
      return voter[1]; // hasVoted
    } catch (error) {
      console.error("❌ Failed to check if voter has voted:", error);
      return false;
    }
  }

  /** Get voter's choice */
  async getVoterChoice(electionId, voterAddress) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const eId = Number(electionId);

      const voter = await this.contract.methods.getVoter(eId, voterAddress).call();
      return Number(voter[2]); // votedFor
    } catch (error) {
      console.error("❌ Failed to get voter choice:", error);
      throw error;
    }
  }

  /** Get total votes for an election */
  async getTotalVotes(electionId) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const eId = Number(electionId);

      const election = await this.contract.methods.elections(eId).call();
      return Number(election.totalVotes);
    } catch (error) {
      console.error("❌ Failed to get total votes:", error);
      throw error;
    }
  }

  /** Get election results */
  async getElectionResults(electionId) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const eId = Number(electionId);

      const results = await this.contract.methods.getResults(eId).call();

      const candidateIds = results[0].map((id) => Number(id));
      const voteCounts = results[1].map((count) => Number(count));

      return candidateIds.map((candidateId, index) => ({
        candidateId,
        voteCount: voteCounts[index]
      }));
    } catch (error) {
      console.error("❌ Failed to get election results:", error);
      throw error;
    }
  }

  /** Get winner */
  async getWinner(electionId) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const eId = Number(electionId);

      const winner = await this.contract.methods.getWinner(eId).call();

      return {
        winnerId: Number(winner[0]),
        winnerName: winner[1],
        winnerParty: winner[2],
        winnerVotes: Number(winner[3])
      };
    } catch (error) {
      console.error("❌ Failed to get winner:", error);
      throw error;
    }
  }

  /** Get candidate count */
  async getCandidateCount(electionId) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const eId = Number(electionId);

      const results = await this.contract.methods.getResults(eId).call();
      return results[0].length;
    } catch (error) {
      console.error("❌ Failed to get candidate count:", error);
      return 0;
    }
  }

  /** Get candidate info */
  async getCandidate(electionId, candidateId) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");

      const eId = Number(electionId);
      const cId = Number(candidateId);

      const candidate = await this.contract.methods.getCandidate(eId, cId).call();

      return {
        id: Number(candidate[0]),
        name: candidate[1],
        party: candidate[2],
        voteCount: Number(candidate[3]),
        isActive: candidate[4]
      };
    } catch (error) {
      console.error(`❌ Failed to get candidate ${candidateId}:`, error);
      throw error;
    }
  }

  /** Get voter info */
  async getVoter(electionId, voterAddress) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");

      const eId = Number(electionId);

      const voter = await this.contract.methods.getVoter(eId, voterAddress).call();

      return {
        isRegistered: voter[0],
        hasVoted: voter[1],
        votedFor: voter[2] ? Number(voter[2]) : null,
        registrationTime: Number(voter[3])
      };
    } catch (error) {
      console.error(`❌ Failed to get voter ${voterAddress}:`, error);
      throw error;
    }
  }

  /** Check if voting is active */
  async isVotingActive(electionId) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const eId = Number(electionId);
      return await this.contract.methods.isVotingActive(eId).call();
    } catch (error) {
      console.error("❌ Failed to check voting status:", error);
      throw error;
    }
  }

  /** End election */
  async endElection(electionId, fromAccount = null) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const account = fromAccount || this.defaultAccount;
      const eId = Number(electionId);

      const result = await this.contract.methods.endElection(eId).send({
        from: account,
        gas: 100000,
        gasPrice: process.env.GAS_PRICE || "20000000000",
      });

      console.log("✅ Election ended:", result.transactionHash);
      return result;
    } catch (error) {
      console.error("❌ Failed to end election:", error);
      throw error;
    }
  }

  /** Get current block number */
  async getBlockNumber() {
    try {
      return await this.web3.eth.getBlockNumber();
    } catch (error) {
      console.error("❌ Failed to get block number:", error);
      throw error;
    }
  }

  /** Verify transaction */
  async verifyTransaction(txHash) {
    try {
      const receipt = await this.web3.eth.getTransactionReceipt(txHash);
      return {
        success: receipt.status === true || receipt.status === "0x1",
        blockNumber: Number(receipt.blockNumber),
        gasUsed: Number(receipt.gasUsed),
        receipt
      };
    } catch (error) {
      console.error("❌ Failed to verify transaction:", error);
      throw error;
    }
  }

  /** Estimate gas */
  async estimateGas(electionId, candidateId, voterAddress) {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      const eId = Number(electionId);
      const cId = Number(candidateId);

      const gas = await this.contract.methods
        .vote(eId, cId)
        .estimateGas({ from: voterAddress });

      return Number(gas);
    } catch (error) {
      console.error("❌ Failed to estimate gas:", error);
      return null;
    }
  }

  /** Get contract events */
  async getContractEvents(eventName, fromBlock = 0, toBlock = "latest") {
    try {
      if (!this.contract) throw new Error("Contract not loaded");
      return await this.contract.getPastEvents(eventName, {
        fromBlock,
        toBlock,
      });
    } catch (error) {
      console.error("❌ Failed to get contract events:", error);
      throw error;
    }
  }

  /** Check if address is valid */
  isValidAddress(address) {
    return this.web3.utils.isAddress(address);
  }

  /** Wei to Ether conversion */
  weiToEther(wei) {
    return this.web3.utils.fromWei(wei.toString(), "ether");
  }

  /** Ether to Wei conversion */
  etherToWei(ether) {
    return this.web3.utils.toWei(ether.toString(), "ether");
  }

  /** Generate hash */
  generateHash(data) {
    return this.web3.utils.sha3(data);
  }
}

const web3Utils = new Web3Utils();
module.exports = web3Utils;
