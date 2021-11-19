import React, { useState, useEffect } from 'react';
import css from './CreateWallet.css';
import Cards from './CreateWalletCards.js';
import axios from 'axios';

const { ethers } = require("ethers");
const { ContractFactory } = require("ethers");
const { abi } = require("../../abis/MultiSigWallet.json");
const { bytecode } = require("../../abis/MultiSigWallet.json");
const metaMaskProvider = new ethers.providers.Web3Provider(
    window.ethereum,
    "rinkeby"
  );
const signer = metaMaskProvider.getSigner();


const CreateWallet = () => {

    const [owner1, setOwner1] = useState("");
    const [owner2, setOwner2] = useState("");
    const [owner3, setOwner3] = useState("");
    const [quorum, setQuorum] = useState("");
    const [safe, setSafe] = useState("");
    
    const execute = async () => {
        if (!owner1) {
            alert("ERROR: owner1 is mandatory");
            return;
        }
        if (!quorum) {
            alert("ERROR: quorum is mandatory");
            return;
        }
        if (isNaN(quorum) === true) {
            alert("Quorum must be a number");
            return;
        } 
        if (!ethers.utils.isAddress(owner1)) {
            alert("Owner1: incorrect address");
            return;
        }
        let counter = 1;
        let owners;
        let _owner2 = false;
        let _owner3 = false;
        if (owner1 == owner2) {
            alert("ERROR: Owners cannot repeat");
            return;
        }
        if (owner1 === owner3 && owner3 != false) {
            alert("ERROR: Owners cannot repeat");
            return;
        }
        if (owner2 === owner3 && owner2 != false) {
            alert("ERROR: Owners cannot repeat");
            return;
        }
        if (owner2) {
            if (!ethers.utils.isAddress(owner2)) {
                alert("Owner2: incorrect address");
                return;
            } else {
                counter += 1;
                _owner2 = true;
            }
        }
        if (owner3) {
            if (!ethers.utils.isAddress(owner3)) {
                alert("Owner3: incorrect address");
                return;
            } else {
                counter += 1;
                _owner3 = true;
            }
        }
        if (quorum > counter) {
            alert("ERROR: quorum cannot be more than the total owners");
        } else {
            if (_owner2 && !_owner3) {
                owners = [owner1, owner2];
            }
            else if (_owner2 && _owner3) {
                owners = [owner1, owner2, owner3];
            }
            else if (_owner3 &&  !_owner2) {
                owners = [owner1, owner3];
            }
            else if (!_owner2 && !_owner3) {
                owners = [owner1];
            } else {
                alert("ERROR OCCURED");
                return;
            }
            const factory = await new ContractFactory(abi, bytecode,signer );
            const result = await factory.deploy(owners, quorum);
            setSafe(result.address);
            const response = {address:result.address, signer:await signer.getAddress()};
            axios.post("http://localhost:3001/api", response)
                .then(res => console.log(res))
                .catch(err => console.log(err));
                alert("safe created succesfully");
        }  
    }
    
    return (
        <div>
            <Cards
                title1="Create a Multi Signature Wallet"
                text1="Requirements: *Minimum 1 owner and 1 quorum. *Owners need to be more than or equal to the quorum"
                placeholder1="address owner (1) *MANDATORY"
                onChange1 = {(e) => setOwner1(e.target.value)}
                placeholder2="address owner (2) *OPTIONAL"
                onChange2 = {(e) => setOwner2(e.target.value)}
                placeholder3="address owner (3) *OPTIONAL"
                onChange3 = {(e) => setOwner3(e.target.value)}
                placeholder4="quorum *MANDATORY"
                onChange4 = {(e) => setQuorum(e.target.value)}
                onClick={() => execute()}
            />
        </div>
    );
}





export default CreateWallet;







