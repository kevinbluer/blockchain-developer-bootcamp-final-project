import React, {useState, useEffect} from 'react';
import Cards from './RequestsCards.js';
import css from './Requests.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

const { ethers } = require("ethers");

const { IS_VALID } = require( '../../utils/errorHandlers.js');
const { RECEIVER_ADDRESS } = require( '../../constants/addresses.js');
const { abi } = require("../../abis/MultiSigWallet.json");
const { receiverAbi } = require("../../abis/Receiver.json");
const metaMaskProvider = new ethers.providers.Web3Provider(
  window.ethereum,
  "rinkeby"
);
const signer = metaMaskProvider.getSigner();
const receiverContract = new ethers.Contract(RECEIVER_ADDRESS, receiverAbi, signer);

const Requests = () => {
  const [contractAddr, setContractAddr] = useState("");
  const [balance, setBalance] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [newQuorum, setNewQuorum] = useState("");
  const [removeOwner, setRemoveOwner] = useState("");
  const [addOwner, setAddOwner] = useState("");
  const [safes, setSafes] = useState("");
  const [button, setButton] = useState("Choose your Safe");


  const _transactionRequest = async () => {
    const contract = new ethers.Contract(contractAddr, abi, metaMaskProvider);
    const signerContract = contract.connect(signer);
    if (isNaN(amount) === true) {
      alert("You need to type numbers");
      return;
    }
    if (amount > balance) {
      alert("Insufficient funds");
      return;
    }
    if (!ethers.utils.isAddress(receiver)) {
      alert("Invalid address!");
      return;
    }
    try {
      await signerContract.transactionRequest(
        receiver,
        ethers.utils.parseEther(amount)
      );
    }catch(err) {
        alert(err);
    }
  }
  
  const _updateQuorumRequest = async () => {
    const contract = new ethers.Contract(contractAddr, abi, metaMaskProvider);
    const signerContract = contract.connect(signer);
    const _quorum = await signerContract.quorum();
    const _owners = await signerContract.totalOwners();
    if (newQuorum == undefined || newQuorum == null) {
      alert("Invalid!");
    }
    if (newQuorum > _owners) {
      alert("Quorum cannot exceed the number of owners");
      return;
    }
    if (newQuorum == _quorum.toString()) {
      alert("invalid request: current quorum is the same");
      return;
    }
    if (isNaN(newQuorum) === true) {
      alert("You need to type numbers");
      return;
    }
    if (newQuorum == 0) {
      alert("quorum cannot be 0!");
      return;
    }
    try {
      await signerContract.updateQuorumRequest(newQuorum)
    }catch(err) {
      alert(err);

    }
  }

  const _removeOwnerRequest = async () => {
    const contract = new ethers.Contract(contractAddr, abi, metaMaskProvider);
    const signerContract = contract.connect(signer);
    let bool = false;
    const owners = await signerContract.getOwnersAddress();
    if (!ethers.utils.isAddress(removeOwner)) {
      alert("Invalid address!");
      return;
    }
    for (let i=0; i<owners.length; i++) {
      if (removeOwner == owners[i]) {
        bool = true;
      }
    }
    if (bool == false) {
      alert("This address is not an owner!");
      return;
    }
    try {
      await signerContract.removeOwnerRequest(removeOwner);
    }catch(err) {
        alert(err);
    }
  }

  const _addOwnerRequest = async () => {
    const contract = new ethers.Contract(contractAddr, abi, metaMaskProvider);
    const signerContract = contract.connect(signer);
    let bool = false;
    const owners = await signerContract.getOwnersAddress();
    if (!ethers.utils.isAddress(addOwner)) {
      alert("Invalid address!");
      return;
    }
    for (let i=0; i<owners.length; i++) {
      if (addOwner == owners[i]) {
        bool = true;
      }
    }
    if (bool) {
      alert("This address is already an owner!");
      return;
    }
    try {
      await signerContract.addOwnerRequest(addOwner);
    }catch(err) {
        alert(err);
        return;
    }
  }

  const triggerButton = (_safe) => {
    setButton(_safe);
    setContractAddr(_safe);
  }

  useEffect(async () => {
    if (IS_VALID(contractAddr)) {
      const contract = new ethers.Contract(contractAddr, abi, metaMaskProvider);
      const signerContract = contract.connect(signer);
      let _balance = await metaMaskProvider.getBalance(contract.address);
      setBalance(ethers.utils.formatEther(_balance.toString()));
    }
    const signerAddress = await signer.getAddress();
    const totalSafes = await receiverContract.returnTracking(signerAddress);
    setSafes(totalSafes);    
  });
  
  return (

    <div>
      <div className="drop-down">
      <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {button}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                {Array.from(safes).map((safe, idx) => (
                    <Dropdown.Item onClick={() => triggerButton(safe)}>{safe}</Dropdown.Item>
                ))} 
                </Dropdown.Menu>
        </Dropdown>
      </div>
      <div className="cards">
        <Cards
          title1="REQUEST A TRANSACTION"
          text1="Input the address and the value in ETH"
          placeholder1="address 'receiver'"
          onChange1={(e) => setReceiver(e.target.value)}
          placeholder1a="amount "
          onClick1={() => _transactionRequest()}
          onChange1a={(e) => setAmount(e.target.value)}
          title2="REQUEST TO UPDATE THE QUORUM"
          text2="Input the desired new quorum"
          placeholder2="new quorum"
          onClick2={(e) => _updateQuorumRequest()}
          onChange2={(e) =>setNewQuorum(e.target.value)}
          title3="REQUEST TO REMOVE AN OWNER"
          text3="Input the owner's address to remove"
          placeholder3="address to remove"
          onClick3 ={(e) => _removeOwnerRequest()}
          onChange3={(e) => setRemoveOwner(e.target.value)}
          title4 = "REQUEST TO ADD AN OWNER"
          text4="Input the owner's address to add"
          placeholder4="address to add"
          onChange4={(e) => setAddOwner(e.target.value)}
          onClick4={(e) => _addOwnerRequest()}
        />
    </div>
  </div>
  );
}

export default Requests;



