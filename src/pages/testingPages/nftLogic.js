import React  from 'react'; //removed { useState, useEffect, useRef }
//hiveio/keychain
//should be only used to check if present and user logged in using it.
// import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
// import Loader from '../../components/loader';
// import axios from 'axios';
// import Importantmsg from '../../components/messages/importantmsg';
// import Abswrapper from '../../components/absscreenwrapper';
// import Robotips from '../../components/robots/robotips';
// import Mesaggertop from '../../components/messages/mesaggertop';

/**
 * Assign the project to an employee.
 * @param {String} account - The username account passed as a prop REQUIRED.
 * This module for now can: Create NFTs, by asking a fee to user. jobaboard will create & issue the token on request.
 */

//dhive to test the broadcast of a custom json
// var dhive = require("@hiveio/dhive");
// var client = new dhive.Client([ "https://hived.privex.io/","https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network"]);
// const ssc_test_id = "ssc-testNettheghost1980";
// const privateKey = dhive.PrivateKey.fromString(process.env.GATSBY_secretJAB);
// const postingKey = dhive.PrivateKey.fromString(process.env.GATSBY_postingKey);
// const SSC = require('sscjs');
// const sourceSSCURL = process.env.GATSBY_testSSCNodeURL; 
// const sscTemp = new SSC(sourceSSCURL); 
///////
// TODO to load all this data from .env file
// const testRPC = "http://185.130.45.130:5000/";
// const jabFEE = { fee: "0.000", currency: "HIVE", costInstance: "0.001", costCurr: "HIVE", acceptedCur: "HIVE"};
// ////////
// const account = "theghost1980";

// const dialogs = [
//     "Hi there! I was waiting for you.",
//     "I'm working to create tokens for you.",
//     "While you wait, let me give you tips",
//     "The best way to use the tokens are:",
//     "1. Minning them. Yes you may do this.",
//     "2. Create on the Go. Which is better and more effective.",
//     "Hope you are getting bored while waiting.",
//     "On more thing...",
//     "On this part of the site, you can:",
//     "- Create tokens.",
//     "- Manage the Tokens.",
//     "- Instantiate new Tokens.",
//     "- Modify some basic properties."
// ];

// var timerTotal;

