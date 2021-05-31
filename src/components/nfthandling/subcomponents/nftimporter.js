import React, { useState, useEffect } from 'react';
import Menuside from '../../interactions/menuside';
import Absscreenwrapper from '../../absscreenwrapper';
import Btnclosemin from '../../btns/btncloseMin';
import Loader from '../../loader';
import Tablinator from '../../interactions/tablinator';
import Recordnator from '../../interactions/recordnator';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';

//constants
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const nftEP = process.env.GATSBY_nftEP;
//end constants

// TODO as soon as we move to mainNet remember we must change all related to test_ssc_id
// Notes: TODO: the idea is allow user to import NFTs created somewhere else. by paying a fee we import it to pur database, add jobaboard as authorisedIssuingAuth so the user can use it on JAB :D
/**
 * This component allow users to import/remove NFT created somewhere else into JAB
 * - It allow user to search by symbol, nft_id or issuer the current nft table on Hive.
 * - It allows user to search instances as well. TODO.
 * @param {Object} userdata as the object holding the user logged data
 * @param {Function} closeCB function to close the component on parent's call.
 * @param {Object} jabFEE as the fees to manage on the whole platform. as { fee: "0.002", currency: "HIVE", costInstance: "0.001", costCurr: "HIVE", acceptedCur: "HIVE"};
 * @param {Function} cbOnSucess the CB/function to call after successfully import the NFT into JAB.
 * @param {String} ssc_test_id the id to trasmit the broadcast, for now test node, later on main.
 * @param {Boolean} devMode optional to log data and events on console.
*/

