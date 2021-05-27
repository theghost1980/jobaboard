import React, { useState, useEffect, useRef } from 'react';
import { check, getStoredField, jabFEE } from '../../utils/helpers';
import Loader from '../../components/loader';
import Btnswitch from '../../components/btns/btnswitch';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
import Btninfo from '../btns/btninfo';

//constants
const dhive = require("@hiveio/dhive");
const client = new dhive.Client([ "https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network","https://hived.privex.io/"]);
const privateKey = dhive.PrivateKey.fromString(process.env.GATSBY_secretJAB);
// const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const ssc_test_id = "ssc-testNettheghost1980";
// testing on local
// const nfthandlermongoEP = 'http://localhost:3000/nft/jobaboard/';
// const nftEP = 'http://localhost:3000/ssc/ssctest/'
//end testing on local
//using main live BE
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const nftEP = process.env.GATSBY_nftEP;
const userEP = process.env.GATSBY_userEP;
const adminEP = process.env.GATSBY_adminEP;
const tsOP = Date.now();
const initialState = {
    id: "",
    symbol: "",
    name: "My NFT created in JAB",
    orgName: "JAB jobs and gigs on Hive blockchain",
    productName: "JAB NFT on the run",
    url: "https://jobaboard.net/",
    maxSupply: "100000",
    price: 0,
    price_definition: 0, //the price user defines to sell the ownership of this definition.
    price_base_on_cast: 0, //this is the price we will use on JAB to buy/sell gigs. Price to be used as in orders.
    amountInstances: 1,
    totalAmountPay: 0,
};
// end using main live BE

// TODO VERY important:
// we must replace the nft.price by nft.price_base_on_cast: Number as this one is the one we will use for gigs/jobs/orders.
   

