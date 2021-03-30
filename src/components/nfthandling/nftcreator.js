import React, { useState, useEffect, useRef } from 'react';
//hiveio/keychain
//should be only used to check if present and user logged in using it.
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
import Loader from '../../components/loader';
import axios from 'axios';
import Importantmsg from '../../components/messages/importantmsg';
import Abswrapper from '../../components/absscreenwrapper';
import Robotips from '../../components/robots/robotips';
import Mesaggertop from '../../components/messages/mesaggertop';
import Btnswitch from '../btns/btnswitch';
import { fecthDataBE } from '../../utils/logger';

//dhive to test the broadcast of a custom json
var dhive = require("@hiveio/dhive");
var client = new dhive.Client([ "https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network","https://hived.privex.io/"]);
const ssc_test_id = "ssc-testNettheghost1980";
const privateKey = dhive.PrivateKey.fromString(process.env.GATSBY_secretJAB);
const postingKey = dhive.PrivateKey.fromString(process.env.GATSBY_postingKey);
// const SSC = require('sscjs');
// const sourceSSCURL = process.env.GATSBY_testSSCNodeURL; 
// const sscTemp = new SSC(sourceSSCURL); 
const adminEP = process.env.GATSBY_adminEP;
const nftEP = process.env.GATSBY_nftEP;
///////
// TODO to load all this data from .env file
const jabFEE = { fee: "0.000", currency: "HIVE", costInstance: "0.001", costCurr: "HIVE", acceptedCur: "HIVE"};
////////
// const account = "theghost1980";

const dialogs = [
    "Hi there! I was waiting for you.",
    "I'm working to create tokens for you.",
    "While you wait, let me give you tips",
    "The best way to use the tokens are:",
    "1. Minning them. Yes you may do this.",
    "2. Create on the Go. Which is better and more effective.",
    "Hope you are not getting bored while waiting.",
    "On more thing...",
    "On this part of the site, you can:",
    "- Create tokens.",
    "- Manage the Tokens.",
    "- Instantiate new Tokens.",
    "- Modify some basic properties."
];

var timerTotal;

/**
 * Assign the project to an employee.
 * @param {String} account - The username account passed as a prop REQUIRED.
 * This module for now can: Create NFTs, by asking a fee to user. jobaboard will create & issue the token on request.
 */

