const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RoyaltiesPayment_test", function () {
  it("", async function () {
    const RoyaltiesPayment = await ethers.getContractFactory(
      "RoyaltiesPayment"
    );
    const deploy_royalty = await RoyaltiesPayment.deploy();
    const deployed_royalty = await deploy_royalty.deployed();

    console.log("RoyaltyPayment contract address:", deployed_royalty.address);
    console.log(
      "We will use this as Token contract's royalty contract address!"
    );

    const token_cont = await ethers.getContractFactory("Token");
    const deploy_token = await token_cont.deploy(deployed_royalty.address);
    const deployed_token = await deploy_token.deployed();
    console.log("Token contract address:", deployed_token.address);
    console.log(
      "We will use this contract address as Marketplace's tokenContractAddress.\n"
    );

    console.log(
      "Checking Token's royaltiewReceiver == RoyaltiesPayment's address...\n"
    );

    expect(await deploy_token.royaltiesReceiver()).to.equal(
      deployed_royalty.address
    );

    console.log("Checked\n");

    const market_cont = await ethers.getContractFactory("Marketplace");
    const deploy_market = await market_cont.deploy(deployed_token.address);
    const deployed_market = await deploy_market.deployed();
    console.log("Marketplace contract address:", deployed_market.address);

    // console.log("Mint tokenID = 1, hash = 1234");
    // var tokenid = await deploy_token.mint(, 1234);
    // console.log("Token Id = ", tokenid);

    const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    console.log('Mint NFT, hash = "1234" address = ', addr1.address);
    const deploy_token_mint = await deploy_token.mint(addr1.address, "1234");
    const deploy_token_mint_await = await deploy_token_mint.wait();
    const tokenID = Number(deploy_token_mint_await.events[0].topics[3]);
    console.log("Token ID = ", tokenID);

    //Approve token
    console.log("This token will approved for sale on Marketplace\n");
    const deploy_token_approve = await deploy_token
      .connect(addr1)
      .approve(deployed_market.address, tokenID);
    const deploy_token_approve_await = await deploy_token_approve.wait();
    console.log("Approved");

    //add addresses to table
    console.log("Setting Royalty rightholders now...");
    const deploy_royalty_setTable1 = await deploy_royalty.setRoyaltyTable(
      addr2.address,
      40
    );
    const deploy_royalty_setTable1_await =
      await deploy_royalty_setTable1.wait();
    console.log("Addr2's percentage = 40%");
    const deploy_royalty_setTable2 = await deploy_royalty.setRoyaltyTable(
      addr3.address,
      40
    );
    const deploy_royalty_setTable2_await =
      await deploy_royalty_setTable2.wait();
    console.log("Addr3's percentage = 40%");

    const deploy_royalty_setTable3 = await deploy_royalty.setRoyaltyTable(
      addr4.address,
      20
    );
    const deploy_royalty_setTable3_await =
      await deploy_royalty_setTable3.wait();
    console.log("Addr4's percentage = 20%");

    const deploy_royalty_getTotalPercent =
      await deploy_royalty.getTotalPercent();
    console.log("Total percent = ", deploy_royalty_getTotalPercent);

    //Make buy offer
    console.log("Making buy offer...\n");
    const options = { value: ethers.utils.parseEther("1.0") };
    const deploy_market_makeBuyOffer = await deploy_market.makeBuyOffer(
      tokenID,
      options
    );
    const deploy_market_makeBuyOffer_await =
      await deploy_market_makeBuyOffer.wait();
    const balance = await ethers.provider.getBalance(owner.address);
    console.log("Buy offer created with 1 Ether. Owner wallet = ", balance);
    console.log("Done\n");

    //Accpet Buy offer
    console.log("Accepting Buy offer...");
    const deploy_market_acceptBuyOffer = await deploy_market
      .connect(addr1)
      .acceptBuyOffer(tokenID);
    const deploy_market_acceptBuyOffer_await =
      await deploy_market_acceptBuyOffer.wait();
    console.log("Accpeted\n");

    //Pay all
    console.log("Pay royalties to right holders..");
    const deploy_royalty_payAll = await deploy_royalty.payAll();
    const deploy_royalty_payAll_await = await deploy_royalty_payAll.wait();
    console.log("Payed!\n");

    console.log(
      "Owner wallet:",
      await ethers.provider.getBalance(owner.address)
    );
    console.log(
      "Address1's wallet",
      await ethers.provider.getBalance(addr1.address)
    );
    console.log(
      "Address2's wallet",
      await ethers.provider.getBalance(addr2.address)
    );
    console.log(
      "Address3's wallet",
      await ethers.provider.getBalance(addr3.address)
    );
    console.log(
      "Address4's wallet",
      await ethers.provider.getBalance(addr4.address)
    );
  });
});
