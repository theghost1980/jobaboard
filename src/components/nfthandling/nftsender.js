import React, { useState, useEffect } from 'react';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
import Btnclosemin from '../btns/btncloseMin';
import Loader from '../loader';
import Abswrapper from '../absscreenwrapper';
import Btninfo from '../btns/btninfo';
// import Btnswitch from '../btns/btnswitch';

//constants
const msg = "Important: Once you send a token to an account, the transaction will be irreversible, so please review it carefully.";

// Important TODO
// This component will:
//  - Update user field holding, anytime an instance is sent to him adding nft_id to it.

/**
 * This component allows user to:
 * -> Detect if actual user is following the presented user. If not, allow user to follow/unfollow on hive.
 * --> Send the customJson using HiveKeychain, Wait for answer and send result to the future component called topMessenger.
 * @param {Object} userdata - The user data to use.
 * @param {Object} nft - The nft object that contains the actual info.
 * @param {Object} nftInstances - The nft instances Object to manipulate.
 * @param {function} cbOnFinish - Call back to return the results after finishing.
 * @param {function} cbCancel - Call back to close the instantiator.
 * @param {String} ssc_id - The ssc id that will listen to this transaction. 2 Options: 1: "ssc-testNettheghost1980" 2: "main"
 * @param {String} nftEP - The EP on BE to get the TX info || execute operations on NFT BE handle.
 * @param {String} userEP - The EP on BE to get the TX info || execute operations on NFT BE handle.
 */

