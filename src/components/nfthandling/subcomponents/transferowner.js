import React, { useState, useEffect } from 'react';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
import Btnclosemin from '../../btns/btncloseMin';
import Loader from '../../loader';
import Btninfo from '../../btns/btninfo';
import Absscreenwrapper from '../../absscreenwrapper';
import Menuside from '../../interactions/menuside';
import Tablinator from '../../interactions/tablinator';

//constants
const userEP = process.env.GATSBY_userEP;
//end contansts

/**
 * This component allow user to:
 * Transfer the selected NFT definition, to another user. Will be user also for sales/buys of the NFT definitions on market later on.
 * @param {Object} userdata - The user data to use.
 * @param {Object} selectedNftDefinition - The nft object that the nft definition.
 * @param {function} cbOnSucess - Call back to return the results after finishing.
 * @param {String} ssc_id Node id to replat a tx, for now the test. TODO -> change as main HIve.
 * @param {String} nftEP the BE to check NFTs txs.
 * @param {String} nfthandlermongoEP BE to handle NFT schema on mongoDB.
 * @param {function} cbCancel - Call back to close the instantiator.
 */

const Transferowner = (props) => {

    const { userdata, selectedNftDefinition, cbOnSucess, cbCancel, ssc_id, nftEP, nfthandlermongoEP } = props;
    const [working, setWorking] = useState(false);
    const [users, setUsers] = useState(null);
    const [action, setAction] = useState(null);
    const [following, setFollowing] = useState(null);
    const [transfer, setTransfer] = useState({
        from: userdata.username, to: '', nft_id: selectedNftDefinition.nft_id, nft_symbol: selectedNftDefinition.symbol, result_transfer: '', executedAt: new Date().toLocaleDateString(),
    });
    const [tx, setTx] = useState(null);

    //functions/CB
    const transferOnwerShip = () => {
        if(isKeychainInstalled){
            const jsonData = [{
                "contractName": "nft",
                "contractAction": "transferOwnership",
                "contractPayload": {
                    "symbol": selectedNftDefinition.symbol,
                    "to": transfer.to,
                }
            }];
            setWorking(true);
            window.hive_keychain.requestCustomJson(userdata.username, ssc_id, "Active", JSON.stringify(jsonData), `Transfer Ownership of ${selectedNftDefinition.symbol} to ${transfer.to}`, function(result){
                const { message, success, error } = result;
                console.log(result);
                if(!success){
                    if(error !== "user_cancel"){
                        const { error, cause, data } = result.error;
                        console.log('Error while trying to send custom_json on NFT.', message);
                    }else if(error === "user_cancel"){ console.log('User cancelled Operation on the NFTeditor.!')} //TODO // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
                    setWorking(false);
                }else if (success){ //check on this txId to analize results.
                    setTx(result.result.id);
                    console.log('Checking TX!',result.result.id); // TODO: send log to loggerOP
                };
            });
        }
    }
    const setTransferTo = (item) => {
        setTransfer(prevState => { return { ...prevState, ['to']: item.username }});
        setAction(null);
    }
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
                    if(response.action === "transferOwnership"){ //Update the account field on NFT as new owner.
                        if(response.logs && response.logs === "{}"){
                            const headers = { 'x-access-token': userdata.token, 'nft_id': selectedNftDefinition.nft_id, 'query': JSON.stringify({ account: transfer.to })};
                            dataRequest(nfthandlermongoEP+"updateNFTfield", "POST", headers, null)
                            .then(response => { 
                                console.log(response);
                                setWorking(false);
                                alert(`The Ownership of ${selectedNftDefinition.symbol} token, has been transfered to ${transfer.to}.`);
                                cbOnSucess();
                            })
                            setWorking(false);
                        }else{
                            //TODO handle as there was an error.
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

    //to load on init
    useEffect(() => {
        //load users, i believe in future this has to be limited.
        loadUsers();
        //load following
    },[]);
    //END to load on init

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
            <div className={`standardDivColHalfW whiteBack marginAuto relativeDiv justRounded ${working ? 'disableDiv2': null}`}>
                <Btnclosemin btnAction={cbCancel} classCSS={"justTopRightPos absCloseCont"} />
                <div className="standardDivColFullW marginsTB">
                    <div className="standardDivRowFlexAutoH justiAlig">
                        <h2>You are about to transfer the NFT definition of {selectedNftDefinition.symbol} Token</h2>
                        <Btninfo msg={"As soon as you transfer the NFT, you will transfer all the rights of this NFT. So please, review carefully the sender."} />
                    </div>
                    <div className="standardDivRowFlexAutoH">
                        <div className="justWidth40">
                            <Menuside items={[
                                    {id: '1-JAB-menu', title: 'Search User', hasSubMenu: false, clickeable: true },
                                    {id: '2-JAB-menu', title: 'Select From User List', hasSubMenu: false, clickeable: true },
                                    {id: '3-JAB-menu', title: 'Select From Following', hasSubMenu: false, clickeable: true },
                                ]} 
                                clickedSubItemCB={(item) => setAction(item)}
                                resetAfterCb={true}
                            /> 
                        </div>
                        <div className="standardDivRowFlexAutoH justWidth60 justiAlig">
                            <h3>Transfer NFT ownership to: </h3>
                            <h3 className="justshadows miniMarginLeft">{transfer.to}</h3>
                        </div>
                    </div>
                    {
                        action === "Select From User List" && users &&
                        <Tablinator 
                            items={users} toShow={['username','fullname']}
                            clickedSubItemCB={(item) => setTransferTo(item)}
                            titleTable={'JABers'}
                        />
                    }
                    {
                        (action === "Select From Following" && following && following.length > 0) &&
                        <ul>
                            {
                                following.map(userfol => {
                                    if(userfol === "" || userfol === null || userfol === undefined) return null
                                    return (
                                        <li key={`${userfol}-user-JAB`} className={"standardLiHovered"}
                                            onClick={() => setTransferTo(userfol)}
                                        >
                                            {userfol}
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    }
                    {
                        transfer.to !== '' &&
                        <div className="standardDisplayJusSpaceAround">
                            <button onClick={cbCancel}>Cancel</button>
                            <button onClick={transferOnwerShip}>Submit</button>
                        </div>
                    }
                </div>
            </div>
        </Absscreenwrapper>
    )
}

export default Transferowner;