const Nftimporter = (props) => {
    const { closeCB, userdata, jabFEE, ssc_test_id, cbOnSucess, devMode } = props;
    const [nftsHive, setNftsHive] = useState([]); //for now as the ones in the test_node, later on to change source to main_net.
    const [nftsJab, setNftsJab] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [selected, setSelected] = useState(null);
    const [tx, setTx] = useState(null);
    const [nftInJab, setNftInJab] = useState(false);

    //functions/CB
    function getNftMongoQuery(query = {},limit = Number,sortby = {}){
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify(query), 'limit': limit, 'sortby': JSON.stringify(sortby),}
        dataRequest(nfthandlermongoEP + "getNFTquery", "GET",headers, null)
        .then(response => {
            if(devMode) {console.log(response)};
            if(response.status === 'sucess'){
                setNftsJab(response.result);
            }
        }).catch(error => {console.log('Error asking for NFTs on this user from DB, mongo.',error)});
    }
    async function addNftMongo(){
        const formData = new FormData();
        console.log(`trying to add new nft id:${selected._id}`);
        formData.append("nft_id", Number(selected._id));
        formData.append("account", userdata.username);
        formData.append("symbol", selected.symbol);
        formData.append("createdAt", new Date);
        formData.append("issuer", selected.issuer);
        formData.append("issued_On", `Imported on ${new Date().toLocaleDateString()}`);
        formData.append("maxSupply", selected.maxSupply);
        formData.append("name",selected.name);
        if(selected.metadata){
            const mdParsed = JSON.parse(selected.metadata);
            if(mdParsed.url){
                formData.append("url", mdParsed.url);
            }
        }
        formData.append("orgName", selected.orgName);
        formData.append("productName", selected.productName);
        // end basic data

        // formData.append("authorizedIssuingAccounts", JSON.stringify(newft.authorizedIssuingAccounts));
        // formData.append("supply", newft.supply);
        // formData.append("circulatingSupply", newft.circulatingSupply);
        const headers = { 'x-access-token': userdata.token, 'id': selected._id };
        dataRequest(nfthandlermongoEP+"addNFTDB","POST", headers, formData)
        .then(response => { console.log(response)})
        .catch(error => console.log('Error adding NFT to DB.',error));
    }
    const importNftToJab = () => {
        //requestTransfer using keychain
        //on the transfer send the json as add jab as issuing authority
        // wait for reaponse, when confirmed as added
        // add NFT into nft table, send updateLists on parent.
        if(isKeychainInstalled){
            const memo = {
                "id": ssc_test_id,
                "json": {
                    "contractName": "nft",
                    "contractAction": "addAuthorizedIssuingAccounts",
                    "contractPayload": {
                        "symbol": selected.symbol,
                        "accounts": [ 'jobaboard' ]
                        }
                },
            };
            
            window.hive_keychain.requestTransfer(userdata.username, "jobaboard", jabFEE.costInstance, JSON.stringify(memo), jabFEE.costCurr, function(result){
                const { message, success, error } = result;
                console.log(result);
                if(!success){
                    if(error !== "user_cancel"){
                        const { error, cause, data } = result.error;
                        if( cause.name && cause.name === "RPCError"){
                            // addStateOP({ state: 'Fatal Error', data: { error: JSON.stringify(result.error)} });
                            //TODO: send this data to OPLOGGER.
                        }
                        return console.log('Error while transfering', message);
                    }else if(error === "user_cancel"){
                        // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
                        console.log('User click on cancel!');
                    }
                }else if (success){
                    const { type, memo, amount, currency, username } = result.data;
                    if( type === "transfer" && 
                        amount === jabFEE.costInstance && 
                        memo === memo 
                        && username === userdata.username && currency === jabFEE.costCurr){ 
                    }
                    // addStateOP({ state: 'Sucess transferred funds', data: {} });
                    console.log('Executed successfully. Now check to continue dev work!!!',result.result.id);
                    setTx(result.result.id);
                };
            });
        }else{
            alert('If the Hive Key Chain is installed, just click on the icon to activate on this website.\nIf not installed, please do so in htttp://todothelink.com');
        }
    }
    function updateIssued(query){ // const query = {} to bring all NFTs.
        setLoadingData(true);
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify(query), 'sortby': JSON.stringify([{ index: "_id", descending: false }])};
        dataRequest(nftEP+"allNFTs","GET", headers, null)
        .then(response => { 
            console.log(response);
            setNftsHive(response);
            setLoadingData(false);
        })
        .catch(error => {
            console.log('Error fetching data from BE',error);
            setLoadingData(false);
        });
    }
    const setTheItem = (item) => {
        if(devMode) {console.log('Clicked on item:', item)};
        const found = nftsJab.filter(nft => Number(nft.nft_id) === Number(item._id));
        if(devMode) {console.log('Found', found)};
        if(found.length !== 0){
            setNftInJab(true);
            if(devMode) {alert('That NFT is already present on JAB.')};
        }else{
            setNftInJab(false);
        }
        setSelected(item);
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
                    //handling for Authorized Issuing Account
                    if(response.action === "addAuthorizedIssuingAccounts"){
                        if(response.logs ="{}"){
                            // {"symbol":"AC","accounts":["theghost1980"],"isSignedWithActiveKey":true}
                            const payload = JSON.parse(response.payload);
                            if(payload.isSignedWithActiveKey){
                                // TODO Add the NFT to mongoDB
                                addNftMongo();
                                alert(`The NFT has been imported on JAB. Now we can cast tokens and post amazing Gigs and Services!`);
                                cbOnSucess();
                                // cbOnFinish();
                            }
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

    //to load on init
    useEffect(() => {
        getNftMongoQuery({ account: userdata.username },0,{ "symbol": 1 });
        updateIssued({});
    },[]);
    //END to load on init

    //to load on each change of states
    useEffect(() => {
        if(tx){ setTimeout(getInfoTX,3000)} //testing on 3s
    },[tx]);
    //END to load on each change of states

    return (
        <Absscreenwrapper xtraClass={"justiAlig"}>
            <div className="whiteBack standardDiv80Auto jutsMinHeight320px">
                <Btnclosemin btnAction={closeCB} />
                <div className="standardDivRowFullW marginsTB" id="importerCont">
                    <div className="standardDiv20Percent importerDiv">
                    <Menuside 
                        items={[
                            {id: '1-JAB', title: 'Search NFTs', hasSubMenu: false, clickeable: true }, 
                            {id: '2-JAB', title: 'Import', hasSubMenu: false, clickeable: true}, 
                        ]}
                        clickedSubItemCB={(title) => console.log('Clicked on:',title)}
                        devMode={true}
                        xclassCSS={"normalTextSmall"}
                    />
                    <div className="contentMiniMargins">
                        <p className="fontSmall">Important Info:</p>
                        <p className="fontSmall">The imported NFT will appear will a default image. You can change it later on edition menu.</p>
                    </div>
                    </div>
                    <div className="standardDiv80Auto importerDiv">
                        {
                            loadingData && <Loader xtraClass={"standardDivRowFlex100pX100pCentered"} logginIn={loadingData}/>
                        }
                        {
                            !loadingData && nftsHive &&
                            <Tablinator items={nftsHive} titleTable={"NFTs on Hive Chain"}
                                clickedSubItemCB={(item) => setTheItem(item)}
                                toShow={['_id','issuer','symbol','supply']}
                                xclassCSS={"justHeight150pOverY"}
                                highLight={{
                                    field: 'issuer', compareTo: userdata.username,
                                }}
                            />
                        }
                        {
                            selected &&
                            <Recordnator closeCB={() => setSelected(null)}
                                item={selected}
                                titleRecord={`View of NFT: ${selected.symbol}`}
                                toShow={[
                                    { field:'_id', type: 'Number', link: false },
                                    { field:'issuer', type: 'String', link: false },
                                    { field:'symbol', type: 'String', link: false },
                                    { field:'maxSupply', type: 'String', link: false },
                                    { field:'supply', type: 'String', link: false },
                                ]}
                                clickedSubItemCB={(item) => console.log('Passed when click, from recordnator:', item)}
                                miniSizes={true}
                            />
                        }
                        {
                                selected && (selected.issuer === userdata.username) && !nftInJab &&
                                <div>
                                    <ul>
                                        <li>As the Owner/Isssuer of this NFT, you may Import it to JAB</li>
                                        <li>A small fee of {jabFEE.costInstance} {jabFEE.costCurr} will cover the expenses.</li>
                                        <li>
                                            <button onClick={importNftToJab}>Proceed</button>
                                        </li>
                                    </ul>
                                </div>
                        }
                        {
                            nftInJab && <p>This NFT is already present on JAB.</p>
                        }
                    </div>
                </div>
            </div>
        </Absscreenwrapper>
    )
}

export default Nftimporter;