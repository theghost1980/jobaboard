import React, { useState, useEffect } from 'react';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
import Absscreenwrapper from '../absscreenwrapper';
import Btnclosemin from '../btns/btncloseMin';
import Loader from '../loader';
import Alerticon from '../icons/alerticon';

//constants
const userEP = process.env.GATSBY_userEP;
const nftEP = process.env.GATSBY_nftEP;
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
//end constans

/**
 * This component allows user to: 
 * - Burn a selected token
 * - update the nft of user.nfts as burned: true.
 * - TODO: after being burned, it will be show on token's history of user.
 * @param {Object} userdata - The user data to use.
 * @param {Function} closeCB the parent's CB to close this component.
 * @param {[Object]} selectedInstances the array of objects that contain the selected instances.
 * @param {String} ssc_test_id as the node we want to replicate the transaction. Options: 1: "ssc-testNettheghost1980" 2: "main"
 * @param {Object} selected as the selected nft when user clicks as we need it here to stablish _id, symbol.
 * @param {Function} cbOnSucess Optional if you need to do something after burns.
 * @param {Boolean} devMode Optional to debug on console.
 */

const Nftburner = (props) => {
    const { closeCB, selectedInstances, userdata, ssc_test_id, selected, cbOnSucess, devMode } = props;
    const [tx, setTx] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [selectedToBurn, setSelectedToBurn] = useState(null);

    //functions/CB
    function burnToken(token){
        // TODO: play with the logic on, if this token is been used on a job?
        // I guess in_use can serve to "transfers" maybe but cannot see the logic yet.
        if(isKeychainInstalled){
            const answer = window.confirm(`You are about to Burn 1 ${selected.symbol} token.\nShall we proceed?`);
            if(answer){
                setLoadingData(true);
                console.log('To burn:', { nft_instance: token, nft_definition: selected });
                setSelectedToBurn(token);
                const jsonData = {
                            "contractName": "nft",
                            "contractAction": "burn",
                            "contractPayload": {
                                "nfts": [ {"symbol": String(selected.symbol), "ids": [ String(token._id) ]} ]
                            }
                }
                const msg = `To burn 1 ${selected.symbol} token.`;
                window.hive_keychain.requestCustomJson(userdata.username, ssc_test_id, "Active", JSON.stringify(jsonData), msg, function(result){
                    const { message, success, error } = result;
                    console.log(result);
                    if(!success){
                        if(error !== "user_cancel"){
                            const { error, cause, data } = result.error;
                            console.log('Error while trying to burn NFT.', message);
                        }else if(error === "user_cancel"){
                            // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
                            console.log('User cancelled burning!');
                            setLoadingData(false);
                        }
                    }else if (success){
                        //check on this txId to analize results.
                        setTx(result.result.id);
                        console.log('Checking TX!',result.result.id);
                        // TODO: send log to loggerOP
                    };
                });
            }else{
                console.log('Token Burning cancelled. Send this to loggerOps');
                setLoadingData(false);
            }
        }
    }
    async function updateBurned(arrayEvents){
        console.log('To handle:', arrayEvents);
        if(arrayEvents[0].event === "burn"){
            // const account = arrayEvents[0].data.account;
            // const nft_symbol = arrayEvents[0].data.symbol;
            const nft_instance_id = selectedToBurn._id;
            const query = { burned: true, updatedAt: new Date(),}
            sendPostBEJH(nfthandlermongoEP+"updateInstanceNFTfield",query, nft_instance_id, selected.nft_id)
            .then(response => {
                console.log(response); //status, result
            }).catch(error => console.log('Error updating field on Instance NFT to DB.',error));
        }
        // 0: Object { contract: "nft", event: "burn", data: {…} }
        // contract: "nft"
        // data: Object { account: "theghost1980", ownedBy: "u", symbol: "GHO", … }
        // event: "burn"
    }
    function getInfoTX(){
        if(tx){
            getSSCDataTX(nftEP + "tx", tx)
            .then(response => {
                // console.log(response);
                if(response.status === "askAgain"){
                    return setTimeout(getInfoTX,3000);
                }else{
                    //{"events":[{"contract":"nft","event":"burn","data":{"account":"theghost1980","ownedBy":"u","unlockedTokens":{},"unlockedNfts":[],"symbol":"APII","id":"1"}}]}
                    if(response.logs){
                        const logs = JSON.parse(response.logs);
                        // console.log(logs.events);
                        if(logs.events.length === 1 && logs.events[0].event === "burn"){
                            //update user.nfts
                            updateBurned(logs.events);
                            //burned. show message to user
                            const msg = `Symbol: ${logs.events[0].data.symbol} ID: ${logs.events[0].data.id} has been sent to null.`;
                            alert('Token Burned Successfully\n' + msg);
                            setTx(null);
                            closeCB();
                            setLoadingData(false);
                            //TODO: update the main nft list.
                            // TODO: send log to loggerOP
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
    /////data fetching
    async function getSSCDataTX(url = '',tx) {
        const response = await fetch(url, { method: 'GET', mode: 'cors', headers: { 'x-access-token': userdata.token,'tx': tx,},});
        return response.json(); 
    };
    //data fecthing
    async function sendPostBEJH(url = '', query = {}, nft_instance_id = Number, ntf_id = Number) {
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: { 'x-access-token': userdata.token, 'query': JSON.stringify(query), 'nft_instance_id': nft_instance_id, 'ntf_id': ntf_id},
        });
        return response.json(); 
    };
    /////END data fetching
    //END functions/CB

    //to load on every state change
    useEffect(() => {
        if(tx){
            setTimeout(getInfoTX,3000); //testing on 3s
        }
    },[tx]);
    //END to load on every state change

    //to load on Init/End
    useEffect(() => {
        if(devMode){ console.log('Received as props:', { closeCB: closeCB, selectedInstances: selectedInstances , userdata: userdata, ssc_test_id: ssc_test_id, selected: selected, cbOnSucess: cbOnSucess })}
        return () => {
            console.log('Unmount Burnernft.', cbOnSucess);
            if(cbOnSucess){ return cbOnSucess()};
        }
    },[]);
    //END to load on Init/End

    return (
        <Absscreenwrapper xtraClass={"justiAlig"}>
            <div className="standardDiv60Percent relativeDiv justBorders justRounded justbackground marginAuto">
                <Btnclosemin classCSS={"closeBtnAbs"} btnAction={closeCB} />
                {   
                    loadingData ? 
                    <div className="standardDivRowFlex100pX100pCentered justpaddingTB">
                        <Loader logginIn={loadingData}/>
                    </div>
                    :
                    <div className="standardContentMargin">
                        <div className="standardDivRowFullWAuto justFlexWrap justiAlig">
                            <h2>We are about to Burn {selected.symbol} tokens</h2>
                            <Alerticon xclassCSS={"iconBlock45p"} size={"Big"} type={"filled"} typeDiv={"notAbsolute"}/>
                        </div>
                        <p>You must understand that this action cannot be undone.</p>
                        <p>Once a token has been burned, we cannot recover it. So please proceed with caution.</p>
                        <p>Important JAB feature: Even when the burned token will be gone, we will keep a record as burned, so you can check on your tokens history anytime.</p>
                        <p>Select the Token to burn from the list</p>
                        <ul className="justBorders justRounded ">
                            {
                                selectedInstances.map(token => {
                                    return (
                                        <li key={`${token._id}-toBurn`} className="standardLiHovered" onClick={() => burnToken(token)}>
                                            ID: {token._id} - Owned By: {token.ownedBy}
                                            {/* TODO: add a loader when is trying to burn the token. */}
                                            {/* TODO: remove the token symbol from user>holding if he had only one of this one. */}
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                }
            </div>
        </Absscreenwrapper>
    )
}

export default Nftburner;