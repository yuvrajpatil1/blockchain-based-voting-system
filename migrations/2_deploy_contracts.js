const Voting = artifacts.require("Voting");
const fs = require("fs");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Voting);
  const votingInstance = await Voting.deployed();

  console.log("Voting contract deployed at:", votingInstance.address);
  console.log("Owner account:", accounts[0]);

  // Save deployment info for backend
  const deploymentInfo = {
    contractAddress: votingInstance.address,
    contractABI: Voting.abi,
    network,
    deployedAt: new Date().toISOString(),
    ownerAccount: accounts[0],
  };

  const buildDir = path.join(__dirname, "../build");
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(buildDir, "deployment-info.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to build/deployment-info.json");
};
