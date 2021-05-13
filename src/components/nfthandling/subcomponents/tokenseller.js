import React, { useEffect, useState } from 'react';
import Loader from '../../loader';
import Absscreenwrapper from '../../absscreenwrapper';
import Btnclosemin from '../../btns/btncloseMin';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//constants
const orderEP = process.env.GATSBY_orderEP;
//end constants
/**
 * This component allow user to place/remove on sale of a token(instance).
 * For now must allow user to set the sell parameters, update it values on MongoDB.
 * TODO: later on, we must add to use this same component in 2 modes: 1- Top of all 2- Render bellow. So it can be used on MarketPlace & Tokens.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Function} closeCB - cb to close the component.
 * @param {Function} cbOnSucess - cb if you need to update components on parent after enabling the market on this definition.
 * @param {Object} userdata - contains all userdata to handle.
 * @param {Object} selectedNft_instance - Contains the nft definition + nft_instance data.
 * @param {String} ssc_test_id as the node that will listen. Now on testNode later on mainNet.
 * @param {String} nftEP - the EP on BE to search TXs on hive main chain.
 * @param {String} nfthandlermongoEP - EP to handle mongoDB nft definitions.
 * @param {String} renderMode - TODO as it will be as "onTop" || "bellow"
 * @param {Boolean} devMode - optional to activate console.logs.
 */

