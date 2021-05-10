import React, { useEffect, useState } from 'react';
import Absscreenwrapper from '../../absscreenwrapper';
import Btnclosemin from '../../btns/btncloseMin';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
import Loader from '../../loader';

/**
 * This component allow user to handle the enable market process on his NFT.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Function} closeCB - cb to close the component.
 * @param {Function} cbOnSucess - cb if you need to update components on parent after enabling the market on this definition.
 * @param {Object} userdata - contains all userdata to handle.
 * @param {Object} selectedNft - contains the nft definition to aply the enable market request.
 * @param {String} ssc_test_id as the node that will listen. Now on testNode later on mainNet.
 * @param {String} nftEP - the EP on BE to search TXs on hive main chain.
 * @param {String} nfthandlermongoEP - EP to handle mongoDB nft definitions.
 * @param {Boolean} devMode - optional to activate console.logs.
 */

const Marketenabler = (props) => {
    const { closeCB, xclassCSS, userdata,  selectedNft, devMode, ssc_test_id, nftEP, nfthandlermongoEP, cbOnSucess} = props;
    const [tx, setTx] = useState({ txid: '', step: 0, currentData: {},});
    const [working, setWorking] = useState(false);
    const dataJsons = [
        { msg: `Step 1 - Enabling Market on: ${selectedNft.symbol}`, jsonData: { "contractName": "nftmarket", "contractAction": "enableMarket", "contractPayload": { "symbol": selectedNft.symbol }},},
        { msg: `Step 2 - Enabling Market on: ${selectedNft.symbol}`, jsonData: { "contractName": "nft", "contractAction": "setGroupBy", "contractPayload": { "symbol": selectedNft.symbol, "properties": ["nftinfo"]}},}
    ];

    //functions/CB
    function updateNftMongo(){
        const query = { market_enabled: true, updatedAt: new Date().toString(),};
        const headers = { 'x-access-token': userdata.token, 'nft_id': selectedNft.nft_id, 'query':JSON.stringify(query),};
        dataRequest(nfthandlermongoEP+"updateNFTfield","POST", headers, null)
        .then(response => {
            if(devMode) { console.log(response) }; //status, result
        }).catch(error => { console.log('Error updating field on NFT to DB.',error)});
    }
    const enableMarket = () => {
        if(isKeychainInstalled){
            setWorking(true);
            const msg = dataJsons[tx.step].msg;
            const jsonData = dataJsons[tx.step].jsonData;
            //TODO here:
            // after you have tested adding a property on creation, before instantiation,
            // come back here to see if it needs the props in order to enable the market

            // const msg = `Enable Market for ${selectedNft.symbol} on JAB - step 1`;
            // TODO: const msg = `Apply setGroupBy for ${selectedNft.symbol} on JAB - step 2`;
            // const jsonData = { "contractName": "nftmarket", "contractAction": "enableMarket", "contractPayload": { "symbol": selectedNft.symbol }}; //step 1
            // { "edition": { "type": "string", "isReadOnly": true, "authorizedEditingAccounts": ["jobaboard"], "authorizedEditingContracts": [] }}

            // TODO const jsonData = { "contractName": "nft", "contractAction": "setGroupBy", "contractPayload": { "symbol": selectedNft.symbol, "properties": ["edition"]}} //step 2.
            
            window.hive_keychain.requestCustomJson(userdata.username, ssc_test_id, "Active", JSON.stringify(jsonData), msg, function(result){
                const { message, success, error } = result;
                if(devMode){ console.log(result) };
                if(!success){
                    if(error !== "user_cancel"){
                        const { error, cause, data } = result.error;
                        console.log('Error while trying to send custom_json on NFT.', message);
                    }else if(error === "user_cancel"){
                        // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
                        console.log('User cancelled Operation on the MarketEnabler!');
                    }
                    setWorking(false);
                }else if (success){ // TODO: send log to loggerOP
                    //check on this txId to analize results.
                    setTx(prevState => { return { txid: result.result.id, step: prevState.step + 1} });
                    console.log('Checking TX!', result.result.id);
                };
            });
        }else{
            alert('If the Hive Key Chain is installed, just click on the icon to activate on this website.\nIf not installed, please do so in htttp://todothelink.com');
            setWorking(false);
        }
    }
    function updateTheThing(symbolPload){
        updateNftMongo();
        alert(`Market Enabled on ${symbolPload}\nNow you can place orders on each instance you have!, or others have.`);
        if(cbOnSucess){ cbOnSucess() };
        closeCB();
    }
    function getInfoTX(){
        if(tx){
            console.log(`Checking on: ${tx.txid}`);
            const headers = {'x-access-token': userdata.token, 'tx': tx.txid,};
            dataRequest(nftEP + "tx", "GET", headers, null)
            .then(response => {
                console.log(response);
                console.log('tx:', tx);
                if(response.status === "askAgain"){
                    return setTimeout(getInfoTX,3000); //recursive to go and check again until the Tx has been propagated on the chains.
                }else{
                    if(tx.step === 1){
                        if(response.action === "enableMarket"){
                            if(response.logs){ 
                                const pLogs = JSON.parse(response.logs); //typical success response -> {"events":[{"contract":"nftmarket","event":"enableMarket","data":{"symbol":"ZZZZZ"}}]}
                                if(!pLogs.errors){ 
                                    const enabledMarket = pLogs.events.find(event => event.event === "enableMarket");
                                    if(enabledMarket.data.symbol === selectedNft.symbol){//now we have success
                                        //execute another customJson.
                                        enableMarket();
                                    }
                                }else{
                                    alert(pLogs.errors.join('\n') + "\nWe will check if the step 2 is done already....");
                                    enableMarket();
                                }
                            }
                        }
                    }else if(tx.step === 2){
                        if(devMode){ console.log('Process should be finished here. Move on Dev!') };
                        if(response.action === "setGroupBy"){
                            if(response.logs === "{}"){
                                const pPayload = JSON.parse(response.payload); //typical response success {"symbol":"ZZZZZ","properties":["nftinfo"],"isSignedWithActiveKey":true}
                                if(pPayload.symbol === selectedNft.symbol){
                                    updateTheThing(pPayload.symbol);
                                }
                            }else{
                                const pLogs = JSON.parse(response.logs);
                                if(pLogs.errors){ //{"errors":["list is already set"]}
                                    if(pLogs.errors[0] === "list is already set"){
                                        const pPayload = JSON.parse(response.payload);
                                        updateTheThing(pPayload.symbol);
                                    }
                                }
                            }
                        }
                    }
                    // if(response.logs){ //{"events":[{"contract":"nftmarket","event":"enableMarket","data":{"symbol":"GUYEN"}}]}
                    //     const pLogs = JSON.parse(response.logs); //{"events":[{"contract":"nftmarket","event":"enableMarket","data":{"symbol":"ONIX"}}]}
                    //     if(devMode) { console.log(pLogs) };
                    //     //response when succeded -> { action: "setGroupBy", contract: "nft", logs: "{}", payload: "{\"symbol\":\"MMMMMMM\",\"properties\":[\"edition\"],\"isSignedWithActiveKey\":true}"} }

                    //     // if(pLogs.hasOwnProperty('events') && pLogs.events[0].event === "enableMarket"){
                    //     //     //TODO - here we must add a second json as the setGroupBy, 1 tx more and repeat the process.
                    //     //     // updateNftMongo();
                    //     //     setWorking(false);
                    //     //     if(cbOnSucess){ cbOnSucess() };
                    //     //     alert(`Enabled Market on: ${pLogs.events[0].data.symbol}.Go place some orders!`);
                    //     //     closeCB();
                    //     // }
                    //     // if(pLogs.errors){ //{"errors":["market already enabled"]}
                    //     //     // updateNftMongo();
                    //     //     setWorking(false);
                    //     //     if(cbOnSucess){ cbOnSucess() };
                    //     //     alert(`Errors: ${pLogs.errors[0]}`);
                    //     //     closeCB();
                    //     // }
                    // }
                }
            })
            .catch(error => {
                console.log('Error asking data ssc on BE',error);
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
    //END functions/CB

    //to load on Init
    useEffect(() => {
        if(devMode){
            console.log('Received as props:');
            console.log('xclassCSS',xclassCSS);
            console.log('userdata',userdata);
            console.log('selectedNft',selectedNft);
            console.log('closeCB',closeCB);
        }
    },[]);
    //END to load on Init

    //to load on each change of state
    useEffect(() => {
        if(tx.txid !== '' && tx.txid !== null && tx.step <= 2){ setTimeout(getInfoTX,3000) }; //testing on 3s
    },[tx])
    //END to load on each change of state
    return (
        <Absscreenwrapper xtraClass={"justiAlig"}>
            <div className={`${xclassCSS} ${working ? 'disableDiv2' : null} whiteBack standardDiv80Auto relativeDiv jutsMinHeight320px`}>
                <Btnclosemin btnAction={closeCB} />
                {
                    working && 
                    <div className="absDivRow100x100T50R50">
                        <Loader logginIn={true} typegif={"blocks"} xtraClass={"absDivRow100x100T50R50 marginsTB"} />
                    </div>
                }
                <div className="standardContentMarginLR justMarginBottom">
                    <div className="standardDivRowFullW">
                        <div className="justWidth60">
                            <h3>Important:</h3>
                            <p>This activation it will happen only once and it will enable this token to be sold on the NFT market.</p>
                            <p>The process will be done by signing and broadcasting 2 operation to the Hive Blockchain. So please be patience and do not close the browser as you need to confirm on each step.</p>
                            <p>This action cannot be undone.</p>
                            <p>If you need your tokens to be bought/sold on JAB and others market. Then proceed.</p>
                        </div>
                        <div className="justWidth40">
                            <img src={selectedNft.image} className="imageMedium" />
                            <ul>
                                <li>
                                    <p className="extraMiniMarginsTB">Symbol: {selectedNft.symbol}</p>
                                </li>
                                <li>
                                    <p className="extraMiniMarginsTB">Id: {selectedNft.nft_id}</p>
                                </li>
                                <li>
                                    <p className="extraMiniMarginsTB">In Use: {selectedNft.in_use ? 'Yes':'No'}</p> 
                                </li>
                            </ul>
                        </div>
                    </div>
                    <button onClick={enableMarket}>Proceed</button>
                </div>
            </div>
        </Absscreenwrapper>
    )
}

export default Marketenabler;