const Nftlogic = () => {
    // const { account } = props;
    // //to create/instantiate INPUTS
    // const [nft, setNft] = useState("");
    // const [amountNft, setAmountNft] = useState(0);
    // // 
    // const [totalAmount, setTotalAmount] = useState(0);
    // const [working, setWorking] = useState(false);
    // const [newNFT, setNewNFT] = useState(null);
    // const [bee, setBee] = useState(null);
    // const [instances, setInstances] = useState([]);
    // const [propValue, setPropValue] = useState("");
    // const [errorFatal, setErrorFatal] = useState(false);
    // const [errorData, setErrorData] = useState("");
    // //cont to handle the whole process and show user what is happening
    // const [nftState, setNftState] = useState(null);
    // const formRef = useRef();
    // const [recordSteps, setRecordSteps] = useState([{
    //     timestamp: new Date()
    // }]);
    // const [totalTime, setTotalTime] = useState(0);
    // const [issuedNFTs, setIssuedNFTs] = useState([]);
    // const [sameName, setSameName] = useState(false);
    // const [messageUser, setMessageUser] = useState(false);
    // //

    //timer function to keep time track of the whole process.
    // testing to see how it works on every 100ms
    // function inittimerTotal(){
    //     timerTotal = setInterval(function(){
    //         setTotalTime(prevState => prevState + 100);
    //         // console.log('Hi');
    //     },100);
    // }
    // 

    // useEffect(() => {
    //     checkBEE();
    //     //load all NFTs names into a state.
    //     sscTemp.find("nft", "nfts", { issuer: "jobaboard" }, null, 0, [], (err, result) => {
    //         if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
    //         // console.log(result);
    //         if(result.length > 0){
    //             setIssuedNFTs(result);
    //         }
    //     });
    // },[]);

    // useEffect(() => {
    //     //to check on instances owned by theghost1980
    //     sscTemp.find('nft', "MMAAA"+"instances", { _id: Number("1") }, null, 0, [], (err, result) => {
    //         if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
    //         console.log(result);
    //     });
    // },[])

    //testing to record all steps in another state
    //just to analyse the steps and see if I must change order of step to add prop value.
    // useEffect(() => {
    //     setRecordSteps(prevState => [
    //         ...prevState, nftState
    //     ]);
    // }, [nftState])

    // function errorOnProcess(){
    //     setNft(null);
    //     setNftState({
    //         step: "X",
    //         desc: `Error on step:${nftState.step}`,
    //         nextstep: "Unkown. Check for system logs.",
    //     });
    //     setNftState(null);
    //     //show bitacora
    //     console.log(recordSteps);
    //     //delete bitacora
    //     formRef.current.reset();
    //     //under any error we cancel the whole process but we should register what happen and in which state
    //     // TODO log this. For now just local state.
    // }

    //asking transfer for now with hive-keychain.
    // const askTransfer = () => {
    //     if(!nft || nft === ""){ return console.log('No input no Sauce for you!')};
    //     if(!account || account === ""){ return console.log("Error fatal on props. Contact Admins.")}

    //     setWorking(true);
    //     setNftState({
    //         step: "2",
    //         desc: "Waiting for transfer",
    //         nextstep: "Create NFT",
    //     });
    //     // the man said:
    //         // You'd broadcast custom json, 
    //         // HE will process the custom json. 
    //         // You'd ask people to send you some tokens as fee, 
    //         // then you'd broadcast in that you keep the sent tokens as fee
    //         //1 HIVE for testing pourposes
    //     //setting enforce = true. User can only make teh transfer from his logged in account.
    //     window.hive_keychain.requestTransfer(account, "jobaboard", totalAmount.toString(), "Creating my NFT on JAB", jabFEE.acceptedCur, function(result){
    //         const { message, success, error } = result;
    //         console.log(result);
    //         if(!success){
    //             //todo add a special log + transmit or save into logs
    //             // maybe send a noti to admins or this may be a whole new module
    //             // so the user can be sure we will fix this
    //             // in the mean time what to do???
    //             // maybe just ask for another transfer
    //             // telling the user we will process this error on top 24hrs.
    //             if(error !== "user_cancel"){
    //                 const { error, cause, data } = result.error;
    //                 if( cause.name && cause.name === "RPCError"){
    //                     setErrorFatal(true);
    //                     const error = `Code:${cause.code}/name:${cause.name}/TS:${new Date()}`;
    //                     setErrorData(error);
    //                 }
    //             }
    //             setWorking(false);
    //             errorOnProcess();
    //             return console.log('Error while transfering', message);
    //         }else if (success){
    //             const { type, memo, amount, currency, username } = result.data;
    //             if( type === "transfer" && 
    //                 amount === totalAmount.toString() && 
    //                 memo === "Creating my NFT on JAB" 
    //                 && username === account && currency === jabFEE.currency){
    //                     //now we start counting the time.
    //                     inittimerTotal();

    //                     //means all good
    //                     // log the tranfer as done, just in case something happens here. IDEA: we could send this async to BE
    //                     // TODO -> make a logger component for client.
    //                     // As this has to be handled on BE.
    //                     console.log(`Funds Received. Creating the NFT>>>${nft}<<<< for ${account}`);
    //                     console.log("Transferred Funds. Success.",message);
    //                     setNftState({
    //                         step: "3",
    //                         desc: "Creating NFT",
    //                         nextstep: "Verify NFT was created.",
    //                     });
    //                     const json =
    //                     {
    //                         "contractName": "nft",
    //                         "contractAction": "create",
    //                         "contractPayload": {
    //                             "symbol": nft,
    //                             "name": `My ${nft} NFT`,
    //                             "orgName": "JOBaBoard JAB",
    //                             "productName": "NFTs to the next level",
    //                             "url": "https://jab.com",
    //                             "maxSupply": "10000",
    //                         },
    //                     };
    //                     const data = {
    //                         id: ssc_test_id,
    //                         json: JSON.stringify(json),
    //                         required_auths: ['jobaboard'],
    //                         required_posting_auths: [],
    //                     };
    //                     client.broadcast
    //                     .json(data, privateKey)
    //                     .then( result => {
    //                         console.log("NFT created.", result);
    //                         checkBEE();
    //                         //function
    //                         var timer;
    //                         function checkNFT(){
    //                             sscTemp.find('nft', 'nfts', { symbol: nft }, null, 0, [], (err, result) => {
    //                                 if(err) return console.log('Error asking state on New NFT - SSCjs',err);
    //                                 if(result.length === 1 && result[0].symbol === nft){
    //                                     //stop interval
    //                                     clearInterval(timer);
    //                                     setNewNFT(result[0]);
    //                                     setNftState({
    //                                         step: "4",
    //                                         desc: "Add prop to The NFT.",
    //                                         nextstep: "Verify NFT prop was added.",
    //                                     });
    //                                     addPropsNFT(result[0]);
    //                                 }
    //                             });
    //                         }
    //                         function clock(){
    //                             timer = setInterval(checkNFT,1000);
    //                         }
    //                         clock();
    //                     })
    //                     .catch(error => console.log("Error while creating NFT",error));
    //             }
    //         }
    //     },true);
    // };

    //add prop value edition="premium"
    // const addPropValue = () => {
    //     if(!propValue || propValue === ""){ console.log('No sauce, no input for you bangaru!')};
    //     //we should receive a valid NFT we could check....
    //     // here we may use just the posting key.
    //     console.log(`Per user request, adding:${propValue} to Instance:${instance._id} of SYM:${newNFT.symbol}`);
    //     // testing to see if the issue is that requires to be stringifyed as well. :S
    //     setNftState({
    //         step: "9",
    //         desc: `Adding prop:${propValue}, for NFT instance id:${instance._id}.`,
    //         nextstep: "Verify prop value was added.",
    //     });
    //     setWorking(true);
    //     const json =
    //     {
    //         "contractName": "nft",
    //         "contractAction": "setProperties",
    //         "contractPayload": {
    //             "symbol": newNFT.symbol,
    //             "nfts": [
    //                 {"id":"1","properties": {"isPremium": true}},
    //             ]
    //         }
    //     };
    //     const data = {
    //         id: ssc_test_id,
    //         json: JSON.stringify(json),
    //         required_auths: [],
    //         required_posting_auths: ["jobaboard"],
    //     };
    //     client.broadcast
    //     .json(data, postingKey)
    //     .then( result => {
    //         console.log(`Added Prop value:${propValue} to NFT:${newNFT.symbol} instance_id:${instance._id}`);
    //         console.log(result);
    //         // check balance to see if they took any BEE
    //         checkBEE();
    //         setNftState({
    //             step: "10",
    //             desc: `Verifying prop value was added for instance id:${instance._id}.`,
    //             nextstep: "Confirm info & Finish process.",
    //         });
    //         //function
    //         var timer;
    //         function checkNFTinstance(){
    //             // console.log('Checking on:',sourceSSCURL);
    //             sscTemp.find('nft', nft+"instances", { _id: Number(instance._id) }, null, 0, [], (err, result) => {
    //                 if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
    //                 console.log(result);
    //                 clearInterval(timer);
    //                 setNftState({
    //                     step: "11",
    //                     desc: `TODO: dunno how to add the prop to instance.`,
    //                     nextstep: "Done.",
    //                 });
    //                 setWorking(false);
    //                 console.log('Showing the whole process....Analyse biatch!');
    //                 console.log(recordSteps);
    //                 // if(result.length === 1 && result[0].account === account){
    //                 //     //founded now we can instantiate
    //                 //     //stop interval
    //                 //     clearInterval(timer);
    //                 //     //set the instance with its new prop
    //                 //     setInstance(result[0]);
    //                 // }
    //             });
    //         }
    //         function clock(){
    //             timer = setInterval(checkNFTinstance,1000);
    //         }
    //         //calling clock
    //         clock();
    //     })
    //     .catch(error => console.log('Error when applying prop to New NFT',error));

    // }

    // function addPropsNFT(newNft){
    //     console.log(`NFT: ${newNft.symbol} Received. Adding 1 prop to the NFT`);
    //     const json =
    //     {
    //         "contractName": "nft",
    //         "contractAction": "addProperty",
    //         "contractPayload": {
    //             "symbol": newNft.symbol,
    //             "name": "isPremium",
    //             "type": "boolean",
    //             "isReadOnly": true,
    //             "authorizedEditingAccounts": [ account, "jobaboard" ],
    //         }
    //     };
    //     const data = {
    //         id: ssc_test_id,
    //         json: JSON.stringify(json),
    //         required_auths: ['jobaboard'],
    //         required_posting_auths: [],
    //     };
    //     client.broadcast
    //     .json(data, privateKey)
    //     .then( result => {
    //         console.log(`Added new Prop to:${newNft.symbol}`);
    //         console.log(result);
    //         checkBEE();
    //         // TODO: Refactor CODE as this is repeating but using different params.
    //         var timer3;
    //         function checkNFT3(){
    //             sscTemp.find('nft', 'nfts', { symbol: newNft.symbol }, null, 0, [], (err, result) => {
    //                 if(err) return console.log('Error asking state on New NFT - SSCjs',err);
    //                 // console.log(result);
    //                 if(result.length === 1 && result[0].symbol === newNft.symbol && result[0].properties.hasOwnProperty("isPremium")){
    //                     console.log('This one should be the NFt with the prop added. Please Check!');
    //                     console.log(result[0]);
    //                     console.log('Did Set new info about the props on NFT.');
    //                     setNewNFT(result[0]);
    //                     setNftState({
    //                         step: "5",
    //                         desc: "Continue to Instantiate",
    //                         nextstep: "Instantiate NFT.",
    //                     });
    //                     clearInterval(timer3);
    //                     //now we must filter on the instantiateNFT by checking
    //                     // amountNft.
    //                     instantiateNFT(result[0]);
    //                 }
    //             });
    //         }
    //         function clock3(){
    //             timer3 = setInterval(checkNFT3,1000);
    //         }
    //         //calling clock
    //         clock3();
    //     })
    //     .catch(error => console.log('Error when applying prop to New NFT',error));
    // }

    //to check how balances change on each iteration
    // function checkBEE(){
    //     const query = { 
    //         jsonrpc:"2.0", 
    //         method:"find",
    //         params: {
    //             contract: 'tokens',
    //             table: 'balances',
    //             query: { account: 'jobaboard', symbol: 'BEE' },
    //         },
    //         id: Date.now(),
    //     };

    //     getDataRPC(query,"contracts");
    // };
    // async function getDataRPC(query,route) {
    //     console.log(`Requesting BEE balance to:\n${testRPC}`);
    //     axios.post(testRPC+route, query)
    //     .then(result => {
    //         // console.log(result.data);
    //         if(result.data.result.length > 0){
    //             setBee(result.data.result[0]);
    //             console.log("Balance Received. Good!");
    //         }
    //     })
    //     .catch(error => {
    //         console.log("Error on RPC request", error);
    //     })
    // };

    // async function sendRPCAxios(toCheck, route, query) {
    //     if(toCheck === 'nft'){
    //         console.log(`Requesting info ${toCheck} to:\n${testRPC}`);
    //         axios.post(testRPC+route, query)
    //         .then(result => {
    //             // console.log(result.data);
    //             if(result.data.result.length === 1){
    //                 //we set to see the changes.
    //                 setNewNFT(result.data.result[0]);
    //             }
    //         })
    //         .catch(error => {
    //             console.log("Error on RPC request", error);
    //         })
    //     }
    // };

    // function instantiateNFT(_newNFT){
    //     console.log(`To instantiate:${_newNFT.symbol}.`)
    //     console.log(`Amount to Instantiate:${amountNft}`);
    //     // The first 3 data properties are free. For each data property added beyond the first three, you must pay a fee of 100 ENG.
    //     // fee = base fee + ((base fee) x (number of data properties))
    //     // assuming now we haven't add but 1 prop only. it should be 0.001 BEE per instance.
    //     const baseFee = 0.001;
    //     const propsNFT = 0;
    //     const fee = baseFee + ( baseFee * propsNFT);
    //     console.log(`Fee to pay for each instance:${fee.toString()} BEE.`);
    //     setNftState({
    //         step: "6",
    //         desc: `Creating ${amountNft} Instance(s) of:${_newNFT.symbol}, automated.`,
    //         nextstep: "Verify NFT was instantiated.",
    //     });
    //     setWorking(true);
    //     // TODO:
    //     // maybe Iterate based on amountNft to create the array of nfts to instantiate
    //     // after this, check if array > 10, so we must split in subArray of 10 each
    //     // if 1 < array <= 10 we can send in one custom json.
    //     // if array > 10, then send subArrays.
    //     //constants
    //     const feeSymbol = "BEE";
    //     var json = {};
    //     var arrayJson = []; 
    //     if(amountNft === 1){
    //         json = [{
    //             "contractName": "nft",
    //             "contractAction": "issue",
    //             "contractPayload": {
    //                 "symbol": _newNFT.symbol,
    //                 "to": account,
    //                 "feeSymbol": feeSymbol,
    //                 "properties": {"isPremium": true},
    //             }
    //         }];
    //     }else{
    //         for(let i = 0; i < amountNft ; i++){
    //             const payload = {
    //                 "fromType": "user",
    //                 "symbol": String(_newNFT.symbol),
    //                 "to": account,
    //                 "feeSymbol": feeSymbol,
    //                 "properties": {"isPremium": (i === 0 ? true : false)}
    //             }
    //              arrayJson.push(payload);
    //         }
    //         // this works for <= 10.
    //         if(arrayJson.length <= 10){
    //             json = {
    //                 "contractName": "nft",
    //                 "contractAction": "issueMultiple",
    //                 "contractPayload": {
    //                     "instances": [...arrayJson]
    //                 },
    //             };
    //         }
    //     }
    //     //i will test for now adding 2 processes <= 10 || > 10 
    //     if(arrayJson.length <= 10){
    //         ///////////////////
    //         //we copy/paste initial code that is working for 1 || 10 as max.
    //         const data = {
    //             id: ssc_test_id,
    //             json: JSON.stringify(json),
    //             required_auths: ['jobaboard'],
    //             required_posting_auths: [],
    //         };
    //         console.log('Ready to send::::::::::');
    //         console.log(data);
    //         //broadcast the instantation
    //         client.broadcast.json(data, privateKey)
    //         .then( result => {
    //             checkBEE();
    //             console.log("NFT Instantiated.", result);
    //             console.log("Now waiting to ensure user have it.");
    //             setNftState({
    //                 step: "7",
    //                 desc: `Created ${amountNft} Instance(s) of:${_newNFT.symbol}.`,
    //                 nextstep: "Verifying instance. Waiting server reply.",
    //             });
    //             //function
    //             var timer2;
    //             function checkInstant(){
    //                 console.log('Checking on:' + _newNFT.symbol + "instances");
    //                 sscTemp.find('nft', _newNFT.symbol+"instances", { account: account }, null, 0, [], (err, result) => {
    //                     if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
    //                     console.log(result);
    //                     if(result.length === amountNft){
    //                         //now we STOP for now counting the time.
    //                         clearInterval(timerTotal);

    //                         //stop interval
    //                         clearInterval(timer2);
    //                         setInstances(result);
    //                         console.log(result);
    //                         setNftState({
    //                             step: "8",
    //                             desc: `Verifyed Instance of:${_newNFT.symbol}, id:${result[0]._id}.`,
    //                             nextstep: "Done Succesfully.",
    //                         });
    //                         setWorking(false);
    //                         console.log('Updating the NFT, to ensure circulating supply changes.');
    //                         sendRPCAxios('nft',"contracts",{
    //                                 jsonrpc:"2.0", 
    //                                 method:"find",
    //                                 params: {
    //                                     contract: 'nft',
    //                                     table: 'nfts',
    //                                     query: { symbol: _newNFT.symbol },
    //                                 },
    //                                 id: Date.now(),
    //                         });
    //                         // as we finish here present state:
    //                         console.log(recordSteps);
    //                     }
    //                 });
    //             }
    //             function clock2(){
    //                 timer2 = setInterval(checkInstant,1000);
    //             }
    //             //calling clock
    //             clock2();
    //         })
    //         .catch(error => console.log('Error while instantiation.',error));
    //         //END copy/paste initial code that is working for 1 || 10 as max.
    //         ///////////////////
    //     }else if(arrayJson.length > 10){
    //         //TODO
    //         // move and refactor this function
    //         function broadCast(chunkArray){
    //             //broadcast the instantation
    //             json = {"contractName": "nft","contractAction": "issueMultiple","contractPayload": {"instances": [...chunkArray]},};
    //             const data = {id: ssc_test_id,json: JSON.stringify(json),required_auths: ['jobaboard'],required_posting_auths: [],};
    //             client.broadcast.json(data, privateKey)
    //             .then( result => {
    //                 console.log('Results for ChunkJson containing',chunkArray.length.toString());
    //                 console.log(result);
    //             })
    //             .catch(error => console.log('Error while instantiation.',error));
    //         }
    //         ////////////Init LOOP////////////
    //         console.log(`ArrayJson Length:${arrayJson.length.toString()}`);
    //         var to = 0;
    //         const steps = 10;
    //         for(let i = 0; i < arrayJson.length ; i++){
    //             console.log(`Trying to iterate from:${to} to:${steps + to}`);
    //             const chunkArray = arrayJson.slice(to,steps + to);
    //             broadCast(chunkArray);
    //             to += chunkArray.length;
    //             i += chunkArray.length;
    //             if(i === arrayJson.length){
    //                 const chunkArray = arrayJson.slice(to,(arrayJson.length - to) + to);
    //                 broadCast(chunkArray);
    //             }
    //         }
    //         ////////////END LOOP////////////
    //         // TODO now, after BD is done.
    //         // new timer to check balance and confirm succedded OP.
    //         //calling clock
    //         // TODO refactor all of this in a global function that we can use on all requests.
    //         var timerFinal;
    //         function lastTimer(){
    //             sscTemp.find('nft', _newNFT.symbol+"instances", { account: account }, null, 0, [], (err, result) => {
    //                 if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
    //                 console.log(result);
    //                 if(result.length === amountNft){
    //                     //now we STOP for now counting the time.
    //                     clearInterval(timerTotal);

    //                     //stop interval
    //                     clearInterval(timerFinal);
    //                     setInstances(result);
    //                     console.log(result);
    //                     setNftState({
    //                         step: "8",
    //                         desc: `Verifyed Instance(s) of:${_newNFT.symbol}, id:${result[0]._id}.`,
    //                         nextstep: "Done Succesfully.",
    //                     });
    //                     setWorking(false);
    //                     console.log('Updating the NFT, to ensure circulating supply changes.');
    //                     sendRPCAxios('nft',"contracts",{
    //                             jsonrpc:"2.0", 
    //                             method:"find",
    //                             params: {
    //                                 contract: 'nft',
    //                                 table: 'nfts',
    //                                 query: { symbol: _newNFT.symbol },
    //                             },
    //                             id: Date.now(),
    //                     });
    //                     // as we finish here present state:
    //                     console.log(recordSteps);
    //                 }
    //             });
    //         }
    //         function clockFinal(){
    //             timerFinal = setInterval(lastTimer,1000);
    //         }
    //         clockFinal();
    //     }
    // }

    // const getInstances = () => {
    //     sscTemp.find('nft', newNFT.symbol+"instances", { account: account }, null, 0, [], (err, result) => {
    //         if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
    //         console.log(result);
    //     });
    // }

    // const getNftsOwned = () => {
    //     sscTemp.find('nft', 'nfts', { issuer: 'jobaboard' }, null, 0, [], (err, result) => {
    //         if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
    //         console.log(result);
    //     });
    // }

    // const changeInput = (event) => {
    //     //validations to be done on the react-form-handler
    //     // Just letters (uppercase letters only, max length of 10).
    //     // bewteen 10 chars max.
    //     // upcase(we will handle this)
    //     const _inp = String(event.target.value).toUpperCase();
    //     //check if present on issuedNfts
    //     if(issuedNFTs && issuedNFTs.length > 0){
    //         const founded = issuedNFTs.filter(nftToken => nftToken.symbol === _inp);
    //         // console.log(founded);
    //         if(founded.length > 0){
    //             setSameName(true);
    //         }else{
    //             setSameName(false);
    //             setNft(_inp);
    //         }
    //     }
    //     if(_inp === "" || !_inp){
    //         setNftState(null);
    //     }else{
    //         setNftState({
    //             step: "1",
    //             desc: "Adding Details to the NFT",
    //             nextstep: "Make Payment",
    //         });
    //     }
    // } 

    // const calculateAmount = (event) => {
    //     //after checking valid data from react-hook-form
    //     if(!event.target.value || event.target.value === null) {
    //         setTotalAmount(0);
    //         setAmountNft(0);
    //     }else {
    //         const amount = Number(event.target.value);
    //         if(amount >= 30){
    //             setMessageUser(true);
    //         }
    //         setAmountNft(amount);
    //         let totalAmount = ((Number(amount) * Number(jabFEE.costInstance)) + Number(jabFEE.fee)).toFixed(3);
    //         setTotalAmount(totalAmount);
    //     }

    //     //after adding the .XXX decimal positions.
    //     // setAmountNft(Number(e.target.value)
    // }

    ///////////testing code here ------- to remove after---------//////////////
    // const demonArray = () => {
    //     const arrayJson = [
    //         { "json":"1"},
    //         { "json":"2"},
    //         { "json":"3"},
    //         { "json":"4"},
    //         { "json":"5"},
    //         { "json":"6"},
    //         { "json":"7"},
    //         { "json":"8"},
    //         { "json":"9"},
    //         { "json":"10"},
    //         { "json":"11"},
    //         { "json":"12"},
    //         { "json":"13"},
    //         { "json":"14"},
    //         { "json":"15"},
    //         { "json":"16"},
    //         { "json":"17"},
    //         { "json":"18"},
    //         { "json":"19"},
    //         { "json":"20"},
    //         { "json":"21"},
    //         { "json":"22"},
    //         { "json":"23"},
    //         { "json":"24"},
    //         { "json":"25"},
    //         { "json":"26"},
    //         { "json":"27"},
    //         { "json":"28"},
    //         { "json":"29"},
    //         { "json":"30"},
    //         { "json":"31"},
    //         { "json":"32"},
    //     ];
    //     var to = 0;
    //     const step = 10;
    //     console.log(`Array of:${arrayJson.length.toString()}`);
    //     for(let i = 0; i < arrayJson.length ; i++){
 
    //         console.log(`Trying to iterate from:${to} to:${step + to}`);
    //         const chunkArray = arrayJson.slice(to,step + to);
    //         console.log(chunkArray);
    //         to += chunkArray.length;
    //         i += chunkArray.length;
    //         if(i === arrayJson.length){
    //             const chunkArray = arrayJson.slice(to,(arrayJson.length - to) + to);
    //             console.log(chunkArray);
    //         }
    //     }
    // }
    ///////////////////////////////////////////////////////////////////////////

    return (
        <div className="contNFTworker">
            {/* {
                messageUser && 
                <Mesaggertop  
                    message={"We recommend issue a max of 30 tokens in one operation. Please visit the documentation, for available options."}
                    enableTime={true}
                    timeToHide={5500}
                    callBack={() => setMessageUser(false)}
                    linkToVisit={"/"}
                    linkText={"Docs Center - JAB"}
                />
            } */}
            {/* {
                errorFatal && 
                    <Abswrapper>
                        <Importantmsg message={errorData} clickToClose={() => setErrorFatal(false)} />
                    </Abswrapper>
            } */}
            {/* {
                nftState &&
                    <div>
                        <ul className="fixedUlTopstate relativeDiv">
                            <li>Status</li>
                            <li>Current Step: <span className="warnSpan">{nftState.step}</span></li>
                            <li>Actual Process: <span className="warnSpan animSpan">{nftState.desc}</span></li>
                            <li>Next Step: <span className="warnSpan">{nftState.nextstep}</span></li>
                            {
                                (totalTime > 0) && 
                                <li className="specialText">Elapsed time: {(totalTime/1000).toFixed(2).toString()} seconds.</li>
                            }
                            <li>
                                <div className="miniDivAbs150">
                                    <Robotips account={account} timming={4000} dialogsProp={dialogs} />
                                </div>
                            </li>
                        </ul>
                    </div>
            } */}
        {/* removed className={`standardFlexCol95 ${working ? 'disableDiv': null}`} */}
        <div>
            {/* {
                working && 
                <div className="loaderMini">
                    <Loader logginIn={true} type={"blocks"} />
                </div>
            } */}
            {/* {
                    (bee) && 
                    <div>
                        <ul className="standardUlHorMini">
                            <li>My {bee.symbol}s: <span style={{ color: 'red'}}>{Number(bee.balance).toFixed(3).toString()}</span></li>
                            <li>Actual System Fee: <span style={{ color: 'red'}}>{jabFEE.fee} {jabFEE.currency}</span></li>
                            <li>Cost Per Instance:<span style={{ color: 'red'}}> {jabFEE.costInstance} {jabFEE.costCurr}</span></li>
                        </ul>
                        <form ref={formRef} className="standardFormHor relativeDiv">
                            <label htmlFor="nft_name">Token's Name:</label>
                            <input name="nft_name" type="text" onChange={changeInput} className={sameName ? 'alertInput': null}/>
                            { sameName && <span className="spanAbs">Name Exists! Choose a different one please.</span>}
                            <label htmlFor="nft_amount">Amount:</label>
                            <input name="nft_amount" defaultValue="0" type="text" onChange={calculateAmount} />
                            <p>Total to Pay: {totalAmount.toString()} {jabFEE.acceptedCur}</p>
                        </form>
                        {
                            (totalAmount > 0) && 
                            <div className="justTopMargin">
                                <button onClick={askTransfer}>SEND payment</button>
                            </div>
                        }
                    </div>
                }
                {
                    newNFT && 
                    <div>
                        <p>ID:{newNFT._id} Issuer:{newNFT.issuer} Name:{newNFT.name}</p>
                        <p>MaxSupply:{newNFT.maxSupply} Supply:{newNFT.supply} Circulating Supply:{newNFT.circulatingSupply}</p>
                        {
                            newNFT.properties.hasOwnProperty("isPremium") &&
                                <p>Added prop: isPremium. Now instantiating, when complete will show bellow.</p>
                        }
                    </div>
                }
                {
                    (instances && instances.length > 0) && 
                    <div className="standardFlexCol95H300">
                    <ul className="standardUlHorSmall">
                        <li>We have New instance(s) of:{newNFT.symbol} now Owned by:{account}</li>
                        
                        {
                            instances.map(instance => {
                                return (
                                    <li key={`${instance._id}-newInstanceIssuedJAB`}>
                                        ID: {instance._id} - owned By: {account} {instance.properties.hasOwnProperty("isPremium") ? `Premium:${instance.properties.isPremium.toString()}` : null}
                                    </li>
                                )
                            })
                        }
                    </ul>
                    </div>
                } */}
        </div>
        </div>
    )
}

export default Nftlogic;