const Tokenseller = (props) => {
    const { closeCB, xclassCSS, userdata,  selectedNft_instance, devMode, ssc_test_id, nftEP, nfthandlermongoEP, cbOnSucess, renderMode} = props;
    const [tx, setTx] = useState(null);
    const [data, setData] = useState({ price: 0, priceSymbol: '', on_sale: false,});
    // const [query, setQuery] = useState({ username: userdata.username, ntf_id: selectedNft_instance.ntf_id, ntf_symbol: selectedNft_instance.ntf_symbol, nft_instance_id: selectedNft_instance.nft_instance_id }); //so we can send this as headers later on.
    const [working, setWorking] = useState(false);
    const [tokenListHive, setTokenListHive] = useState(null);

    //functions/CB
    const sendData = (e) => {
        e.preventDefault();
        if(isKeychainInstalled){
            setWorking(true);
            const msg = `Sell Order for 1 ${selectedNft_instance.ntf_symbol} of ID: ${selectedNft_instance.nft_instance_id} at a price: ${data.price} - ${data.priceSymbol} on MarketPlace`;
            // const jsonData = { "contractName": "nftmarket", "contractAction": "enableMarket", "contractPayload": { "symbol": selectedNft.symbol }};
            const jsonData = { "contractName": "nftmarket", "contractAction": "sell", "contractPayload": { "symbol": selectedNft_instance.ntf_symbol, "nfts": [ String(selectedNft_instance.nft_instance_id) ], "price": String(Number(data.price).toFixed(3)), "priceSymbol": data.priceSymbol, "fee": 0 }};
            window.hive_keychain.requestCustomJson(userdata.username, ssc_test_id, "Active", JSON.stringify(jsonData), msg, function(result){
                const { message, success, error } = result;
                if(devMode){ console.log(result) };
                if(!success){
                    if(error !== "user_cancel"){
                        const { error, cause, data } = result.error;
                        console.log('Error while trying to send custom_json on NFT.', message);
                    }else if(error === "user_cancel"){
                        // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
                        console.log('User cancelled Operation on the NFTeditor.!');
                    }
                    setWorking(false);
                }else if (success){ // TODO: send log to loggerOP
                    //check on this txId to analize results.
                    setTx(result.result.id); 
                    console.log('Checking TX!',result.result.id);
                };
            });
        }else{
            alert('If the Hive Key Chain is installed, just click on the icon to activate on this website.\nIf not installed, please do so in htttp://todothelink.com');
            setWorking(false);
        }

    }
    function updateState(name,value){
        setData(prevState => { return {...prevState, [name]: value }});
    }
    function fromTsToDate(ts){
        return new Date(ts);
    }
    function sendDataMongo(data, order){
        const headers = { 'x-access-token': userdata.token, 'nft_instance_id': data.filter.nft_instance_id, 'ntf_id': data.filter.ntf_id, 'query': JSON.stringify(data.updateData), };
        dataRequest(nfthandlermongoEP+"updateInstanceNFTfield","POST",headers,{})
        .then(response => console.log(response))
        .catch(error => console.log('Error updating NFT instance - sellOrder', error));
        const headers2 = { 'x-access-token': userdata.token, };
        const formdata = new FormData();
        const toSendFD = {};
        Object.entries(order).forEach(([key,value]) => {
            formdata.append(key,value);
            toSendFD[key] = value;
        });
        if(devMode){ console.log('About to send to BE:', toSendFD)}
        dataRequest(orderEP+"createMarketOrder","POST",headers2,formdata)
        .then(response =>{ console.log(response) })
        .catch(error => console.log('Error processing MarketOrder.',error));
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
                    setWorking(false);
                    if(devMode){ console.log('Process should be finished here. Move on Dev!') };
                    if(response.logs){ //{"events":[{"contract":"nftmarket","event":"enableMarket","data":{"symbol":"GUYEN"}}]}
                        const pLogs = JSON.parse(response.logs);
                        if(devMode) { console.log(pLogs) };
                        if(response.action === "sell" && response.contract === "nftmarket"){
                            if(!pLogs.events){//means this token is already placed on a sell order.
                                //TODO if needed maybe look into the info of the token to see if is onsale or not.
                                alert('This Token has an ongoing Sell Order.\nPlease go to Marketplace > My Orders.');
                                return closeCB();
                            }
                            const sellEvent = pLogs.events.find(event => event.event === "sellOrder");
                            if(devMode) { console.log(sellEvent) };
                            if(sellEvent && sellEvent.data.account === userdata.username && sellEvent.data.timestamp){ //the order was successfully set
                                //now we update the instance as on_sale
                                const { orderId, nftId, account, symbol, price, priceSymbol, timestamp } = sellEvent.data;
                                const updateDataInstance = {
                                    filter: { username: account, ntf_id: selectedNft_instance.ntf_id, ntf_symbol: symbol, nft_instance_id: nftId,},
                                    updateData: { price: Number(price).toFixed(5), priceSymbol: priceSymbol, on_sale: true, updatedAt: new Date().toString() },
                                }
                                if(devMode){ console.log('About to process:', updateDataInstance )};
                                const nft_instances =[ { symbol: symbol, nfts: [ Number(nftId) ], price: price, priceSymbol: priceSymbol, fee: 0 } ];
                                const order = { username: userdata.username, order_type: "sell", item_type: "instance", orderId: orderId, nft_instances: JSON.stringify(nft_instances), price_total: price, price_symbol: priceSymbol, tx_id: tx, ts_hive: Number(timestamp), createdAt: new Date().toString(), };
                                sendDataMongo(updateDataInstance, order);
                                if(cbOnSucess){ cbOnSucess() };
                                // TODO send all this info to BE.
                                alert(`Order placed on ${symbol} ID: ${nftId}.\Take a screen shot of info bellow if you need it.\nBut at anytime just go to Marketplace > My Orders..\n***********************\nOrder Id: ${orderId}\nNFT: ${symbol}\nID Token: ${nftId}\nExecuted at: ${fromTsToDate(timestamp)}\nPrice: ${Number(price).toFixed(3)} on ${priceSymbol}\n***********************`);
                                closeCB();
                            }
                        }
                        // if(pLogs.hasOwnProperty('events') && pLogs.events[0].event === "enableMarket"){
                        //     updateNftMongo();
                        //     setWorking(false);
                        //     if(cbOnSucess){ cbOnSucess() };
                        //     alert(`Enabled Market on: ${pLogs.events[0].data.symbol}.Go place some orders!`);
                        //     closeCB();
                        // }
                        // if(pLogs.errors){ //{"errors":["market already enabled"]}
                        //     updateNftMongo();
                        //     setWorking(false);
                        //     if(cbOnSucess){ cbOnSucess() };
                        //     alert(`Errors: ${pLogs.errors[0]}`);
                        //     closeCB();
                        // }
                    }
                }
            })
            .catch(error => {
                console.log('Error asking data ssc on BE',error);
                setWorking(false);
            });
        }
    }
    function loadTokensHive(){ //query as { table: '', contract: '', query: {}, limit: 0, offset: 0, indexes: [] };
        setWorking(true);
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify( { table: 'tokens', contract: 'tokens', query: {}, limit: 0, offset: 0, indexes: []}) };
        dataRequest(nftEP+"queryContractTable","GET",headers,null)
        .then(response => {
            if(response.status === 'sucess'){
                setTokenListHive(response.result);
            }
            setWorking(false);
        }).catch(error => {
            console.log('Error getting tokenList on BE.', error);
            setWorking(false);
        });
    }
    //////data fecthing
    async function dataRequest(url = '', requestType, headers,formdata) {
        const response = formdata   ? await fetch(url, { method: requestType, mode: 'cors', headers: headers, body: formdata})
                                    : await fetch(url, { method: requestType, mode: 'cors', headers: headers,});
        return response.json(); 
    };
    //////END data fecthing
    //END functions/CB

    //to load on Init
    useEffect(() => {
        //TODO here as soon as we get the definition info, we must check if market_enabled for that nft, if not, educate the user.
        if(devMode){ console.log('Received as props:', { closeCB, xclassCSS, userdata,  selectedNft_instance, devMode, ssc_test_id, nftEP, nfthandlermongoEP, cbOnSucess, renderMode}) };
        loadTokensHive();
    },[]);
    //END to load on Init

    //to load on each change of state
    useEffect(() => {
        if(data && devMode){ console.log('Data changed:', data) };
    }, [data]);
    useEffect(() => {
        if(tx){ setTimeout(getInfoTX,3000) }; //testing on 3s
    },[tx])
    //END to load on each change of state

    return (
        <div>
            {
                (renderMode === "onTop") ?
                <Absscreenwrapper xtraClass={"justiAlig"}>
                    <div className={`${xclassCSS} ${working ? 'disableDiv2' : null} whiteBack standardDiv80Auto relativeDiv jutsMinHeight320px`}>
                        <Btnclosemin btnAction={closeCB} />
                        {
                            working && 
                            <div className="absDivRow100x100T50R50">
                                <Loader logginIn={true} typegif={"blocks"} xtraClass={"absDivRow100x100T50R50 marginsTB"} />
                            </div>
                        }
                        {   !working && tokenListHive && selectedNft_instance &&
                            <div className="standardContentMarginLR justMarginBottom">
                                <div className="standardDivRowFullW">
                                    <div className="justWidth60">
                                        <h3>Place an Order on MarketPlace</h3>
                                        <p>Fill the neccesary fields bellow and when ready hit Submit.</p>
                                        <form onSubmit={sendData} className="standardFormColHorFullWAutoH relativeDiv colorX marginBottom">
                                            <label htmlFor="price">Price</label>
                                            <input name="price" onChange={(e) => updateState("price", Number(e.target.value))} 
                                                required pattern="[0-9.]{1,21}" title="Just numbers and dots please. between 1 and 9.999.999.999."
                                            />
                                            <label htmlFor="priceSymbol">Price Symbol</label>
                                            {/* //TODO later, load all tokens available on hive using the same method you use on token> userwallet. */}
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
                                            <h4>About to place an order on:</h4>
                                            <img src={selectedNft_instance.nft_definition.thumb} className="xSmallImage" />
                                            <p>Symbol: {selectedNft_instance.ntf_symbol}</p>
                                            <p>Token ID: {selectedNft_instance.nft_instance_id}</p>
                                            <p>On Sale: {selectedNft_instance.on_sale ? 'YES':'NO'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </Absscreenwrapper>

                : alert('I am not finished yet! come back later....')
            }
        </div>
    )
}

export default Tokenseller;

//data help
//testing now with no fee & even when we are just doing teh enable market without the 2nd step.
// { //json to transmit to place an order on market on this instance.
//     "contractName": "nftmarket",
//     "contractAction": "sell",
//     "contractPayload": {
//         "symbol": "TESTNFT",
//         "nfts": [ "1","2","3" ],
//         "price": "2.000",
//         "priceSymbol": "ENG",
//         "fee": 500 
//     }
// }

//successfull response on a sell order
// {
//     "events": [
//         {
//             "contract": "nft",
//             "event": "transfer",
//             "data": {
//                 "from": "jobaboard",
//                 "fromType": "u",
//                 "to": "nftmarket",
//                 "toType": "c",
//                 "symbol": "MMMMMMM",
//                 "id": "1"
//             }
//         },
//         {
//             "contract": "nftmarket",
//             "event": "sellOrder",
//             "data": {
//                 "account": "jobaboard",
//                 "ownedBy": "u",
//                 "symbol": "MMMMMMM",
//                 "nftId": "1",
//                 "timestamp": 1620520284000,
//                 "price": "2.00000000",
//                 "priceSymbol": "BEE",
//                 "fee": 0,
//                 "orderId": 1
//             }
//         }
//     ]
// }
//END data help