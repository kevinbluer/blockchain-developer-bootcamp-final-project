const { expect } = require("chai");

const provider = waffle.provider;

describe ("MultiSigWallet.sol", () => {
    let alice;
    let bob;
    let alan;
    let pau;
    let attacker;
    let MultiSigWallet;

    beforeEach(async () => {
        // 4 possible signers (attackers and owners)
        [alice, bob, alan, pau, attacker] = await ethers.getSigners();
        MultiSigWallet = await ethers.getContractFactory("MultiSigWalletMock");
    });

    describe ("correct deployment", () => {
        it ("should deploy with 1 owner and quorum=1", async () => {
            const owners = [alice.address];
            const quorum = 1;
            const contract = await MultiSigWallet.deploy(owners, quorum);
            const _totalOwners = await contract.totalOwners();
            const _quorum = await contract.quorum();
            expect(_totalOwners).to.equal("1");
            expect(_quorum).to.equal("1");
        });
        it ("should deploy with 2 owners and quorum=2", async () => {
            const owners = [alice.address, bob.address];
            const quorum = 2;
            const contract = await MultiSigWallet.deploy(owners, quorum);
            const _totalOwners = await contract.totalOwners();
            const _quorum = await contract.quorum();
            expect(_totalOwners).to.equal("2");
            expect(_quorum).to.equal("2");
        });
        it ("should deploy with 3 owners and quorum=2", async () => {
            ;const owners = [alice.address, bob.address, alan.address];
            const quorum = 2;
            const contract = await MultiSigWallet.deploy(owners, quorum);
            const _totalOwners = await contract.totalOwners();
            const _quorum = await contract.quorum();
            expect(_totalOwners).to.equal("3");
            expect(_quorum).to.equal("2");
        });
        it ("contract should accept ether and update accordingly", async () => {
            const owners = [alice.address, bob.address, alan.address];
            const quorum = 2;
            const contract = await MultiSigWallet.deploy(owners, quorum)
            let contractBalance = await provider.getBalance(contract.address);
            await expect(contractBalance.toString()).to.equal("0");
            await alice.sendTransaction({
                to:contract.address,
                value:ethers.utils.parseEther("100")
            });
            contractBalance = await provider.getBalance(contract.address);
            await expect(contractBalance.toString()).to.equal(
                ethers.utils.parseEther("100")
            );
        });
    });

    describe ("incorrect deployment", () => {
        it ("should fail if we provide 0 owners", async () => {
            const owners = [];
            const quorum = 1;
            await expect(
                MultiSigWallet.deploy(owners, quorum)
            ).to.be.revertedWith("There needs to be more than 0 owners");
        });
        it ("should fail if we provide 1 owner and quorum=2", async () => {
            const owners = [alice.address];
            const quorum = 2;
            await expect(
                MultiSigWallet.deploy(owners, quorum)
            ).to.be.revertedWith("Quorum exceeds owners");
        });
        it ("should fail if we provide quorum=0", async () => {
            const owners = [alice.address];
            const quorum = 0;
            await expect(
                MultiSigWallet.deploy(owners, quorum)
            ).to.be.revertedWith("Quorum needs to be more than 0");
        });
        it ("should fail if we repeat an owner", async () => {
            const owners = [alice.address, alice.address];
            const quorum = 1;
            await expect(
                MultiSigWallet.deploy(owners, quorum)
            ).to.be.revertedWith("Address already an owner");
        });
    });

    describe ("Only owners can call the functions", () => {
        it ("should revert", async () => {
            const owners = [alice.address, bob.address];
            const quorum = 2;
            const contract = await MultiSigWallet.deploy(owners, quorum);
            const pauContract = await contract.connect(pau);
            await expect(
                pauContract.transactionRequest(
                    bob.address, 1000
                )
            ).to.be.revertedWith("You are not an owner");
        });
        it ("should revert", async () => {
            const owners = [alice.address, bob.address];
            const quorum = 2;
            const contract = await MultiSigWallet.deploy(owners, quorum);
            await expect(
                contract.updateQuorumRequest(3)
            ).to.be.revertedWith("Quorum exceeds total owners");
            const pauContract = await contract.connect(pau);
            await expect(
                pauContract.updateQuorumRequest(
                    2
                )
            ).to.be.revertedWith("You are not an owner");
        });
        it ("should revert", async () => {
            const owners = [alice.address, bob.address];
            const quorum = 2;
            const contract = await MultiSigWallet.deploy(owners, quorum);
            const pauContract = await contract.connect(pau);
            await expect(
                pauContract.removeOwnerRequest(
                    bob.address
                )
            ).to.be.revertedWith("You are not an owner");
        });
        it ("should revert", async () => {
            const owners = [alice.address, bob.address];
            const quorum = 2;
            const contract = await MultiSigWallet.deploy(owners, quorum);
            const pauContract = await contract.connect(pau);
            await expect(
                pauContract.addOwnerRequest(
                    bob.address
                )
            ).to.be.revertedWith("You are not an owner");
        });
    });

    describe ("Transaction request and approval journey", () => {
        let owners;
        let quorum;
        let contract;
        let bobContract;

        beforeEach (async () => {
            owners = [alice.address, bob.address];
            quorum = 2;
            contract = await MultiSigWallet.deploy(owners, quorum);
            bobContract = await contract.connect(bob);

        });

        it ("should fail due to insufficient funds", async () => {
           await expect(
               contract.transactionRequest(
                   alan.address, 
                   10000
               )
           ).to.be.revertedWith("Not enough funds");
        });
        it ("should send eth to the contract and submit a transaction", async () => {
            const amount = ethers.utils.parseEther("100");
            let contractBalance = await provider.getBalance(contract.address);
            let alanInitialBalance = await provider.getBalance(alan.address);
            await expect(alanInitialBalance.toString()).to.equal(
                ethers.utils.parseEther("10000")
            );
            //bob and alice send 100 eth each
            await expect(contractBalance.toString()).to.equal("0");
            await alice.sendTransaction({to:contract.address, value:amount});
            await bob.sendTransaction({to:contract.address, value:amount});
            contractBalance = await provider.getBalance(contract.address);
            //contract now has 200 ether
            await expect(contractBalance.toString()).to.equal(
                ethers.utils.parseEther("200")
            );
            //bob and alice are the unique owners and the contract has a quorum of 2
            //they both now submit a transaction to pau
            const amountToSend = ethers.utils.parseEther("150");
            await contract.transactionRequest(alan.address, amountToSend);
            //first transaction is 0 index --> change this
            //we now have 2 confirmations
            await contract.transactionApproval(0);
            await contract.connect(bob).transactionApproval(0);
            contractBalance = await provider.getBalance(contract.address);
            await expect(contractBalance.toString()).to.equal(
                //200 (initial 2 transfers) - 150 (transfer to pau)
                ethers.utils.parseEther("50")
            );
            //pau balance should have 10,000 eth + 150 
            //rounding err.
            alanBalance = await provider.getBalance(alan.address);
            await expect(alanBalance.toString()).to.equal(
                ethers.utils.parseEther("10150")
            );

        });
        it ("should fail due to not an owner attempt", async () => {
            //funding the contract
            await alice.sendTransaction({
                to:contract.address,
                value:ethers.utils.parseEther("1")
            });
            const _quorum = await contract.quorum();
            await expect(_quorum.toString()).to.equal("2");
            //alice requesting for a transaction
            await contract.transactionRequest(pau.address, 100000000);
            await contract.transactionApproval(0);
            await expect(
                contract.transactionApproval(0)
            ).to.be.revertedWith("You already signed this transaction");
        });
        it ("alan should not be able to approve a transaction", async () => {
            await alice.sendTransaction({
                to:contract.address,
                value:ethers.utils.parseEther("1")
            });
            await contract.transactionRequest(
                pau.address, ethers.utils.parseEther("0.1")
            );
            await contract.transactionApproval(0);
            const alanContract = await contract.connect(alan);
            await expect(
                alanContract.transactionApproval(0)
            ).to.be.revertedWith("You are not an owner");
        });
        it ("should not transfer funds if quorum not reached", async () =>{
            let contractBalance = await provider.getBalance(contract.address);
            const transferAmount = ethers.utils.parseEther("1000");
            await expect(contractBalance.toString()).to.equal("0");
            //quorum = 2
            let _quorum = await contract.quorum();
            await expect(_quorum.toString()).to.equal("2");
            //Send funds to the contract alice sends 1000 ether
            await alice.sendTransaction({
                to:contract.address,
                value:transferAmount
            });
            //confirm the received ether
            contractBalance = await provider.getBalance(contract.address);
            await expect(contractBalance.toString()).to.equal(transferAmount);
            //alice submits a transaction request to send 500 eth to alan
            await contract.transactionRequest(
                alan.address,
                ethers.utils.parseEther("500")
            );
            //alice confirms the transaction
            await contract.transactionApproval(0);
            //the contract should still have 1000 ether
            contractBalance = await provider.getBalance(contract.address);
            await expect(contractBalance.toString()).to.equal(transferAmount);
            //bob signs the secon order to transfer
            await bobContract.transactionApproval(0);
            //contract balance should update
            contractBalance = await provider.getBalance(contract.address);
            await expect(contractBalance.toString()).to.equal(ethers.utils.parseEther("500"));

        });
    });


    describe("Update quorum request and approval journey", () => {
        let owners;
        let bobContract;
        let pauContract;
        let aliceContract;
        let attackerContract;
        let quorum;

        beforeEach(async () => {
            owners = [alice.address, bob.address, pau.address];
            quorum = 3;
            contract = await MultiSigWallet.deploy(owners, quorum);
            bobContract = await contract.connect(bob);
            pauContract = await contract.connect(pau);
            aliceContract = await contract.connect(alice);
            attackerContract = await contract.connect(attacker);
        });

        it ("should not let the attacker submit a request", async () => {
            await expect
            (
                attackerContract.updateQuorumRequest(2)
            ).to.be.revertedWith("You are not an owner");
        });
        it ("should update quorum to 2", async () => {
            let _quorum = await contract.quorum();
            //quorum is currently 3
            await expect(_quorum.toString()).to.equal("3");
            //bob submits the request to update quorum to 2
            await bobContract.updateQuorumRequest(2);
            //3 owners approve
            await bobContract.updateQuorumApproval(0);
            await aliceContract.updateQuorumApproval(0);
            await pauContract.updateQuorumApproval(0);
            //quorum should be 2
            _quorum = await contract.quorum();
            await expect(_quorum.toString()).to.equal("2");
        });
        it ("should not let an owner repeat an approval", async () => {
            let _quorum = await contract.quorum();
            //quorum is currently 3
            await expect(_quorum.toString()).to.equal("3");
            //pau submits the request to update quorum to 2
            await pauContract.updateQuorumRequest(2);
            //2 owners approve
            await pauContract.updateQuorumApproval(0);
            await aliceContract.updateQuorumApproval(0);
            //pau repeats the approval
            await expect
            (
                pauContract.updateQuorumApproval(0)
            ).to.be.revertedWith("You already signed this transaction");
            _quorum = await contract.quorum();
            //quorum remains the same
            await expect(_quorum.toString()).to.equal("3");
        });
        it ("should not be possible to update quorum more than the n of owners", async () => {
            let _quorum = await contract.quorum();
            //quorum is currently 3
            await expect(_quorum.toString()).to.equal("3");
            let _totalOwners = await contract.totalOwners();
            //there are 3 owners
            await expect(_totalOwners).to.equal("3");
            //pau tries to submit a request to update quorum to 4
            await expect(
                pauContract.updateQuorumRequest(4)
            ).to.be.revertedWith("Quorum exceeds total owners");
        });
        it ("should not let the attacker approve the request", async () => {
            await pauContract.updateQuorumRequest(2);
            await expect(
                attackerContract.updateQuorumApproval(0)
            ).to.be.revertedWith("You are not an owner");
            let alanContract = await contract.connect(alan);
            await expect(
                alanContract.updateQuorumApproval(0)
            ).to.be.revertedWith("You are not an owner");
        });
        it ("should revert, quorum cannot be 0", async () => {
            await expect
            (
                pauContract.updateQuorumRequest(0)
            ).to.be.revertedWith("You need at least quorum of 1");
        });
    });

    describe ("Remove an owner request and approval journey", () => {
        let owners;
        let bobContract;
        let pauContract;
        let aliceContract;
        let attackerContract;
        let quorum;

        beforeEach (async () => {
            owners = [alice.address, bob.address, pau.address];
            quorum = 2;
            contract = await MultiSigWallet.deploy(owners, quorum);
            bobContract = await contract.connect(bob);
            pauContract = await contract.connect(pau);
            aliceContract = await contract.connect(alice);
            attackerContract = await contract.connect(attacker);
        });
        it ("should fail due to 0 owners", async () => {
            let _owners = [alice.address];
            let _contract = await MultiSigWallet.deploy(_owners, 1);
            await expect(
                _contract.removeOwnerRequest(alice.address)
            ).to.be.revertedWith("There needs to be at least 1 owner");
        });
        it ("should fail by providing a non-owner address", async () => {
            await expect(
                contract.removeOwnerRequest(alan.address)
            ).to.be.revertedWith("Address to remove is not an owner");
        });
        it ("should fail by a non-owner calling the request", async () => {
            let alanContract = await contract.connect(alan);
            await expect(
                alanContract.removeOwnerRequest(pau.address)
            ).to.be.revertedWith("You are not an owner");
        });
        it ("should remove an owner", async () => {
            let isBob = false;
            //currently there are 3 owners
            let addresses = await contract.getOwnersAddress();
            expect(addresses.length).to.equal(3);
            for (let i=0; i<addresses.length; i++) {
                if (addresses[i] == bob.address) {
                    isBob = true;
                }
            }
            //we confirm that bob is an owner
            expect(isBob).to.equal(true);
            //requesting the approval to remove bob
            await aliceContract.removeOwnerRequest(bob.address);
            //approving the transaction: we need 2 approvals
            await pauContract.removeOwnerApproval(0);
            await aliceContract.removeOwnerApproval(0);
            //we confirm that there are only 2 owners
            addresses = await contract.getOwnersAddress();
            expect(addresses.length).to.equal(2);
            isBob = false;
            for (let i=0; i<addresses.length; i++) {
                if (addresses[i] == bob.address) {
                    isBob = true;
                }
            }
            //we confirm bob is not an owner anymore
            expect(isBob).to.equal(false);
        });
        it ("should fail by an owner trying to approve 2 times", async () => {
            await aliceContract.removeOwnerRequest(bob.address);
            await pauContract.removeOwnerApproval(0);
            await expect(
                pauContract.removeOwnerApproval(0)
            ).to.be.revertedWith("You already signed this transaction");
        });
        it ("should fail: there needs to be more owners than quorm", async () => {
            let _quorum = await contract.quorum();
            await expect(_quorum.toString()).to.equal("2");
            let _totalOwners = await contract.totalOwners();
            await expect(_totalOwners).to.equal("3");
            //removing 1 owner
            await aliceContract.removeOwnerRequest(bob.address);
            //approving the transaction: we need 2 approvals
            await pauContract.removeOwnerApproval(0);
            await aliceContract.removeOwnerApproval(0);
            _totalOwners = await contract.totalOwners();
            //we have 2 owners
            await expect(_totalOwners).to.equal("2");
            //trying to remove the second owner
            await expect(
                aliceContract.removeOwnerRequest(pau.address)
            ).to.be.revertedWith("There needs to be more owners than quorum");
        });
    });

    describe("Add an owner request and approval journey", () => {
        let owners;
        let bobContract;
        let pauContract;
        let aliceContract;
        let attackerContract;
        let quorum;

        beforeEach (async () => {
            owners = [alice.address, bob.address];
            quorum = 2;
            contract = await MultiSigWallet.deploy(owners, quorum);
            bobContract = await contract.connect(bob);
            pauContract = await contract.connect(pau);
            aliceContract = await contract.connect(alice);
            attackerContract = await contract.connect(attacker);
        });
        it ("should not work: only owners", async () => {
            await expect(attackerContract.addOwnerRequest(pau.address)
            ).to.be.revertedWith("You are not an owner");
        });
        it ("should not work: cannot add an existing owner", async () => {
            let confirmation;
            let _owners = await contract.getOwnersAddress();
            for (let i=0; i<_owners.length; i++) {
                if (owners[i] == bob.address) {
                    confirmation = true;
                }
            }
            //We confirm that bob is an owner
            expect(confirmation).to.equal(true);
            await expect(bobContract.addOwnerRequest(bob.address)
            ).to.be.revertedWith("Address is already an owner");
            await expect(bobContract.addOwnerRequest(alice.address)
            ).to.be.revertedWith("Address is already an owner");
        });
        it ("cannot add this address as an owner", async () => {
            let _contract = contract.address;
            await expect(bobContract.addOwnerRequest(_contract)
            ).to.be.revertedWith("This address cannot be owner");
        });
        it ("cannot add an invalid address", async () => {
            await expect(bobContract.addOwnerRequest("0x0909ab")
            ).to.be.reverted;
        });
        it ("should fail: only owners can submit requests", async () => {
            await expect(pauContract.addOwnerRequest(attacker.address)
            ).to.be.revertedWith("You are not an owner");
        });
        it ("should add an owner", async () => {
            //we confirm quorum is 2
            let _quorum = await contract.quorum();
            expect(_quorum).to.equal("2");
            //we confirm there are 2 owners
            let _totalOwners = await contract.totalOwners();
            expect(_totalOwners).to.equal(2);
            //we confirm pau is not an owner
            let _owners = await contract.getOwnersAddress();
            let confirmation = false;
            for (let i=0; i<_owners.length; i++) {
                if (_owners[i] == pau.address) {
                    confirmation = true;
                }
            }
            expect(confirmation).to.equal(false);
            //we submit the request to add an owner
            await aliceContract.addOwnerRequest(pau.address);
            //2 ownerapprovals
            await aliceContract.addOwnerApproval(0);
            await bobContract.addOwnerApproval(0);
            //pau should be added as an owner
            _totalOwners = await contract.totalOwners();
            expect(_totalOwners).to.equal(3);
            _owners = await contract.getOwnersAddress();
            for (let i=0; i<_owners.length; i++) {
                if (_owners[i] == pau.address) {
                    confirmation = true;
                }
            }
            expect(confirmation).to.equal(true);
        });
        it ("should fail: owner cannot sign transactions 2 times", async () => {
            await aliceContract.addOwnerRequest(pau.address);
            await bobContract.addOwnerApproval(0);
            await expect(bobContract.addOwnerApproval(0)
            ).to.be.revertedWith("You already signed this transaction");
        });
    });
    
    describe("Uitls functions", () => {
        let owners;
        let bobContract;
        let pauContract;
        let aliceContract;
        let attackerContract;
        let quorum;

        beforeEach (async () => {
            owners = [alice.address, bob.address];
            quorum = 1;
            contract = await MultiSigWallet.deploy(owners, quorum);
            bobContract = await contract.connect(bob);
            pauContract = await contract.connect(pau);
            aliceContract = await contract.connect(alice);
            attackerContract = await contract.connect(attacker);
            //we fund the contract
            await alice.sendTransaction(
                {
                    to:contract.address,
                    value:ethers.utils.parseEther("1000")
                }
            );
        });
        it ("should request a transaction and return it", async () => {
            await aliceContract.transactionRequest(
                pau.address,
                ethers.utils.parseEther("100")
            );
            await aliceContract.transactionRequest(
                alice.address,
                ethers.utils.parseEther("100")
            );
            await aliceContract.transactionRequest(
                bob.address,
                ethers.utils.parseEther("100")
            );
            let result = await contract.pendingTransactionsData();
            //logs correctly
            // console.log(result)
        });
        it ("should show totalOwners correctly", async () => {
            //currently we have 2
            let _totalOwners = await contract.totalOwners();
            await expect(_totalOwners).to.equal(2);
            //we eliminate one owner
            await aliceContract.removeOwnerRequest(bob.address);
            await aliceContract.removeOwnerApproval(0);
            _totalOwners = await contract.totalOwners();
            await expect(_totalOwners).to.equal(1);
            //we add 2 owners
            await aliceContract.addOwnerRequest(bob.address);
            await aliceContract.addOwnerRequest(pau.address);
            await aliceContract.addOwnerApproval(0);
            await aliceContract.addOwnerApproval(1);
            _totalOwners = await contract.totalOwners();
            await expect(_totalOwners).to.equal(3);

        });
        it ("should show the getOwnerAddress() correctly", async () => {
            //currently alice and bob are owners
            let addresses = await contract.getOwnersAddress();
            for (let i=0; i<addresses.length; i++) {
                if (i == 0) {
                    await expect(alice.address).to.equal(addresses[i]);
                }
                if (i == 1) {
                    await expect(bob.address).to.equal(addresses[i]);
                }
            }
        });
        it ("should update addresses accordingly", async () => {
            let addresses = await contract.getOwnersAddress();
            let isAlice = false;
            let isBob = false;
            //we confirm that both of the addresses are there
            for (let i=0; i<addresses.length; i++) {
                if (addresses[i] == alice.address) {
                    isAlice = true;
                }
                if (addresses[i] == bob.address) {
                    isBob = true;
                }
            }
            expect(isAlice).to.equal(true);
            expect(isBob).to.equal(true);
            //we remove bob
            await aliceContract.removeOwnerRequest(bob.address);
            await aliceContract.removeOwnerApproval(0);
            addresses = await contract.getOwnersAddress();
            isAlice = false;
            isBob = false;
            for (let i=0; i<addresses.length; i++) {
                if (addresses[i] == alice.address) {
                    isAlice = true;
                }
                if (addresses[i] == bob.address) {
                    isBob = true;
                }
            }
            expect(isAlice).to.equal(true);
            expect(isBob).to.equal(false);
        });
        it ("should return updateQuorum transactions correctly", async () => {
            await aliceContract.updateQuorumRequest(2);
            let result = await contract.pendingUpdateQuorumData();
            //logs correctly
            //console.log(result);
            //if we approve it should not show anymore and update quorum
            await contract.updateQuorumApproval(0);
            result = await contract.pendingUpdateQuorumData();
            //logs correcty
            //console.log(result);
        });
        it ("should return pendingRemoveOwnerData correctly", async () => {
            await aliceContract.removeOwnerRequest(bob.address);
            let result = await aliceContract.pendingRemoveOwnerData();
            //logs correctly
            // console.log(result);
        });
        it ("should return pendingAddOwnerData correctly", async () => {
            await aliceContract.addOwnerRequest(pau.address);
            // console.log("pau address -->",  pau.address);
            let result = await aliceContract.pendingAddOwnerData();
            //logs correctly
            // console.log(result);
        });
    });
});

