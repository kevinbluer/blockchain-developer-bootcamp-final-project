import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import MainHome from './components/main-home/MainHome.js';
import Home from './components/home/Home.js';
import Requests from './components/requests/Requests.js';
import Information from './components/information/Information.js';
import CreateWallet from './components/create-wallet/CreateWallet.js';
import Approvals from './components/approvals/Approvals.js';


const App = () => {
	return (
		<div>
		<BrowserRouter>
      <Routes>
      <Route path="/" element={<MainHome/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/home/requests" element={<Requests/>}/>
        <Route path="/home/information" element={<Information/>}/>
        <Route path="/create-wallet" element={<CreateWallet/>}/>
        <Route path="/home/approvals" element={<Approvals/>}/>
      </Routes>
  </BrowserRouter>
		</div>
		);
}
export default App;



