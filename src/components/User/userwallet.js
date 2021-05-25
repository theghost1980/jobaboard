import React, { useState, useEffect } from 'react'
import { check } from '../../utils/helpers';
import axios from 'axios';
import Img from 'gatsby-image';
import { Link, useStaticQuery, graphql, navigate } from 'gatsby';
import Loader from '../loader';
import Jobitoassistant from './jobitoassistant';
import { useForm } from 'react-hook-form';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
import Btninfo from '../btns/btninfo';
import Btnoutlink from '../btns/btnoutlink';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
//testing SSCjs library
const SSC = require('sscjs');
const ssc = new SSC('https://api.hive-engine.com/rpc');
// const ssc = new SSC(process.env.GATSBY_testSSCNodeURL+"rpc"); //as use the test node for now so we can play with fake balances.
const nftEP = process.env.GATSBY_nftEP;
const dhive = require("@hiveio/dhive");
const client = new dhive.Client([ "https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network","https://hived.privex.io/"]);
const privateKey = dhive.PrivateKey.fromString(process.env.GATSBY_secretJAB);
const postingKey = dhive.PrivateKey.fromString(process.env.GATSBY_postingKey);
const ssc_test_id = "ssc-testNettheghost1980";
const masterTestTokenSymbol = "HIVETEST";
const quantityTransfer = "1000"; 
const noIconUrl = "https://res.cloudinary.com/dbcugb6j4/image/upload/v1621712575/file_1621712573714_rocket-emji_h1r5np.png";
const iconMasterTokenUrl = "https://res.cloudinary.com/dbcugb6j4/image/upload/v1621874972/JAB_beta_tokens_oydeaz.png";
const create_dict = [
    { 
        step: 1, json: [{
            "contractName": "tokens",
            "contractAction": "create",
            "contractPayload": {
                "symbol": masterTestTokenSymbol,
                "name": "JAB testing tokens",
                "precision": 8,
                "maxSupply": "10000000",
                "url": "jobaboard.net",
            }
        }],
        key: 'private',
    },
    {
        step: 2, json:[{
            "contractName": "tokens",
            "contractAction": "updateMetadata",
            "contractPayload": {
                "symbol": masterTestTokenSymbol,
                "metadata": {
                    "icon": iconMasterTokenUrl,
                }
            }
        }],
        key: 'posting',
    },
    { 
        step: 3, json: [{
            contractName: "tokens",
            contractAction: "issue",
            contractPayload: {
                symbol: masterTestTokenSymbol,
                to: "jobaboard",
                quantity: quantityTransfer,
            }
        }],
        key: 'private',
    },
];
//END testing
const msgInfoWallet = "Use the deposit button to import the desired amount of HIVE, it will automatically convert to SWAP.HIVE which is the currency used to create your own Tokens.\nThe withdraw button will convert your SWAP.HIVE back to HIVE and return it to your HIVE wallet.\n*There is a 1% fee when converting between HIVE and SWAP.HIVE.";

