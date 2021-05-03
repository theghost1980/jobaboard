import React, { useState, useEffect } from 'react';
import { check } from '../../utils/helpers';
import Tablinator from '../interactions/tablinator';
import Recordnator from '../interactions/recordnator';
//constants
const adminEP = process.env.GATSBY_adminEP;

const Managenfts = () => {

    const userdata = check();
    const [nfts, setNfts] = useState(null);
    const [selected, setSelected] = useState(null);
    
    //to load on init
    useEffect(() => {
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({}), 'limit': 0, 'sortby': JSON.stringify( { "null": null} )};
        requestData(adminEP+"getNFTquery",'GET',headers,true)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setNfts(response.result);
            }
        }).catch(error => console.log('Error asking NFTs on Admins BE.',error));
    },[]);
    //END to load on init

    //functions/CB
    /////////DATA fecthing////////////
    async function requestData(url = '', resquestType, headers,json = Boolean) { 
        const response = await fetch(url, {
            method: resquestType,
            mode: 'cors',
            headers: headers,
        });
        return json ? response.json() : response; 
    };
    //////////END DATA fecthing////////
    //END functions/CB
    return (
        <div className="standardContentMargin">
            <h2>Hi from Manage NFTs</h2>
            <p>TODO: Maybe this section may include:</p>
            <ul>
                <li>List NFTs, CRUD NFTs</li>
                <li>Log NFTs activities and so on.</li>
            </ul>
            {
                nfts &&
                <Tablinator clickedSubItemCB={(item) => setSelected(item)}
                    items={nfts} toShow={['issued_On','nft_id','account','symbol','issuer']}
                    titleTable={"NFTs created on JAB Platform"}
                />
            }
            {
                selected && 
                <Recordnator imgClassCSS={"imageMedium justMargin0auto"} imageMainField={{ imgField: 'image' }}
                    titleRecord={`NFT ${selected.symbol} owned by: ${selected.account}`} devMode={false}
                    xclassCSS={"justBorders justRounded"} closeCB={() => setSelected(null)}
                    item={selected} 
                    toShow={[
                        { field:'issued_On', type: 'String' },
                        { field:'for_sale', type: 'Boolean' },
                        { field:'in_use', type: 'Boolean' },
                        { field:'burned', type: 'Boolean' },
                        { field:'nft_id', type: 'Number' },
                        { field:'account', type: 'String' },
                        { field:'symbol', type: 'String' },
                        { field:'createdAt', type: 'Date' },
                        { field:'updatedAt', type: 'Date' },
                        { field:'price', type: 'Number' },
                        { field:'maxSupply', type: 'Number' }, 
                        { field:'name', type: 'String' },
                        { field:'orgName', type: 'String' },
                        { field:'productName', type: 'String' },
                            { field:'image', type: 'String', link: true },
                            { field:'thumb', type: 'String', link: true },
                            { field:'url', type: 'String', link: true },
                            { field:'authorizedIssuingAccounts', type: 'Array' },
                    ]}
                />
            }
        </div>
    )
}

export default Managenfts;


// {
//     "image": "https://res.cloudinary.com/dbcugb6j4/image/upload/v1618248580/file_1618248580509_icons8-twitter-circled-128_1_hchlqb.png",
//     "thumb": "https://res.cloudinary.com/dbcugb6j4/image/upload/v1618248581/thumb-1618248580826icons8-twitter-circled-128_1_tyedfq.png",
//     "issued_On": "JAB platform",
//     "for_sale": false,
//     "in_use": false,
//     "burned": false,
//     "_id": "6070f2b2fe95fc00155d2ca5",
//     "authorizedIssuingAccounts": [],
//     "nft_id": 185,
//     "account": "theghost1980",
//     "symbol": "SAS",
//     "createdAt": "2021-04-10T00:34:56.000Z",
//     "price": 55,
//     "issuer": "theghost1980",
//     "maxSupply": "1000",
//     "name": "D My NFT created in JAB",
//     "orgName": "JAB jobs and gigs on a Hive blockchain",
//     "productName": "JAB NFT on the run",
//     "__v": 0,
//     "updatedAt": "2021-04-12T17:30:15.000Z",
//     "url": "https://stoic-hoover-64741e.netlify.app/"
//   }