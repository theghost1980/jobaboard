import React, { useEffect, useState } from 'react';
import Absscreenwrapper from '../absscreenwrapper';
import Loader from '../loader';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
import Btnclosemin from '../btns/btncloseMin';
import Tablinator from '../interactions/tablinator';
import Btninfo from '../btns/btninfo';

// action = {
//     action: '', 
//     items_count: 0,
//     item_type: '', 
//     items: [],
//     json_data: { //if not present this will tell transmitter this is a sell order, so it will show input options.
//         contractName: '',
//         contractAction: '',
//         contractPayload: {},
//     },
// }

//constants
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const orderEP = process.env.GATSBY_orderEP;
const nftEP = process.env.GATSBY_nftEP;
const userEP = process.env.GATSBY_userEP;
const dataMsgUser = [
    { action: 'sell', type: 'multiple', msg: 'By issuing a Multiple sell order, all selected NFTs will have same price and price Symbol, each. The total will be reflected on total as you type.', msgRight: 'JAB & HIve Chain will emit one order separately for each item.'},
    { action: 'update', type: 'multiple', msg: 'You can only edit the price on the selected items. If you need to change the price Symbol, cancel the order(s) and place new one(s).', msgRight: 'JAB & HIve Chain will emit one order separately for each item.'},
];
//END constants

/**
 * Assign the project to an employee.
 * @param {String} xclassCSS - Extra CSS class if needed.
 * @param {Object} action as defined above.
 * @param {Object} userdata - userdata.
 * @param {Object} order as the order we want to handle from user.
 * @param {Function} closeCB
 * @param {String} ssc_id URL node to listen on broadcast. For now test node, later on main hive.
 * @param {Boolean} devMode optional to debug on console.
 */