const Userwallet = () => {
    const { register, handleSubmit, errors } = useForm(); // initialize the hook

    const userdata = check();
    const [tokenList, setTokenList] = useState([]); //we will bring only one for now setted as the testserver, as it HIVE + JAB.
    const [tokens, setTokens] = useState([]); //the ones we are using for testing
    const [testTokens, setTestTokens] = useState({ symbol: masterTestTokenSymbol, balance: 0 });
    const [realTokens, setRealTokens] = useState([]); //the real balances to show to user as another tab.
    const [noTokens, setNoTokens] = useState(false);
    const [action, setAction] = useState('');
    const [tx, setTx] = useState(null);
    const [step, setStep] = useState(null); //by default so we use the first json on dict.
    const [masterCreated, setMasterCreated] = useState(false);
    const [creatingToken, setCreatingToken] = useState(false);
    const [mustCreateTestToken, setMustCreateTestToken] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [userTopUp, setUserTopUp] = useState(false);

    //graphql queries
    const data = useStaticQuery(graphql`
       query {
           depositIcon: file(relativePath: {eq: "topUp.png"}) {
               childImageSharp {
                   fixed(width: 35) {
                       ...GatsbyImageSharpFixed_withWebp
                   }
               }
           }
           withdrawIcon: file(relativePath: {eq: "withdraw.png"}) {
               childImageSharp {
                   fixed(width: 35) {
                       ...GatsbyImageSharpFixed_withWebp
                   }
               }
           }
           infoIcon: file(relativePath: {eq: "info.png"}) {
               childImageSharp {
                   fixed(width: 20) {
                       ...GatsbyImageSharpFixed_withWebp
                   }
               }
           }
       }
   `);
   //end grapqhql queries

    //just for testing - TODO -> remove later on
    // useEffect(() => {
    //     console.log(iconsTokens);
    //     if(iconsTokens.length > 0){
    //         console.log(iconsTokens.filter(tok => tok.nameToken === "WEED").map(icon => icon.iconToken));
    //     }
    // },[iconsTokens])
    //end just testing

    //to load On state changes
    useEffect(() => { if(tx){ setTimeout(getInfoTX,3000) }; }, [tx]);
    useEffect(() => {
        if(step){
            const json = create_dict.find(dict_step => dict_step.step === step).json;
            console.log('Using json as:', json);
            const key = create_dict.find(dict_step => dict_step.step === step).key;
            const currentKey = (key === 'private') ? privateKey : postingKey;
            const required_auths = (key === 'private') ? ['jobaboard'] : [];
            const required_posting_auths = (key === 'private') ? [] : ['jobaboard'];
            if(topUpUser){ json[0].contractPayload.to = userdata.username; };
            console.log('About to transmit:', {json: json, id: ssc_test_id, step: step, key: key });
            const data = { id: ssc_test_id, json: JSON.stringify(json), required_auths: required_auths, required_posting_auths: required_posting_auths,};
            client.broadcast.json(data, currentKey)
            .then(result => {
                console.log(result);
                setTx(result.id);
            }).catch(error => {
                console.log('Error while creating Master Token.',error);
            });
        }
    },[step]);
    //END to load On state changes

    //all togheter one function on mount
    useEffect(() => {
        updateFakeBalances();
        ssc.find('tokens', 'balances', { account:  userdata.username }, 100, 0, [], (err, result) => {
            if(err) return console.log('Error fetching on SSCjs',err);
            // console.log(result);
            setRealTokens(result);
        });
        //check if admin logged && master test token exists.
        if(userdata.usertype === 'admin'){
            const query = { contract: 'tokens', table: 'tokens', query: { symbol: masterTestTokenSymbol }, limit: 1, offset: 0, indexes: [], }; //{ contract: '', table: '', query: {}, limit: 0, offset: 0, indexes: [] };
            const headers = { 'x-access-token': userdata.token, 'query':JSON.stringify(query)};
            dataRequest(nftEP+"queryContractTable", "GET", headers, null).then(response =>{
                console.log(response);
                if(response.status === 'sucess' && response.result.length === 0){ //test token has not been created
                    setMustCreateTestToken(true);
                }
            }).catch(error => console.log('Error getting tokens from BE.', error));
        }
    },[])

    // useEffect(() => {
    //     //tokens added now we can lookUp icons + set
    //     if(realTokens.length > 0 && iconsTokens.length < realTokens.length){
    //         realTokens.map(item => {
    //             //find each icon
    //             console.log('Searching Icons.')
    //             ssc.find('tokens', 'tokens', { symbol: item.symbol }, 100, 0, [], (err, result) => {
    //                 if(err) return console.log('Error getting icon for token', err);
    //                 console.log(result);
    //                 const metaData = JSON.parse(result[0].metadata);
    //                 const iconToken = metaData.icon ? metaData.icon : noIconUrl ;
    //                 addnewItem({ nameToken: item.symbol, iconToken: iconToken});
    //             })
    //         });
    //     }
    // },[realTokens]);
    useEffect(() => {
        //tokens added now we can lookUp icons + set
        if(tokens.length > 0){
            const tokens_symbols = tokens.map(token => token.symbol);
            console.log('Searching Fake Icons.', tokens_symbols);
            const query = { contract: 'tokens', table: 'tokens', query: { symbol: { $in: [...tokens_symbols] } }, limit: 0, offset: 0, indexes: [], }; //{ contract: '', table: '', query: {}, limit: 0, offset: 0, indexes: [] };
            const headers = { 'x-access-token': userdata.token, 'query':JSON.stringify(query)};
            dataRequest(nftEP+"queryContractTable", "GET", headers, null).then(response =>{
                console.log(response);
                if(response.status === 'sucess'){
                    setTokenList(response.result);
                    setLoadingData(false);
                }
            }).catch(error => {
                console.log('Error getting tokens from BE.', error);
                setLoadingData(false);
            });
        }
    },[tokens]);
    // useEffect(() => {
    //     if(faceIconsTokens.length > 0){
    //         faceIconsTokens.forEach(testTkn => {
    //             console.log(testTkn);
    //             const iconToken = {};
    //             if(testTkn.metadata){
    //                 const metaData = JSON.parse(testTkn.metadata);
    //                 iconToken.nameToken = testTkn.symbol;
    //                 iconToken.iconToken = metaData.icon ? metaData.icon : noIconUrl;
    //             }else if(testTkn.iconToken){
    //                 iconToken.iconToken = testTkn.iconToken;
    //                 iconToken.nameToken = testTkn.nameToken;
    //             }
    //             addnewItem2(iconToken);
    //         });
    //     }
    // },[faceIconsTokens]);

    ////////fetch requests as async functions
    async function getDataRPC(RPC = '', route, query) {
        axios.post(RPC + route, query)
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.log("Error on RPC request", error);
        })
    };
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata   ? fetch(url, { method: requestType, contentType: 'application/json', headers: headers,})
                                        : fetch(url, { method: requestType, contentType: 'application/json', headers: headers, body: formdata});
        return (await response).json(); 
    };
    ////////END fetch requests

    //general functions/cb to make later on helpers
    const topUpUser = () => {
        setUserTopUp(true);
        setStep(3);
    }
    function updateFakeBalances(){
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ contract: 'tokens', table: 'balances', query: { account:  userdata.username }, limit: 100, offset: 0, indexes: [] }) }; //{ contract: '', table: '', query: {}, limit: 0, offset: 0, indexes: [] };
        dataRequest(nftEP+"queryContractTable", "GET", headers, null).then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                if(response.result.length === 0){
                    setNoTokens(true);
                }else{
                    setTokens(response.result);
                    const found = response.result.find(tkn => tkn.symbol === testTokens.symbol);
                    if(found){
                        const myTestBalances = { symbol: masterTestTokenSymbol, balance: found.balance };
                        console.log('Setting the test balances as:', myTestBalances);
                        setTestTokens(myTestBalances);
                    }
                }
            }
        }).catch(error => console.log('Error getting tokens balances on test node BE.', error));
    }
    function fixNumber(number, decPos){
        const n = Number(number).toFixed(decPos)
        return n.toString();
    }
    function addnewItem(item){
        // setBlocks(previousState => [...previousState, result.data.result ]);
        setIconsTokens(previuosState => [...previuosState, item]);
    }
    function addnewItem2(item){
        // setBlocks(previousState => [...previousState, result.data.result ]);
        setFaceIconsTokens(previuosState => [...previuosState, item]);
    }
    function getIcon(token){
        const symbol = token.symbol;
        const found = tokenList.find(tkn => tkn.symbol === symbol);
        if(found.metadata){
            const pMD = JSON.parse(found.metadata);
            if(pMD.icon){
                return pMD.icon;
            }else{
                return noIconUrl
            }
        }
        return noIconUrl
    }
    function resetAll(){
        setTokenList([]); //so it will be reset.
        updateFakeBalances();
        if(topUpUser){
            setUserTopUp(false);
        }else{
            setMasterCreated(true);
        }
        setTx(null);
        setStep(null);
    }
    function getInfoTX(){
        if(tx){
            console.log(`Checking on: ${tx}`);
            const headers = {
                'x-access-token': userdata.token,
                'tx': tx,
            }
            dataRequest(nftEP + "tx", "GET", headers, null)
            .then(response => {
                console.log(response);
                if(response.status === "askAgain"){
                    return setTimeout(getInfoTX,3000);
                }else{
                    console.log(response); //on sucess logs: {"events":[{"contract":"tokens","event":"transfer","data":{"from":"jobaboard","to":"null","symbol":"BEE","quantity":"100"}}]}
                    if(response.action === 'create' && response.contract === 'tokens'){
                        const pLogs = JSON.parse(response.logs);
                        console.log(pLogs); //events as array so we must filter.
                        if(!pLogs.errors){
                            if(pLogs.events && pLogs.events.find(event => event.event === 'transfer' && event.contract === 'tokens')){ //measn we have the new master token. Now we can issue. To test issue 100 to jobaboard and reload fake balances.
                                console.log('Token created, about to apply the icon to the newly created Token.');
                                createJABSWIPE(2);
                            }
                        }else{
                            const errores = pLogs.errors.join(' \n');
                            alert(errores);
                            setTx(null);
                            setCreatingToken(false);
                            setStep(null);
                        }
                    }else if(response.action === 'issue' && response.contract === 'tokens'){ //on sucess logs: {"events":[{"contract":"tokens","event":"transferFromContract","data":{"from":"tokens","to":"jobaboard","symbol":"TESTTTTTT","quantity":"100"}}]}
                        const pLogs = JSON.parse(response.logs);
                        console.log(pLogs); //events as array so we must filter.
                        if(!pLogs.errors){
                            if(pLogs.events && pLogs.events.find(event => event.event === 'transferFromContract' && event.contract === 'tokens')){ //measn we have the new master token. Now we can issue. To test issue 100 to jobaboard and reload fake balances.
                                const dataTranfer = pLogs.events.find(event => event.event === 'transferFromContract' && event.contract === 'tokens').data;
                                if(dataTranfer){
                                    const { from, to, symbol, quantity } = dataTranfer;
                                    if(from === 'tokens' && to === 'jobaboard' && symbol === masterTestTokenSymbol && quantity === quantityTransfer ){
                                        alert(`We have a new Test Master Token Enabled.\nToken Symbol: ${masterTestTokenSymbol}\nSent to main account: ${quantity} Tokens.\nUpdating Balance.`);
                                        resetAll();
                                    }
                                    if(topUpUser && to === userdata.username && symbol === masterTestTokenSymbol && quantity === quantityTransfer ){
                                        alert(`You have a new top up of ${quantity}. You may play with Gigs & NFTs.`);
                                        resetAll();
                                    }
                                }
                            }
                        }else{
                            const errores = pLogs.errors.join(' \n');
                            alert(errores);
                        }
                    }else if(response.action === "updateMetadata" && response.contract === 'tokens'){
                        if(response.logs === "{}"){ //on sucess //logs: "{}"
                            console.log('Updated the icon, passing to final stage. Transfer 100 to main account.');
                            createJABSWIPE(3);
                        }
                    } 
                }
            })
            .catch(error => { console.log('Error asking data ssc on BE',error); });
        }
    }
    //end general functions/cb

    function addIconsTokens(){
        if(tokens.length > 0 && tokens){
            tokens.map(token => {
                console.log(token);
                ssc.find('tokens', 'tokens', { symbol: token.symbol }, 100, 0, [], (err, result) => {
                    if(err) return console.log('Error getting icon for token', err);
                    // console.log(result);
                    //set the user's token
                    const metaData = JSON.parse(result[0].metadata);
                    // console.log(metaData);
                    const iconToken = metaData.icon;
                    // console.log(iconToken);
                    addnewItem({ nameToken: token.symbol, iconToken: iconToken});
                })
            });
        }
    }

    //functions/CB
    const createJABSWIPE = (setStepTo) => {
        setCreatingToken(true);
        setStep(setStepTo);
    }
    //END functions/CB

    //TODO possible ideas to do here check this out
    // <ul className="textNomarginXXSmall">
    //     <li>Ideas TODO Here</li>
    //     <li>Allow user to topUp/widthdraw any coin they need. I.e: Orbs,LEO,etc.</li>
    //     <li>By using a existing contract that allow todo so, and just invoking it using hive keychain.</li>
    // </ul>

    return (
        <div className="justMinHeight300px">
            <Tabs>
                <TabList>
                    {/* <Tab>
                        <div className="standardDivRowFullW justAligned">
                            <h3>My Test Balances</h3>
                            <Btninfo size={"mini"} msg={"As we need to test the whole platform we must play with fake balances. If you need to add balance for testing, just contact an admin using support."} />
                        </div>
                    </Tab> */}
                    <Tab>
                        <div className="standardDivRowFullW justAligned">
                            <h3>My Tokens Balances</h3>
                            <Btninfo size={"mini"} msg={"Token Balances you hold in HIVE chain."} />
                        </div>
                    </Tab>
                </TabList>
                {/* <TabPanel>
                {
                    testTokens.balance === 0 && !loadingData &&
                    <div>
                        {
                            userTopUp ?
                            <div className="standardDivRowFlex100pX100pCentered"><Loader logginIn={userTopUp} /></div>
                            :
                            <div>
                                <p>Your actual balance of {masterTestTokenSymbol} is 0.</p>
                                <p>Please Top up some more by clicking bellow.</p>
                                <button onClick={topUpUser}>Top Up 1000</button>
                            </div>
                        }
                    </div>
                }
                {
                    loadingData &&  <div className="standardDivRowFlex100pX100pCentered"><Loader logginIn={loadingData} /></div>
                }
                {
                    tokens.length > 0 && tokenList.length > 0 && !loadingData &&
                    <ul className="ulTokenWallet justHeight250pOverX backGroundColorBlueJab justRounded justSpaceAround">
                        {
                            tokens.map(token => {
                                return (
                                    <li key={`${token._id}`} className="marginLeft marginRight">
                                        <div className="walletTokenCont">
                                            <img src={getIcon(token)} className="iconToken" />
                                            <p className="walletUserAmount justMiniPadding">{String(token.symbol).substring(0,1) + String(token.symbol).substring(1).toLowerCase()}: {fixNumber(token.balance,2)}</p>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                }
                </TabPanel> */}
                <TabPanel>
                {
                    loadingData &&  <div className="standardDivRowFlex100pX100pCentered"><Loader logginIn={loadingData} /></div>
                }
                {
                    realTokens.length > 0 && tokenList.length > 0 && !loadingData &&
                    <ul className="ulTokenWallet justHeight250pOverX backGroundColorBlueJab justRounded justSpaceAround">
                        {
                            realTokens.map(token => {
                                return (
                                    <li key={`${token._id}`} className="marginLeft marginRight">
                                        <div className="walletTokenCont">
                                            <img src={getIcon(token)} className="iconToken" />
                                            <p className="walletUserAmount justMiniPadding">{String(token.symbol).substring(0,1) + String(token.symbol).substring(1).toLowerCase()}: {fixNumber(token.balance,2)}</p>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                }
                </TabPanel>
            </Tabs>
            <div className="justMargin0auto textAlignedCenter">
                <Btnoutlink xtraIcon={true} xclassCSS={"normalTextSmall justWidth200"} textLink={"discover more tokens"} link={"https://hive-engine.com/"}/>
            </div>
            {/* {
                userdata && userdata.usertype === 'admin' && !masterCreated && !creatingToken && mustCreateTestToken &&
                <div className="justBordersRoundedMarginB">
                    <div className="standardContentMargin">
                        <p>Hi there Admin: {userdata.username}</p>
                        <p>JAB has detected that the Test token: {masterTestTokenSymbol} must be created.</p>
                        <p>Please click the buttom bellow and wait for it.</p>
                        <button onClick={() => createJABSWIPE(1)}>Create Master Token</button>
                    </div>
                </div>
            } */}
            {/* {
                creatingToken && !masterCreated && <div className="standardDivRowFlex100pX100pCentered"><Loader logginIn={creatingToken} /></div>
            } */}
        </div>
    )
}

export default Userwallet;


// removed code for topup balances as we are using HIVE to all buy/sell/casting important transactions

  //testing the SSCJS library
    // const ssc = new SSC('https://api.hive-engine.com/rpc');
    //     ssc.stream((err, res) => {
	//     console.log(err, res);
    // });
    // function getInfoUser(){
    //     // find first token for this user
    //     // ssc.findOne( 'tokens', 'balances', { account:  'theghost1980' }, (err, result) => {
    //     //     console.log(err, result);
    //     // });

    //     //get all tokens available
    //     // ssc.find('tokens', 'tokens', { }, 1000, 0, [], (err, result) => {
    //     //     console.log(err, result);
    //     // });

    //     ssc.find('tokens', 'balances', { account:  'theghost1980' }, 100, 0, [], (err, result) => {
    //         if(err) return console.log('Error fetching on SSCjs',err);
    //         console.log(result);
    //         //set the user's token
    //         setTokens(result);
    //     })
    // }

// function oneTokenData(name){
    //     const nameToken = name;
    //     //get contract info for one token
    //     ssc.find('tokens', 'tokens', { symbol: nameToken } , 1000, 0, [], (err, result) => {
    //         if(err) return console.log('Error fetching on SSCjs',err);
    //         console.log(result);
    //         //set the user's token
    //         const metaData = JSON.parse(result[0].metadata);
    //         console.log(metaData);
    //         const iconToken = metaData.icon;
    //         console.log(iconToken);
    //         addnewItem({ nameToken: nameToken, iconToken: iconToken});
    //     });
    // }

    // function processInput(value){
    //     const num = Number(value).toFixed(3);
    //     return String(num);
    // }

    // const onSubmit = async (data) => {
    //     if(data.amount <= 0) { return null };
    //     console.log(data);
    //     const toAccount = "honey-swap";
    //     // const memo = {"id":"ssc-mainnet-hive","json":{"contractName":"hivepegged","contractAction":"buy","contractPayload":{}}};
    //     const memo = "DepositN-112";
    //     const currency = "HIVE";
    //     const amount = processInput(data.amount);
    //     // TODO function to always return 3 decimal points
    //     // important
    //     if(action === "deposit"){
    //         //we make a depo
    //         const keyChain = await keychain(window, 'requestTransfer', userdata.username, toAccount, amount, memo, currency);
    //         const {data, success, msg, cancel, notActive} = keyChain;
    //         if(success){ 
    //             //do something on sucess of deposit.
    //             // reload the component????
    //         }else if(!cancel) {
    //             if(notActive) {
    //                 console.log('Please allow Keychain to access this website');
    //             } else {
    //                 console.log(msg);
    //                 console.log(keyChain);
    //             }
    //         }else if (cancel){
    //             //user cancelled so...
    //             console.log('Cancelled by User');
    //         }
    //     }else if(action === "withdraw"){
    //         //we make a withdraw
    //     }
    // };

    // <div className="standardDiv50Percent">
    //     <ul className="ulActionsWallet">
    //         <li>
    //             <button onClick={() => setAction('deposit')}>Top Up</button>
    //             <Img fixed={data.depositIcon.childImageSharp.fixed} className="iconWalletAction" />
    //         </li>
    //         <li>
    //             <button onClick={() => setAction('withdraw')}>Widthdraw</button>
    //             <Img fixed={data.withdrawIcon.childImageSharp.fixed} className="iconWalletAction"  />
    //         </li>
    //         <li>
    //             <Btninfo msg={msgInfoWallet} />
    //         </li>
    //     </ul>
    //     {
    //         !(tokens.length > 0 && iconsTokens.length > 0) && (!noTokens) &&
    //         <div className="standardDivRowFlex100pX100pCentered">
    //             <Loader logginIn={true} />
    //         </div>
    //     }
    //     {
    //         (action !== '') &&
    //             <div className="actionContainer">
    //                 <form onSubmit={handleSubmit(onSubmit)}>
    //                     <div className="standardRowDiv">
    //                         <p>Amount </p>
    //                         <input name="amount" ref={register({ pattern: /[0-9.]+/, required: true })} 
    //                             className="inputValueNum"
    //                             pattern="[0-9.]+"
    //                             title="Only Numbers and Dots."
    //                             defaultValue="0.000"
    //                         />
    //                         <p>to {action}</p>
    //                     </div>
    //                     {errors.amount && <p className="warningTextSmall centered">Please numbers Only!</p>}
    //                     <div className="standardRowDiv spaceEvenly marginBottom">
    //                         <button>Go! let's {action}</button>
    //                         <button onClick={() => setAction('')}>cancel</button>
    //                     </div>
    //                 </form>
    //             </div>
    //     }
    // </div> 