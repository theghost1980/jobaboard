import React, { useEffect, useState } from 'react';
import Absscreenwrapper from '../../absscreenwrapper';
import Btnclosemin from '../../btns/btncloseMin';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';

/**
 * This component allow user to handle the enable market process on his NFT.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Function} closeCB - cb to close the component.
 * @param {Object} userdata - contains all userdata to handle.
 * @param {Object} selectedNft - contains the nft definition to aply the enable market request.
 * @param {String} ssc_test_id as the node that will listen. Now on testNode later on mainNet.
 * @param {String} nftEP - the EP on BE to search TXs on hive main chain.
 * @param {String} nfthandlermongoEP - EP to handle mongoDB nft definitions.
 * @param {Boolean} devMode - optional to activate console.logs.
 */

const Marketenabler = (props) => {
    const { closeCB, xclassCSS, userdata,  selectedNft, devMode, ssc_test_id, nftEP, nfthandlermongoEP} = props;
    const [tx, setTx] = useState(null);

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
            const msg = `Enable Market for ${selectedNft.symbol} on JAB`;
            const jsonData = { "contractName": "nftmarket", "contractAction": "enableMarket", "contractPayload": { "symbol": selectedNft.symbol }};
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
                }else if (success){ // TODO: send log to loggerOP
                    //check on this txId to analize results.
                    setTx(result.result.id);
                    console.log('Checking TX!',result.result.id);
                };
            });
        }else{
            alert('If the Hive Key Chain is installed, just click on the icon to activate on this website.\nIf not installed, please do so in htttp://todothelink.com');
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
                    if(devMode){ console.log('Process should be finished here. Move on Dev!') };
                    if(response.logs){ //{"events":[{"contract":"nftmarket","event":"enableMarket","data":{"symbol":"GUYEN"}}]}
                        const pLogs = JSON.parse(response.logs); //{"events":[{"contract":"nftmarket","event":"enableMarket","data":{"symbol":"ONIX"}}]}
                        if(devMode) { console.log(pLogs) };
                        if(pLogs.hasOwnProperty('events') && pLogs.events[0].event === "enableMarket"){
                            updateNftMongo();
                            alert(`Enabled Market on: ${pLogs.events[0].data.symbol}.Go place some orders!`);
                        }
                        if(pLogs.errors){ //{"errors":["market already enabled"]}
                            updateNftMongo();
                            alert(`Erros: ${pLogs.errors[0]}`);
                        }
                    }
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
        if(tx){
            if(tx){ setTimeout(getInfoTX,3000)} //testing on 3s
        }
    },[tx])
    //END to load on each change of state
    return (
        <Absscreenwrapper xtraClass={"justiAlig"}>
            <div className={`${xclassCSS} whiteBack standardDiv80Auto jutsMinHeight320px`}>
                <Btnclosemin btnAction={closeCB} />
                <div className="standardContentMarginLR justMarginBottom">
                    <div className="standardDivRowFullW">
                        <div className="justWidth60">
                            <h3>Important:</h3>
                            <p>This activation it will happen only once and it will enable this token to be sold on the NFT market.</p>
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