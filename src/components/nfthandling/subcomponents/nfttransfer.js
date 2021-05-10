import React, { useState, useEffect } from 'react';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
import Btnclosemin from '../../btns/btncloseMin';
import Loader from '../../loader';
import Btninfo from '../../btns/btninfo';
import Absscreenwrapper from '../../absscreenwrapper';
import Menuside from '../../interactions/menuside';
import Tablinator from '../../interactions/tablinator';

// NOTE: IMportant this one if not in use.....

/**
 * This component allows user to:
 * -> Transfer || Burn the selected instance from tokens.js
 * @param {Object} userdata - The user data to use.
 * @param {Object} selectedNft_Instance - The nft object that contains the actual instance + .nft_definition.
 * @param {String} action - define if you "burn" or "transfer"
 * @param {function} cbOnFinish - Call back to return the results after finishing.
 * @param {function} cbCancel - Call back to close the instantiator.
 * @param {String} ssc_id - The ssc id that will listen to this transaction. 2 Options: 1: "ssc-testNettheghost1980" 2: "main"
 * @param {String} nftEP - The EP on BE to get the TX info || execute operations on NFT BE handle.
 * @param {String} userEP - The EP on BE to get the TX info || execute operations on NFT BE handle.
 */

const Nfttransfer = (props) => {
    const { userdata, selectedNft_Instance, cbOnFinish, cbCancel, ssc_id, nftEP, userEP, action } = props;
    const [working, setWorking] = useState(false);
    const [following, setFollowing] = useState(null);
    const [sourceList, setSourceList] = useState("");
    const [users, setUsers] = useState(null);
    const [dataUserTo, setDataUserTo] = useState(null);
    const [tx, setTx] = useState(null);
    const [selectedInstances, setSelectedInstances] = useState(null); //so on init we search for all instances the user has if he decides to send multiple.
    const [actionOnInstance, setActionOnInstance] = useState({
        action: action, //transfer or burn
        selectedNft_Instance: selectedNft_Instance,
        totalNft: 1,
        symbol: selectedNft_Instance.ntf_symbol,
        epUrl: '',
        from: userdata.username,
        to: '',
    })

    //to load on Init
    useEffect(() => {
        loadUsers();
        loadInstances(); //we search based on the nft the user selected and scan for all instances has on hive.
    },[]);
    //END to load on Init

    //functions/CB
    function loadUsers(){
        setWorking(true);
        const headers = { 'x-access-token': userdata.token, 'filter': JSON.stringify({}),'query': JSON.stringify({}) };
        dataRequest(userEP+"jabUsersField","GET",headers,null)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){ setUsers(response.result) };
            setWorking(false);
        }).catch(error => {
            console.log('Error on GET request to BE.', error);
            setWorking(false);
        });
    }
    function loadInstances() {
        console.log(`Searching on:${actionOnInstance.symbol} but in Hive chain...`);
        setWorking(true);
        const headers = { 'x-access-token': userdata.token, 'nftsymbol': actionOnInstance.symbol, 'query': JSON.stringify({ account: userdata.username }), 'table': 'instances',};
        console.log(`Searching on:${actionOnInstance.symbol}`);
        dataRequest(nftEP+"allInstances", "GET", headers, null)
        .then(response => {
            console.log(response);
            setSelectedInstances(response);
            setWorking(false);
        }).catch(error => {
            console.log('Error fecthing BE - instances.',error);
            setWorking(false);
        });
    }
    const executeAction = () => {
        if(isKeychainInstalled){
            setWorking(true);
            const msg = `Transfer ${actionOnInstance.totalNft} ${actionOnInstance.symbol} ${actionOnInstance.totalNft === 1 ? 'Token' : 'Tokens'} to ${actionOnInstance.to}`;
            const jsonData = {
                "contractName": "nft",
                "contractAction": "transfer",
                "contractPayload": {
                    "to": actionOnInstance.to,
                    "nfts": [
                        {"symbol": actionOnInstance.symbol, "ids": ["TODO HERE"]}, //todo here.
                    ]
                }
            }
            window.hive_keychain.requestCustomJson(userdata.username, ssc_id, "Active", JSON.stringify(jsonData), msg, function(result){
                const { message, success, error } = result;
                console.log(result);
                if(!success){
                    if(error !== "user_cancel"){
                        const { error, cause, data } = result.error;
                        console.log('Error while trying to send custom_json on NFT.', message);
                    }else if(error === "user_cancel"){ console.log('User cancelled Operation on the NFTeditor.!') }; //TODO // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} });
                    setWorking(false);
                }else if (success){ //check on this txId to analize results.
                    setTx(result.result.id);
                    console.log('Checking TX!',result.result.id); // TODO: send log to loggerOP
                };
            });
        }
    }
    function updateState(name,value){
        setActionOnInstance(prevState => { return {...prevState, [name]: value }});
    }
    const setAndClose = (item) => {
        setDataUserTo(item);
        updateState("to",item.username);
        setSourceList("");
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
                    setWorking(false);
                    if(response.action === "transfer"){
                        if(response.logs){
                            // response for 1 transfer {"events":[{"contract":"nft","event":"transfer","data":{"from":"theghost1980","fromType":"u","to":"workerjab1","toType":"u","symbol":"ACQ","id":"2"}}]}
                            const logs = JSON.parse(response.logs);
                            console.log('Logs:',logs);
                            if(logs.events.length === 1){
                                const payload = JSON.parse(response.payload);
                                console.log('payload received:',payload);
                                    if(payloadArray.length === 1){ 
                                    if(payload.isSignedWithActiveKey && payload.nfts.length === payloadArray.length){
                                        updateHolding(payload.nfts.length);
                                        alert(`Successfully sent ${payload.nfts.length} ${nft.symbol} Token(s) to ${transferTo}`);
                                        // TODO tomorrow
                                        // check all of this and add the update on nft_user.
                                        processEvent(logs.events);
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
    /////data fecthing
    async function dataRequest(url,requestType,headers,formdata){
        const response = formdata ? fetch(url, {
            method: requestType,
            headers: headers,
        }) : fetch(url, { method: requestType, headers: headers });
        return (await response).json();
    }
    /////END data fecthing
    //END functions/CB

    //load on each state change
    useEffect(() => {
        if(users){ setFollowing(users.find(user => user.username === userdata.username).following) };
    },[users]);
    useEffect(() => {
        if(tx){ setTimeout(getInfoTX,3000) }; //each 3s
    },[tx]);
    //END load on each state change

    return (
        <Absscreenwrapper xtraClass={"justiAlig"}>
            <div className={`standardDivFlexPlain justWidth90 jutsMinHeight320px whiteBack marginAuto relativeDiv justRounded ${working ? 'disableDiv2': null}`}>
                <Btnclosemin btnAction={cbCancel} classCSS={"justTopRightPos absCloseCont"} />
                <div className="standardDivRowFullW">
                    <div className="standardDiv40Percent justBorderRightInset">
                        <div className="standardContentMarginLR">
                            <h3>We are about to {actionOnInstance.action}</h3>
                            <h3>{actionOnInstance.totalNft} {actionOnInstance.selectedNft_Instance.ntf_symbol} Token{actionOnInstance.totalNft === 1 ? 's' : null}.</h3>
                            <div className={"standardDivRowFullW"}>
                            {
                                actionOnInstance.selectedNft_Instance.nft_definition.thumb && <img src={actionOnInstance.selectedNft_Instance.nft_definition.thumb} className="miniImageJobs justMargin0auto justshadows" />
                            }
                            <div>
                                <div>
                                    <p>Select NFTs IDs</p>
                                    <Btninfo size={"mini"}  msg={"Each Token have a unique ID, This represent the uniqueness of each NFT token."}/>
                                </div>
                                <ul>
                                    <li></li>
                                </ul>
                            </div>
                            </div>
                            <p>Choose the user you would like to transfer.</p> 
                            <p>Please the options from bellow.</p>
                            <ul>
                                <li className="standardLiHovered" onClick={() => setSourceList("Users")}>Select from User List</li>
                                <li className="standardLiHovered" onClick={() => setSourceList("Following")}>Select from followers</li>
                            </ul>
                        </div>
                    </div>
                    <div className="standardDiv60Percent justiAlig">
                        <div className="standardContentMarginLR">
                            {
                                working && 
                                <div className="standardDivRowFlex100pX100pCentered">
                                    <Loader logginIn={working}/>
                                </div>
                            }
                            {
                                !working &&
                                <div className="justiAlig">
                                    {
                                        sourceList !== '' && users && <Tablinator xclassCSS={"marginTop"} items={sourceList === "Users" ? users : following} toShow={['username','fullname']} clickedSubItemCB={(item) => setAndClose(item)} titleTable={'JABers'} />
                                    }
                                    {
                                        actionOnInstance.to !== "" &&
                                        <div className="justiAlig">
                                            {
                                                dataUserTo && dataUserTo.avatar && <img src={dataUserTo.avatar} className="miniImageJobs justMargin0auto justshadows" />
                                            }
                                            <h2 className="textAlignedCenter">Send NFT to: {actionOnInstance.to}</h2>
                                            <div className="standardDisplayJusSpaceAround justMarginBottom">
                                                <button onClick={cbCancel}>Cancel</button>
                                                <button onClick={executeAction}>{action}</button>
                                            </div>
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </Absscreenwrapper>
    )
}

export default Nfttransfer;