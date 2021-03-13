import React from 'react';
import { fecthDataBE } from '../../utils/logger';
import { check } from '../../utils/helpers';

import axios from 'axios';

// constants
const adminEP = process.env.GATSBY_adminEP;

const Generaltesting = () => {

    const userdata = check();

    const sendLog = () => {
        const timestamp = new Date().getTime();
        const nft = JSON.stringify({
            symbol: "TITS",
            name: "D My NFT created in JAB",
            orgName: "JAB jobs and gigs on a Hive blockchain",
            productName: "JAB NFT on the run",
            url: "https://www.jab.com",
            maxSupply: "1000"
        });
        const data = 
        {
            txID: `${timestamp}|theghost1980|0`, 
            op: `createNFT|${nft}|10`,
            totalSteps: "8",
            result: "",
            error: "false",
            descError: "", 
        }
        fecthDataBE(data,adminEP+"/addOP",userdata.token);
       
    }
    return (
        <div>
            <button onClick={sendLog}>Send Log test</button>
        </div>
    )
}

export default Generaltesting;
