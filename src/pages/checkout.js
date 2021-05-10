import React, { useState, useEffect } from 'react';
//components
// TODO layout must transform itself as different layots
// - for check out should be minimal, like just logo and menu to avoid user "crazyness".
import Layout from '../components/layout';
import { getStoredField, check } from '../utils/helpers';
import Btnswitch from '../components/btns/btnswitch';
import Img from 'gatsby-image';
import { useStaticQuery, graphql, navigate } from 'gatsby';
import Btninfo from '../components/btns/btninfo';
import Btnoutlink from '../components/btns/btnoutlink';
//hiveio/keychain
import { isKeychainInstalled } from '@hiveio/keychain';
import Loader from '../components/loader';
import Btnprint from '../components/btns/btnprint';

// TODO
// We must see if we need to handle the jobpreviews as a page instead of a inner component, as
// when we finish this result we may present the option to present the option to the user to review the initial job
// as we are handling this right now it will take more work and it is out of standards I think.

//contants
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const orderEP = process.env.GATSBY_orderEP;
// TODO take this on .env file
const jabFEE = { fee: "0.002", currency: "HIVE", costInstance: "0.001", costCurr: "HIVE", acceptedCur: "HIVE"};
const dhive = require("@hiveio/dhive");
const client = new dhive.Client([ "https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network","https://hived.privex.io/"]);
const privateKey = dhive.PrivateKey.fromString(process.env.GATSBY_secretJAB);
const ssc_id = "ssc-testNettheghost1980";
const nftEP = process.env.GATSBY_nftEP;