const Transmiter = (props) => {
    const { devMode, action, userdata, ssc_id, order, closeCB } = props;
    const [loadingData, setLoadingData] = useState(true);
    const [tx, setTx] = useState(null);
    const [msg, setMsg] = useState(`About to: ${action.action} an order.`);
    const [data, setData] = useState({ price: 0, priceSymbol: '', on_sale: true, updatedAt: ''});
    const [tokenListHive, setTokenListHive] = useState(null);
    const [resultOP, setResultOP] = useState({ status: '', message: ''});

    //to load on init
    useEffect(() => {
        if(devMode){ console.log('Received on props:', { devMode, action, userdata, ssc_id, nftEP, order, closeCB })};
        if((action.action === 'cancel' || action.action === 'buy') && action.item_type === 'instance'){
            return transmit();
        }
        if(action.action === 'cancel' && action.item_type === 'definition'){
            return cancel_def_order();
        }
        if(action.action === 'sell'){
            return loadTokensHive();
        }
        setLoadingData(false);
    },[])
    //END to load on init

    //load on state changes
    useEffect(() => {
        if(tx){ setTimeout(getInfoTX,3000) }; //3s on each iteration.
    },[tx]);
    //END load on state changes

    //functions/CB
    function cancel_def_order(){
        const formdata = new FormData();
        const order_id = action.items[0]._id;
        const symbol = action.items[0].nft_symbol;
        const query = { for_sale: false, updatedAt: new Date().toString(), };
        const headers = { 'x-access-token': userdata.token, 'nft_id': action.items[0].nft_id, 'query':JSON.stringify(query),};
        dataRequest(nfthandlermongoEP+"updateNFTfield", "POST", headers, null)
        .then(response => {
            console.log(response); //status, result
            if(response.status === "sucess"){
                const headers2 = {'x-access-token': userdata.token, 'operation': 'cancel', 'order_id': JSON.stringify({ _id: { $in: [order_id] }})} ;
                formdata.append("data", JSON.stringify({ status: 'Cancelled', updatedAt: new Date() }));
                dataRequest(orderEP+"handleMarketOrder", "POST", headers2, formdata).then(response => {
                    console.log(response);
                    const results = { status: response.status, message: response.message };
                    if(response.status === 'sucess'){
                        setResultOP({ status: response.status, message: `Order of sell definition ${symbol}, cancelled on JAB Marketplace.` });
                    }else {
                        setResultOP(results);
                    }
                    setLoadingData(false);
                }).catch(error => console.log(`Error processing a cancellation on Orders_Market.`, error));
            }
        }).catch(error => console.log('Error updating field on NFT to DB.',error));
    }
    function updateState(name,value){
        setData(prevState => { return {...prevState, [name]: value }});
        // if(action === 'sell'){
        //     action.json_data.contractPayload[name] = value;
        // }
    }
    function loadTokensHive(){ //query as { table: '', contract: '', query: {}, limit: 0, offset: 0, indexes: [] };
        setLoadingData(true);
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify( { table: 'tokens', contract: 'tokens', query: {}, limit: 0, offset: 0, indexes: []}) };
        dataRequest(nftEP+"queryContractTable","GET",headers,null)
        .then(response => {
            if(response.status === 'sucess'){
                setTokenListHive(response.result);
            }
            setLoadingData(false);
        }).catch(error => {
            console.log('Error getting tokenList on BE.', error);
            setLoadingData(false);
        });
    }
    function forceCancellation(){
        const headersOM = {'x-access-token': userdata.token, 'operation': 'cancel', 'order_id': JSON.stringify({ _id: { $in: action.items.map(order => order._id ) }}) }                                                                               
        const formdata = new FormData();
        formdata.append("data", JSON.stringify({ status: 'Cancelled', updatedAt: new Date(), }));
        dataRequest(orderEP+"handleMarketOrder", "POST", headersOM, formdata).then(response => {
            console.log(response);
        }).catch(error => console.log(`Error processing a forced cancellation on Orders_Market.`, error));
    }
    async function processEvent(arrayEvents, nftSymbol){
        // const sell_order = { username, order_type, item_type, orderId, nft_id, nft_instance_id, nft_symbol, price, priceSymbol, fee, tx_id, ts_hive, createdAt };
        console.log('Received on processEvent', { arrayEvents, nftSymbol }); 
        console.log('Using state action:', action);
        const nfts_ids = [];
        const orders_id = (action.action === 'cancel' || action.action === 'update') ? action.items.map(order => order._id ) : null;
        // console.log('orders_id', orders_id);
        const dataBE = [];
        const sell_status = (action.action === 'cancel' || action.action === 'buy')     ?   { on_sale: false, updatedAt: new Date(), price: 0, priceSymbol: '' } 
                                                                                        :   { on_sale: true, updatedAt: new Date(), price: data.price, } ;
        if(action.action === 'sell'){
            sell_status.priceSymbol = data.priceSymbol;
        }
        if(action.action === 'buy'){
            sell_status.username = userdata.username;
        }
        arrayEvents.filter(event => (event.event === `${action.action}Order` || event.event === 'changePrice')).map(event => {
            // if(event.event === `${action.action}Order`){
                if(action.item_type === 'instance' && action.action === 'sell'){
                    nfts_ids.push(Number(event.data.nftId)); //to store only the id of each instance
                    dataBE.push({ username: userdata.username, order_type: action.action, item_type: action.item_type, orderId: event.data.orderId, nft_instance_id: Number(event.data.nftId), nft_symbol: event.data.symbol, price: Number(event.data.price), priceSymbol: event.data.priceSymbol, fee: event.data.fee, tx_id: tx, ts_hive: event.data.timestamp, createdAt: new Date(),} )
                }
                if(action.action === 'cancel' && action.item_type === 'instance'){
                    // dataBE.push({ status: 'Cancelled', updatedAt: new Date(), });
                    console.log('Adding to cancellation:', event.data.nftId);
                    nfts_ids.push(Number(event.data.nftId)); //to store only the id of each instance
                }
                if(action.action === 'update' && action.item_type === 'instance'){
                    nfts_ids.push(Number(event.data.nftId)); //to store only the id of each instance
                }
            // }
        }); 
        arrayEvents.map(buyEvent => {
            if(action.action === 'buy' && action.item_type === 'instance'){
                const buyObject = {};
                if(buyEvent.event === "hitSellOrder"){
                    const { paymentTotal, priceSymbol, sellers, symbol } = buyEvent.data; //note sellers = [];
                    buyObject.price_total = Number(paymentTotal);
                    buyObject.price_symbol = priceSymbol;
                    buyObject.nft_symbol = symbol;
                    const { nftIds, } = sellers[0]; //for now we will handle only 1 by 1 sell. After deciding when to release live, I can handle multi buy.
                    buyObject.nfts_id = Number(action.items[0].ntf_id);
                    buyObject.nft_instance_id = Number(nftIds[0]);
                    buyObject.price = Number(paymentTotal);
                    buyObject.priceSymbol = priceSymbol;
                    buyObject.username = userdata.username,
                    buyObject.order_type = action.action,
                    buyObject.item_type = action.item_type,
                    buyObject.ref_order_id = action.order._id,
                    buyObject.tx_id = tx,
                    buyObject.status = "Filled",
                    buyObject.createdAt = new Date(),
                    nfts_ids.push(Number(nftIds[0])); //to store only the id of each instance
                    dataBE.push(buyObject);
                }
            }
        });


        console.log('About to process on Orders_market:', { dataBE, sell_status, nfts_ids, orders_id });
        const headersOM = {'x-access-token': userdata.token, 'operation': action.action, 'order_id': JSON.stringify({ _id: { $in: orders_id }}) } //add  as array of [order._id] as filter when action = 'cancel' || 'update' requires ._id.
        const formdata = new FormData();
        if(action.action === 'cancel'){
            formdata.append("data", JSON.stringify({ status: 'Cancelled', updatedAt: new Date(), } ));
        }else if(action.action === 'sell' || action.action === 'buy'){
            formdata.append("data", JSON.stringify(dataBE));
        }else if(action.action === 'update'){
            formdata.append("data", JSON.stringify({ updatedAt: new Date(), price: data.price, }));
        }
        dataRequest(orderEP+"handleMarketOrder", "POST", headersOM, formdata).then(response => {
            console.log(response);
        }).catch(error => console.log(`Error processing a ${action.action} on Orders_Market.`, error));

        //update the selling order as 'Filled' using the upcomming action.order._id only when executing the buy.
        if(action.action === 'buy'){
            const headersOM = {'x-access-token': userdata.token, 'operation': 'update', 'order_id': JSON.stringify({ _id: { $in: [ action.order._id ] }}) } //add  as array of [order._id] as filter when action = 'cancel' || 'update' requires ._id.
            const formdata = new FormData();
            formdata.append("data", JSON.stringify({ updatedAt: new Date(), status: 'Filled', }));
            dataRequest(orderEP+"handleMarketOrder", "POST", headersOM, formdata).then(response => {
                console.log(response);
            }).catch(error => console.log(`Error processing a ${action.action} on Orders_Market.`, error));
        }

        console.log('Now update each sell status on items.');
        
        // // const cancel_instances = { on_sale: false, updatedAt: new Date(), price: 0, priceSymbol: 'notSet' };
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify(sell_status), 'filter': JSON.stringify({ nft_instance_id: { $in: [...nfts_ids] }, ntf_symbol: nftSymbol }), 'updatemany': 'YESPLEASE!', };
        console.log('About to send to Nft_user:', { nfts_ids, nftSymbol, headers });
        dataRequest(nfthandlermongoEP+"updateInstanceNFTfield", "POST",headers, {})
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setResultOP({ status: response.status, message: `JAB placed the ${action.action} order. Of the ${response.result.nModified} items.`})
            }else{
                setResultOP({ status: response.status, message: response.message });
            }
            setLoadingData(false);
        })
        .catch(error => console.log('Error trying to update instances.',error));

        // const header2 = {'x-access-token': userdata.token, 'operation': action.action, 'order_id': order._id, } //add order._id //action = 'cancel' requires ._id.
        // const formdata = new FormData();
        // formdata.append("updatedAt", new Date());
        // formdata.append("status","Cancelled");
        // dataRequest(orderEP+"createMarketOrder", "POST", header2, formdata).then(response => {
        //     console.log(response);
        // }).catch(error => console.log('Error updating order.', error));

        // const buy_order = { username, ref_order_id, order_type, status, item_type, orderId, nft_id, nft_instance_id, nft_symbol, price, priceSymbol, fee, price_total, fee_Total, tx_id, ts_hive, createdAt };
        // //just to be used in a buy multiple -> nft_instances & nft_definitions
        // const nft_instances =[ { from_account: '', symbol: '', nfts: [0,1,2,3], price: 0, priceSymbol: '', fee: 0, }];
        // const cancel_order = { status = 'Cancelled',  }
        // //can be multiple but with the same priceSymbol.
        // const change_price_order = { order_id, price, nfts: ['1','2','3'], symbol: '' } //Note that the price symbol cannot be changed, to do that. Please cancel this order and create a new one.

    }

    const sendData = (event) => {
        event.preventDefault();
        if(action.action === "sell"){
            console.log('To add', data);
            action.json_data.contractPayload.price = Number(data.price).toFixed(3).toString();
            action.json_data.contractPayload.priceSymbol = data.priceSymbol;
        }
        if(action.action === 'update'){ action.json_data.contractPayload.price = Number(data.price).toFixed(3).toString(); }
        transmit();
    }
    function transmit(){
        if(isKeychainInstalled){
            window.hive_keychain.requestCustomJson(userdata.username, ssc_id, "Active", JSON.stringify(action.json_data), msg, function(result){
                const { message, success, error } = result;
                console.log(result);
                if(!success){
                    if(error !== "user_cancel"){
                        const { error, cause, data } = result.error;
                        console.log('Error while trying to send custom_json on NFT.', message);
                    }else if(error === "user_cancel"){ console.log('User cancelled Operation on the transmiter.!') }; //TODO // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} });
                    setLoadingData(false);
                    closeCB();
                }else if (success){ //check on this txId to analize results.
                    setLoadingData(true);
                    setTx(result.result.id);
                    console.log('Checking TX!',result.result.id); // TODO: send log to loggerOP
                };
            });
        }else{
            alert('Hive Key Chain not installed. Please go to FAQ if the problem persists.');
        }
    }
    function getInfoTX(){
        if(tx){
            console.log(`Checking on: ${tx}`);
            const headers = {'x-access-token': userdata.token, 'tx': tx,};
            dataRequest(nftEP + "tx", "GET", headers, null)
            .then(response => {
                console.log(response);
                if(response.status === "askAgain"){
                    return setTimeout(getInfoTX,3000); //recursive to go and check again until the Tx has been propagated on the chains.
                }else{
                    console.log('Process should be finished here. Move on Dev!');
                    if((response.action === action.action || response.action === 'changePrice') && response.contract === action.json_data.contractName){
                        const pLogs = JSON.parse(response.logs); //{"events":[{"contract":"nft","event":"transfer","data":{"from":"nftmarket","fromType":"c","to":"theghost1980","toType":"u","symbol":"NEWONE","id":"1"}},{"contract":"nftmarket","event":"cancelOrder","data":{"account":"theghost1980","ownedBy":"u","symbol":"NEWONE","nftId":"1","timestamp":1620885342000,"price":"100.90000000","priceSymbol":"BEE","fee":0,"orderId":1}}]}
                        const pPayload = JSON.parse(response.payload);
                        console.log(pLogs, pPayload);
                        if(pLogs.errors){
                            if(pLogs.errors[0] === "market not enabled for symbol"){
                                 alert(`The Token: ${pPayload.symbol} has not enabled the Market option.\nif you are the owner of this NFT definition, please navigate to Tokens > Sale Options.\nIf you are not the owner, please contact the owner and asking to enable the market, so any holder can place sell orders.`);
                                 setLoadingData(false);
                                 closeCB();
                            }else if(pLogs.errors[0] === "cannot fill your own orders"){
                                alert('Sorry Friend but you cannot buy your own Tokens.\nWe are sure there is plenty of fishes to catch. Select a different owner.');
                                closeCB();
                            }else if(pLogs.errors[0] === "you must have enough tokens for payment"){
                                const answer = window.confirm(`You need to top up more ${action.priceSymbol}\nJust go to Tokens > Balances.\nWant me to add it to your Wishlist?`);
                                if(answer){
                                    //TODO add to wishlist!!
                                }
                                closeCB();
                            }
                        }else{
                            if(pLogs.events){ 
                                if(action.action === 'update'){
                                    return processEvent(pLogs.events.filter(event => event.event === "changePrice"), pPayload.symbol);
                                }
                                if(action.action === 'buy'){ //so we can handle all the stuff of each buy order received from hive.
                                    return processEvent(pLogs.events, pPayload.symbol);
                                }
                                processEvent(pLogs.events.filter(event => event.event === `${action.action}Order`), pPayload.symbol);
                                // alert(`${action} Order Executed successfully!.`);
                                // closeCB();
                            }else{
                                alert('Probably that order was cancelled already. If problem persists please contact support team.');
                                if(action.action === 'cancel'){ //force cancellation on this order.
                                    forceCancellation();
                                }
                                setLoadingData(false);
                                closeCB();
                            }
                        }
                    }
                }
            })
            .catch(error => {
                console.log('Error asking data ssc on BE',error);
                setLoadingData(false);
            });
        }
    }
     //////data fecthing
     async function dataRequest(url = '', requestType, headers,formdata) {
        const response = formdata   ? await fetch(url, { method: requestType, mode: 'cors', headers: headers, body: formdata})
                                    : await fetch(url, { method: requestType, mode: 'cors', headers: headers,});
        return response.json(); 
    };
    //////END data fecthing
    //EBD functions/CB

    return (
        <Absscreenwrapper xtraClass={"justifyFlexStart"}>
            <div className="standardDiv80Auto whiteBack justBordersRounded justTop100p">
                <Btnclosemin btnAction={() => closeCB()} />
                <div className="standardContentMargin">
                    {
                        loadingData && <div className="standardDivRowFlex100pX100pCentered"><Loader logginIn={loadingData} /></div>
                    }
                    {   !loadingData && tokenListHive && action.action === 'sell' && resultOP.status === '' &&
                        
                            <div className={`standardDivColFullW ${loadingData ? 'disableDiv2' : null }`}>
                                <div className={`standardDivRowFullW justAligned`}>
                                    <h2>About to {action.action} on Marketplace.</h2>
                                    <Btninfo  msg={dataMsgUser.find(msg => msg.action === action.action).msg}/>
                                </div>
                                <div className="standardDivRowFullW">
                                    <div className="justWidth60">
                                        <p>Fill the neccesary fields bellow and when ready hit Submit.</p>
                                        <form onSubmit={sendData} className="standardFormColHorFullWAutoH relativeDiv colorX marginBottom">
                                            <label htmlFor="price">Price</label>
                                            <input name="price" onChange={(e) => updateState("price", Number(e.target.value))} 
                                                required pattern="[0-9.]{1,21}" title="Just numbers and dots please. between 1 and 9.999.999.999."
                                            />
                                            <label htmlFor="priceSymbol">Price Symbol</label>
                                            <select name="priceSymbol" onChange={(e) => updateState("priceSymbol", e.target.value)} required>
                                                <option defaultValue="Please Select a Symbol"></option>
                                                {
                                                    tokenListHive.map(token => {
                                                        return (
                                                            <option key={token._id} value={token.symbol}>{token.symbol} - Issued By: {token.issuer}</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                            <button className="minibtn marginsTB" type="submit" >Submit</button>
                                        </form>
                                    </div>
                                    <div className="justWidth40">
                                        <div className="standardContentMarginLR textAlignedCenter">
                                            <div className="standardDivRowFullW justAligned">
                                                <h4>About to place an order on: {action.items[0].ntf_symbol}</h4>
                                                <Btninfo size={"mini"}  msg={dataMsgUser.find(msg => msg.action === action.action).msgRight}/>
                                            </div>
                                            <p>Total: {data.price ? Number(data.price * action.items.length).toFixed(5).toString() : null } In: {data.priceSymbol ? data.priceSymbol : null }</p>
                                            <Tablinator 
                                                items={action.items} toShow={['ntf_symbol','nft_instance_id']}
                                                pagination={{ perPage: 10, controls: false }}

                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        {   !loadingData && action.action === 'update' && resultOP.status === '' &&
                            <div className={`standardDivColFullW ${loadingData ? 'disableDiv2' : null }`}>
                                <div className={`standardDivRowFullW justAligned`}>
                                    <h2>About to {action.action} on Marketplace.</h2>
                                    <Btninfo  msg={dataMsgUser.find(msg => msg.action === action.action).msg}/>
                                </div>
                                <div className="standardDivRowFullW">
                                    <div className="justWidth60">
                                        <p>Fill the neccesary fields bellow and when ready hit Submit.</p>
                                        <form onSubmit={sendData} className="standardFormColHorFullWAutoH relativeDiv colorX marginBottom">
                                            <label htmlFor="price">Price</label>
                                            <input name="price" onChange={(e) => updateState("price", Number(e.target.value))} 
                                                required pattern="[0-9.]{1,21}" title="Just numbers and dots please. between 1 and 9.999.999.999."
                                            />
                                            <p>Price Symbol: {action.items[0].priceSymbol}</p>
                                            <button className="minibtn marginsTB" type="submit" >Submit</button>
                                        </form>
                                    </div>
                                    <div className="justWidth40">
                                        <div className="standardContentMarginLR textAlignedCenter">
                                            <div className="standardDivRowFullW justAligned">
                                                <h4>About to Edit an order on: {action.items[0].nft_symbol}</h4>
                                                <Btninfo size={"mini"}  msg={dataMsgUser.find(msg => msg.action === action.action).msgRight}/>
                                            </div>
                                            <p>Old Price: {action.items[0].price}</p>
                                            <p>New price: {data.price ? Number(data.price * action.items.length).toFixed(5).toString() : null } In: {action.items[0].priceSymbol}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        {
                            resultOP.status !== '' && !loadingData &&
                            <div className="standardContentMargin">
                                <h1>Results: {resultOP.status}</h1>
                                <p>JAB says:</p>
                                <p>{resultOP.message}</p>
                                <button onClick={() => closeCB()}>Ok</button>
                            </div>
                        }
                </div>
            </div>
        </Absscreenwrapper>
    )
}

export default Transmiter;
