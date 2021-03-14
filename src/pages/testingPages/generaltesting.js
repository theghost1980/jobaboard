import React from 'react';
import { fecthDataBE } from '../../utils/logger';
import { check } from '../../utils/helpers';

import axios from 'axios';

// constants
const adminEP = process.env.GATSBY_adminEP;

const Generaltesting = () => {

    const userdata = check();

    async function getSSCData(url = '') {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token
            },
        });
        return response.json(); 
    };

    const testSSCBE = () => {
        getSSCData("https://backendjab.herokuapp.com/ssc/ssctest/allNFTs")
        .then(response => console.log(response))
        .catch(error => console.log('Error on request',error));
    }

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
            <ul>
                <li>
                    {/* <button onClick={sendLog}>Send Log test</button> */}
                </li>
                <li>
                    <button onClick={testSSCBE}>Send SSC test</button>
                </li>
            </ul>
            
        </div>
    )
}

export default Generaltesting;
