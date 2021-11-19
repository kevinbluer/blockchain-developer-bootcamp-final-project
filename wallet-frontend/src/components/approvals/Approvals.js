import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import 'bootstrap/dist/css/bootstrap.min.css';
import css from './Approvals.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown'

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


const Approvals = () => {

    const [button, setButton] = useState("Choose your Safe");
    const [safes, setSafes] = useState("");
    const [quorumData, setQuorumData] = useState([]);
    const [transactionData, setTransactionData] = useState([]);
    const [removeOwnerData, setRemoveOwnerData] = useState([]);
    const [addOwnerData, setAddOwnerData] = useState([]);

    const triggerButton = async (_safe) => {
        let newQuorum;
        let index;
        let approvals;
        let isApproved;
        setButton(_safe);
        if (IS_VALID(_safe)) {
            const contract = new ethers.Contract(_safe, abi, signer);
            const _transactionData = await contract.pendingTransactionsData();
            const _quorumData = await contract.pendingUpdateQuorumData();
            const _removeOwnerData = await contract.pendingRemoveOwnerData();
            const _addOwnerData = await contract.pendingAddOwnerData();
            // const addOwnerData = await contract.pendingAddOwnerData();
            setTransactionData(_transactionData);
            setQuorumData(_quorumData);
            setRemoveOwnerData(_removeOwnerData);
            setAddOwnerData(_addOwnerData);
        }
    }

    const approveQuorum = async (_index) => {
        const contract = new ethers.Contract(button, abi, signer);
        await contract.updateQuorumApproval(_index);
    }

    const approveTransaction = async (_index) => {
        const contract = new ethers.Contract(button, abi, signer);
        await contract.transactionApproval(_index);
    }

    const removeOwner = async (_index) => {
        const contract = new ethers.Contract(button, abi, signer);
        await contract.removeOwnerApproval(_index);
    }

    const addOwner = async (_index) => {
        const contract = new ethers.Contract(button, abi, signer);
        await contract.addOwnerApproval(_index);
    }

    useEffect(async () => {
        const signerAddress = await signer.getAddress();
        const totalSafes = await receiverContract.returnTracking(signerAddress);
        setSafes(totalSafes);    
      }, []);

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
                <Row xs={2} md={2} className="g-4">
                    {
                    quorumData.map((card, idx) => (
                        <Col>
                        <Card
                            bg="light"
                            border="info"
                        >   
                            <Card.Body>
                                <Card.Title>Quroum Update</Card.Title>
                                <Card.Text>New Quorum Requested: {card[0].toString()}</Card.Text>
                                <Card.Text>Transaction Index: {card[1].toString()}</Card.Text>
                                <Card.Text>Total Signatures: {card[2].toString()}</Card.Text>
                             </Card.Body>
                             <Button onClick={() => approveQuorum(card[1].toString())}>Approve</Button>
                        </Card>
                        </Col>
                        ))
                    }
                    {
                    transactionData.map((card, idx) => (
                        <Card
                            bg="light"
                            border="danger"
                        >
                            <Card.Body>
                                <Card.Title>Transaction Request</Card.Title>
                                <Card.Text>Addres to: {card[0].toString()}</Card.Text>
                                <Card.Text>Value: {ethers.utils.formatEther(card[1].toString())} ETH</Card.Text>
                                <Card.Text>Transaction Index: {card[2].toString()}</Card.Text>
                                <Card.Text>Total Signatures: {card[3].toString()}</Card.Text>
                             </Card.Body>
                             <Button variant="warning"onClick={() => approveTransaction(card[2].toString())}>Approve</Button>
                        </Card>
                        ))
                    
                    }
                    {
                    removeOwnerData.map((card, idx) => (
                        <Card
                            bg="light"
                            border="danger"
                        >
                            <Card.Body>
                                <Card.Title>Remove Owner</Card.Title>
                                <Card.Text>Addres to remove: {card[0].toString()}</Card.Text>
                                <Card.Text>Transaction Index: {card[1].toString()}</Card.Text>
                                <Card.Text>Total Signatures: {card[2].toString()}</Card.Text>
                             </Card.Body>
                             <Button variant="warning"onClick={() => removeOwner(card[1].toString())}>Approve</Button>
                        </Card>
                        ))
                    }
                    {
                    addOwnerData.map((card, idx) => (
                        <Card
                            bg="light"
                            border="danger"
                        >
                            <Card.Body>
                                <Card.Title>Add Owner</Card.Title>
                                <Card.Text>Addres to add: {card[0].toString()}</Card.Text>
                                <Card.Text>Transaction Index: {card[1].toString()}</Card.Text>
                                <Card.Text>Total Signatures: {card[2].toString()}</Card.Text>
                             </Card.Body>
                             <Button variant="warning"onClick={() => addOwner(card[1].toString())}>Approve</Button>
                        </Card>
                        ))
                    }
                    
                </Row>
                
          </div>
      </div>
    );
}

export default Approvals;

