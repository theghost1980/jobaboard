import React, { useState, useEffect } from 'react';
import { check } from '../../utils/helpers';
import Tablinator from '../interactions/tablinator';
import Recordnator from '../interactions/recordnator';
import Menuhover from '../interactions/menuhover';
//constants
const adminEP = process.env.GATSBY_adminEP;
const nftEP = process.env.GATSBY_nftEP;
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const itemsMenu = [
    {title: 'CRUD Options NFT JAB', cbProp: 'manageNftsMongo', subMenu: [ 'List All NFTs JAB', 'List All NFTs Logs', ],},
]
const fieldsNftDef = [
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
];
const devMode = true;
//end constants

const Managenfts = () => {

    const userdata = check();
    const [nfts, setNfts] = useState(null);
    const [optionMenu, setOptionMenu] = useState({
        option: '', subOption: '',
    });
    const [selected, setSelected] = useState(null);
    const [instancesSelected, setInstancesSelected] = useState(null);
    
    //to load on init
    useEffect(() => {
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({}), 'limit': 0, 'sortby': JSON.stringify( { "null": null} )};
        requestData(adminEP+"getNFTquery",'GET',headers,null)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setNfts(response.result);
            }
        }).catch(error => console.log('Error asking NFTs on Admins BE.',error));
    },[]);
    //END to load on init

    //to load on state changes
    useEffect(() => {
        if(selected){ //SYMBOLinstances
            // const query = { table: 'nft', contract: `${selected.symbol}instances`, query: {}, limit: 0, offset: 0, indexes: []}; //as { table: '', contract: '', query: {}, limit: 0, offset: 0, indexes: [] };
            // const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify(query), };
            // requestData(nftEP+"queryContractTable","GET",headers,null)
            // .then(response => {
            //     console.log(response);
            //     setInstancesSelected(response.result);
            // }).catch(error => console.log('Error request NFT on BE.', error));
            const query = { ntf_symbol: selected.symbol };
            const headers = {  'x-access-token': userdata.token, 'query': JSON.stringify(query), 'limit': 0, 'sortby': JSON.stringify( { nft_instance_id: 1 } ), };
            requestData(nfthandlermongoEP+"getNFTInstancesQuery","GET",headers,null)
            .then(response => {
                if(devMode) {console.log(response)};
                setInstancesSelected(response.result);
            })
            .catch(error => { console.log('Error getting data BE.',error) });
        }
    },[selected]);
    //END to load on state changes

    //functions/CB
    function updateState(name,value){
        setOptionMenu(prevState => { return {...prevState, [name]: value }});
    }
    /////////DATA fecthing////////////
    async function requestData(url = '', resquestType, headers,formdata) { 
        const response = formdata   ? fetch(url, { method: resquestType, mode: 'cors', headers: headers, body: formdata,})
                                    : fetch(url, { method: resquestType, mode: 'cors', headers: headers,})
        return (await response).json(); 
    };
    //////////END DATA fecthing////////
    //END functions/CB
    return (
        <div className="standardContentMargin">
            <Menuhover 
                clickedSubItemCB={(item) => updateState("option", item)}
                items={itemsMenu}
            />
            <h2>Hi from Manage NFTs</h2>
            <ul className="justxxsmalltext">
                <li>TODO: Maybe this section may include:</li>
                <li>List NFTs, CRUD NFTs & instances</li>
                <li>Log NFTs activities and so on.</li>
            </ul>
            {
                nfts && optionMenu.option === "List All NFTs JAB" &&
                <Tablinator clickedSubItemCB={(item) => setSelected(item)}
                    items={nfts} toShow={['issued_On','nft_id','account','symbol','issuer']}
                    titleTable={"NFTs on JAB Platform"}
                    xclassCSS={"justBordersRoundedMarginB justHeight300pOverY"}
                    devMode={false}
                    pagination={{ perPage: 10, controls: false }}
                />
            }
            {
                selected && 
                <div>
                <Recordnator imgClassCSS={"imageMedium justMargin0auto"} imageMainField={{ imgField: 'image' }}
                    titleRecord={`NFT ${selected.symbol} owned by: ${selected.account}`} devMode={false}
                    xclassCSS={"justBorders justRounded"} closeCB={() => setSelected(null)}
                    item={selected} 
                    toShow={fieldsNftDef}
                />
                <button className="marginsTB" onClick={() => updateState("subOption", "showInstances")}>Instances of {selected.symbol}</button>
                {
                    optionMenu.subOption === "showInstances" && instancesSelected &&
                    <Tablinator 
                        titleTable={`Instances of ${selected.symbol}`}
                        items={instancesSelected}
                        xclassCSS={"justBordersRoundedMarginB justHeight300pOverY"}
                        toShow={['nft_instance_id','on_sale','username','burned','createdAt','price','priceSymbol']}
                        clickedSubItemCB={(item) => console.log('Clicked on:', item)}
                    />
                }
                </div>
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