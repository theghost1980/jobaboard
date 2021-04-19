import React, { useState, useEffect } from 'react';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
import Btnclosemin from '../btns/btncloseMin';
import Loader from '../loader';

/**
 * This component allows user to:
 * -> Detect if actual user is following the presented user. If not, allow user to follow/unfollow on hive.
 * --> Send the customJson using HiveKeychain, Wait for answer and send result to the future component called topMessenger.
 * @param {Object} userdata - The user data to use.
 * @param {Object} nft - The nft object that contains all the info.
 * @param {Number} amount - Number of tokens you want to create.
 * @param {function} cbOnFinish - Call back to return the results after finishing.
 * @param {function} cbCancel - Call back to close the instantiator.
 * @param {Object} jabFEE - Object that contains all the fee, price per instance, etc.
 * @param {String} ssc_id - The ssc id that will listen to this transaction. 2 Options: 1: "ssc-testNettheghost1980" 2: "main"
 * @param {String} nftEP - The EP on BE to get the TX info || execute operations on NFT BE handle.
 */

const Instantiator = (props) => {
    const { userdata, nft, amount, cbOnFinish, cbCancel, jabFEE, ssc_id, nftEP} = props;
    const [set_onNoti, setSet_onNoti] = useState(false);
    const [tx, setTx] = useState(null);
    const [message, setMessage] = useState(null);
    const [working, setWorking] = useState(false);
    // functions/CB
    const setOnNoti = () => {
        setSet_onNoti(!set_onNoti);
    }
    function jsonArray(_amount){
        const feeSymbol = "BEE";
        const arrayJson = [];
        for(let i = 0; i < _amount ; i++){
            const payload = {
                "fromType": "user",
                "symbol": String(nft.symbol),
                "to": userdata.username,
                "feeSymbol": feeSymbol,
            }
             arrayJson.push(payload);
        }
        return arrayJson;
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
                        setWorking(false);
                        // TODO
                        // CHEck if was successfull then
                        // add into mongoDb to update the new amount of issued and circutaling supply
                        // looks like it will return amount = contract_name.
                        const tknContracts = logs.events.filter(log => log.contract === "tokens");
                        const nftContracts = logs.events.filter(log => log.contract === "nft");
                        // console.log(tknContracts,nftContracts);
                        if(Number(amount) === tknContracts.length && Number(amount) === nftContracts.length){
                            //was succesfull dunno if we must handle in case of an error of issuing less than amount???
                            alert(`We casted ${amount} ${nft.symbol} Token(s)`);
                            setMessage(`We casted ${amount} ${nft.symbol} Token(s)`);
                            cbOnFinish();
                        }
                        if(logs.errors){
                            const foundAuthIssueError = logs.errors.filter(error => error === "not allowed to issue tokens");
                            console.log(foundAuthIssueError);
                            if(foundAuthIssueError.length >= 1){
                                alert('Our System has detected that you are not set as Issuer, even when you own the token.\nTo fix this, just navigate to Tokens>Edit>Authorize Casting Accounts.\n.');
                                // TODO what to do if the transfer as already done?
                                // options: 1. give the money back.
                                        //  2. create a special 1 time only use code. JAB12XX-123@$, with expiration and add a collection into DB, so it can be tracked and used 1 time only.
                            }
                        }
                        //check the logs
                        // if(logs.events && logs.events.length > 0){ //means tokens submitted successfully so we can check
                        //     // addStateOP({ state: 'Sucess Token Created.', data: { log: JSON.stringify(logTx.events)} });
                            
                        // }else if(logs.errors){ //handle the errors.
                        //     // addStateOP({ state: 'Error when receiving ssc server response.', data: { error: JSON.stringify(logTx.errors)} });
                        //     // TODO.
                        //     console.log('Error on logs',logs.errors);
                            
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
    // //////Fetching data functions
    async function getSSCData(url = '', headers) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: headers,
        });
        return response.json(); 
    };
    // //////END fecthing data functions
    // end functions/CB

    // to handle the operation
    const instantiate = () => {
        if(isKeychainInstalled){
            setWorking(true);
            const amountToPay = (Number(jabFEE.costInstance) * amount).toFixed(3).toString();
            const json = jsonArray(amount);
            const memo = {
                "id": ssc_id,
                "json": {
                    "contractName": "nft",
                    "contractAction": "issueMultiple",
                    "contractPayload": {
                        "instances": [ ...json ]
                    },
                },
            };
            window.hive_keychain.requestTransfer(userdata.username, "jobaboard", amountToPay, JSON.stringify(memo), jabFEE.acceptedCur, function(result){
                const { message, success, error } = result;
                console.log(result);
                if(!success){
                    if(error !== "user_cancel"){
                        const { error, cause, data } = result.error;
                        if( cause.name && cause.name === "RPCError"){
                            // addStateOP({ state: 'Fatal Error', data: { error: JSON.stringify(result.error)} });
                            //TODO: send this data to OPLOGGER.
                            // OPLOGGER must be a component that:
                            // - receives the log/op/errors as props
                            // - test connectivity on BE(we must code an EP as /PING on public maybe || adminEP) to get "OK"
                            // - send the log to mongoDB.
                            // - it may has additional features to activate on BE as:
                            //      - send log to support or send special message/email to admins
                            // - receives the log id + success msg from BE
                        }
                        // TODO send the log as well and register the event.
                        // TODO: ALL this process must finish presenting to user
                        // - A msg that "His/her funds are safe as we have registered it" & "Take note of the system log, in case support contacts you during the next 24 hrs."
                        // - A final msg as "You may continue doing the same operation and we will send your money back as soon as possible or contact support if any available".
                        setWorking(false);
                        return console.log('Error while transfering', message);
                    }else if(error === "user_cancel"){
                        // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
                        console.log('User click on cancel!');
                    }
                    setWorking(false);
                }else if (success){
                    const { type, memo, amount, currency, username } = result.data;
                    if( type === "transfer" && 
                        amount === amountToPay && 
                        memo === memo 
                        && username === userdata.username && currency === jabFEE.costCurr){ 
                    }
                    // addStateOP({ state: 'Sucess transferred funds', data: {} });
                    console.log('Executed successfully. Now check to continue dev work!!!',result.result.id);
                    setTx(result.result.id);
                };
            });
        }else{
            alert('Please allow Hive Keychain to access this website. If you have installed it, just click the icon on your web browser. If not installed follow this link TODO.')
            setWorking(false);
        }
    }
    // END to handle the operation

    // calling on each change of state
    useEffect(() => {
        console.log(set_onNoti);
    }, [set_onNoti]);
    useEffect(() => {
        if(tx){
            //testing on 3s
            setTimeout(getInfoTX,3000);
        }
    },[tx]);
    // END calling on each change of state

    return (
        <div className="standardDivRowFullW">
            <div className={`standardDivColHalfW whiteBack marginAuto relativeDiv justRounded relativeDiv ${working ? 'disableDiv2': null}`}>
                <Btnclosemin btnAction={cbCancel} classCSS={"justTopRightPos absCloseCont"} />
                <div className="standardDivColFullW">
                    <div className="standardContentMargin standardDivColFullW normalTextSmall">
                        <img src={nft.image} className="imageMedium" />
                        <h3 className="marginRL">We are about to create: {amount} token{ amount === 1 ? null: 's'} of {nft.symbol}</h3>
                        <h3 className="marginRL">Total Price to transfer: {(Number(jabFEE.costInstance) * amount)} in {jabFEE.acceptedCur}</h3>
                        <p className="marginRL">The process is fast but if you are in a hurry. Check the box bellow and the system will do it in a few moments, and send you a notification when is done.(TODO)</p>
                        {
                            working &&
                            <div className="absDivRow100x100">
                                <Loader logginIn={true} typegif={"blocks"} xtraClass={"absDivRow100x100 marginsTB"} />
                            </div>
                        }
                        <div className="standardDivRowFullW">
                            <label className="marginRL" htmlFor="set_on_noti">After transfer the funds send me a notification when is ready.</label>
                            <input name="set_on_noti" type="checkbox" defaultChecked={set_onNoti} onChange={setOnNoti} />
                        </div>
                        {
                            !message &&
                            <button onClick={instantiate} className="width100p marginsTB">Proceed</button>
                        }
                        {
                            message &&
                            <div>
                                <p>{message}</p>
                                <button onClick={cbCancel}>Close</button>
                            </div>
                        }
                    </div>
                    <div className="standardContentMargin standardDivColFullW contrasted">

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Instantiator;