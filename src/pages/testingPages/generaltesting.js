import React from 'react';
import { fecthDataBE } from '../../utils/logger';
import { check } from '../../utils/helpers';

import axios from 'axios';

// constants
const nftEP = process.env.GATSBY_nftEP;

const Generaltesting = () => {

    const userdata = check();

    async function getSSCData(url = '',query = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token,
                'query': JSON.stringify(query),
            },
        });
        return response.json(); 
    };

    const testSSCBE = () => {
        getSSCData(nftEP+"allNFTs", { issuer: 'jobaboard' })
        .then(response => console.log(response))
        .catch(error => console.log('Error on request',error));
    }
       
    return (
        <div>
            <ul>
                <li>
                    <button onClick={testSSCBE}>Send SSC test</button>
                </li>
            </ul>
            
        </div>
    )
}

export default Generaltesting;
