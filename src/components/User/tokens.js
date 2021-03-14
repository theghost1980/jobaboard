import React, { useState, useEffect } from 'react';
import { check } from '../../utils/helpers';
import axios from 'axios';
//hooks-forms
import { useForm } from 'react-hook-form';
// testing scroll

//end testing scroll
//components
import Btnclosemin from '../btns/btncloseMin';
import Abswrapper from '../absscreenwrapper';
import { Link } from 'gatsby';
import Loader from '../loader';
import Nftcreator from '../nfthandling/nftcreator';
//testing SSCjs library
// const SSC = require('sscjs');
// const ssc = new SSC('http://185.130.45.130:5000/');
//END testing
//dhive to broadcast a custom json
var dhive = require("@hiveio/dhive");
var client = new dhive.Client(["https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network"]);
//constants
const nftEP = process.env.GATSBY_nftEP;

const Tokensuser = () => {
    const userdata = check();
    // TODO: factor the state, maybe to use less.
    const [hive, setHive] = useState(null);
    const [noHive, setNoHive] = useState(null);
    const [ownedTokens, setOwnedTokens] = useState([]);
    const [noowned, setNoowned] = useState(false);
    const [createToken, setCreateToken] = useState(false);
    const [nfts, setNfts] = useState(null);
    const [existsNft, setExistsNft] = useState(false);
    const [loadingData, setLoadingData] = useState(true); //by default on init
    const [loadingInstances, setLoadingInstances] = useState(false);
    const [canCreate, setCanCreate] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [payload, setPayload] = useState(null);
    const [nameLenght, setNameLenght] = useState(0);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [noInstancesOfNFT, setnoInstancesOfNFT] = useState(false);
    //init forms-hooks
    const { register, handleSubmit, errors } = useForm();
    // on load
    // show user's swap.hive balance
    // for multiples values in query account: { $in: ['themarkymark', 'theghost1980']}

    useEffect(() => {
        setLoadingData(true);
        client.database.getAccounts([userdata.username])
        .then(result => {
            console.log(result);
            if(result.length > 0 && result[0].balance){
                const hives = Number(result[0].balance.split(' HIVE')[0]).toFixed(3);
                if(hives > 1){
                    setCanCreate(true);
                    setHive(hives);
                }else{
                    setCanCreate(false);
                    setHive("0.00");
                }
            }
        })
        .catch(error => { console.log('Error while querying user on DHIVE.',error)});

        // show user's owned tokens if any
        // .properties.isPremium.authorizedEditingAccounts
        // ssc.find("nft", "nfts", { issuer: "jobaboard", "properties.isPremium.authorizedEditingAccounts": userdata.username } , null, 0, [], (err, result) => {
        //     if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
        //     console.log(result);
        //     if(result.length > 0){
        //         setOwnedTokens(result);
        //     }else{
        //         setNoowned(true);
        //     }
        //     setLoadingData(false);
        // });
        getSSCData(nftEP+"allNFTs",{ issuer: "jobaboard", "properties.isPremium.authorizedEditingAccounts": userdata.username })
        .then(response =>{
            if(response.result === 'error'){ 
                console.log('Error from BE', response.error) 
                setLoadingData(false);};
            if(response.length > 0){
                setOwnedTokens(response);
            }else{
                setNoowned(true);
            }
            setLoadingData(false);
        })
        // Bring NFTs list and set a state.
        // ssc.find('nft','nfts', { }, 1000, 0 , [], (err, result) => {
        //     if(err) return console.log('Error fetching on SSCjs - nft>nfts',err);
        //     // console.log('List nfts created by etherchest');
        //     console.log(result);
        //     setNfts(result);
        // });
        // So when the user type the symbol, it says of exists or not.
        // this can saves us some fecthings later on.
        // ----> ???
    },[])

    const refreshNfts = () => {
        // ssc.find("nft", "nfts", { issuer: "jobaboard", "properties.isPremium.authorizedEditingAccounts": userdata.username } , null, 0, [], (err, result) => {
        //     if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
        //     console.log(result);
        //     if(result.length > 0){
        //         setOwnedTokens(result);
        //     }else{
        //         setNoowned(true);
        //     }
        //     setLoadingData(false);
        // });
        getSSCData(nftEP+"allNFTs",{ issuer: "jobaboard", "properties.isPremium.authorizedEditingAccounts": userdata.username })
        .then(response => {
            if(response.error){ 
                console.log('Error fetching data from BE',response.error);
                setLoadingData(false);
            }else if(response.length > 0){
                setOwnedTokens(response);
            }else if(response.length === 0){
                setNoowned(true);
            }
            setLoadingData(false);
        })
    }

    const closeMe = () => {
        setCreateToken(!createToken);
    }

    const cancelTokenCreation = () => {
        setPayload(null);
        setReviewing(false);
        setCreateToken(!createToken);
    }

    //handling the form data as create the token
    const onSubmit = (data) => {
        if(!reviewing){
            alert('Please review carefully the data to print onto the Blockchain.\nWhen ready send.');
            setReviewing(true);
            setPayload(data);
            console.log(data);
        }
    };

    const checkLength = (event) => {
        setNameLenght(event.target.value.length);
    }

    const findInstances = (_nft) => {
        setSelectedNFT(null);
        setLoadingInstances(true);
        // ssc.find("nft", `${_nft.symbol}instances`, { account: userdata.username } , null, 0, [], (err, result) => {
        //     if(err){
        //         setLoadingInstances(false);
        //         return console.log('Error asking state on User NFT Instance - SSCjs',err);
        //     } 
        //     // console.log(result);
        //     if(result.length > 0){
        //         setSelectedNFT(result);
        //     }else{
        //         //no issued yet, show user that and invite him to instantiate or sell the token.... Ideas..more ideas...
        //         setnoInstancesOfNFT(true);
        //     }
        //     setLoadingInstances(false);
        // });
        console.log(_nft.symbol);
        getSSCDataTable(nftEP+"allInstances",`${_nft.symbol}`,"instances",{ account: userdata.username })
        .then(response => {
            if(response.error){console.log('Error fetching data from BE',response.error);};
            if(response.length > 0){
                setSelectedNFT(response);
            }else if(response.length === 0){
                setnoInstancesOfNFT(true);
            }
            setLoadingInstances(false);
        })
        .catch(error => console.log('Error fetching Data',error));
    }

    const checkSymbolName = (nft) => {
        if(nfts && nfts.length > 0){
            const NFT = String(nft).toUpperCase();
            // console.log(`Checking:${NFT}`);
            //we check if symbol already exists
            const matchedNFT = nfts.filter(nft => nft.symbol === String(NFT).toLocaleUpperCase());
            if(matchedNFT.length > 0){
                setExistsNft(true);
            }else{
                setExistsNft(false);
            }
        }
    }

    function goCreateNFT(){
        setCreateToken(!createToken);
        // const element = document.getElementById("nftCreatorJAB");
        // element.scrollIntoView({block: "start", behavior: "smooth"});
        if(!createToken){
            window.scrollTo(0, 900);
        }
    }

    //////////data fecthing BE////////////
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
    async function getSSCDataTable(url = '',nftSymbol = String, table = String, query = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token,
                'nftsymbol': nftSymbol,
                'query': JSON.stringify(query),
                'table': table,
            },
        });
        return response.json(); 
    };
    //////////////////////////////////////

    return (
        <div className="userTokensContainer">
            <h1>My Tokens</h1>
            {
                loadingData && 
                <div className="standardDivRowFlex100pX100pCentered">
                    <Loader logginIn={true} typegif={"blocks"} />
                </div>
            }
            {
                !loadingData &&
                <>
                <div className="standardDivRowFullW">
                    <div className="importantUserBalanceCont centered">
                        <p>Current HIVE: {hive ? hive.toString() : '0.0'}</p>
                    </div>
                    {
                    (canCreate) &&
                        <ul className="standardUlHor">
                            <li>
                                <button onClick={goCreateNFT}>{createToken ? 'close': 'Create Token'}</button>
                            </li>
                            <li>
                                <button>Option 2</button>
                            </li>
                            <li>
                                <button>Option 3</button>
                            </li>
                            <li>
                                <button>Option 4</button>
                            </li>
                        </ul>
                    }
                </div>
                <div>
                    <ul className="standardUlHorSmall">
                        {
                            (ownedTokens.length > 0) &&
                                ownedTokens.map(token => {
                                    return (
                                        <li className="standardLiHovered" key={`${token._id}-ownedToken`} onClick={() => findInstances(token)}>
                                            {token.symbol} - {token.name} - {token.circulatingSupply.toString()} - Max Supply: {token.maxSupply.toString()}
                                        </li>
                                    )
                                })
                        }
                    </ul>
                    <ul className="standardUlHor">
                        <li>
                            <button>Filter By</button>
                        </li>
                        <li>
                            <button>Search</button>
                        </li>
                        <li>
                            <button>Go to Last</button>
                        </li>
                        <li>
                            <button onClick={refreshNfts}>Refresh</button>
                        </li>
                    </ul>
                    {
                        loadingInstances && 
                        <div className="standardDivRowFlex100pX100pCentered">
                            <Loader logginIn={true} typegif={"blocks"} />
                        </div>
                    }
                    {
                        (!selectedNFT && noInstancesOfNFT) &&
                            <div>
                                <p>Looks like you haven't cast any of that Token.</p>
                                <button>Let's Cast it</button>
                                <p>Tech me how (+Link TODO)</p>
                            </div>
                    }
                    {
                        selectedNFT &&
                        <div>
                            <ul className="standardUlHorSmall">
                                {
                                    selectedNFT.map(instance => {
                                        return (
                                            <li key={`${instance._id}-myInstance-JAB`}>
                                                ID: {instance._id} - Owned by: {instance.ownedBy} -{" "}  
                                                {instance.properties.hasOwnProperty("isPremium") ? `Is Premium:${instance.properties.isPremium ? 'Yes': 'No'}`: null}
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                            <button onClick={() => setSelectedNFT(null)}>Close</button>
                        </div>
                    }
                </div>
                {    
                noowned && <p>Looks like you have no tokens Yet. Click to follow tutorial. TODO</p>
                }
                {
                noHive && <p>Your current HIVE balance do not allow you to create tokens. Please <Link to="/app/wallet">Top Up</Link></p>
                }
                </>
            }
            {
                (createToken && userdata.username) &&
                <div id="nftCreatorJAB">
                    <Nftcreator  account={userdata.username} token={userdata.token}/>
                </div>
            }
        </div>
    )
}

export default Tokensuser;