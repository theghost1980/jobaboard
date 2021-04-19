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

// TODO
// We must see if we need to handle the jobpreviews as a page instead of a inner component, as
// when we finish this result we may present the option to present the option to the user to review the initial job
// as we are handling this right now it will take more work and it is out of standards I think.

//contants
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const orderEP = process.env.GATSBY_orderEP;
// TODO take this on .env file
const jabFEE = { fee: "0.002", currency: "HIVE", costInstance: "0.001", costCurr: "HIVE", acceptedCur: "HIVE"};

const Checkout = (props) => {
    // const logged = getStoredField("logged");
    // if(!logged || !props.location.state.job_id){
    //     navigate("/");
    //     return null
    // }
    const userdata = check();
    // console.log(props);
    const { state } = props.location;
    const [jobSelected, setJobSelected] = useState(null);
    const [moreDetails, setMoreDetails] = useState(false);
    const [resultsOP, setResultsOP] = useState(null);
    const [results, setResults] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [order, setOrder] = useState({
        username_employer: String, //the ones who serves the order
        username_employee: String, //the ones who ask this gig/job
        note: String, //used for 'cancellation' or "anything else needed".
        nft_id: Number,
        nft_symbol: String,
        nft_price_on_init: Number, //respresent the price when the order was emitted. In case we may want to allow users to change prices on their nft later on without affecting on going orders.
        job_id: String,
        job_title: String, //used to check if maybe the user placed the same order twice.
        days_to_complete: Number, //as default 1.
        category_job: String,
        sub_category: String,
        escrow_type: String, //could be 'system' or 'username'.
        job_type: String, //as employee or employeer, reference of this job (optional maybe)
        sub_total: Number,
        extra_money: 0,
        total_amount: Number, //in case we add later on extra features or quantity.
        tx_id: String, //as the txId of this transference when successfull as paid.
        createdAt: new Date().toString(),
        special_requirements: String, //if the employee needs more specifications.
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
                        updateOrderState("nft_price_on_init",response.result[0].price);
                        updateOrderState("sub_total", (response.result[0].price * state.paying_price));
                        updateOrderState("total_amount", (response.result[0].price * state.paying_price));
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
                            //TODO
                            // Now we send the command to BE:
                            // instantiate N tokens of order.nft_id to the employer
                            // after verifying the user has the N instances send a notification to the user.
                        }
                        //hide loader
                        // setLoading(false);
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
            }
        }
    }, [resultsOP]);
    //END to load on state changes
    // functions/CB
    const processPayment = () => {
        if(isKeychainInstalled){
            setLoadingData(true);
            const memo = `Order of Gig/Job-${jobSelected._id} on Job A Board.`
            const total_amount = Number(order.sub_total + order.extra_money).toFixed(3);
            updateOrderState("total_amount", Number(total_amount));

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
                            status: 'cancelled_user', results: new Date().toString(),
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
            const extra = 0.10 * order.sub_total;
            if(cen){
                updateOrderState("extra_money", extra);
            }else if(!cen){
                updateOrderState("extra_money", 0);
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
    //////END data fetching
    // END functions/CB
    return (
        <Layout>
            {
                results &&
                <div className="businessPageCont">
                    <h1>Order processed.</h1>
                    <p>Under any issue, do not hesitate our contact support by email or using the messaging system on JAB.</p>
                    <p>If you need you can print this information but a copy has been sent to your email.</p>
                    <p>Also it can be located within > Jobs > My Orders > (TODO LINK, FE,BE)</p>
                    <hr></hr>
                    <div className="standardDivRowFullW">
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
            <div className="businessPageCont">
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
                            <textarea name="special_requirements" onChange={(e) => updateOrderState(e.target.name,e.target.value)} 
                                placeholder="Feel free to add here all the special needs or requirements you may need"
                            />
                            <label htmlFor="note">Note for the Professional:</label>
                            <textarea name="note" onChange={(e) => updateOrderState(e.target.name,e.target.value)} 
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
                        <div className="marginRL standardDisplayJusSpaceAround">
                            <div className="standardDivFlexPlain">
                                <Img fixed={data.acceptedAll.childImageSharp.fixed} />
                                <p className="textNomarginXSmall">On JobAboard we take crypto, very much!</p>
                            </div>
                            <div className="marginBottom">
                                <h3>Sub Total: {order.sub_total} HIVE.</h3>
                                {
                                    order.extra_money > 0 &&
                                    <h4 className="justColorGray">Extra Fast Added as 10%: {order.extra_money}</h4>
                                }
                                <h2>Total to Pay: {order.sub_total + order.extra_money} HIVE</h2>
                                <button onClick={processPayment} className="justBackRed">Proceed with payment</button>
                            </div>
                        </div>
                    </div>
                }
                <div className="marginsTB justMarginAuto standardDivFlexPlain">
                    <Img fixed={data.keyChainLogo.childImageSharp.fixed} className="justBackBlack justRoundedMini"/>
                    <p className="textNomarginXSmall">Payment powered by <Btnoutlink link={"https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep"} textLink={"Hive Keychain"} />.</p>
                    <p className="textNomarginXXSmall">Terms and Conditions: you as the customer, who hire, is accepting our refund policy by executing this contract bewteen the buyer, called also as JABer, and you known also as the JABer. Please review your order carefully as we process the support request on a 24 - 48 hours base. For more information go to Policy in JAB at the bottom part.</p>
                </div>
            </div>
            }
        </Layout>
    )
}

export default Checkout;