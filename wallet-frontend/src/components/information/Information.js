import React, {useState, useEffect} from 'react';
import css from './Information.css';
import InformationCards from './InformationCards';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown'


const { abi } = require("../../abis/MultiSigWallet.json");
const { IS_VALID } = require( '../../utils/errorHandlers.js');
const { ethers } = require("ethers");
const metaMaskProvider = new ethers.providers.Web3Provider(
  window.ethereum,
  "rinkeby"
);
const signer = metaMaskProvider.getSigner();

// Receiver contract
const receiverAddress = "0xf8b7C0728E590800919511C58B1c7574644092ac";
const receiverAbi = [
            "function updateTracking(address _owner, address _newSafe) external",
            "function returnTracking(address _owner) external view returns (address[] memory)"
        ];
const receiverContract = new ethers.Contract(receiverAddress, receiverAbi, signer);

const Information = () => {
    
    const [balance, setBalance] = useState("");
    const [quorum, setQuorum] = useState("");
    const [nOwners, setNOwners] = useState("");
    const [addr, setAddr] = useState([]);
    const [button, setButton] = useState("Choose your Safe");
    const [safes, setSafes] = useState("");
    const [contractAddr, setContractAddr] = useState("");

    const triggerButton = (_safe) => {
      setContractAddr(_safe);
      setButton(_safe);
    }

    useEffect(async () => {
      if (IS_VALID(contractAddr)) {
        const contract = new ethers.Contract(contractAddr, abi, metaMaskProvider);
        const _balance = await metaMaskProvider.getBalance(contractAddr);
        const _quorum = await contract.quorum();
        const _nOwners = await contract.totalOwners();
        const _addr = await contract.getOwnersAddress();
        setBalance(ethers.utils.formatEther(_balance.toString()) + " " + "ETH");
        setQuorum(_quorum.toString());
        setNOwners(_nOwners.toString());
        setAddr(_addr);
      }
      const signerAddress = await signer.getAddress();
      const totalSafes = await receiverContract.returnTracking(signerAddress);
      setSafes(totalSafes);    
  
    });

    return (
        <div className="cards">
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
          <div className="title">
          </div>
          <InformationCards
            title1="Contract's Balance"
            text1={balance}
            title2="Contract's Quorum"
            text2={quorum}
            title3="Number of owners"
            text3={nOwners}
            title4="Addresses of owners"
            text4={addr}
          />
        </div>
      );
    }
    
export default Information;