const Checkout = (props) => {
    // const logged = getStoredField("logged");
    // if(!logged || !props.location.state.job_id){
    //     navigate("/");
    //     return null
    // }
    const userdata = check();
    // console.log(props);
    const { state } = props.location;
    const [tx, setTx] = useState(null);
    const [jobSelected, setJobSelected] = useState(null);
    const [moreDetails, setMoreDetails] = useState(false);
    const [resultsOP, setResultsOP] = useState(null);
    const [results, setResults] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [order, setOrder] = useState({
        username_employer: "", //the ones who serves the order
        username_employee: "", //the ones who ask this gig/job
        note: "", //used for 'cancellation' or "anything else needed".
        nft_id: 0,
        nft_symbol: "",
        nft_amount: 0, //represent the amount of NFTs the user will give/get, depending on order type. This field is important to know how many instances will be sent/received.
        nft_price_on_init: 0, //respresent the price when the order was emitted. In case we may want to allow users to change prices on their nft later on without affecting on going orders.
        job_id: "",
        job_title: "", //used to check if maybe the user placed the same order twice.
        days_to_complete: 0, //as default 1.
        category_job: "",
        sub_category: "",
        escrow_type: "", //could be 'system' or 'username'.
        job_type: "", //as employee or employeer, reference of this job (optional maybe)
        sub_total: 0,
        extra_money: 0,
        total_amount: 0, //in case we add later on extra features or quantity.
        tx_id: "", //as the txId of this transference when successfull as paid.
        createdAt: new Date().toString(),
        special_requirements: "", //if the employee needs more specifications.
    });

    //Grapqhl queries
    const data = useStaticQuery(graphql`
        query{
            acceptedAll: file(relativePath: {eq: "accepted_cryptosJAB.png"}) {
                childImageSharp {
                    fixed(width: 200) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            keyChainLogo: file(relativePath: {eq: "keychain_logo.png"}) {
                childImageSharp {
                    fixed(width: 100) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries

    //to load on init
    useEffect(() => {
        if(state && userdata.logged){
            console.log(state);
            if(state._id && state.nft_symbol){
                setJobSelected(state);
                //set some fields
                updateOrderState("username_employee", state.username);
                updateOrderState("username_employer", userdata.username);
                updateOrderState("job_id", state._id);
                updateOrderState("job_title", state.title);
                updateOrderState("days_to_complete", state.days_to_complete);
                updateOrderState("category_job", state.category);
                updateOrderState("sub_category", state.sub_category);
                updateOrderState("escrow_type", state.escrow_type);
                updateOrderState("job_type", state.job_type);
                updateOrderState("nft_amount",state.paying_price);
                //get the token price.
                const query = { symbol: state.nft_symbol, account: null,};
                console.log(query);
                sendGETBEJustH(nfthandlermongoEP + "getNFTquery",query,0, { "null": null })
                .then(response => {
                    // console.log(response);
                    if(response.status === 'sucess' && response.result.length === 1){
                        // we may add it to myHoldings
                        updateOrderState("nft_id", response.result[0].nft_id);
                        updateOrderState("nft_symbol", response.result[0].symbol);
                        updateOrderState("nft_price_on_init",Number(response.result[0].price_base_on_cast));
                        updateOrderState("sub_total", (Number(response.result[0].price_base_on_cast) * Number(state.paying_price)).toFixed(5));
                        updateOrderState("total_amount", (Number(response.result[0].price_base_on_cast) * Number(state.paying_price)).toFixed(5));
                    }
                }).catch(error => console.log('Error asking for NFTs on this user from DB, mongo.',error));
            }else{
                // console.log('Not job_id present on State! redirect');
                navigate("/");
            }
        }else{
            // console.log('Not State present! redirect');
            navigate("/");
        }
    }, []);
    //END to load on init

    //to load on state changes
    useEffect(() => {
        if(resultsOP){
            // console.log(resultsOP);
            if(resultsOP.status === 'sucess' || resultsOP.status === 'test'){
                //send the formdata to BE and generate virtual receipt.
                const formdata = new FormData();
                const newNode = {};
                Object.entries(order).forEach(([key, val]) => { 
                    formdata.append(key,val);
                    return (newNode[key] = val)
                });
                // console.log('About to print on BE:');
                // console.log(newNode);
                // TODO now print on BE and get results back
                const filter = JSON.stringify({ username_employer: order.username_employer, username_employee: order.username_employee, job_title: order.job_title });
                const headers = { 'x-access-token': userdata.token, 'filter':  filter};
                sendPostWH(`${orderEP}createOrder`,formdata,headers)
                .then(response => {
                    if(response.auth === false || response.status === 'failed'){
                        console.log('Error on addition!',response.message);
                        // setLoading(false);
                        setLoadingData(false);
                    }else{
                        console.log(response);
                        if(response.status === 'sucess'){
                            console.log('Order Created!');
                            // todo later on, we may do something with response.data
                            setLoadingData(false);
                            // setResultsOP({ status: 'finished', result: response.result});
                            setResults(response.result);
                            // const headers = { 'x-access-token': userdata.token, 'toprocess': JSON.stringify({ from: order.username_employee, to: order.username_employer, nft_id: order.nft_id,  symbol: order.nft_symbol, amount: order.nft_amount, order_id: response.result._id})};
                            // sendPostWH(nftEP+"castNfts",{},headers)
                            // .then(response => {
                            //     console.log(response);
                            //     //TODO handle this maybe:
                            //     // Add this response as a local notification and send it to server as well.
                            //     //maybe we should have a notifications component for special as this one. or just use topmessenger

                            // }).catch(error => {
                            //     console.log('Error on request nft to BE.',error);
                            // })

                            // in order to make things easier, i will handle the instantiation locally
                            const arrayJson = jsonArray(order.nft_amount,order.nft_symbol,order.username_employee);
                            const json = {
                                "contractName": "nft",
                                "contractAction": "issueMultiple",
                                "contractPayload": {
                                    "instances": [...arrayJson]
                                },
                            };
                            const data = {
                                id: ssc_id,
                                json: JSON.stringify(json),
                                required_auths: ['jobaboard'],
                                required_posting_auths: [],
                            };
                            client.broadcast
                            .json(data, privateKey)
                            .then(result => {
                                console.log(result);
                                setTx(result.id);
                            }).catch(error => {console.log('Error while creating the NFT.',error)});
                        }
                        //hide loader
                        setLoadingData(false);
                    }
                })
                .catch(error => {
                    console.log('Error while adding user OP data to API + image.',error);
                    setLoadingData(false);
                });

            }else if(resultsOP.status === 'failedRPC'){
                //we must handle this special error
                // TODO
                setLoadingData(false);
            }else if(resultsOP.status === 'failed'){
                //send to Oplogger to write a log on ordersLogs
                // TODO we must create it.
                setLoadingData(false);
            }else if(resultsOP.status === 'user_cancel'){
                //send to Oplogger to write a log on ordersLogs
                // TODO we must create it.
                setLoadingData(false);
            }
        }
    }, [resultsOP]);
    useEffect(() => {
        if(tx){ setTimeout(getInfoTX,3000)}; ////testing on 3s
    },[tx]);
    //TODO for testing to delete  later on
    useEffect(() => {
        console.log('Changes on order:', order);
    },[order]);
    //END to load on state changes

    // functions/CB
    async function processEvent(arrayEvents){
        const nfts = [];
        arrayEvents.map(event => {
            if(event.event === "issue"){
                nfts.push( { ntf_id: Number(order.nft_id), ntf_symbol: order.nft_symbol, nft_instance_id: Number(event.data.id), username: order.username_employer, createdAt: new Date()} )
            }
        });
        const formdata = new FormData();
        formdata.append("nfts",JSON.stringify(nfts));
        
        sendPostBE(nfthandlermongoEP+"addNftInstance",formdata,"YESPLEASE!") //using inserMany for now
        .then(response => console.log(response))
        .catch(error => console.log('Error trying to add new instance.',error));
    }
    function getInfoTX(){
        if(tx){
            console.log(`Checking on: ${tx}`);
            const headers = {
                'x-access-token': userdata.token,
                'tx': tx,
            }
            getSSCData(nftEP + "tx", headers)
            .then(response => {
                console.log(response);
                if(response.status === "askAgain"){
                    return setTimeout(getInfoTX,3000); //recursive to go and check again until the Tx has been propagated on the chains.
                }else{
                    if(response.logs){
                        const logs = JSON.parse(response.logs);
                        console.log('Process should be finished here. Move on Dev!');
                        console.log(logs);
                        setLoadingData(false);
                        const tknContracts = logs.events.filter(log => log.contract === "tokens");
                        const nftContracts = logs.events.filter(log => log.contract === "nft");
                        // console.log(tknContracts,nftContracts);
                        if(Number(order.nft_amount) === tknContracts.length && Number(order.nft_amount) === nftContracts.length){
                            //was succesfull dunno if we must handle in case of an error of issuing less than amount???
                            alert(`You have the tokens on your balance. Go to tokens > My holdings`);
                            processEvent(logs.events);
                        }
                        if(logs.errors){
                            //todo handle errors
                        }
                    }
                }
            })
            .catch(error => { console.log('Error asking data ssc on BE',error)});
        }
    }
    function jsonArray(_amount,symbol,to){
        const feeSymbol = "BEE";
        const arrayJson = [];
        for(let i = 0; i < _amount ; i++){
            const payload = {
                "fromType": "user",
                "symbol": String(symbol),
                "to": to,
                "feeSymbol": feeSymbol,
            }
             arrayJson.push(payload);
        }
        return arrayJson;
    }
    const processPayment = () => {
        if(isKeychainInstalled){
            setLoadingData(true);
            const memo = `Order of Gig/Job-${jobSelected._id} on Job A Board.`
            const total_amount = Number(order.total_amount).toFixed(3);
            // updateOrderState("total_amount", Number(total_amount));

            //just for testing now DELETE LATER
            // updateOrderState("tx_id", "AGGSHTESTEST");
            // setResultsOP({ status: 'test'});
            //just for testing now DELETE LATER
            
            // TODO we must be sure the order is not already placed.
            // So before calling the transfer we must just check using the filter
            // if not found then proceed to transfer. So we dont have to refund money or anything else.

            window.hive_keychain.requestTransfer(order.username_employer, order.username_employee, total_amount, memo, jabFEE.acceptedCur, function(result){
                const { message, success, error } = result;
                console.log(result);
                if(!success){
                    if(error !== "user_cancel"){
                        const { error, cause, data } = result.error;
                        if( cause.name && cause.name === "RPCError"){
                            // addStateOP({ state: 'Fatal Error', data: { error: JSON.stringify(result.error)} });
                            if(showValueDevMode){ console.log('Error RPCError,', message)};
                            return setResultsOP({
                                status: 'failedRPC', results: message,
                            });
                        }
                        // TODO send the log as well and register the event.
                        // TODO: ALL this process must finish presenting to user
                        // - A msg that "His/her funds are safe as we have registered it" & "Take note of the system log, in case support contacts you during the next 24 hrs."
                        // - A final msg as "You may continue doing the same operation and we will send your money back as soon as possible or contact support if any available".
                        // console.log('Error while transfering', message);
                        //return result object as { status: 'failed', results: message }
                        setResultsOP({
                            status: 'failed', results: message,
                        });

                    }else if(error === "user_cancel"){
                        // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
                        // console.log('User click on cancel!');

                        //return result object as { status: 'cancelled_user', results: new Date().toString() }
                        setResultsOP({
                            status: 'user_cancel', results: new Date().toString(),
                        });
                    }
                }else if (success){
                    const { type, memo, amount, currency, username } = result.data;
                    if( type === "transfer" && 
                        amount === order.total_amount.toString() && 
                        memo === memo 
                        && username === order.username_employer && currency === jabFEE.costCurr){ 
                    }
                    // addStateOP({ state: 'Sucess transferred funds', data: {} });
                    // console.log('Executed successfully. Now check to continue dev work!!!',result.result.id);
                    // setTx({ txid: result.result.id, step: 1});

                    //return result object as { status: 'sucess', results: { txId: result.result.id } }
                    updateOrderState("tx_id", result.result.id);
                    setResultsOP({ status: 'sucess'});
                };
            });
        }else{
            alert('Please allow Hive Key Chain to access this website.\nSome steps you may follow:\n1. Check if extension installed.\n2.Click on it a couple times, to allow access on this web page.\n3.If not installed go to: https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep.');
            setLoadingData(false);
        }
    }
    const addExtra = (cen) => {
        console.log(cen);
        if(order.total_amount){
            const extra = Number(0.10 * order.sub_total).toFixed(3);
            if(cen && order.extra_money === 0){
                updateOrderState("extra_money", Number(extra));
                updateOrderState("total_amount", Number(order.sub_total) + Number(extra));
            }else if(!cen && order.extra_money > 0){
                updateOrderState("extra_money", 0);
                updateOrderState("total_amount", Number(order.total_amount) - Number(extra));
            }
        }
    }
    const processSwitch = (cen) => {
        setMoreDetails(cen);
    }
    function updateOrderState(name,value){
        setOrder(prevState => { return {...prevState, [name]: value}});
    }
    //////data fecthing
    async function getSSCData(url = '', headers) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: headers,
        });
        return response.json(); 
    };
    async function sendPostWH(url = '', formData, headers) {
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            // headers: {
            //     'x-access-token': userdata.token
            // },
            headers: headers,
            body: formData,
        });
        return response.json(); 
    };
    async function sendGETBEJustH(url = '', query = {},limit=Number,sortby = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token,
                'query': JSON.stringify(query),
                'limit': limit,
                'sortby': JSON.stringify(sortby),
            },
        });
        return response.json(); 
    };
    async function sendPostBE(url = '', formdata, insertmany) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'x-access-token': userdata.token, 'insertmany': insertmany },
            body: formdata,
        });
        return response.json(); 
    };
    //////END data fetching
    // END functions/CB
    return (
        <Layout>
            {
                results &&
                <div className="businessPageCont">
                    <h1>Order processed.</h1>
                    <p>Under any issue, do not hesitate our contact support by email or using the messaging system on JAB.</p>
                    <p>If you need you can print this information now or later by accessing your dashboard.</p>
                    <p>Also it can be located within > Jobs > My Orders > (TODO LINK, FE,BE)</p>
                    <p>Important: JAB is creating the tokens for you as we "speak". As soon as they are casted, you will receive a notification.</p>
                    <hr></hr>
                    <div className="standardDivRowFullW relativeDiv">
                        <Btnprint classCSS={"justAbsolutePos scaleHovered standardDivFlexPlain justRight30pTop10p justBorders justRounded"}/>
                        <div className="standardDiv60Percent">
                            <h2>Order ID: {results._id}</h2>
                            <h3>Order TxId on payment: {results.tx_id}</h3>
                            <h3>Status: {results.status}</h3>
                            <p>Job/Gig Title: {jobSelected.title}</p>
                            <p>JABer on this Gig/Job: {jobSelected.username}</p>
                            <p>Category: {jobSelected.category}</p>
                            <p>Already Payed: {jobSelected.paying_price} {jobSelected.nft_symbol} Tokens.</p>
                            <p>Total payed: {order.total_amount} in {jabFEE.acceptedCur}</p>
                            {
                                jobSelected.days_to_complete ?
                                <p>Days to complete: {jobSelected.days_to_complete}.</p>
                                : <p className="warningTextSmall">Warning. This Job/Gig do not have Days to complete, review this with the provider and make a note if possible, before processing it.</p>
                            }
                        </div>
                        <div className="standardDiv30Percent">
                            <img src={jobSelected.images[0]} className="imageMedium"/>
                        </div>
                    </div>
                   
                </div>
            }
            {
                loadingData &&
                <div className="standardDivColFullW justHeight400p">
                    <Loader logginIn={true} typegif={"spin"} />
                </div>
            }
            { jobSelected && jobSelected._id && !loadingData && !results &&
            <div className="businessPageCont justRounded justBorders">
                <div className="standardContentMarginLR">
                    <h1>Checkout Page</h1>
                    <h3>You have selected:</h3>
                    <div className="standardDivRowFullW">
                        <div className="standardDiv30Percent">
                            <img src={jobSelected.images[0]} className="imageMedium"/>
                        </div>
                        <div className="standardDiv60Percent">
                            <p>Job/Gig Title: {jobSelected.title}</p>
                            <p>JABer on this Gig/Job: {jobSelected.username}</p>
                            <p>Category: {jobSelected.category}</p>
                            <p>To Pay: {jobSelected.paying_price} {jobSelected.nft_symbol} Tokens.</p>
                            {
                                jobSelected.days_to_complete ?
                                <p>Days to complete: {jobSelected.days_to_complete}.</p>
                                : <p className="warningTextSmall">Warning. This Job/Gig do not have Days to complete, review this with the provider and make a note if possible, before processing it.</p>
                            }
                        </div>
                    </div>
                    <div className="justiAlig">
                        <Btnswitch  xtraClassCSS={"justAligned"} initialValue={false} title={"Add more details"} 
                            sideText={"Add specific details and customizations"}
                            btnAction={processSwitch}
                        />
                    </div>
                    {
                        moreDetails &&
                        <div className="justMargin0auto">
                            <form className="formColFlex90p justMargin0auto">
                                <label htmlFor="special_requirements">Special Requirements:</label>
                                <textarea name="special_requirements" onChange={(e) => {updateOrderState(e.target.name,e.target.value)}} 
                                    placeholder="Feel free to add here all the special needs or requirements you may need"
                                />
                                <label htmlFor="note">Note for the Professional:</label>
                                <textarea name="note" onChange={(e) => {updateOrderState(e.target.name,e.target.value)}} 
                                    placeholder="We recommend placing here special delivery dates or specific details"
                                />
                                <Btnswitch xtraClassCSS={"justAligned"} initialValue={false} sideText={"Add Extra Fast delivery request for 10% more."} showValueDevMode={false}
                                    btnAction={addExtra} addInfoBtn={true} infoMsg={"Be sure to ask to the provider/seller as they may delay, we recommend adding a note."}
                                />
                            </form>
                        </div>
                    }
                    {   order.sub_total &&
                        <div className="formColFlex90p justBorders justRounded marginsTB justMarginAuto">
                            <div className="standardDisplayJusSpaceAround justSpecialAttentionClass">
                                <div className="standardDivFlexPlain">
                                    <Img fixed={data.acceptedAll.childImageSharp.fixed} />
                                    <p className="textNomarginXSmall justNotextShadowColorBlack">On JobAboard we take crypto, very much!</p>
                                </div>
                                <div className="marginBottom">
                                    <h3>Sub Total: {order.sub_total} HIVE.</h3>
                                    {
                                        order.extra_money > 0 &&
                                        <h4 className="justColorYellow">Extra Fast Added as 10%: {order.extra_money}</h4>
                                    }
                                    <h2>Total to Pay: {order.total_amount} HIVE</h2>
                                    <button onClick={processPayment} className="justBackRed">Proceed with payment</button>
                                </div>
                            </div>
                        </div>
                    }
                    <div className="marginsTB justMarginAuto standardDivFlexPlain textAlignedCenter justWidth90 ">
                        <Img fixed={data.keyChainLogo.childImageSharp.fixed} className="justBackBlack justRoundedMini justMargin0auto"/>
                        <p className="textNomarginXSmall">Payment powered by <Btnoutlink link={"https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep"} textLink={"Hive Keychain"} />.</p>
                        <p className="textNomarginXXSmall">Terms and Conditions: you as the customer, who hire, is accepting our refund policy by executing this contract bewteen the buyer, called also as JABer, and you known also as the JABer. Please review your order carefully as we process the support request on a 24 - 48 hours base. For more information go to Policy in JAB at the bottom part.</p>
                    </div>
                </div>
            </div>
            }
        </Layout>
    )
}

export default Checkout;