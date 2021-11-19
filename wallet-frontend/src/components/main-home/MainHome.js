import React, {useState} from 'react';
import css from './MainHome.css';
import MainHomeCards from './MainHomeCards.js';
import {useNavigate} from 'react-router-dom';
const { ethers } = require("ethers");

const MainHome = () => {

    return (
        <div>
            <div className="title">
            </div>
            <div className="MainHome">
              <MainHomeCards
              text="Already have an existing multi-signature wallet (safe)"
              placeholder="Enter the multi-signature wallet's address"
              />
            </div>
        </div>
    );
}


export default MainHome;