const Nftcreator = (props) => {
    // TODO very important
    // when we create a new NFT or issue
    // we must send a comand to the parent component to update
    // the info within his NFTs owned list.
    // i can think of the same CB as prop.

    const { account, token } = props;
    //to create/instantiate INPUTS
    const [nft, setNft] = useState("");
    const [amountNft, setAmountNft] = useState(0);

    // For now to add the new one we use token => later on, modify the code to work using 1 object as much as possible.
        const [nftToken, setNftToken] = useState({
            symbol: "",
            name: "D My NFT created in JAB",
            orgName: "JAB jobs and gigs on a Hive blockchain",
            productName: "JAB NFT on the run",
            url: "https://www.jab.com",
            maxSupply: "1000"
        })
    ////// 
    const [totalAmount, setTotalAmount] = useState(0);
    const [working, setWorking] = useState(false);
    const [newNFT, setNewNFT] = useState(null);
    const [bee, setBee] = useState(null);
    const [instances, setInstances] = useState([]);
    const [propValue, setPropValue] = useState("");
    const [errorFatal, setErrorFatal] = useState(false);
    const [errorData, setErrorData] = useState("");
    //cont to handle the whole process and show user what is happening
    const [nftState, setNftState] = useState(null);
    const formRef = useRef();
    const [recordSteps, setRecordSteps] = useState([{
        timestamp: new Date()
    }]);
    const [totalTime, setTotalTime] = useState(0);
    const [issuedNFTs, setIssuedNFTs] = useState([]);
    const [sameName, setSameName] = useState(false);
    const [messageUser, setMessageUser] = useState(false);
    const [addMoreDetails, setAddMoreDetails] = useState(false);
    //

    //timer function to keep time track of the whole process.
    // testing to see how it works on every 100ms
    function inittimerTotal(){
        timerTotal = setInterval(function(){
            setTotalTime(prevState => prevState + 100);
            // console.log('Hi');
        },100);
    }
    // 

    function updateIssued(){
        // sscTemp.find("nft", "nfts", { issuer: "jobaboard" }, null, 0, [], (err, result) => {
        //     if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
        //     // console.log(result);
        //     if(result.length > 0){
        //         setIssuedNFTs(result);
        //     }
        // });
        getSSCData(nftEP+"allNFTs",{ issuer: "jobaboard"})
        .then(response => {
            if(response.length > 0){
                setIssuedNFTs(response);
            }
        })
        .catch(error => console.log('Error fetching data from BE',error));
    }

    useEffect(() => {
        checkBEE();
        //load all NFTs names into a state.
        updateIssued();

        // sscTemp.find("nft", "nfts", {  }, 80, 0, [], (err, result) => {
        //     if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
        //     console.log(result);
        // });
    },[]);

    //testing to record all steps in another state
    //just to analyse the steps and see if I must change order of step to add prop value.
    useEffect(() => {
        setRecordSteps(prevState => [
            ...prevState, { state: nftState }
        ]);
    }, [nftState])

    function errorOnProcess(){
        setNft(null);
        setNftState({
            step: "X",
            desc: `Error on step:${nftState.step}`,
            nextstep: "Unkown. Check for system logs.",
        });
        setNftState(null);
        //show bitacora
        console.log(recordSteps);
        //delete bitacora
        formRef.current.reset();
        //under any error we cancel the whole process but we should register what happen and in which state
        // TODO log this. For now just local state.
    }
    //Just to test if working properly a useeffect TO DELETE LATER ON
    useEffect(() => {
        console.log('nftToken Value::::::::::')
        console.log(nftToken);
        console.log('::::::::::::::::::::::::::::::')
    },[nftToken]);

    // TODO: move all of this fetchings to helpers.....:D
    /////////////fecthing NFT from BE
    //////////data fecthing BE////////////
    async function getSSCData(url = '',query = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': token,
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
                'x-access-token': token,
                'nftsymbol': nftSymbol,
                'query': JSON.stringify(query),
                'table': table,
            },
        });
        return response.json(); 
    };
    //////////////////////////////////////
    /////////////////////////////////

    ///setters of states
    //setting nftToken per field
    function setValueNFT(name,value){
        // TODO validate each and every field.
        // TODO important
        setNftToken(prevState => {
            return {...prevState, [name]: value}
        })
    }
    //setters of states
    ////////////////////

    ////////send for record LogOP
    function sendLog(_currentStep,_result,_error,_desc){
        const timestamp = new Date().getTime();
        var _nft;
        if(_currentStep === "1"){
            //send the nft object stringyfied. after that just the name
            _nft = JSON.stringify(nftToken);
        }else{
            _nft = nftToken.symbol;
        }
        const _data = { txID: `${timestamp}|${account}|${_currentStep}`, op: `createNFT|${JSON.stringify(_nft)}|${amountNft.toString()}`, totalSteps: "8",result: _result, error: _error, descError: _desc};
        fecthDataBE(_data,adminEP+"/addOP",token);
        console.log('Sending log',_currentStep);
    }
    ////////

    //asking transfer for now with hive-keychain.
    const askTransfer = () => {
        if(!nft || nft === ""){ return console.log('No input no Sauce for you!')};
        if(!account || account === ""){ return console.log("Error fatal on props. Contact Admins.")};

        // ++++++++++++++++++
        //Record event to LogOp
        sendLog("2","Request Started + Added data. Waiting for confirmation.","false","");
        //End recording
        // ++++++++++++++++++

        const str = `\nSymbol: ${nftToken.symbol}\nName: ${nftToken.name}\nOrganization: ${nftToken.orgName}\nProduct Name: ${nftToken.productName}\nUrl: ${nftToken.url}\nMax Supply: ${nftToken.maxSupply}`
        const answer = window.confirm(`Please check the current features of your token:${str}\nDo you agree to proceed?`);
        if(!answer){ 
            // ++++++++++++++++++
            //Record event to LogOp
            sendLog("2","User choosed not to proceed.","false","");
            //End recording
            // ++++++++++++++++++
            return console.log('User cancelled OP.');
        }

        setAddMoreDetails(false);
        // end confirmation to proceed
        setWorking(true);
        setNftState({
            step: "2",
            desc: "Waiting for transfer",
            nextstep: "Create NFT",
        });
        
        //setting enforce = true. User can only make teh transfer from his logged in account.
        window.hive_keychain.requestTransfer(account, "jobaboard", totalAmount.toString(), "Creating my NFT on JAB", jabFEE.acceptedCur, function(result){
            const { message, success, error } = result;
            console.log(result);
            if(!success){
                if(error !== "user_cancel"){
                    const { error, cause, data } = result.error;
                    if( cause.name && cause.name === "RPCError"){
                        setErrorFatal(true);
                        const error = `Code:${cause.code}/name:${cause.name}/TS:${new Date()}`;
                        setErrorData(error);
                        // ++++++++++++++++++
                        //Record event to LogOp
                        sendLog("X",`Error happened. Exception.Code:${cause.code}/name:${cause.name}/`,"true",`Needs to be investigated as user posibly tranferred funds.Amount:${totalAmount.toString()} in${jabFEE.acceptedCur}`);
                        //End recording
                        // ++++++++++++++++++
                    }
                    
                }
                setWorking(false);
                errorOnProcess();
                 // ++++++++++++++++++
                //Record event to LogOp
                sendLog("X",`Error happened. Error while transfering.Msg:${message}`,"true","");
                //End recording
                // ++++++++++++++++++
                return console.log('Error while transfering', message);
            }else if (success){
                const { type, memo, amount, currency, username } = result.data;
                if( type === "transfer" && 
                    amount === totalAmount.toString() && 
                    memo === "Creating my NFT on JAB" 
                    && username === account && currency === jabFEE.currency){
                        //now we start counting the time.
                        inittimerTotal();

                        // ++++++++++++++++++
                        //Record event to LogOp
                        sendLog("3",`Transferred Funds.Msg:${message}`,"false",`A:${totalAmount.toString()}-M:${memo}-C:${currency}`);
                        //End recording
                        // ++++++++++++++++++

                        // As this has to be handled on BE.
                        console.log(`Funds Received. Creating the NFT>>>${nft}<<<< for ${account}`);
                        console.log("Transferred Funds. Success.",message);
                        setNftState({
                            step: "3",
                            desc: "Creating NFT",
                            nextstep: "Verify NFT was created.",
                        });
                        //Creating the NFT - create NFT

                        const json =
                        {
                            "contractName": "nft",
                            "contractAction": "create",
                            "contractPayload": {
                                "symbol": nftToken.symbol,
                                "name": nftToken.name,
                                "orgName": nftToken.orgName,
                                "productName": nftToken.productName,
                                "url": nftToken.url,
                                "maxSupply": nftToken.maxSupply,
                            },
                        };
                        const data = {
                            id: ssc_test_id,
                            json: JSON.stringify(json),
                            required_auths: ['jobaboard'],
                            required_posting_auths: [],
                        };
                        client.broadcast
                        .json(data, privateKey)
                        .then( result => {
                            console.log("NFT created.", result);
                            checkBEE();

                            // ++++++++++++++++++
                            //Record event to LogOp
                            sendLog("4",`BD done.R=${JSON.stringify(result)}`,"false","");
                            //End recording
                            // ++++++++++++++++++

                            //function
                            var timer;
                            function checkNFT(){
                                // sscTemp.find('nft', 'nfts', { symbol: nftToken.symbol }, null, 0, [], (err, result) => {
                                //     if(err) return console.log('Error asking state on New NFT - SSCjs',err);
                                //     if(result.length === 1 && result[0].symbol === nftToken.symbol){
                                //         //stop interval
                                //         clearInterval(timer);
                                //         setNewNFT(result[0]);
                                //         setNftState({
                                //             step: "4",
                                //             desc: `Add prop to The NFT:${nftToken.symbol}.`,
                                //             nextstep: "Verify that NFT prop was added.",
                                //         });
                                //         addPropsNFT(result[0]);
                                //     }
                                // });
                                getSSCData(nftEP+"allNFTs", { symbol: nftToken.symbol, issuer: "jobaboard" })
                                .then(response => {
                                    console.log(response);
                                    if(response.length === 1 && response[0].symbol === nftToken.symbol){
                                        //stop interval
                                        clearInterval(timer);
                                        setNewNFT(response[0]);
                                        setNftState({
                                            step: "4",
                                            desc: `Add prop to The NFT:${nftToken.symbol}.`,
                                            nextstep: "Verify that NFT prop was added.",
                                        });
                                        addPropsNFT(response[0]);
                                    }
                                }).catch(error => console.log('Error while verifying prop.',error));
                            }
                            function clock(){
                                timer = setInterval(checkNFT,1000);
                            }
                            clock();
                            // ++++++++++++++++++
                            //Record event to LogOp
                            sendLog("4",`NFT created.`,"false","");
                            //End recording
                            // ++++++++++++++++++
                        })
                        .catch(error => console.log("Error while creating NFT",error));
                }
            }
        },true);
    };

    function addPropsNFT(newNft){
        console.log(`NFT: ${newNft.symbol} Received. Adding 1 prop to the NFT`);
        // TODO: condition to check if the main account is instantiating
        // to remove it from "authorizedEditingAccounts"
        const json =
        {
            "contractName": "nft",
            "contractAction": "addProperty",
            "contractPayload": {
                "symbol": newNft.symbol,
                "name": "isPremium",
                "type": "boolean",
                "isReadOnly": true,
                "authorizedEditingAccounts": [ account, "jobaboard" ],
            }
        };
        const data = {
            id: ssc_test_id,
            json: JSON.stringify(json),
            required_auths: ['jobaboard'],
            required_posting_auths: [],
        };
        client.broadcast
        .json(data, privateKey)
        .then( result => {
            console.log(`Added new Prop to:${newNft.symbol}`);
            console.log(result);
            checkBEE();

            // ++++++++++++++++++
            //Record event to LogOp
            sendLog("5",`Added prop.`,"false","");
            //End recording
            // ++++++++++++++++++

            // TODO: Refactor CODE as this is repeating but using different params.
            var timer3;
            function checkNFT3(){
                // sscTemp.find('nft', 'nfts', { symbol: newNft.symbol }, null, 0, [], (err, result) => {
                //     if(err) return console.log('Error asking state on New NFT - SSCjs',err);
                //     // console.log(result);
                //     if(result.length === 1 && result[0].symbol === newNft.symbol && result[0].properties.hasOwnProperty("isPremium")){
                //         console.log('This one should be the NFt with the prop added. Please Check!');
                //         console.log(result[0]);
                //         console.log('Did Set new info about the props on NFT.');
                //         setNewNFT(result[0]);
                //         setNftState({
                //             step: "5",
                //             desc: "Continue to Instantiate",
                //             nextstep: "Instantiate NFT.",
                //         });
                //         clearInterval(timer3);
                //         //now we must filter on the instantiateNFT by checking
                //         // amountNft.
                //         instantiateNFT(result[0]);
                //     }
                // });
                getSSCData(nftEP+"allNFTs", { symbol: nftToken.symbol })
                .then(response => {
                    if(response.length === 1 && response[0].symbol === newNft.symbol && response[0].properties.hasOwnProperty("isPremium")){
                        console.log('This one should be the NFt with the prop added. Please Check!');
                        console.log(response[0]);
                        console.log('Did Set new info about the props on NFT.');
                        setNewNFT(response[0]);
                        setNftState({
                            step: "5",
                            desc: "Continue to Instantiate",
                            nextstep: "Instantiate NFT.",
                        });
                        clearInterval(timer3);
                        //now we must filter on the instantiateNFT by checking
                        // amountNft.
                        instantiateNFT(response[0]);
                    }
                }).catch(error => console.log('Error while Instantiate prop.',error));
            }
            function clock3(){
                timer3 = setInterval(checkNFT3,1000);
            }
            //calling clock
            clock3();
            // ++++++++++++++++++
            //Record event to LogOp
            sendLog("5",`Verifying prop(s) added.`,"false","");
            //End recording
            // ++++++++++++++++++
        })
        .catch(error => console.log('Error when applying prop to New NFT',error));
    }

    //to check how balances change on each iteration
    function checkBEE(){
        // const query = { 
        //     jsonrpc:"2.0", 
        //     method:"find",
        //     params: {
        //         contract: 'tokens',
        //         table: 'balances',
        //         query: { account: 'jobaboard', symbol: 'BEE' },
        //     },
        //     id: Date.now(),
        // };

        // getDataRPC(query,"contracts");
        //new one
        getSSCData(nftEP+"getBalance", { account: 'jobaboard', symbol: 'BEE'})
        .then(response => {
            console.log(response);
            if(response.length > 0){
                setBee(response[0])
            }
        }).catch(error => console.log('Error asking token balance',error));
    };
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

    async function sendRPCBE(toCheck, query) {
        if(toCheck === 'nft'){
            // console.log(`Requesting info ${toCheck} to:\n${testRPC}`);
            // axios.post(testRPC+route, query)
            // .then(result => {
            //     // console.log(result.data);
            //     if(result.data.result.length === 1){
            //         //we set to see the changes.
            //         setNewNFT(result.data.result[0]);
            //     }
            // })
            // .catch(error => {
            //     console.log("Error on RPC request", error);
            // })
            // symbol: _newNFT.symbol
            getSSCData(nftEP+"allNFTs", query)
            .then(response => {
                console.log(response);
                if(response.length === 1 && !response.error){
                    setNewNFT(response[0]);
                }else{
                    console.log(response);
                }
            }).catch(error => {
                console.log("Error on NFTs request to BE", error);
            })
        }
    };

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

    function instantiateNFT(_newNFT){
        console.log(`To instantiate:${_newNFT.symbol}.`)
        console.log(`Amount to Instantiate:${amountNft}`);
        // The first 3 data properties are free. For each data property added beyond the first three, you must pay a fee of 100 ENG.
        // fee = base fee + ((base fee) x (number of data properties))
        // assuming now we haven't add but 1 prop only. it should be 0.001 BEE per instance.
        const baseFee = 0.001;
        const propsNFT = 0;
        const fee = baseFee + ( baseFee * propsNFT);
        console.log(`Fee to pay for each instance:${fee.toString()} BEE.`);
        setNftState({
            step: "6",
            desc: `Creating ${amountNft} Instance(s) of:${_newNFT.symbol}, automated.`,
            nextstep: "Verify NFT was instantiated.",
        });
        setWorking(true);

        // TODO:
        // chequear porque al usar la main account, no puede enviarselos a si mismo.
        // el error esta o aca debajo cuando se hace el to:
        // o mas abajo cuando as ique correr paso a paso.
        // por ahora funciona crear para las demas cuentas que sean distintias a la main
        const feeSymbol = "BEE";
        var json = {};
        var arrayJson = []; 
        if(amountNft === 1){
            json = [{
                "contractName": "nft",
                "contractAction": "issue",
                "contractPayload": {
                    "symbol": _newNFT.symbol,
                    "to": account,
                    "feeSymbol": feeSymbol,
                    "properties": {"isPremium": true},
                }
            }];
        }else{
            for(let i = 0; i < amountNft ; i++){
                const payload = {
                    "fromType": "user",
                    "symbol": String(_newNFT.symbol),
                    "to": account,
                    "feeSymbol": feeSymbol,
                    "properties": {"isPremium": (i === 0 ? true : false)}
                }
                 arrayJson.push(payload);
            }
            // this works for <= 10.
            if(arrayJson.length <= 10){
                json = {
                    "contractName": "nft",
                    "contractAction": "issueMultiple",
                    "contractPayload": {
                        "instances": [...arrayJson]
                    },
                };
            }
        }
        //i will test for now adding 2 processes <= 10 || > 10 
        if(arrayJson.length <= 10){
            ///////////////////
            //we copy/paste initial code that is working for 1 || 10 as max.
            const data = {
                id: ssc_test_id,
                json: JSON.stringify(json),
                required_auths: ['jobaboard'],
                required_posting_auths: [],
            };
            console.log('Ready to send::::::::::');
            console.log(data);
            //broadcast the instantation
            client.broadcast.json(data, privateKey)
            .then( result => {
                checkBEE();
                console.log("NFT Instantiated.", result);
                console.log("Now waiting to ensure user have it.");
                setNftState({
                    step: "7",
                    desc: `Created ${amountNft} Instance(s) of:${_newNFT.symbol}.`,
                    nextstep: "Verifying instance. Waiting server reply.",
                });

                // ++++++++++++++++++
                //Record event to LogOp
                sendLog("7",`BD done to instantiate:${amountNft}.`,"false","");
                //End recording
                // ++++++++++++++++++

                //function
                var timer2;
                function checkInstant(){
                    console.log('Checking on:' + _newNFT.symbol + "instances");
                    // sscTemp.find('nft', _newNFT.symbol+"instances", { account: account }, null, 0, [], (err, result) => {
                    //     if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
                    //     console.log(result);
                    //     if(result.length === amountNft){
                    //         //now we STOP for now counting the time.
                    //         clearInterval(timerTotal);

                    //         //stop interval
                    //         clearInterval(timer2);
                    //         setInstances(result);
                    //         console.log(result);
                    //         setNftState({
                    //             step: "8",
                    //             desc: `Verifyed Instance of:${_newNFT.symbol}, id:${result[0]._id}.`,
                    //             nextstep: "Done Succesfully.",
                    //         });
                    //         setWorking(false);
                    //         console.log('Updating the NFT, to ensure circulating supply changes.');
                    //         sendRPCAxios('nft',"contracts",{
                    //                 jsonrpc:"2.0", 
                    //                 method:"find",
                    //                 params: {
                    //                     contract: 'nft',
                    //                     table: 'nfts',
                    //                     query: { symbol: _newNFT.symbol },
                    //                 },
                    //                 id: Date.now(),
                    //         });
                    //         // as we finish here present state:
                    //         console.log(recordSteps);
                    //     }
                    // });
                    getSSCDataTable(nftEP+"allInstances",_newNFT.symbol,"instances",{ account: account })
                    .then(response => {
                        console.log(response);
                        if(response.length === amountNft && !response.error){
                            //now we STOP for now counting the time.
                            clearInterval(timerTotal);

                            //stop interval
                            clearInterval(timer2);
                            setInstances(response);
                            console.log(response);
                            setNftState({
                                step: "8",
                                desc: `Verifyed Instance of:${_newNFT.symbol}, id:${response[0]._id}.`,
                                nextstep: "Done Succesfully.",
                            });
                            setWorking(false);
                            console.log('Updating the NFT, to ensure circulating supply changes.');
                            sendRPCBE('nft',{ symbol: _newNFT.symbol });
                            // as we finish here present state:
                            console.log(recordSteps);
                        }
                    }).catch(error => {console.log('Error getting All instances of NFT to BE',error)})
                }
                function clock2(){
                    timer2 = setInterval(checkInstant,1000);
                }
                //calling clock
                clock2();
                // ++++++++++++++++++
                //Record event to LogOp
                sendLog("8",`Waiting response from server about instantiation of:${amountNft}.`,"false","");
                //End recording
                // ++++++++++++++++++
            })
            .catch(error => console.log('Error while instantiation.',error));
            //END copy/paste initial code that is working for 1 || 10 as max.
            ///////////////////
        }else if(arrayJson.length > 10){
            //TODO
            // move and refactor this function
            function broadCast(chunkArray){
                //broadcast the instantation
                json = {"contractName": "nft","contractAction": "issueMultiple","contractPayload": {"instances": [...chunkArray]},};
                const data = {id: ssc_test_id,json: JSON.stringify(json),required_auths: ['jobaboard'],required_posting_auths: [],};
                client.broadcast.json(data, privateKey)
                .then( result => {
                    console.log('Results for ChunkJson containing',chunkArray.length.toString());
                    console.log(result);
                })
                .catch(error => console.log('Error while instantiation.',error));
            }
            ////////////Init LOOP////////////
            console.log(`ArrayJson Length:${arrayJson.length.toString()}`);
            var to = 0;
            const steps = 10;
            for(let i = 0; i < arrayJson.length ; i++){
                console.log(`Trying to iterate from:${to} to:${steps + to}`);
                const chunkArray = arrayJson.slice(to,steps + to);
                broadCast(chunkArray);
                to += chunkArray.length;
                i += chunkArray.length;
                if(i === arrayJson.length){
                    const chunkArray = arrayJson.slice(to,(arrayJson.length - to) + to);
                    broadCast(chunkArray);
                }
            }
            ////////////END LOOP////////////

            // ++++++++++++++++++
            //Record event to LogOp
            sendLog("7",`BD done of array of:${arrayJson.length.toString()} instances.`,"false","");
            //End recording
            // ++++++++++++++++++

            // TODO now, after BD is done.
            // new timer to check balance and confirm succedded OP.
            //calling clock
            // TODO refactor all of this in a global function that we can use on all requests.
            var timerFinal;
            function lastTimer(){
                // sscTemp.find('nft', _newNFT.symbol+"instances", { account: account }, null, 0, [], (err, result) => {
                //     if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
                //     console.log(result);
                //     if(result.length === amountNft){
                //         //now we STOP for now counting the time.
                //         clearInterval(timerTotal);

                //         //stop interval
                //         clearInterval(timerFinal);
                //         setInstances(result);
                //         console.log(result);
                //         setNftState({
                //             step: "8",
                //             desc: `Verifyed Instance(s) of:${_newNFT.symbol}, id:${result[0]._id}.`,
                //             nextstep: "Done Succesfully.",
                //         });
                //         setWorking(false);
                //         console.log('Updating the NFT, to ensure circulating supply changes.');
                //         sendRPCAxios('nft',"contracts",{
                //                 jsonrpc:"2.0", 
                //                 method:"find",
                //                 params: {
                //                     contract: 'nft',
                //                     table: 'nfts',
                //                     query: { symbol: _newNFT.symbol },
                //                 },
                //                 id: Date.now(),
                //         });
                //         // as we finish here present state:
                //         console.log(recordSteps);
                //         //as final step UPDATE THE NFTs issued by main account to prevent errors if user wants to
                //         // create a new one right away.
                //         updateIssued();

                //         // ++++++++++++++++++
                //         //Record event to LogOp
                //         sendLog("Last",`Process finished successfully.`,"false","");
                //         //End recording
                //         // ++++++++++++++++++

                //     }
                // });
                getSSCDataTable(nftEP+"allInstances",_newNFT.symbol,"instances",{ account: account })
                .then(response => {
                    console.log(response);
                    if(response.length === amountNft && !response.error){
                        //now we STOP for now counting the time.
                        clearInterval(timerTotal);
                        //stop interval
                        clearInterval(timerFinal);
                        setInstances(response);
                        console.log(response);
                        setNftState({
                            step: "8",
                            desc: `Verifyed Instance(s) of:${_newNFT.symbol}, id:${response[0]._id}.`,
                            nextstep: "Done Succesfully.",
                        });
                        setWorking(false);
                        console.log('Updating the NFT, to ensure circulating supply changes.');
                        sendRPCBE('nft',{ symbol: _newNFT.symbol });
                        // as we finish here present state:
                        console.log(recordSteps);
                        //as final step UPDATE THE NFTs issued by main account to prevent errors if user wants to
                        updateIssued();
                        // ++++++++++++++++++
                        //Record event to LogOp
                        sendLog("Last",`Process finished successfully.`,"false","");
                        //End recording
                        //here send to parent tokens a message to self update the list
                        // TODO
                        // Another TODO very important
                        // Here I must register this NFTs as owned by this user on MongoDB.
                        // ++++++++++++++++++
                    }
                }).catch(error => {console.log('Error getting All instances of NFT to BE',error)})
            }
            function clockFinal(){
                timerFinal = setInterval(lastTimer,1000);
            }
            clockFinal();

            // ++++++++++++++++++
            //Record event to LogOp
            sendLog("8",`Verifying the:${arrayJson.length.toString()} instances.`,"false","");
            //End recording
            // ++++++++++++++++++
        }
    }

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

    const changeInput = (event) => {
        //TODO validations to be done on the react-form-handler
        const _inp = String(event.target.value).toUpperCase();
        //check if present on issuedNfts
        if(issuedNFTs && issuedNFTs.length > 0){
            const founded = issuedNFTs.filter(nftToken => nftToken.symbol === _inp);
            // console.log(founded);
            if(founded.length > 0){
                setSameName(true);
            }else{
                setSameName(false);
                setNft(_inp);
                //TODO: remove setNft as we will use the one bellow as definitive
                setValueNFT("symbol",_inp);
            }
        }
        if(_inp === "" || !_inp){
            setNftState(null);
        }else{
            setNftState({
                step: "1",
                desc: "Adding Details to the NFT",
                nextstep: "Make Payment",
            });
        }
    } 

    const calculateAmount = (event) => {
        // TODO
        //after checking valid data from react-hook-form
        if(!event.target.value || event.target.value === null) {
            setTotalAmount(0);
            setAmountNft(0);
        }else {
            const amount = Number(event.target.value);
            if(amount >= 30){
                setMessageUser(true);
            }
            setAmountNft(amount);
            let totalAmount = ((Number(amount) * Number(jabFEE.costInstance)) + Number(jabFEE.fee)).toFixed(3);
            setTotalAmount(totalAmount);
        }
    }

    function receivedFromSwitch(value){
        // console.log(`Received from switch:${value}`);
        setAddMoreDetails(value);
    }

    return (
        <div className="contNFTworker">
            {
                messageUser && 
                <Mesaggertop  
                    message={"We recommend issue a max of 20 - 29 tokens in one operation.\nWhen issuing a batch of more than 30 tokens, errors may be present.\nPlease visit the documentation, for available options."}
                    enableTime={true}
                    timeToHide={6500}
                    callBack={() => setMessageUser(false)}
                    linkToVisit={"/"}
                    linkText={"Docs Center - JAB"}
                />
            }
            {
                errorFatal && 
                    <Abswrapper>
                        <Importantmsg message={errorData} clickToClose={() => setErrorFatal(false)} />
                    </Abswrapper>
            }
            {
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
            }
        <div className={`standardFlexCol100w ${working ? 'disableDiv': null}`}>
            {
                working && 
                <div className="loaderMini">
                    <Loader logginIn={true} type={"blocks"} />
                </div>
            }
            {
                    (bee) && 
                    <div>
                        <ul className="standardUlHorMini backGBaseColor">
                            <li>My {bee.symbol}s: <span style={{ color: 'red'}}>{Number(bee.balance).toFixed(3).toString()}</span></li>
                            <li>Actual System Fee: <span style={{ color: 'red'}}>{jabFEE.fee} {jabFEE.currency}</span></li>
                            <li>Cost Per Instance:<span style={{ color: 'red'}}> {jabFEE.costInstance} {jabFEE.costCurr}</span></li>
                        </ul>
                        <form ref={formRef} className="standardFormHor relativeDiv colorX">
                            <label htmlFor="symbol">Token's Name:</label>
                            <input name="symbol" type="text" onChange={changeInput} className={sameName ? 'alertInput': null}/>
                            { sameName && <span className="spanAbs">Name Exists! Choose a different one please.</span>}
                            <label htmlFor="nft_amount">Amount:</label>
                            <input name="nft_amount" defaultValue="0" type="text" onChange={calculateAmount} />
                            <p>Total to Pay: {totalAmount.toString()} {jabFEE.acceptedCur}</p>
                        </form>
                        <Btnswitch 
                            sideText={"Add more Details"} 
                            btnAction={(cen) => receivedFromSwitch(cen)} 
                            showValueDevMode={false}
                        />
                        {
                            addMoreDetails &&
                                <div>
                                    <form className="formVertFlex">
                                        <label htmlFor="name">Token's Name:</label>
                                        <input name="name" type="text" onChange={(e)=> setValueNFT(e.target.name,e.target.value)}/>
                                        <label htmlFor="orgName">Organization Name:</label>
                                        <input name="orgName" type="text" onChange={(e)=> setValueNFT(e.target.name,e.target.value)} />
                                        <label htmlFor="productName">Product Name:</label>
                                        <input name="productName" type="text" onChange={(e)=> setValueNFT(e.target.name,e.target.value)} />
                                        <label htmlFor="url">URL:</label>
                                        <input name="url" type="text" onChange={(e)=> setValueNFT(e.target.name,e.target.value)} />
                                        <label htmlFor="maxSupply">Max Supply:</label>
                                        <input name="maxSupply" type="text" onChange={(e)=> setValueNFT(e.target.name,e.target.value)} />
                                    </form>
                                </div>
                        }
                        {
                            (totalAmount > 0) && 
                            <div className="justTopMargin standardFlex200 border1pxContrast">
                                <button onClick={askTransfer} className="textShadowBasic">SEND payment</button>
                            </div>
                        }
                    </div>
                }
                {
                    newNFT && 
                    <div className="darkText">
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
                    <ul className="standardUlHorSmall" className="darkText">
                        <li>We have New instance(s) of:{newNFT.symbol} now Owned by:{account}</li>
                        
                        {
                            instances.map(instance => {
                                return (
                                    <li key={`${instance._id}-newInstanceIssuedJAB`} className="darkText">
                                        ID: {instance._id} - owned By: {account} {instance.properties.hasOwnProperty("isPremium") ? `Premium:${instance.properties.isPremium.toString()}` : null}
                                    </li>
                                )
                            })
                        }
                    </ul>
                    </div>
                }
        </div>
        </div>
    )
}

export default Nftcreator;