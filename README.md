# Final Project: Multi-Signature wallet
## Project Description: 
#### Multi-Signature smart contract wallet for ethereum accounts. The wallet lets you send and receive ether, set a minimum quorum (signatures of owners) to execute transactions and shows you the most basic information. For security purposes, every time you create a "safe", the creator(s) will deploy the smart contract, so each individual deployer will interact with its own safe. The code for all the safes are the same, you can find the "proxy" contract with the name "MultiSigWallet.sol"
## Folder Structure:
####  Project's frontend can be found inside of the "wallet-frontend" folder.

#### The smart contracts and test cases can be found inside of the "wallet" folder.

## Basic Flow:
#### You enter to the main home and get prompt two options: 1. Create a Safe 2. Already have a safe. If you choose the first option, you will create your own multi-sig walllet with some important arguments like, how many owners ?, minimum require signatures to confirm a transaction etc.. If you already have a safe, you choose the second option (you can create multiple safes), inside of the second option, you will find basic multi-sig features like, submit a transaction, change owners, update the quorum etc... In order to approve the transactions, you first need to submit the transaction and then it needs to be approved given the number of signatures is equal to or greater than the quorum. n > m.

## Front-end URL: 

#### https://multi-signature.netlify.app/

## Screen Cast:
#### https://drive.google.com/file/d/1m2C0umE-ndHHYx_WcoiDLcILF2DmfZb8/view?usp=sharing
## USE:

#### To interact with the application, just go to:  https://multi-signature.netlify.app/
#### For the test cases go to the "wallet" folder and follow the instructions on the Readme file.


### ENS ADDRESS FOR NFT CERTIFICATE: polipic.eth