const Nftcreatorfinal = (props) => {
    const { updateOnSuccess, user_wants_claim } = props; //as BETA mode passed when user wants his free NFT.
    const [moreDetails, setMoreDetails] = useState(false);
    const [nft, setNft] = useState(initialState);
    const [newlyCreatedNFT, setNewlyCreatedNFT] = useState(null);
    const [issuedNFTs, setIssuedNFTs] = useState([]);
    const [showNftIssued, setShowNftIssued] = useState(false);
    const [sameSymbol, setSameSymbol] = useState(false);
    const [tx, setTx] = useState(null);
    const [disableDiv, setDisableDiv] = useState(false);
    const [myNFTsOnJab, setmyNFTsOnJab] = useState([]);
    const formRef = useRef();
    const [loadingData, setLoadingData] = useState(false);
    const [logTx, setLogTx] = useState(null);
    const [dataLogs, setDataLogs] = useState(null);
    const [steps, setSteps] = useState({ step: 1, status: 'Adding Details to NFT', log: {}, currentAction: '', ts: tsOP, sendToLogBe: false, });
    const userdata = check();

    //functions/CB//////
    /////fetching functions//////
    async function getSSCData(url = '', headers) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: headers,
        });
        return response.json(); 
    };
    async function sendPostBE(url = '', formdata, id) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-access-token': userdata.token,
                'id': id
            },
            body: formdata,
        });
        return response.json(); 
    };
    async function sendPostBEJH(url = '', query, nft_id) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-access-token': userdata.token,
                'nft_id': nft_id,
                'query':JSON.stringify(query),
            },
        });
        return response.json(); 
    };
    async function sendPostPlain(url = '', headers) {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
        });
        return response.json(); 
    };
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata   ? fetch(url, { method: requestType, headers: headers,})
                                        : fetch(url, { method: requestType, headers: headers, body: formdata});
        return (await response).json(); 
    };
    ///END data fetching
    function sendNFTBE(){
        const formData = new FormData();
        // the basic data we really need, all the rest will be handled directly with hive ssc.
        console.log(`trying to add new nft id:${nft.id}`);

        formData.append("nft_id", nft.id);
        formData.append("account", userdata.username);
        formData.append("symbol",nft.symbol);
        formData.append("createdAt", new Date);
        formData.append("price_definition", Number(nft.price_definition));
        formData.append("price_base_on_cast", Number(nft.price_base_on_cast));
        formData.append("issuer", userdata.username);
        formData.append("maxSupply", nft.maxSupply);
        formData.append("name",nft.name);
        formData.append("url",nft.url);
        formData.append("orgName", nft.orgName);
        formData.append("productName", nft.productName);
        // end basic data
        
        sendPostBE(nfthandlermongoEP+"addNFTDB",formData, nft.id)
        .then(response => {
            console.log(response); //status, result
            if(response.status === "success"){
                setNewlyCreatedNFT(response.result);
            }
        }).catch(error => console.log('Error adding NFT to DB.',error));

    }
    function sendMoneyBackAuto() {
        const amount = nft.totalAmountPay.toString() + " " + jabFEE.costCurr;
        const data = { from: "jobaboard", to: userdata.username, amount: amount, memo: "Some one took that NFT name. Funds sent back. Keep JABing.",};
        client.broadcast.transfer(data,privateKey)
        .then(result => { //TODO send this info as log in steps.
            console.log(result);
            alert(`Looks like someone took already that NFT symbol, we have sent the funds back to your wallet. Please check after 2 minutes.\nTake note of this txid:${result.id}`);
            clearStates();
        }).catch(error => {
            console.log('Error while transfering.',error);
            //TODOsend this to logs.
        });
    }
    function getInfoTX(){
        if(tx){
            console.log(`Checking on: ${tx.txid}`);
            const headers = {
                'x-access-token': userdata.token,
                'tx': tx.txid,
            }
            getSSCData(nftEP + "tx", headers)
            .then(response => {
                console.log(response);
                if(response.status === "askAgain"){
                    return setTimeout(getInfoTX,3000);
                }else{
                    if(tx.step === 1){
                        if(steps.currentAction === response.action){
                            if(response.logs){
                                const pLogs = JSON.stringify(response.logs);
                                if(!pLogs.errors){//typical success response {"events":[{"contract":"tokens","event":"transfer","data":{"from":"jobaboard","to":"null","symbol":"BEE","quantity":"100"}}]}
                                    findNft({ issuer: 'jobaboard', symbol: nft.symbol});
                                }else{
                                    // TODO handle errors as a separate function
                                    console.log('Errors to handle HERE dev!');
                                }
                            }else{
                                const pLogs = JSON.parse(response.logs);
                                if(pLogs.errors && pLogs.errors[0] === "symbol already exists"){
                                    sendMoneyBackAuto();
                                }
                            }
                        }
                    }else if(tx.step === 2){
                        if(steps.currentAction === response.action){
                            if(response.logs){
                                if(response.logs === "{}"){ //means no error when adding props to NFT.
                                    alert('Property Added. Now instantiate it.');
                                    instantiateNFT(JSON.parse(response.payload)); // payload: {"symbol":"TESTTT","name":"nftinfo","type":"string","isReadOnly":true,"authorizedEditingAccounts":["jobaboard"],"isSignedWithActiveKey":true}
                                }else{
                                    // TODO handle errors as a separate function
                                    console.log('Errors to handle HERE dev!');
                                }
                            }
                        }
                    }else if(tx.step === 3){
                        if(steps.currentAction === response.action){
                            if(response.logs){ //typical response for success as {"events":[{"contract":"tokens","event":"transfer","data":{"from":"jobaboard","to":"null","symbol":"BEE","quantity":"0.00200000"}},{"contract":"nft","event":"issue","data":{"from":"jobaboard","fromType":"user","to":"theghost1980","toType":"user","symbol":"TESTTT","lockedTokens":{},"lockedNfts":[],"properties":{},"id":1}}]}
                                const pLogs = JSON.parse(response.logs);
                                const issueEvent = pLogs.events.find(event => event.event === steps.currentAction);
                                if(issueEvent && issueEvent.contract === "nft" && issueEvent.event === steps.currentAction){//Now we tramsferOwnership.
                                    const payloadSymbol = issueEvent.data.symbol;
                                    const nftID = issueEvent.data.id;
                                    const user_nft = { ntf_id: nft.id, ntf_symbol: nft.symbol, nft_instance_id: nftID,}
                                    setDataLogs(user_nft);
                                    transferONft(userdata.username, payloadSymbol);
                                }else{
                                    //TODO handle error as separate function
                                    console.log('Errors to handle HERE dev!');
                                }
                            }
                        }
                    }else if(tx.step === 4){
                        if(steps.currentAction === response.action){
                            if(response.logs === "{}"){//means no errors typical response on success {"symbol":"ZZZ","to":"theghost1980","isSignedWithActiveKey":true}
                                const pPayload = JSON.parse(response.payload);
                                if(pPayload.symbol === nft.symbol && pPayload.to === userdata.username){ //transfered successful. now we send info into mongoDB.
                                    updateSteps("step","9 - Final Step.");
                                    updateSteps('status',"You have a Brand New NFT Definition + 1 Token, added to your balances."); 
                                    updateSteps("log", JSON.stringify({ status: 'sucess', results: 'Added instance + NFT to mongoDB' }));
                                    updateSteps("sendToLogBe", true);
                                    sendPostNewInstance();
                                    alert('You have a new NFT!'); 
                                    sendNFTBE();
                                    updateOnSuccess();
                                    clearStates()
                                }
                            }else{
                                //TODO handle error as separate function
                                console.log('Errors to handle HERE dev!');
                                updateSteps("log", JSON.stringify({ status: 'failed', results: JSON.stringify({ logs: response.logs }) }));
                                updateSteps("sendToLogBe", true);
                            }
                        }
                    }

                    // if(response.logs && response.logs !== "{}"){ //check the logs
                    //     const logs = JSON.parse(response.logs);
                    //     console.log(logs);
                    //     if(logs.events && logs.events.length > 0){ //means tokens submitted successfully so we can check
                    //         // addStateOP({ state: 'Sucess Token Created.', data: { log: JSON.stringify(logTx.events)} });
                    //         if(tx.step === 1){
                    //             findNft({ issuer: 'jobaboard', symbol: nft.symbol});
                    //         }else if(tx.step === 2){
                    //             //TODO NOW instantiateNFT(response[0]);
                    //            if(steps.currentAction === response.action){//means it was broadcasted so we may continue.
                    //                 alert('Property Added');
                    //            }
                    //         }else if(tx.step === 3){
                    //             //TODO
                    //             if(logs.events.length === 2){ //verify the nft contract it says transfer
                    //                 console.log(logs.events);
                    //                 const found = logs.events.filter(event => event.contract === "nft" && event.event === "issue");
                    //                 console.log(found);
                    //                 if(found.length === 1){
                    //                     //now we are sure, just check on the data, jic
                    //                     console.log(`Success on Issuing from: ${found[0].data.from} to: ${found[0].data.to}\nid: ${found[0].data.id}, symbol:${found[0].data.symbol}`);
                    //                     //here as the user has the instance we add it to its user.nfts array
                    //                     const nftID = found[0].data.id;
                    //                     const user_nft = { ntf_id: nft.id, ntf_symbol: nft.symbol, nft_instance_id: nftID,}
                    //                     setDataLogs(user_nft);
                    //                     transferONft(userdata.username,nft.symbol);
                    //                 }
                    //             }
                    //         }
                    //     }else if(logs.errors){ //handle the errors.
                    //         // addStateOP({ state: 'Error when receiving ssc server response.', data: { error: JSON.stringify(logTx.errors)} });
                    //         // TODO.
                    //         console.log('Error on logs',logs.errors); //Now I am just handling the case when teh symbol already exists and I return the funds back to the user automatically. 
                    //         if(logs.errors[0] === "symbol already exists"){
                    //             sendMoneyBackAuto();
                    //         }
                    //     }
                    // }else{
                    //     console.log('No logs received!!');
                    //     if(tx.step === 3){
                    //         console.log('Step 3!!');
                    //         if(response.action === "transferOwnership"){
                    //             //we add the new instance on mongoDB
                    //             sendPostNewInstance();
                    //             alert('You have a new NFT!'); 
                    //             sendNFTBE();
                    //             updateOnSuccess();
                    //             clearStates()
                    //         }
                    //     }
                    // }
                }
            })
            .catch(error => {
                console.log('Error asking data ssc on BE',error);
                clearStates()
            });
        }
    }
    async function sendPostNewInstance(){
        if(dataLogs){
            // { ntf_id: nft.id, ntf_symbol: nft.symbol, nft_instance_id: nftID,}
            const formdata = new FormData();
            formdata.append("username",userdata.username);
            formdata.append("ntf_id", Number(dataLogs.ntf_id));
            formdata.append("ntf_symbol",dataLogs.ntf_symbol);
            formdata.append("nft_instance_id",Number(dataLogs.nft_instance_id));
            formdata.append("createdAt",new Date());
            console.log('About to stamp a new instance:', { dataLogs } );
            sendPostBE(nfthandlermongoEP+"addNftInstance",formdata,0)
            .then(response => console.log(response))
            .catch(error => console.log('Error trying to add new instance.',error));
        }else{
            console.log('Fatal error. The new instance data is not been set! DEV Check!');
        }
    }
    function transferONft(to,nft_symbol){
        updateSteps("currentAction","transferOwnership");
        const json = [{ "contractName": "nft", "contractAction": "transferOwnership", "contractPayload": { "symbol": nft_symbol, "to": to } }];
        const data = { id: ssc_test_id, json: JSON.stringify(json), required_auths: ['jobaboard'], required_posting_auths: [],};
        client.broadcast.json(data, privateKey)
        .then(result => {
            console.log(result);
            updateSteps("step", 8);
            updateSteps("status", "Casted & Confirmed. Now transfering Ownership. Token still in the Oven.");
            updateSteps("log", JSON.stringify({ status: 'sucess', results: JSON.stringify(json) }));
            updateSteps("sendToLogBe", true);
            setTx({txid: result.id, step: 4});
        }).catch(error => {
            console.log('Error while transfering ownership.',error);
            updateSteps("log", JSON.stringify({ status: 'failed', results: JSON.stringify(error) }));
            updateSteps("sendToLogBe", true);
        });
    }
    const changeInput = (event) => {
        //TODO validations to be done on the react-form-handler
        const _inp = String(event.target.value).toUpperCase();
        //check if present on issuedNfts
        // TODO now: update this cb as check on each char of the symbol
        // as requested by hive ssc in order to create the new one.
        if(issuedNFTs && issuedNFTs.length > 0){
            const founded = issuedNFTs.filter(nftToken => nftToken.symbol === _inp);
            if(founded.length > 0){
                setSameSymbol(true);
            }else{
                setSameSymbol(false);
                setValueNFT("symbol",_inp);
            }
        }
    } 

    const calculateAmount = (event) => {
        // TODO validations on form
        if(event.target.value && event.target.value !== null) {
            const amount = Number(event.target.value);
            // todo solve the >= 30 tokens issue...
            setValueNFT("amountInstances",amount);
            let totalAmount = ((Number(amount) * Number(jabFEE.costInstance)) + Number(jabFEE.fee));
            setValueNFT("totalAmountPay",totalAmount);
        }
    }
    function setValueNFT(name,value){
        setNft(prevState => { return {...prevState, [name]: value} });
    }
    function updateSteps(name,value){
        setSteps(prevState => { return {...prevState, [name]: value} } );
    }
    function updateAmount(){
        let totalAmount = ((Number(nft.amountInstances) * Number(jabFEE.costInstance)) + Number(jabFEE.fee));
        setValueNFT("totalAmountPay",totalAmount);
    }
    function clearStates(){
        setTx(null);
        setNft(initialState);
        setDisableDiv(false);
        setLoadingData(false);
        setMoreDetails(false);
        formRef.current.reset();
        updateAmount();
    }
    function addTXtoCheck(tx = { txid: "", status: { type: String, default: 'TODO'}, type: ""}){
        setTxArray(prevState => [...prevState, tx]);
    }
    function receivedFromSwitch(value){
        // console.log(`Received from switch:${value}`);
        setMoreDetails(value);
    }
    function updateIssued(query){
        // TODO add the sort option on BE about this type of queries.
        // const query = {};
        const headers = {
            'x-access-token': userdata.token,
            'query': JSON.stringify(query),
        }
        getSSCData(nftEP+"allNFTs", headers)
        .then(response => {
            if(response.length > 0){
                setIssuedNFTs(response);
                console.log(response);
            }
        })
        .catch(error => console.log('Error fetching data from BE',error));
    }
    function findNft(query){
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify(query),}
        getSSCData(nftEP+"findNFT", headers)
        .then(response => {
            console.log(response);
            if(response.length > 0){ 
                console.log('Token found!. You may proceed.');
                console.log(response);
                addPropsNFT(response[0]); //adding props on new NFT.
                updateSteps("step", 5);
                updateSteps("status", "NFT Confirmed. Now adding props.");
                updateSteps("sendToLogBe", true);
                //testing to add id as received and store it in the nftState.
                setValueNFT("id",response[0]._id);
                //add it here to mongoDB.
                // sendNFTBE(response[0]);
                //update the list for NFTs on this user.
                updateIssued({});
            }else if(response.length === 0){
                setTimeout(findNft({ issuer: userdata.username, symbol: nft.symbol }),3000);
            }
        })
        .catch(error => {
            console.log('Error fetching data from BE',error);
            updateSteps("status", "Error fetching data from BE");
            updateSteps("sendToLogBe", true);
        });
    }

    //handling instantiate, addProps
    function instantiateNFT(payload){ //payload parsed as recived. {"symbol":"TESTTT","name":"nftinfo","type":"string","isReadOnly":true,"authorizedEditingAccounts":["jobaboard"],"isSignedWithActiveKey":true}
        console.log(`To instantiate 1 token of: ${payload.symbol}.`);
        updateSteps("currentAction", "issue");
        const ts = Date.now().toString();
        const nftinfoProp = JSON.stringify({ issuedby: '@jobaboard', createdat: "ts" + ts, isPremiun: true });
        const json = [{ "contractName": "nft", "contractAction": "issue", "contractPayload": { "symbol": payload.symbol, "to": userdata.username, "feeSymbol": jabFEE.feeSymbol, "properties": { "nftinfo": nftinfoProp },}}];
        const data = { id: ssc_test_id, json: JSON.stringify(json), required_auths: ['jobaboard'], required_posting_auths: [],};
        client.broadcast.json(data, privateKey)
        .then(result => {
            console.log(result); //handle this tx to apply the same method as others TxIds.
            updateSteps("step", 7);
            updateSteps("status", "Confirmed Props. NFT instance being created, waiting confirmation On Blockchain.");
            updateSteps("log", JSON.stringify({ status: 'sucess', results: JSON.stringify(json) }));
            updateSteps("sendToLogBe", true);
            if(result.id){ setTx({txid: result.id, step: 3}) }; //check results on broadcasting
        }).catch(error => {
            console.log('Error while instantiation.',error);
            updateSteps("log", JSON.stringify({ status: 'failed', results: JSON.stringify(error) }));
            updateSteps("sendToLogBe", true);
        });
    }
    function addPropsNFT(_newNFT){
        console.log(`To add props to: ${_newNFT.symbol}.`);
        updateSteps("currentAction", "addProperty");
        const json = {
            "contractName": "nft",
            "contractAction": "addProperty",
            "contractPayload": {
                "symbol": _newNFT.symbol,
                "name": "nftinfo",
                "type": "string",
                "isReadOnly": true,
                "authorizedEditingAccounts": [ "jobaboard" ],
            }
        };
        const data = { id: ssc_test_id, json: JSON.stringify(json), required_auths: ['jobaboard'], required_posting_auths: [],};
        client.broadcast.json(data, privateKey)
        .then(result => {
            console.log(result); //handle this tx to apply the same method as others TxIds.
            updateSteps("step", 6);
            updateSteps("status", "Added props. Now waiting confirmation On Hive Blockhain.");
            updateSteps("log", JSON.stringify({ status: 'sucess', results: JSON.stringify(json) }));
            updateSteps("sendToLogBe", true);
            if(result.id){ setTx({ txid: result.id, step: 2 }) }; //check results on broadcasting
        }).catch(error => {
            console.log('Error while instantiation.',error);
            updateSteps("log", JSON.stringify({ status: 'failed', results: JSON.stringify(error) }));
            updateSteps("sendToLogBe", true);
        });
    }
    //END handling instantiate, addProps

    function updateClaimed(){
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ claimed_free_nft: true }), 'toupdateon': userdata.username };
        dataRequest(userEP+"updateUserField", "POST", headers, null).then(response => {
            console.log('User has claimed his Free NFT. Updated field results:', response);
        }).catch(error => console.log('Error while updating Important NFT claim.', error));
    }

    //new method as we will broadcast witj jab
    const createNFTJAB = () => {
        event.preventDefault();
        if(user_wants_claim){ //we bypass all the rest of code and execute at once
            const str = `\nSymbol: ${nft.symbol}\nName: ${nft.name}\nOrganization: ${nft.orgName}\nProduct Name: ${nft.productName}\nUrl: ${nft.url}\nMax Supply: ${nft.maxSupply === "" ? 'Unlimited': nft.maxSupply}\nAbout to create: ${nft.amountInstances} token.\nPrice Definition: ${nft.price_definition} ${jabFEE.acceptedCur}\nCasting Base Price: ${nft.price_base_on_cast} ${jabFEE.acceptedCur}.`
            const answer = window.confirm(`Please check the current features of your Free Claimed token:${str}\nDo you agree to proceed?`);
            if(!answer){ 
                updateSteps("step", 1);
                updateSteps("status", `About to create: ${nft.symbol}. Username: ${userdata.username}`);
                updateSteps("sendToLogBe", true);
                setDisableDiv(false);
                setLoadingData(false);
                updateSteps("log", JSON.stringify({ status: 'failed', error: 'User Choose not to continue.'}));
                return console.log('User Cancelled NFT creation');
            }else{
                setDisableDiv(true);
                setLoadingData(true);
                updateSteps("step", 1);
                updateSteps("status", "User claimed Free NFT. Now creating NFT.");
                updateSteps("log", JSON.stringify({ status: 'sucess', results: 'Claiming Free NFT.', note: 'Claiming Free NFT.'}));
                updateSteps("sendToLogBe", true);
                const issuingAccounts = userdata.username === 'jobaboard' ? ["jobaboard"] : ["jobaboard", userdata.username];
                updateSteps("currentAction", "create");
                updateSteps("sendToLogBe", true);
                const json = { "contractName": "nft", "contractAction": "create", "contractPayload": { "symbol": nft.symbol, "name": nft.name, "orgName": nft.orgName, "productName": nft.productName, "url": nft.url, "maxSupply": nft.maxSupply, "authorizedIssuingAccounts": issuingAccounts,} }; 
                const data = { id: ssc_test_id, json: JSON.stringify(json), required_auths: ['jobaboard'], required_posting_auths: [],};
                client.broadcast
                .json(data, privateKey)
                .then(result => {
                    console.log(result);
                    updateSteps("step", 4);
                    updateSteps("status", "NFT created FREE CLAIM-BETA. Waiting confirmation on Hive Blockchain.");
                    updateSteps("log", JSON.stringify({ status: 'sucess', results: JSON.stringify(data), txId: result.id }));
                    updateSteps("sendToLogBe", true); //now bellow we update the claimed_nft field
                    updateClaimed();
                    return setTx({ txid: result.id, step: 1});
                }).catch(error => {
                    console.log('Error while creating the NFT.', error);
                    updateSteps("log", JSON.stringify({ status: 'failed', error: error }));
                    return updateSteps("sendToLogBe", true);
                });
            }
            return null;
        }
        if(isKeychainInstalled){
            if(!sameSymbol && nft.symbol !== ""){
                setDisableDiv(true);
                setLoadingData(true);
                const str = `\nSymbol: ${nft.symbol}\nName: ${nft.name}\nOrganization: ${nft.orgName}\nProduct Name: ${nft.productName}\nUrl: ${nft.url}\nMax Supply: ${nft.maxSupply === "" ? 'Unlimited': nft.maxSupply}\nAbout to create: ${nft.amountInstances} token.\nPrice Definition: ${nft.price_definition} ${jabFEE.acceptedCur}\nCasting Base Price: ${nft.price_base_on_cast} ${jabFEE.acceptedCur}.`
                const answer = window.confirm(`Please check the current features of your token:${str}\nDo you agree to proceed?`);
                if(!answer){ 
                    updateSteps("step", 1);
                    updateSteps("status", `About to create: ${nft.symbol}. Username: ${userdata.username}`);
                    updateSteps("sendToLogBe", true);
                    setDisableDiv(false);
                    setLoadingData(false);
                    updateSteps("log", JSON.stringify({ status: 'failed', error: 'User Choose not to continue.'}));
                    return console.log('User Cancelled NFT creation');
                }else{//we ask for transfer
                    updateSteps("step", 2);
                    updateSteps("status", `Waiting Transfer amount:${nft.totalAmountPay.toString()}-${jabFEE.acceptedCur}`);
                    updateSteps("sendToLogBe", true);
                    const memo = `Creating my NFT on JAB Symbol:${nft.symbol} on ${new Date().toString()}`
                    window.hive_keychain.requestTransfer(userdata.username, "jobaboard", nft.totalAmountPay.toString(), JSON.stringify(memo), jabFEE.acceptedCur, function(result){
                        const { message, success, error } = result;
                        console.log(result);
                        if(!success){
                            if(error !== "user_cancel"){
                                setDisableDiv(false);
                                setLoadingData(false);
                                setMoreDetails(false);
                                const { error, cause, data } = result.error;
                                if( cause.name && cause.name === "RPCError"){
                                    // addStateOP({ state: 'Fatal Error', data: { error: JSON.stringify(result.error)} });
                                    //TODO: handle this shit
                                }
                                updateSteps("log", JSON.stringify({ status: 'failed', error: 'Chain Error', message: message }));
                                updateSteps("sendToLogBe", true);
                                return console.log('Error while transfering', message);
                            }else if(error === "user_cancel"){
                                // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
                                console.log('User click on cancel!');
                                setDisableDiv(false);
                                setLoadingData(false);
                                setMoreDetails(false);
                                updateSteps("log", JSON.stringify({ status: 'failed', error: 'User Cancelled OP.'}));
                                updateSteps("sendToLogBe", true);
                            }
                        }else if (success){
                            const { type, memo, amount, currency, username } = result.data;
                            if( type === "transfer" && 
                                amount === nft.totalAmountPay.toString() && 
                                memo === memo 
                                && username === userdata.username && currency === jabFEE.costCurr){ 
                            }
                            //now we broadcast the NFthing
                            updateSteps("step", 3);
                            updateSteps("status", "Transference Received. Now creating NFT.");
                            updateSteps("log", JSON.stringify({ status: 'sucess', results: JSON.stringify(result.data), note: 'Transfer received'}));
                            updateSteps("sendToLogBe", true);
                            const issuingAccounts = userdata.username === 'jobaboard' ? ["jobaboard"] : ["jobaboard", userdata.username];
                            updateSteps("currentAction", "create");
                            updateSteps("sendToLogBe", true);
                            const json = { "contractName": "nft", "contractAction": "create", "contractPayload": { "symbol": nft.symbol, "name": nft.name, "orgName": nft.orgName, "productName": nft.productName, "url": nft.url, "maxSupply": nft.maxSupply, "authorizedIssuingAccounts": issuingAccounts,} }; 
                            const data = { id: ssc_test_id, json: JSON.stringify(json), required_auths: ['jobaboard'], required_posting_auths: [],};
                            client.broadcast
                            .json(data, privateKey)
                            .then(result => {
                                console.log(result);
                                updateSteps("step", 4);
                                updateSteps("status", "NFT created. Waiting confirmation on Hive Blockchain.");
                                updateSteps("log", JSON.stringify({ status: 'sucess', results: JSON.stringify(data), txId: result.id }));
                                updateSteps("sendToLogBe", true);
                                setTx({ txid: result.id, step: 1});
                            }).catch(error => {
                                console.log('Error while creating the NFT.', error);
                                updateSteps("log", JSON.stringify({ status: 'failed', error: error }));
                                updateSteps("sendToLogBe", true);
                            });
                        };
                    });
                }
            }
        }else{
            alert('If Hive Key Chain is installed, click on its icon on the browser bar to active it, if not installed check the link.');
        };
    };
    // OLD method handling for createNFT
    // const createNFT = (event) => {
    //     // testing validations for now so
    //     event.preventDefault();
    //     // VERY important TODO check on validations and test them
    //     if(isKeychainInstalled){
    //         if(!sameSymbol && nft.symbol !== ""){
    //             setDisableDiv(true);
    //             setLoadingData(true);
    //             // addStateOP({ state: 'Init NFT Creation', data: JSON.stringify(nft)});
    //             const str = `\nSymbol: ${nft.symbol}\nName: ${nft.name}\nOrganization: ${nft.orgName}\nProduct Name: ${nft.productName}\nUrl: ${nft.url}\nMax Supply: ${nft.maxSupply === "" ? 'Unlimited': nft.maxSupply}\nPrice for each of your tokens:${nft.price} ${jabFEE.acceptedCur}\nAbout to create:${nft.amountInstances} tokens.`
    //             const answer = window.confirm(`Please check the current features of your token:${str}\nDo you agree to proceed?`);
    //             if(!answer){ 
    //                 // addStateOP({ state: 'User choose to not continue OP.', data: {} });
    //                 setDisableDiv(false);
    //                 setLoadingData(false);
    //                 return console.log('User Cancelled NFT creation');
    //             }
    //             //we continue with transfer and so on...
    //             // TODO: where to handle the mongoDB formdata? now or as soon as we verify from hive server as TxId done???
    //             // TODO instead of just doing a transfer.
    //             // let's exectute transfer + custom json at once and test this out to modify the logic.
    //             // So in memo we will store the following:
    //             // Important Note: placeing userdata.username as authorizedIssuingAccounts even when he is the owner is a must.
    //             const authorizedIssuingAccounts = userdata.username === "jobaboard" ? [ "jobaboard"] : [ "jobaboard", userdata.username ];
    //             const memo = nft.maxSupply !== "" ? {
    //                 "id": ssc_test_id,
    //                 "json": {
    //                     "contractName": "nft",
    //                     "contractAction": "create",
    //                     "contractPayload": {
    //                         "symbol": nft.symbol,
    //                         "name": nft.name,
    //                         "orgName": nft.orgName,
    //                         "productName": nft.productName,
    //                         "url": nft.url,
    //                         "maxSupply": nft.maxSupply,
    //                         "authorizedIssuingAccounts": authorizedIssuingAccounts,
    //                     }
    //                 },
    //             } : { "id": ssc_test_id, "json": {"contractName": "nft","contractAction": "create","contractPayload": {"symbol": nft.symbol,"name": nft.name,"orgName": nft.orgName,"productName": nft.productName,"url": nft.url,"authorizedIssuingAccounts": [ "jobaboard", userdata.username ],}},}
    //             // addStateOP({ state: 'Waiting for transfer', data: {username: userdata.username, amount: nft.totalAmountPay, currency: jabFEE.acceptedCur, note: JSON.stringify(memo)} });
    //             window.hive_keychain.requestTransfer(userdata.username, "jobaboard", nft.totalAmountPay.toString(), JSON.stringify(memo), jabFEE.acceptedCur, function(result){
    //                 const { message, success, error } = result;
    //                 console.log(result);
    //                 if(!success){
    //                     if(error !== "user_cancel"){
    //                         setDisableDiv(false);
    //                         setLoadingData(false);
    //                         setMoreDetails(false);
    //                         const { error, cause, data } = result.error;
    //                         if( cause.name && cause.name === "RPCError"){
    //                             // addStateOP({ state: 'Fatal Error', data: { error: JSON.stringify(result.error)} });
    //                             //TODO: send this data to OPLOGGER.
    //                             // OPLOGGER must be a component that:
    //                             // - receives the log/op/errors as props
    //                             // - test connectivity on BE(we must code an EP as /PING on public maybe || adminEP) to get "OK"
    //                             // - send the log to mongoDB.
    //                             // - it may has additional features to activate on BE as:
    //                             //      - send log to support or send special message/email to admins
    //                             // - receives the log id + success msg from BE
    //                         }
    //                         // TODO send the log as well and register the event.
    //                         // TODO: ALL this process must finish presenting to user
    //                         // - A msg that "His/her funds are safe as we have registered it" & "Take note of the system log, in case support contacts you during the next 24 hrs."
    //                         // - A final msg as "You may continue doing the same operation and we will send your money back as soon as possible or contact support if any available".
    //                         return console.log('Error while transfering', message);
    //                     }else if(error === "user_cancel"){
    //                         // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
    //                         console.log('User click on cancel!');
    //                         setDisableDiv(false);
    //                         setLoadingData(false);
    //                         setMoreDetails(false);
    //                     }
    //                 }else if (success){
    //                     const { type, memo, amount, currency, username } = result.data;
    //                     if( type === "transfer" && 
    //                         amount === nft.totalAmountPay.toString() && 
    //                         memo === memo 
    //                         && username === userdata.username && currency === jabFEE.costCurr){ 
    //                     }
    //                     // addStateOP({ state: 'Sucess transferred funds', data: {} });
    //                     console.log('Executed successfully. Now check to continue dev work!!!',result.result.id);
    //                     setTx({ txid: result.result.id, step: 1});
    //                 };
    //             });
    //         }
    //     }else{
    //         // addStateOP({ state: 'Hive KeyChain not ready on browser!', data: { date: new Date().toString()} });
    //         alert('To proceed you must install Hive KeyChain and enable it on your browser, please follow the next steps.');
    //         setDisableDiv(false);
    //         setLoadingData(false);
    //         setMoreDetails(false);
    //         // TODO show next steps.
    //         // This may be a component as well. We could call it: stepper. So we may pass:
    //         // Video, image src and so on to guide the user to a specific action
    //         // it could be stored in a dictionary.
    //     }
    // }
    // // END handling for createNFT
    //end functions/CB//

    //useeffects to load once///
    useEffect(() => {
        updateIssued({}); //to bring all the NFTs on hive SSC.
        updateAmount();
    }, []);

    //to load On state changes
    useEffect(() => {
        if(tx){ setTimeout(getInfoTX,3000) };
    }, [tx]);
    useEffect(() => {
        if(steps && steps.sendToLogBe){
            const log = { is_system: false, log_type: 'nft_creation', data: JSON.stringify(steps), username: userdata.username, usertype: userdata.usertype, createdAt: new Date().toString(), }
            const headers = {'x-access-token': userdata.token}; //x-access-token data on formdata.
            const formdata = new FormData();
            formdata.append("is_system", log.is_system);
            formdata.append("log_type", log.log_type);
            formdata.append("data", log.data);
            formdata.append("username", log.username);
            formdata.append("usertype", log.usertype);
            formdata.append("createdAt", log.createdAt);
            dataRequest(adminEP+"addOp", "POST", headers, formdata).then(response => {
                console.log(response);
            }).catch(error => console.log('Error sending logs.', error ));
            updateSteps("sendToLogBe", false); //so we avoid a missmatch assingment.
         };
    }, [steps]);
    //END to load On state changes
    // useEffect(() => {
    //     console.log(statusOP);
    //     //maybe here we should handle the send to BE
    //     // after send
    //     // clear it setStatusOP([]);
    // }, [statusOP]);
    //END useeffects to load after the state changes

    return (
        <div>
            <div>
                <button onClick={() => setShowNftIssued(!showNftIssued)}>
                    {showNftIssued ? 'Close List':'List all'}
                </button>
                {
                    showNftIssued && (issuedNFTs.length > 0) &&
                    <ul className="standardUlHorSmall">
                        {
                            issuedNFTs.map(nft => {
                                return (
                                    <li key={nft._id}>{nft.symbol} - {nft.name}</li>
                                )
                            })
                        }
                    </ul>
                }
            </div>
            <div>
                {
                    user_wants_claim ?
                    <p>Claiming your Free NFT during BETA phase!</p>
                    :
                    <ul className="standardUlHorMini backGBaseColor">
                        <li>Actual System Fee: <span className="textColorContrast1 marginRight">{jabFEE.fee} {jabFEE.currency}</span></li>
                        <li>Cost Per Instance:<span className="textColorContrast1"> {jabFEE.costInstance} {jabFEE.costCurr}</span></li>
                    </ul>
                }
            </div>
            { sameSymbol && 
                <div className="standardDivRowFullW justAligned">
                    <p className="normalTextSmall alertSpan">Name Exists! Choose a different one please.</p>
                </div>
            }
            <div className={disableDiv ? 'disableDiv': null}>
                <Btnswitch btnAction={(cen) => receivedFromSwitch(cen)} sideText={"Edit Details"} initialValue={false} showValueDevMode={true} />
                <div>
                    {/* { errors.price && <span>Price, Must be a number with only dots.</span>} */}
                    <form onSubmit={createNFTJAB} ref={formRef}>
                        <div className="formVertFlex relativeDiv colorX">
                            <label htmlFor="symbol">Token's Symbol:</label>
                            <input name="symbol" type="text" onChange={changeInput} defaultValue={nft.symbol} 
                                className={sameSymbol ? 'alertInput': null}
                                required pattern="[A-Z]{1,10}" title="Uppercase letters only, max length of 10."
                            />
                            <label htmlFor="price_definition">
                                Price Definition:(on {jabFEE.acceptedCur}) <Btninfo msg={"Each NFT you create, contain a definition. This is the price on the NFT definition. We recommend a higher price if you decide to sell it later on, on JAB Marketplace."} size={"mini"}/>
                            </label>
                            <input name="price_definition" type="text" defaultValue={nft.price_definition.toString()} 
                                onChange={(e)=> setValueNFT(e.target.name,e.target.value)} 
                                required pattern="[0-9.]{1,21}" title="Just numbers and dot please. 21 number lenght."
                            />
                            <label htmlFor="price_base_on_cast">
                                Casting Base Price:(on {jabFEE.acceptedCur}) <Btninfo msg={"This is the price a user must for each of your tokens, when they want to trade a service/Gig with you. Set the price you want, taking into account that it can be modified later on."} size={"mini"}/>
                            </label>
                            <input name="price_base_on_cast" type="text" defaultValue={nft.price_base_on_cast.toString()} 
                                onChange={(e)=> setValueNFT(e.target.name,e.target.value)} 
                                required pattern="[0-9.]{1,21}" title="Just numbers and dot please. 21 number lenght."
                            />
                            {/* <span className="validity"></span> TODO */}
                        </div>
                        {/* <label htmlFor="amountInstances">Amount of tokens:</label>
                        <input name="amountInstances" defaultValue="1" type="text" onChange={calculateAmount} /> */}
                        {
                            moreDetails && 
                            <div className="formVertFlex">
                                <label htmlFor="name">Token's Name:</label>
                                <input name="name" type="text" onChange={(e)=> setValueNFT(e.target.name,e.target.value)} 
                                    required pattern="[\w\d\s]{1,50}" title="Letters, Numbers and whitespace only. Max length of 50"
                                />
                                <label htmlFor="orgName">Organization Name:</label>
                                <input name="orgName" type="text" onChange={(e)=> setValueNFT(e.target.name,e.target.value)} 
                                    required pattern="[\w\d\s]{1,50}" title="Letters, Numbers and whitespace only. Max length of 50"
                                />
                                <label htmlFor="productName">Product Name:</label>
                                <input name="productName" type="text" onChange={(e)=> setValueNFT(e.target.name,e.target.value)} 
                                    required pattern="[\w\d\s]{1,50}" title="Letters, Numbers and whitespace only. Max length of 50"
                                />
                                <label htmlFor="url">URL:</label>
                                <input name="url" type="text" onChange={(e)=> setValueNFT(e.target.name,e.target.value)} 
                                    required pattern=".{1,255}" title={`Max length of 255.`}
                                />
                                <label htmlFor="maxSupply">Max Supply:</label>
                                <input name="maxSupply" type="text" onChange={(e)=> setValueNFT(e.target.name,e.target.value)} defaultValue={nft.maxSupply}  
                                    pattern="[0-9,]{0,21}" title="Number and comma only. Between 1 and 9,007,199,254,740,991. If maxSupply is not specified, then the supply will be unlimited."
                                />
                            </div>
                        }
                        <button className="marginsTB" type="submit">Create NFT</button>
                    </form>
                </div>
                <p>Total to Pay: {nft.totalAmountPay.toString()} {jabFEE.acceptedCur}</p>
                <div>
                    <p>Status Bar --> Step: {steps.step} Now: {steps.status}</p>
                </div>
            </div>
            <hr></hr>
            {
                loadingData &&
                <div className="standardDivRowFlex100pX100pCentered">
                    <Loader xtraClass={"marginsTB"} logginIn={true} typegif={"blocks"} />
                </div>
            }
            {
                newlyCreatedNFT &&
                <div className="textAlignedCenter">
                    <div>
                        <img src={newlyCreatedNFT.thumb} />
                    </div>
                    <p>Symbol: {newlyCreatedNFT.symbol} / Price Definition: {newlyCreatedNFT.price_definition} {jabFEE.acceptedCur}</p>
                    <p>Casting Base Price: {newlyCreatedNFT.price_base_on_cast} {jabFEE.acceptedCur}</p>
                    <p>Owner: {newlyCreatedNFT.account} / Token Id:{newlyCreatedNFT.nft_id}</p>
                </div>
               }
            {/* <input type="text" onChange={(e) => setTx(e.target.value)} />
            <button onClick={getInfoTX}>Check TX</button> */}
            {/* {
                statusOP &&
                    <div style={{
                        position: 'fixed', bottom: '0px', height: '100px', overflow: 'auto'
                    }}>
                        <ul>
                        {
                            statusOP.map(status => {
                                return (
                                    <li key={`${status.state}`}>{status.state}</li>
                                )
                            })
                        }
                        </ul>
                    </div>
            } */}
        </div>
    )
}

export default Nftcreatorfinal;


//helping data///
// {"events":[
//     {
//         "contract":"tokens",
//         "event":"transfer",
//         "data":{
//             "from":"jobaboard",
//             "to":"null",
//             "symbol":"BEE",
//             "quantity":"0.00200000"
//         }
//     },
//     {
//         "contract":"nft",
//         "event":"issue",
//         "data":{
//             "from":"jobaboard",
//             "fromType":"user",
//             "to":"theghost1980",
//             "toType":"user",
//             "symbol":"TESTTT",
//             "lockedTokens":{},
//             "lockedNfts":[],
//             "properties":{},
//             "id":1
//         }
//     },
// ]}