const Nftsender = (props) => {
    const { userdata, nft, nftInstances, cbOnFinish, cbCancel, ssc_id, nftEP, userEP } = props;
    const [selector, setSelector] = useState(null);
    const [following, setFollowing] = useState(null);
    const [tx, setTx] = useState(null);
    const [working, setWorking] = useState(false);
    const [payloadArray, setPayloadArray] = useState([]); //to add/remove the instances the user wants to transfer
    const [showSearch, setShowSearch] = useState(false);
    const [userNameSearch, setUserNameSearch] = useState(null);
    const [transferTo, setTransferTo] = useState(null);
    const [newHolding, setNewHolding] = useState(null);

    // functions/CB
    function processCustomJson(jsonData, msg){
        if(isKeychainInstalled){
            setWorking(true);
            window.hive_keychain.requestCustomJson(userdata.username, ssc_id, "Active", JSON.stringify(jsonData), msg, function(result){
                const { message, success, error } = result;
                console.log(result);
                if(!success){
                    if(error !== "user_cancel"){
                        const { error, cause, data } = result.error;
                        console.log('Error while trying to send custom_json on NFT.', message);
                    }else if(error === "user_cancel"){
                        // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
                        console.log('User cancelled Operation on the NFTeditor.!');
                    }
                    setWorking(false);
                }else if (success){
                    //check on this txId to analize results.
                    setTx(result.result.id);
                    console.log('Checking TX!',result.result.id);
                    // TODO: send log to loggerOP
                };
            });
        }
    }
    function addInArray(item){
        setPayloadArray(prevState =>[ ...prevState, String(item)]);
    }
    // function removeInArray(item){
    //     //just check none of the main users:
    //     if(item !== "jobaboard" && item !== userdata.username){
    //         const without = payloadArray.filter(user => user !== item);
    //         setPayloadArray(without);
    //     }
    // }
    const handleSearch = (event) => {
        event.preventDefault();
        if(userNameSearch && userNameSearch !== userdata.username){
            setWorking(true);
            getDataWH(userEP + "findJabUser",{ 'x-access-token': userdata.token, 'query': JSON.stringify({ username: userNameSearch})})
            .then(response => {
                setWorking(false);
                console.log(response);
                if(response.status === "sucess"){
                    setTransferTo(response.result.username);
                    setShowSearch(false);
                }else if(response.status === "not found"){
                    alert('That user do not exist on JAB. Please try another user name!');
                }
            }).catch(error => {
                console.log('Error asking for User on BE.',error);
                setWorking(false);
            })
        }
    }
    const processData = () => {
        if(payloadArray.length > 0 && transferTo){
            processCustomJson({
                "contractName": "nft",
                "contractAction": "transfer",
                "contractPayload": {
                    "to": transferTo,
                    "nfts": [
                        {"symbol": nft.symbol, "ids": [...payloadArray]},
                    ]
                }
            },`Send ${payloadArray.length.toString()} ${nft.symbol} to:${transferTo}`);
        }
    }
    const addIt = (_token) => {
        if(_token){
            console.log(`To add:${_token}`);
            const found = payloadArray.filter(token => String(token) === String(_token));
            console.log(found);
            if(found.length === 0){
                if(payloadArray.length <= 50){
                    addInArray(_token);
                }else{
                    alert('We support a maximmun transfer of 50 token.\nYou may send 50 tokens now, and execute more transfers if you need.');
                }
            }
        }
    }
    const removeIt = (_token) => {
        if(_token){
            console.log(`To remove:${_token}`);
           const without = payloadArray.filter(token => token !== _token);
            setPayloadArray(without);
        }
    }
    function getInfoTX(){
        if(tx){
            console.log(`Checking on: ${tx}`);
            const headers = {'x-access-token': userdata.token, 'tx': tx,};
            getDataWH(nftEP + "tx", headers)
            .then(response => {
                console.log(response);
                if(response.status === "askAgain"){
                    return setTimeout(getInfoTX,3000); //recursive to go and check again until the Tx has been propagated on the chains.
                }else{
                    console.log('Process should be finished here. Move on Dev!');
                    // TODO The only data we will update on mongoDB is:
                    // When editing metadata, name, desc, nft icon, todo..expand this
                    setWorking(false);
                    //handling for Authorized Issuing Account
                    // TODO
                    // check what is the answer as soon as transfer has been success
                    // or possibl errors
                        if(response.action === "transfer"){
                            if(response.logs){
                                // response for 1 transfer {"events":[{"contract":"nft","event":"transfer","data":{"from":"theghost1980","fromType":"u","to":"workerjab1","toType":"u","symbol":"ACQ","id":"2"}}]}
                                // response for many: {"events":[{"contract":"nft","event":"transfer","data":{"from":"theghost1980","fromType":"u","to":"workerjab1","toType":"u","symbol":"ACQ","id":"6"}},{"contract":"nft","event":"transfer","data":{"from":"theghost1980","fromType":"u","to":"workerjab1","toType":"u","symbol":"ACQ","id":"7"}},{"contract":"nft","event":"transfer","data":{"from":"theghost1980","fromType":"u","to":"workerjab1","toType":"u","symbol":"ACQ","id":"8"}}]}
                                const logs = JSON.parse(response.logs);
                                console.log('Logs:',logs);
                                if(logs.events.length === payloadArray.length){
                                    // {"to":"workerjab1","nfts":[{"symbol":"ACQ","ids":["2"]}],"isSignedWithActiveKey":true}
                                    // as many {"to":"workerjab1","nfts":[{"symbol":"ACQ","ids":["6","7","8"]}],"isSignedWithActiveKey":true}
                                    const payload = JSON.parse(response.payload);
                                    console.log('payload received:',payload);
                                    if(payloadArray.length > 1){ 
                                        if(payload.isSignedWithActiveKey && payload.nfts[0].ids.length === payloadArray.length){
                                            updateHolding(payload.nfts[0].ids.length);
                                            alert(`Successfully sent ${payload.nfts[0].ids.length} ${nft.symbol} Token(s) to ${transferTo}`);
                                            setTx(null);
                                            cbOnFinish();
                                            // TODO important
                                            // here we must updateuserField as holding[symbol]
                                            // so we may need to have a query of Insert into holding
                                            // and also Remove from holding.
                                            // This function can be executed on each of the results, no matter
                                            // if we sent 1 or more tokens, as we only need the symbol
                                            // the following code must be used as reference but we need to add the especific method "insert" & "remove" from field.
                                            // here as we have instantiated we update the circulating supply to 1
                                        }
                                    }else if(payloadArray.length === 1){ 
                                        if(payload.isSignedWithActiveKey && payload.nfts.length === payloadArray.length){
                                            updateHolding(payload.nfts.length);
                                            alert(`Successfully sent ${payload.nfts.length} ${nft.symbol} Token(s) to ${transferTo}`);
                                            setTx(null);
                                            cbOnFinish();
                                        }
                                    }
                                }
                            }
                        }
                }
            })
            .catch(error => {
                console.log('Error asking data ssc on BE',error);
                setWorking(false);
            });
        }
    }
    const reset = () => {
        setSelector(null);
        cbCancel();
    }
    function addReceiver(user){
        setTransferTo(user);
        setSelector(null); //to hide the list as a user was selected
    }
    function updateHolding(payloadNfts){
        if(newHolding && newHolding.length > 0){ 
            console.log(`Sending toTransfer:${transferTo}`);
            const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ $push: { holding: nft.symbol } }), 'toupdateon': transferTo};
            sendPostBEJH(userEP+"updateUserField",headers).then(response => {
                console.log(response);
            }).catch(error => {
                console.log('Error updating holding field',error);
            });
        }
        console.log('payloadArray.length:', payloadArray.length);
        console.log('payloadNfts:', payloadNfts);
        if(payloadArray.length === payloadNfts){ //means the user sent all his tokens so now NADA ZIPPO CAPUTS!
            const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ $pull: { holding: nft.symbol } }), 'toupdateon': null};
            sendPostBEJH(userEP+"updateUserField",headers).then(response => {
                console.log(response);
            }).catch(error => {
                console.log('Error updating holding field',error);
            });
        }
    }
    // Data fecthing
    async function getDataWH(url = '', headers = {}) {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors', 
            headers: headers,
        });
        return response.json(); 
    };
    async function sendPostBEJH(url = '', headers) {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
        });
        return response.json(); 
    };
    // END data fecthing
    // END functions/CB

    //to fire on each state change
    useEffect(() => {
        if(selector){
            console.log(`Now on: ${selector}`);
            if(selector === "showList"){
                setWorking(true);
                const headers = { 'x-access-token': userdata.token, 'tolookup': null, 'query': JSON.stringify({ following: 1 })};
                // TODO modify this function on BE to accept another param as usertolookup so if not present uses the decoded
                // then on FE to add it
                getDataWH(userEP+"jabUserField",headers).then(response => {
                    console.log(response);
                    if(response.status === "sucess" && response.result.following.length > 0){
                        const _following = response.result.following;
                        if(_following.length === 1 && _following[0] === ""){
                            alert('You are not following JABers.');
                            setWorking(false);
                            return setFollowing(null);
                        }
                        setFollowing(response.result.following);
                        setWorking(false);
                    }
                }).catch(error => {
                    console.log('Error asking for following field',error);
                    setWorking(false);
                });
            }
        }
    }, [selector]);
    useEffect(() => {
        if(tx){
            //testing on 3s
            setTimeout(getInfoTX,3000);
        }
    },[tx]);
    useEffect(() => {
        if(transferTo){
            //now as the transfer to has been added, no matter from which option: search, list or whatever
            // we ask for his holding field to compare with this symbol and prepare the op of updating this field
            const headers = { 'x-access-token': userdata.token, 'tolookup': transferTo, 'query': JSON.stringify({ holding: 1 })};
            getDataWH(userEP+"jabUserField",headers).then(response => {
                console.log(response);
                if(response.status === "sucess"){
                    if(response.result.holding.length === 0){
                        setNewHolding([ String(nft.symbol) ]);
                    }else{
                        const found = response.result.holding.filter(symbol => symbol === nft.symbol);
                        if(found.length === 0){
                            const newArray = response.result.holding.concat([ String(nft.symbol) ]);
                            setNewHolding(newArray);
                        };
                    }
                }
            }).catch(error => {
                console.log('Error asking for holding field.',error);
            });
        }
    }, [transferTo]);
    // for testing on dev - to delete later on
    useEffect(() => {
        console.log(newHolding);
    }, [newHolding]);
    //END to fire on each state change

    return (
        <div className="standardDivRowFullW">
            <div className={`standardDivColHalfW whiteBack marginAuto relativeDiv justRounded ${working ? 'disableDiv2': null}`}>
                <Btnclosemin btnAction={cbCancel} classCSS={"justTopRightPos absCloseCont"} />
                <div className="standardDivColFullW standardContentMargin">
                    <h2>We are about to Send {nft.symbol}<Btninfo msg={msg}/></h2>
                    {
                        working &&
                        <div className="standardDivRowFlex100pX100pCentered">
                            <Loader xtraClass={"marginsTB"} logginIn={true} typegif={"blocks"} />
                        </div>
                    }
                    <p>You have {nftInstances.length - payloadArray.length} Token{nftInstances.length === 1 ? null: 's'} available.</p>
                    <div className="standardDivRowFullW justifyContentSpaced marginAuto">
                        <div className="standardDiv60Percent">
                            <p>Your tokens list</p>
                            <ul className="overflowYscroll justMaxHeight">
                                {
                                    nftInstances.map(token => {
                                        return (
                                            <li key={token._id} className="standardLiHovered "
                                                title="Click to Add to sending list" onClick={() => addIt(token._id)}>
                                                Token Id:{token._id} - Owned by:{token.ownedBy}
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                        <div className="standardDiv30Percent">
                            <p>About to send</p>
                            <ul className="overflowYscroll justHeight90p">
                                {   
                                    payloadArray.map(id => {
                                        return (
                                            <li key={`${id}-ToSendNFTJAB`} className="standardLiHovered "
                                                title="Click to Remove if from sending list" onClick={() => removeIt(id)}>
                                                Token Id:{id}
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                            <p className="noMargins textXSmallOrange">Total tokens to send:{payloadArray.length.toString()}</p>
                        </div>
                    </div>
                    <h2>Send the selected tokens to user: {transferTo}</h2>
                    <p>Options</p>
                        <ul className="standardUlRowFlexPlain justJustifiedContent">
                            <li className="marginRight"><button onClick={() => setSelector("showList")} title="Add from the JABers I follow">From Following</button></li>
                            <li className="marginRight"><button title="Select from my Friends on the Chat">From Chat-TODO</button></li>
                            <li><button onClick={() => setShowSearch(true)} title="Let me input the name. ">I will search</button></li>
                        </ul>
                        {
                            showSearch && 
                            <Abswrapper xtraClass={"justiAlig"}>
                                <div className="standardDivColHalfW relativeDiv whiteBack justRounded">
                                    <Btnclosemin btnAction={() => setShowSearch(false)} classCSS={"justTopRightPos absCloseCont"} />
                                    {
                                        working && 
                                        <div className="standardDivRowFlex100pX100pCentered">
                                            <Loader logginIn={true} typegif={"dots"} />
                                        </div>
                                    }
                                    <form onSubmit={handleSearch} className="justiAlig justDisplayFlex justpaddingTB">
                                        <label htmlFor="input_search_name">User Name:</label>
                                        <input type="text" name="input_search_name" onChange={(e) => setUserNameSearch(e.target.value)} />
                                        <button type="submit">Search</button>
                                    </form>
                                </div>
                            </Abswrapper>
                        }
                        {
                            selector && (selector === "showList") && following &&
                            <Abswrapper xtraClass={"justiAlig"}>
                                <div className="standardDivColHalfW whiteBack marginAuto relativeDiv justRounded">
                                    {
                                        working &&
                                        <div className="standardDivRowFlex100pX100pCentered">
                                            <Loader xtraClass={"marginsTB"} logginIn={true} typegif={"blocks"} />
                                        </div>
                                    }
                                    <p className="smallText">Just click on the user name, to select the receiver.</p>
                                    <ul className="overflowYscroll justMaxHeight">
                                        {
                                            following.map(user => {
                                                return (
                                                    (user && user !== "jobaboard") ?  
                                                            <li key={`${user}-JABersIFollow`} className="standardLiHovered" title={"Click to Select"}
                                                                onClick={() => addReceiver(user)}
                                                            >
                                                                {user}
                                                            </li> : null
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            </Abswrapper>
                        }
                    {
                        // authAction === "Add Authorities" ?
                        // <div className="standardDivRowFullW">
                        //     <div className="standardDiv60Percent">
                        //         <p>Actual Accounts</p>
                        //         <ul className="overflowYscroll justMaxHeight">
                        //             {
                        //                 authAccounts.map(authUser => {
                        //                     return (
                        //                         <li key={`${authUser}-authorizedToIssueJAB`} className="standardLiHovered"
                        //                             title="Actual User">
                        //                             {authUser}
                        //                         </li>
                        //                     )
                        //                 })
                        //             }
                        //         </ul>
                        //         {
                        //             showSearch && 
                        //             <div className="relativeDiv">
                        //                 <Btnclosemin btnAction={() => setShowSearch(false)} classCSS={"justTopRightPos absCloseCont"} />
                        //                 <form onSubmit={handleSearch}>
                        //                     <label htmlFor="input_search_name">User Name:</label>
                        //                     <input type="text" name="input_search_name" onChange={(e) => setUserNameSearch(e.target.value)} />
                        //                     <button type="submit">Search</button>
                        //                 </form>
                        //             </div>
                        //         }
                        //         <p>Options</p>
                        //         <ul className="standardUlRowFlexPlain justJustifiedContent">
                        //             {
                        //                 (ImIAsAuth()) && <li>Add Me as I don't know why I am not listed.<button onClick={() => addIt(userdata.username)}>Add Me</button></li>
                        //             }
                        //             <li className="marginRight"><button onClick={() => setSelector("showList")} title="Add from the JABers I follow">From Following</button></li>
                        //             <li className="marginRight"><button title="Select from my Friends on the Chat">From Chat-TODO</button></li>
                        //             <li><button onClick={() => setShowSearch(!showSearch)} title="Let me input the name. ">I will search</button></li>
                        //         </ul>
                        //     </div>
                        //     <div className="standardDiv30Percent">
                        //         {
                        //         selector && (selector === "showList") && following &&
                        //         <div>
                        //             <p className="smallText">Just click on it, to add it. When ready hit Submit.</p>
                        //             <ul className="overflowYscroll justMaxHeight">
                        //                 {
                        //                     following.map(user => {
                        //                         return (
                        //                             (user && user !== "jobaboard") ?  
                        //                                     <li key={`${user}-JABerIFollow`} className="standardLiHovered" title={"Click to add"}
                        //                                         onClick={() => addIt(user)}
                        //                                     >
                        //                                         {user}
                        //                                     </li> : null
                        //                         )
                        //                     })
                        //                 }
                        //             </ul>
                        //         </div>
                        //         }
                        //     </div>
                        // </div>
                        // : 
                        // <div>
                        //     <p>Actual Accounts</p>
                        //     <ul className="overflowYscroll justMaxHeight">
                        //         {
                        //             authAccounts.map(authUser => {
                        //                 return (
                        //                     <li key={`${authUser}-authorizedToIssueJAB`} className="standardLiHovered "
                        //                         title="Click to remove" onClick={() => removeIt(authUser)}>
                        //                         {authUser}
                        //                     </li>
                        //                 )
                        //             })
                        //         }
                        //     </ul>
                        // </div>
                    }
                    {
                        <div className="standardDivRowFullW justifyContentSpaced marginAuto">
                            <button onClick={reset}>Cancel and Exit</button>
                            <button className="minibtn" onClick={processData}>Submit</button>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Nftsender;