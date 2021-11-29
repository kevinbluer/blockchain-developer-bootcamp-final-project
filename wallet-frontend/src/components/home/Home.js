import React, {useState} from 'react';
import css from './Home.css';
import HomeCards from './HomeCards.js';
import Requests from '../requests/Requests.js';
import {Link} from "react-router-dom";
import Button from 'react-bootstrap/Button';

const { ethers } = require("ethers");

const metaMaskProvider = new ethers.providers.Web3Provider(
    window.ethereum,
    "rinkeby"
  );

const Home = () => {
    const [button, setButton] = useState("Connect Wallet");
    const [connected, setConnected] = useState();

    const connectWallet = async () => {
        await window.ethereum.enable();
        await metaMaskProvider.send("eth_requestAccounts");
        const signer = metaMaskProvider.getSigner();
        const userAddr = await signer.getAddress();
        setButton(userAddr);
        setConnected(<HomeCards/>)
        alert("You are connected");
    }

    return (
        <div>
            <div className="button">
                <Button variant="primary" onClick={connectWallet}>{button}</Button>
            </div>
            <div className="text-home">
                <h2>Please, be sure to be connected in RINKEBY</h2>
            </div>
            <div className="Home">
              {connected}
            </div>
        </div>
    );
}


export default Home;









