import React, { useState, useEffect } from 'react';
// import { fecthDataBE } from '../../utils/logger';
import { check, encode, decode, formatDateTime, fecthDataRequest } from '../../utils/helpers';
import Tablinator from '../../components/interactions/tablinator';
import Recordnator from '../../components/interactions/recordnator';

//constants
const nftEP = process.env.GATSBY_nftEP;
const dhive = require("@hiveio/dhive");
const client = new dhive.Client([ "https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network","https://hived.privex.io/"]);
const privateKey = dhive.PrivateKey.fromString(process.env.GATSBY_secretJAB);
const ssc_test_id = "ssc-testNettheghost1980";

// END TODO

const Generaltesting = () => {
    
    const userdata = check();

    const [query, setQuery] = useState({
        account: '', symbol: '',
    });
    const [nfts, setNfts] = useState(null);
    const [selected, setSelected] = useState(null);
    
    //functions/CB
    function updateQuery(name,value){
        setQuery(prevState => { return { ...prevState, [name]: value }});
    }
    /////data fecthing
    async function fetchRequest(typeRequest,url = '', headers,formdata) {
        const response = await fetch(url, {
            method: typeRequest,
            headers: headers,
            body: formdata,
        });
        return response.json(); 
    };
    /////END data fecthing
    const sendRequest = () => {
        const headers = { 'x-access-token': userdata.token, 'toprocess': JSON.stringify({ from: 'theghost1980', to: 'sexosentido', nft_id: 192,  symbol: 'GHO', amount: 3, order_id: 'hhhggh11223sjj'})};
        fetchRequest("POST",nftEP+"castNfts",headers,{})
        .then(response => {
            console.log(response);
        }).catch(error => {
            console.log('Error on request nft to BE.',error);
        })
    }
    const sendRequest2 = () => {
        const headers = { 'x-access-token': userdata.token };
        const formdata = new FormData();
        formdata.append('nft_name',"GRR the token");
        formdata.append('nft_symbol',"GRR");

        fetchRequest("POST",nftEP+"createNFT",headers,formdata)
        .then(response => {
            console.log(response);
        }).catch(error => {
            console.log('Error on post request nft to BE.',error);
        })
    }
    const searchAll = () => {
        const headers = { 
            'x-access-token': userdata.token,
            'query': JSON.stringify({
                issuer: 'theghost1980',
            }),
        }
        fetchRequest('GET',nftEP+"findNFT",headers)
        .then(response => {
            console.log(response);
            setNfts(response);
        }).catch(err => console.log('Error getting data on BE.',err));
    }
    const transferONft = () => {
        const json = [{
                "contractName": "nft",
                "contractAction": "transferOwnership",
                "contractPayload": {
                    "symbol": selected.symbol,
                    "to": "theghost1980"
                }
        }];
        const data = {
            id: ssc_test_id,
            json: JSON.stringify(json),
            required_auths: ['jobaboard'],
            required_posting_auths: [],
        };
        client.broadcast.json(data, privateKey)
        .then(result => {
            console.log(result);
        }).catch(error => {
            console.log('Error while transfering ownership.',error);
        });
    }
    //END functions/CB

    return (
        <div>
            <button onClick={sendRequest}>test instantiate</button>
            <div className="marginLeft">
                {/* <label htmlFor="name">Issuer</label>
                <input type="text" name="account" onChange={(e) => updateQuery(e.target.name,e.target.value)}/>
                <label htmlFor="symbol">Symbol</label>
                <input type="text" name="symbol" onChange={(e) => updateQuery(e.target.name,e.target.value)}/> */}
                <button onClick={searchAll}>Search all by JAB</button>
            </div>
            {
                nfts &&
                <Tablinator xclassCSS={"justHeight300pOverY"} clickedSubItemCB={(item) => setSelected(item)}
                    items={nfts} toShow={['symbol','_id','maxSupply']}
                />
            }
            {
                selected &&
                <div>
                <Recordnator item={selected} xclassCSS={"textXSmallGray"} closeCB={() => setSelected(null)}
                    toShow={[
                        { field: '_id', type: 'String', link: false },
                        { field: 'name', type: 'String', link: false },
                        { field: 'symbol', type: 'String', link: false },
                        { field: 'orgName', type: 'String', link: false },
                    ]}
                />
                <button onClick={transferONft}>Transfer To theghost1980</button>
                </div>
            }
            <button onClick={sendRequest2}>test creation</button>
        </div>
    )
};

export default Generaltesting;
