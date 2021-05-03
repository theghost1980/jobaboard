import React, { useState, useEffect } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Btninfo from '../../btns/btninfo';
import Loader from '../../loader';
import Btnswitch from '../../btns/btnswitch';

//constants
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
//end constants

/**
 * This component present the creations + holdings in 2 separate tabs
 * - It returns to a CB the selected item.
 * @param {Object} cbSendItem - The item where user has clicked.
 * @param {Object} userdata as the object holding the user logged data
 * @param {Object} tradeCointBalance - the coin the platform has set to create/cast nfts. For now passed from parent as HIVE balnce as { coin: 'none', balance: 0, }.
 * @param {Boolean} fireAnUpdateNfts - optional if you need this component to fire a GET request on current NFts. I.e: use it when doing changes to refresh the current list.
 * @param {Boolean} fireAnUpdateInstances - optional if you need this component to fire a GET request on current instances. I.e: idem.
 * @param {Boolean} devMode - optional to see console.logs
*/

const Tokentabulator = (props) => {
    const { cbSendItem, userdata, tradeCointBalance = { coin: 'none', balance: 0, }, fireAnUpdateNfts, fireAnUpdateInstances, devMode } = props;

    const [allNfts, setAllNfts] = useState([]); //all NFTs definitions on JAB.
    const [nfts, setNfts] = useState([]);
    const [myHoldings, setMyHoldings] = useState([]);
    const [loadingNfts, setLoadingNfts] = useState(false);
    const [loadingInstances, setLoadingInstances] = useState(false);
    const [smallerIcons, setSmallerIcons] = useState(false);

    //to load on init
    useEffect(() => {
        updateAllNftList();
        updateMyCreations();
    }, []);
    //END to load on init

    //to load on each change of state
    useEffect(() => {
            if(devMode) {console.log('fireAnUpdateNfts',fireAnUpdateNfts)};
            updateMyCreations();
    },[fireAnUpdateNfts]);
    useEffect(() => {
        if(devMode) {console.log('fireAnUpdateInstances',fireAnUpdateInstances)};
        updateAllNftList();
    },[fireAnUpdateInstances]);
    //END to load on each change of state

    //functions/CB
    function updateAllNftList(){ //get all instances on mongoDB
        setLoadingInstances(true);
        const query = {};
        sendGETBEJustH(nfthandlermongoEP+"getNFTquery",query,0, { symbol: 1 })
        .then(response => {
            if(devMode) {console.log(response)};
            setAllNfts(response.result);
            updateInstances();
        })
        .catch(error => {
            console.log('Error getting data BE.',error);
            setLoadingInstances(false);
        });
    }
    function updateInstances(){ //get all instances on mongoDB
        const query = { username: userdata.username };
        sendGETBEJustH(nfthandlermongoEP+"getNFTInstancesQuery",query,0, { symbol: 1 })
        .then(response => {
            if(devMode) {console.log(response)};
            setMyHoldings(response.result);
            setLoadingInstances(false);
        })
        .catch(error => {
            console.log('Error getting data BE.',error);
            setLoadingInstances(false);
        });
    }
    function updateMyCreations(){
        setLoadingNfts(true);
        getNftMongoQuery({ account: userdata.username },0,{ "symbol": 1 });
    }
    function getNftMongoQuery(query = {},limit = Number,sortby = {}){
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify(query), 'limit': limit, 'sortby': JSON.stringify(sortby),}
        sendRequest(nfthandlermongoEP + "getNFTquery", "GET",headers)
        .then(response => {
            if(devMode) {console.log(response)};
            if(response.status === 'sucess'){
                setNfts(response.result);
            }
            setLoadingNfts(false);
        }).catch(error => {
            console.log('Error asking for NFTs on this user from DB, mongo.',error);
            setLoadingNfts(false);
        });
    }
    function getThumb(nftId){
        const found = allNfts.filter(item => item.nft_id === nftId);
        if(devMode) { console.log(found) };
        return found ? found[0].thumb : null;
    }
    function getNftDefinition(nft_id){
        const found = allNfts.filter(nft => nft.nft_id === nft_id);
        if(devMode) { console.log(found) };
        return found[0];
    }
    //data fecthing
    async function sendRequest(url = '', requestType, headers) {
        const response = await fetch(url, {
            method: requestType, 
            mode: 'cors', 
            headers: headers,
        });
        return response.json(); 
    };
    async function sendGETBEJustH(url = '', query = {},limit = Number,sortby = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {  'x-access-token': userdata.token, 'query': JSON.stringify(query), 'limit': limit, 'sortby': JSON.stringify(sortby),},
        });
        return response.json(); 
    };
    //END data fecthing
    //END functions/CB

    return (
        <div>
            <Tabs>
                <TabList>
                    <Tab>
                        <h3 className="shadowsTitlesSoft">My NFTs <Btninfo size={"mini"} msg={'These are all the NFTs definitions you own. For each one you can: edit info, sell as premium and more. Select one to see the options bellow.'} /></h3>
                    </Tab>
                    <Tab>
                        <h3 className="shadowsTitlesSoft">My Holdings <Btninfo size={"mini"} msg={'These are all the NFTs you posess.'} /></h3>
                    </Tab>
                    <Tab>
                        {
                            (tradeCointBalance && (tradeCointBalance.balance === 0))
                            ?
                            <div className="standardDivMini">
                                <Loader logginIn={true} typegif={"spin"}/>
                            </div>
                            :
                            <h3 className="shadowsTitlesSoft">My Balance: {tradeCointBalance.balance} {tradeCointBalance.coin}<Btninfo size={"mini"} msg={'The actual balance you have on JAB accepted coin to create/cast NFTs.'} /></h3>
                        }
                    </Tab>
                </TabList>
                <TabPanel>
                    <div className="standardDivRowPlain jutsMinHeight200px">
                    {
                        (nfts.length > 0) && !loadingNfts &&
                        <div>
                            <ul className="standardUlRowFlexPlain justMaxHeight300p justOverflowY wrapDiv">
                                {
                                    nfts.map(token => {
                                        return (
                                            
                                            <li key={token._id} className={`pointer goldeBorderRound hoveredBordered miniMarginLeft`} onClick={() => cbSendItem(token,"nft_definition")}>
                                                <div className="textAlignedCenter">
                                                    <div className="shinning">
                                                        <img src={token.thumb} className="smallImage" />
                                                    </div>
                                                    <p className="xSmalltext">Symbol: {token.symbol}</p>
                                                    <p className="xSmalltext">Price: {token.price} HIVE</p>
                                                </div>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    }
                    {
                        loadingNfts && 
                        <div className="standardDivRowFlex100pX100pCentered">
                            <Loader logginIn={loadingNfts} />
                        </div>
                    }
                    </div>
                </TabPanel>
                <TabPanel>
                    <div className="jutsMinHeight320px">
                        <ul className="standardUlRowFlexPlain overflowXscroll">
                            {   !loadingInstances &&
                                myHoldings.map(token => {
                                    return (
                                        <li key={token._id} className="pointer hoveredBordered miniMarginLeft" onClick={() => cbSendItem({...token, image: getThumb(token.ntf_id), nft_definition: getNftDefinition(token.ntf_id)},"nft_instance")}>
                                            <div className="textAlignedCenter">
                                                <div>
                                                    <img src={getThumb(token.ntf_id)} className={`${smallerIcons ? 'xSmallImage': 'smallImage '}`} />
                                                </div>
                                                <p className="xSmalltext">Symbol: {token.ntf_symbol}</p>
                                                <p className="xSmalltext">Id: {token.nft_instance_id}</p>
                                            </div>
                                        </li>
                                    )
                                })
                            }
                            {
                                loadingInstances && 
                                <div className="standardDivRowFlex100pX100pCentered">
                                    <Loader logginIn={loadingNfts} />
                                </div>
                            }
                        </ul>
                         {
                            !loadingInstances &&
                                <div>
                                    <Btnswitch xtraClassCSS={"justAligned"} btnAction={(cen) => setSmallerIcons(cen)}
                                        sideText={"Smaller icons please!"} initialValue={false} 
                                    />
                                </div>
                        }
                        <ul className="textNomarginXXSmall">
                            <li>Todo Here</li>
                            <li>Option for user to show as text/icons. Option to search & import nft instances(maybe). Option to group tokens if they have too many of each.</li>
                            <li>Option to list all the instances of a particular NFT.</li>
                        </ul>
                    </div>
                </TabPanel>
                <TabPanel>
                    <div className="jutsMinHeight320px">
                        <ul className="standardUlColAutoW">
                            <li>
                                <button>Top Up</button>
                            </li>
                            <li>
                                <button>Widthaw</button>
                            </li>
                            <li>
                                <button>Convert</button>
                            </li>
                        </ul>
                        <ul className="textNomarginXXSmall">
                            <li>Todo Here</li>
                            <li>We can send user to the wallet or do it here.</li>
                            <li>Maybe think better about if this is needed here.</li>
                        </ul>
                    </div>
                </TabPanel>
            </Tabs>
        </div>
    )
}

export default Tokentabulator;