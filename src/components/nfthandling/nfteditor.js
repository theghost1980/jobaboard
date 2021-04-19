import React, { useState, useEffect } from 'react';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
import Btnclosemin from '../btns/btncloseMin';
import Loader from '../loader';
import Btnswitch from '../btns/btnswitch';
import Btninfo from '../btns/btninfo';
import Btnconfirmcancel from '../btns/btnconfirm';

// constants
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;

/**
 * This component allows user to:
 * -> Detect if actual user is following the presented user. If not, allow user to follow/unfollow on hive.
 * --> Send the customJson using HiveKeychain, Wait for answer and send result to the future component called topMessenger.
 * @param {Object} userdata - The user data to use.
 * @param {Object} nft - The nft object that contains the actual info comming from Hive.
 * @param {Object} nftMongo - The nft object that contains the info stored on Mongo DB.
 * @param {Object} toEdit - Contain what we want to edit as { toEdit: ''}
 * @param {function} cbOnFinish - Call back to return the results after finishing.
 * @param {function} cbCancel - Call back to close the instantiator.
 * @param {String} ssc_id - The ssc id that will listen to this transaction. 2 Options: 1: "ssc-testNettheghost1980" 2: "main"
 * @param {String} nftEP - The EP on BE to get the TX info || execute operations on NFT BE handle.
 * @param {String} userEP - The EP on BE to get the TX info || execute operations on NFT BE handle.
 * @param {Object} jabFEE - The object that contain the definitions on fee,price,etc.
 */

const Nfteditor = (props) => {
    const { userdata, nft, cbOnFinish, cbCancel, ssc_id, nftEP, userEP, toEdit, jabFEE, nftMongo} = props;
    const [authAccounts, setAuthAccounts] = useState(nft.authorizedIssuingAccounts);
    const [selector, setSelector] = useState(null);
    const [userList, setUserList] = useState(null);
    const [following, setFollowing] = useState(null);
    const [tx, setTx] = useState(null);
    const [working, setWorking] = useState(false);
    const [authAction, setAuthAction] = useState("");
    const [payloadArray, setPayloadArray] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [userNameSearch, setUserNameSearch] = useState(null);
    const [errorImageIcon, setErrorImageIcon] = useState(false);
    const [hasChanged, setHasChanged] = useState("");
    const [payloadSent, setPayloadSent] = useState(null);
    const initialStateNftEdit = {
        nft_id: nftMongo.nft_id,
        symbol: nftMongo.symbol,
        name: nftMongo.name,
        orgName: nftMongo.orgName,
        productName: nftMongo.productName,
        url: nftMongo.url,
        icon: nftMongo.image,
        desc: checkDescField(nft),
        price: nftMongo.price,
        file: File,
    }
    // console.log(initialStateNftEdit);
    // console.log(nftMongo);
    const [nftEditInfo, setNftEditInfo] = useState(initialStateNftEdit);
    const [iconNftObject, setIconNftObject] = useState({
        image: '', thumb: '',
    })

    // functions/CB
    function checkDescField(nft){
        const metadata = JSON.parse(nft.metadata);
        if(metadata && metadata.hasOwnProperty("desc")){
            return metadata.desc;
        }else{
            return "";
        }
    }
    function setTheLoad(jsonData, typeKey){
        // {"symbol":"SIS","name":"Sistemas Token NFT x2","isSignedWithActiveKey":false}
        const objectKey = { isSignedWithActiveKey: typeKey === "Posting" ? false : true};
        const _contractPayload = jsonData.contractPayload;
        const newObj = Object.assign(_contractPayload,objectKey);
        setPayloadSent(newObj);
    }
    function processCustomJson(jsonData, msg, typeKey){
        if(isKeychainInstalled){
            setWorking(true);
            window.hive_keychain.requestCustomJson(userdata.username, ssc_id, typeKey, JSON.stringify(jsonData), msg, function(result){
                const { message, success, error } = result;
                if(toEdit === "Edit Token Information") { setTheLoad(jsonData, typeKey)};
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
        setPayloadArray(prevState =>[ ...prevState, item]);
    }
    function setValueNFT(name,value){
        setHasChanged(name);
        setNftEditInfo(prevState => {return {...prevState, [name]: value}})
    }
    // function removeInArray(item){
    //     //just check none of the main users:
    //     if(item !== "jobaboard" && item !== userdata.username){
    //         const without = payloadArray.filter(user => user !== item);
    //         setPayloadArray(without);
    //     }
    // }
    // handling the icon image
    // TODO do this in a component that returns the picture and file...
    const uploadedImage = React.useRef(null);
    const selectedImgFile = (event) => {
        if(event.target.files === null){ return console.log('User cancelled uploading image!')}
        const imgFile = event.target.files[0];
        console.log(imgFile);
        if(imgFile.type === "image/jpeg" || imgFile.type === "image/png"){
            const { current } = uploadedImage;
            current.file = imgFile;
            const reader = new FileReader();
            reader.onload = e => {
                current.src = e.target.result;
                // now test if the aspect ratio is 1 so the image is square if not...not allowed as icon.
                const img = new Image();
                img.src = e.target.result;
                img.onload = function(){
                    const imgW = img.width;
                    const imgH = img.height;
                    const ar = imgW / imgH;
                    console.log(`W:${imgW},H:${imgH}. AR:${ar.toString()}`);
                    if(ar >= 0.95 && ar <= 1.05){
                        console.log(`Passed`);
                        setErrorImageIcon(false);
                    }else{
                        console.log('Not passed!');
                        setErrorImageIcon(true);
                    }
                };
            };
            reader.readAsDataURL(imgFile);
            //now we pass the file 
            setValueNFT('file',event.target.files[0]);
        }else{
            alert('File Must be Image type: jpeg/png.');
            return null
        }
    }
    // END handling the icon image

    const handleSearch = (event) => {
        event.preventDefault();
        if(userNameSearch){
            getDataWH(userEP + "findJabUser",{ 'x-access-token': userdata.token, 'query': JSON.stringify({ username: userNameSearch})})
            .then(response => {
                console.log(response);
                if(response.status === "sucess"){
                    const answer = window.confirm('User Found. Do we added it as authority right away?');
                    if(answer){ //add it
                        addIt(response.result.username);
                    }
                }else if(response.status === "not found"){
                    alert('That user do not exist on JAB. Please try another user name!');
                }
            }).catch(error => {
                console.log('Error asking for User on BE.',error);
            })
        }
    }
    function ImIAsAuth(){
        if(authAccounts){
            const found = authAccounts.filter(authed => authed === userdata.username);
            if(found.length === 0){
                return true;
            }else{
                return false;
            }
        }
    }
    function processQuery(){
        if(hasChanged === "url"){
            return {
                url: nftEditInfo.url, updatedAt: new Date().toString(),
            }
        }else if(hasChanged === "orgName"){
            return {
                orgName: nftEditInfo.orgName, updatedAt: new Date().toString(),
            }
        }else if(hasChanged === "productName"){
            return {
                productName: nftEditInfo.productName, updatedAt: new Date().toString(),
            }
        }else if(hasChanged === "name"){
            return {
                name: nftEditInfo.name, updatedAt: new Date().toString(),
            }
        }else if(hasChanged === "file"){
            return {
                image: iconNftObject.image, thumb: iconNftObject.thumb, updatedAt: new Date().toString(),
            }
        }
    }
    function loadName(){
      if(hasChanged === "url"){
            return "updateUrl";
        }else if(hasChanged === "orgName"){
            return "updateOrgName";
        }else if(hasChanged === "productName"){
            return "updateProductName";
        }else if(hasChanged === "name"){
            return "updateName";
        }else if(hasChanged === "desc"){
            return "updateMetadata";
        }
    }
    function bringPayload(){
        // another idea to refactor this may be if I construct the new payload based on
        // each field has been changing ???? let's see.
        // testing o nthis
        // "metadata": {
        //     "url": "https://mycoolnft.com",
        //     "icon": "https://mycoolnft.com/token.jpg",
        //     "desc": "This NFT will rock your world! It has features x, y, and z. So cool!"
        // }
        if(hasChanged === "desc"){
            const pay = {
                "symbol": nftEditInfo.symbol,
                "metadata":{
                    "url": String(nftEditInfo.url),
                    "icon": String(nftEditInfo.icon),
                    "desc": String(nftEditInfo.desc),
                }
            }
            return pay
        }else if(hasChanged === "url"){
            const pay = {
                "symbol": nftEditInfo.symbol,
                "url": nftEditInfo.url,
            }
            return pay
        }else if(hasChanged === "orgName"){
            const pay = {
                "symbol": nftEditInfo.symbol,
                "orgName": nftEditInfo.orgName,
            }
            return pay
        }else if(hasChanged === "productName"){
            const pay = {
                "symbol": nftEditInfo.symbol,
                "productName": nftEditInfo.productName,
            }
            return pay
        }else if(hasChanged === "name"){
            const pay = {
                "symbol": nftEditInfo.symbol,
                "name": nftEditInfo.name,
            }
            return pay;
        };
    }
    const processEdition = async () => {
        if(hasChanged){
            setWorking(true);
            console.log('Sending Edition for:',hasChanged);
            // somehow detect what input has changed, maybe another state.object
            if(hasChanged === "file"){
                if(nftEditInfo.file){
                    const formData = new FormData();
                    formData.append("file",nftEditInfo.file, nftEditInfo.file.name);
                    //return for now as testing this before processing the payload on hive ssc
                    await sendPostBEJBody(nfthandlermongoEP + "uploadIcon",formData)
                    .then(response => {
                        if(response.status === 'sucess'){
                            setIconNftObject({ image: response.dataIcon.image, thumb: response.dataIcon.thumb });
                            processCustomJson({
                                "contractName": "nft",
                                "contractAction": "updateMetadata",
                                "contractPayload": {
                                    "symbol": nftEditInfo.symbol,
                                    "metadata": {
                                        "url": String(nftEditInfo.url),
                                        "icon": String(response.dataIcon.image),
                                        "desc": String(nftEditInfo.desc),
                                    }
                                }
                            }, `Updating Icon of ${nftEditInfo.symbol}`,"Posting");
                        }else{
                            return alert("There was an error on server. Please try again later!");
                        }
                    }).catch(error => {
                        alert("There was an error on server. Please try again later!");
                        console.log('Error uploading the Icon nft image.',error);
                        return error;
                    })
                }
            }else{
                const _contractPayload = bringPayload();
                const _contractAction = loadName();
                processCustomJson({
                    "contractName": "nft",
                    "contractAction": _contractAction,
                    "contractPayload": _contractPayload,
                }, `Updating ${hasChanged} of ${nftMongo.symbol}`, "Posting");
            }
            //as testing now.
        }
    }
    const updateJustMongo = () => {
        if(nftEditInfo.price !== initialStateNftEdit.price){
            setWorking(true);
            console.log(`Has changed. So let us update it! id:${nftEditInfo.nft_id}, price:${nftEditInfo.price}`);
            const query = {
                price: nftEditInfo.price,
                updatedAt: new Date().toString(),
            }
            sendPostBEJH(nfthandlermongoEP+"updateNFTfield",query, nftEditInfo.nft_id)
            .then(response => {
                console.log(response); //status, result
                if(response.status === "sucess"){
                    setWorking(false);
                    //maybe send a update to parent
                    // for now show the alert message and...
                    alert('Price Updated!');
                    setHasChanged("");
                    cbOnFinish();
                }
            }).catch(error => {
                console.log('Error updating field on NFT to DB.',error);
                setWorking(false);
            });
        }
    }    
    const processData = () => {
        if(payloadArray.length > 0){
            const authObject = authAction === "Add Authorities" ? { contractAction: "addAuthorizedIssuingAccounts", msg: `Add ${JSON.stringify(payloadArray)} as Authorized Issuing account(s), on${nft.symbol}`}
                            :   { contractAction: "removeAuthorizedIssuingAccounts", msg: `Remove ${JSON.stringify(payloadArray)} as Authorized Issuing account(s), on${nft.symbol}`};
            processCustomJson({
                "contractName": "nft",
                "contractAction": authObject.contractAction,
                "contractPayload": {
                    "symbol": nft.symbol,
                    "accounts": [...payloadArray],
                }
            },authObject.msg, "Active");
        }
    }
    const addIt = (_user) => {
        console.log(`To add:${_user}`);
        const found = authAccounts.filter(authed => authed === _user);
        if(found.length == 0){
            const newArray = [ _user ];
            const old = authAccounts;
            const newOne = newArray.concat(old);
            addInArray(_user);
            setAuthAccounts(newOne);
            if(_user === userdata.username){
                // show question to process this right now
                const answer = window.confirm('I will process this request right away. Do we proceed right?');
                if(answer){
                    processCustomJson({
                        "contractName": "nft",
                        "contractAction": "addAuthorizedIssuingAccounts",
                        "contractPayload": {
                            "symbol": nft.symbol,
                            "accounts": [ userdata.username ]
                            }
                    },`Add myself as Authorized Issuing account, on${nft.symbol}`, "Active");
                }
            }
        }
    }
    const removeIt = (_user) => {
        if(_user !== userdata.username && _user !== "jobaboard"){
            console.log(`To remove:${_user}`);
            // const without = authAccounts.filter(authed => authed !== _user);
            addInArray(_user);
            const old = authAccounts.filter(authed => authed !== _user);
            // const newOne = without.concat(old);
            setAuthAccounts(old);
        }else{
            alert("Your account & The System account, must be as issuing Authorities always.");
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
                    if(toEdit === "Authorized Issuing Account"){
                        if(response.action === "addAuthorizedIssuingAccounts" || response.action === "removeAuthorizedIssuingAccounts"){
                            if(response.logs ="{}"){
                                // {"symbol":"AC","accounts":["theghost1980"],"isSignedWithActiveKey":true}
                                const payload = JSON.parse(response.payload);
                                if(payload.isSignedWithActiveKey){
                                    alert(`The following account(s) ${JSON.stringify(payload.accounts)}\nhas been ${authAction === "Add Authorities" ? 'added ': 'removed '} as Authorized Issuing Account `);
                                    cbOnFinish();
                                }
                            }
                        }
                    }else{
                        // const payload = JSON.parse(response.payload);
                        const payload = response.payload;
                        const _payloadSent = JSON.stringify(payloadSent);
                        if( _payloadSent === payload) {
                            //let's handle the hasChanged as the query we send to update on mongoDB
                            if(hasChanged !== "desc"){
                                setWorking(true);
                                const query = processQuery();
                                sendPostBEJH(nfthandlermongoEP+"updateNFTfield",query, nftEditInfo.nft_id)
                                .then(response => {
                                    console.log(response);
                                    setHasChanged("");
                                    alert('Operation Done successfully!');
                                    cbOnFinish();
                                    setWorking(false);
                                    setTx(null);
                                }).catch(error => {
                                    console.log('Error updating field on MongoDB.',error);
                                    setWorking(false);
                                });
                            }else{
                                setWorking(false);
                                setHasChanged("");
                                alert('Operation Done successfully!');
                                setTx(null);
                                cbOnFinish();
                            }
                        }
                        console.log('Analyse response to code this part dev. Come on you can do this...The force is with you!');
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
    // Data fecthing
    async function getDataWH(url = '', headers = {}) {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors', 
            headers: headers,
        });
        return response.json(); 
    };
    async function sendPostBEJH(url = '', query, nft_id) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-access-token': userdata.token,
                'nft_id': nft_id,
                'query':JSON.stringify(query),
            },
        });
        return response.json(); 
    };
    async function sendPostBEJBody(url = '', formData) {
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token
            },
            body: formData,
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
                getDataWH(userEP+"jabUserField",headers).then(response => {
                    console.log(response);
                    if(response.status === "sucess" && response.result.following.length > 0){
                        const _following = response.result.following;
                        if(_following.length === 1 && _following[0] === ""){
                            alert('You are not following JABers yet.');
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
    // for testing payloadSent
    useEffect(() => {
        console.log(payloadSent);
    }, [payloadSent]);
    // useEffect(() => {
    //     if(nftEditInfo !== initialStateNftEdit){
    //         console.log('A value has changed!');
    //     }
    // },[nftEditInfo]);
    useEffect(() => {
        console.log(`Changed detected on: ${hasChanged}`);
    }, [hasChanged]);
    //END to fire on each state change

    const msg = toEdit !== "Authorized Issuing Account" ? "In case you wonder about: Symbol and other properties, those are set one time only when the token is created."
                            : "Important: Once you authorize an account, it will be able to cast new tokens, so please choose carefully.";

    return (
        <div className="standardDivRowFullW">
            <div className={`standardDivColHalfW whiteBack marginAuto relativeDiv justRounded ${working ? 'disableDiv2': null}`}>
                <Btnclosemin btnAction={cbCancel} classCSS={"justTopRightPos absCloseCont"} />
                {
                    working &&
                    <div className="standardDivRowFlex100pX100pCentered">
                        <Loader  xtraClass={"marginsTB"} logginIn={true} typegif={"blocks"} />
                    </div>
                }
                <div className="standardDivColFullW standardContentMargin">
                    <h2>{toEdit} on {nftEditInfo.symbol}<Btninfo msg={msg}/></h2>
                    {
                        (toEdit === "Authorized Issuing Account" )
                        ?
                        //init whole authorized issuing account process
                        <div>
                            <Btnswitch 
                                sideText={`Select an Action to perform on Authorities. Actual: ${authAction}`} 
                                btnAction={(cen) => setAuthAction(cen ? 'Add Authorities': 'Remove Authorities')}
                                initialValue={false}
                                xtraClassCSS={"justAligned"}
                            />
                            <p>User(s) to {authAction} to: {JSON.stringify(payloadArray)}</p>
                            {
                                authAction === "Add Authorities" ?
                                <div className="standardDivRowFullW">
                                    <div className="standardDiv60Percent">
                                        <p>Actual Accounts</p>
                                        <ul className="overflowYscroll justMaxHeight">
                                            {
                                                authAccounts.map(authUser => {
                                                    return (
                                                        <li key={`${authUser}-authorizedToIssueJAB`} className="standardLiHovered"
                                                            title="Actual User">
                                                            {authUser}
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                        {
                                            showSearch && 
                                            <div className="relativeDiv">
                                                <Btnclosemin btnAction={() => setShowSearch(false)} classCSS={"justTopRightPos absCloseCont"} />
                                                <form onSubmit={handleSearch}>
                                                    <label htmlFor="input_search_name">User Name:</label>
                                                    <input type="text" name="input_search_name" onChange={(e) => setUserNameSearch(e.target.value)} />
                                                    <button type="submit">Search</button>
                                                </form>
                                            </div>
                                        }
                                        <p>Options</p>
                                        <ul className="standardUlRowFlexPlain justJustifiedContent">
                                            {
                                                (ImIAsAuth()) && <li>Add Me as I don't know why I am not listed.<button onClick={() => addIt(userdata.username)}>Add Me</button></li>
                                            }
                                            <li className="marginRight"><button onClick={() => setSelector("showList")} title="Add from the JABers I follow">From Following</button></li>
                                            <li className="marginRight"><button title="Select from my Friends on the Chat">From Chat-TODO</button></li>
                                            <li><button onClick={() => setShowSearch(!showSearch)} title="Let me input the name. ">I will search</button></li>
                                        </ul>
                                    </div>
                                    <div className="standardDiv30Percent">
                                        {
                                        selector && (selector === "showList") && following &&
                                        <div>
                                            <p className="smallText">Just click on it, to add it. When ready hit Submit.</p>
                                            <ul className="overflowYscroll justMaxHeight">
                                                {
                                                    following.map(user => {
                                                        return (
                                                            (user && user !== "jobaboard") ?  
                                                                    <li key={`${user}-JABerIFollow`} className="standardLiHovered" title={"Click to add"}
                                                                        onClick={() => addIt(user)}
                                                                    >
                                                                        {user}
                                                                    </li> : null
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                        }
                                    </div>
                                </div>
                            : 
                                <div>
                                    <p>Actual Accounts</p>
                                    <ul className="overflowYscroll justMaxHeight">
                                        {
                                            authAccounts.map(authUser => {
                                                return (
                                                    <li key={`${authUser}-authorizedToIssueJAB`} className="standardLiHovered "
                                                        title="Click to remove" onClick={() => removeIt(authUser)}>
                                                        {authUser}
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            }
                        </div>
                        :
                            <div className="formVertFlex">
                                <p>Modify the field(s) you want to update, and press the Confirmation button aside each field to submit. The system will process it and let you know when is ready on an alert message on the screen.</p>
                                <div className="standardDivRowFullW">
                                    <div className="justWidth30">
                                        <div className="justOverflowAuto divFlex100x100">
                                            <img 
                                                src={nftMongo.thumb} 
                                                className="smallImageMax120x120" 
                                                ref={uploadedImage} 
                                            />
                                        </div>
                                        <input type="file" 
                                                onChange={selectedImgFile} 
                                                accept="image/*"
                                                multiple={false} 
                                        />
                                        { hasChanged === "file" && <Btnconfirmcancel title={"Click to Send"} animation={"animFadeFast minimumMarginTB"} typeIcon={"confirm"} btnAction={processEdition} />}
                                            {
                                                errorImageIcon && 
                                                <p className="warningTextSmall">We do not recommend using an image with different sizes for height/width, please choose an image as 200px by 200px or 300px by 300px.</p>
                                            }
                                    </div>
                                    <div className="justWidth70">
                                        <form 
                                            // onSubmit={createNFT} 
                                            // ref={formRef}
                                        >
                                            <div className="standardFormColHorFullWAutoH relativeDiv colorX marginBottom">
                                                <div className="relativeDiv justDisplayGrid">
                                                <label htmlFor="name">Token's Name:</label>
                                                <input name="name" type="text"
                                                    onChange={(e)=> setValueNFT(e.target.name,e.target.value)} 
                                                    defaultValue={nftEditInfo.name}
                                                    required pattern="[\w\d\s]{1,50}" title="Letters, Numbers and whitespace only. Max length of 50"
                                                />
                                                { hasChanged === "name" && <Btnconfirmcancel xclassCSS={"justAbsolutePos justL-40T10"} title={"Click to Send"} animation={"animFadeFast minimumMarginTB"} typeIcon={"confirm"} btnAction={processEdition} />}
                                                </div>
                                                <div className="relativeDiv justDisplayGrid">
                                                    <label htmlFor="orgName">Organization Name:</label>
                                                    <input name="orgName" type="text" 
                                                        defaultValue={nftEditInfo.orgName}
                                                        onChange={(e)=> setValueNFT(e.target.name,e.target.value)} 
                                                        required pattern="[\w\d\s]{1,50}" title="Letters, Numbers and whitespace only. Max length of 50"
                                                    />
                                                    { hasChanged === "orgName" && <Btnconfirmcancel xclassCSS={"justAbsolutePos justL-40T10"} title={"Click to Send"} animation={"animFadeFast minimumMarginTB"} typeIcon={"confirm"} btnAction={processEdition} />}
                                                </div>
                                                <div className="relativeDiv justDisplayGrid">
                                                    <label htmlFor="productName">Product Name:</label>
                                                    <input name="productName" type="text" 
                                                        defaultValue={nftEditInfo.productName}
                                                        onChange={(e)=> setValueNFT(e.target.name,e.target.value)} 
                                                        required pattern="[\w\d\s]{1,50}" title="Letters, Numbers and whitespace only. Max length of 50"
                                                    />
                                                    { hasChanged === "productName" && <Btnconfirmcancel xclassCSS={"justAbsolutePos justL-40T10 whiteBack"} title={"Click to Send"} animation={"animFadeFast minimumMarginTB"} typeIcon={"confirm"} btnAction={processEdition} />}
                                                </div>
                                                <div className="relativeDiv justDisplayGrid">
                                                    <label htmlFor="url">URL:</label>
                                                    <input name="url" type="text" 
                                                        defaultValue={nftEditInfo.url}
                                                        onChange={(e)=> setValueNFT(e.target.name,e.target.value)} 
                                                        required pattern=".{1,255}" title={`Max length of 255.`}
                                                    />
                                                    { hasChanged === "url" && <Btnconfirmcancel xclassCSS={"justAbsolutePos justL-40T10"} title={"Click to Send"} animation={"animFadeFast minimumMarginTB"} typeIcon={"confirm"} btnAction={processEdition} />}
                                                </div>
                                                <div className="relativeDiv justDisplayGrid">
                                                    <label htmlFor="desc">Description:</label>
                                                    <input name="desc" type="text"
                                                        defaultValue={nftEditInfo.desc}
                                                        onChange={(e)=> setValueNFT(e.target.name,e.target.value)} 
                                                        required pattern=".{1,500}" title={`Max length of 500.`}
                                                    />
                                                    { hasChanged === "desc" && <Btnconfirmcancel xclassCSS={"justAbsolutePos justL-40T10"} title={"Click to Send"} animation={"animFadeFast minimumMarginTB"} typeIcon={"confirm"} btnAction={processEdition} />}
                                                </div>
                                                <div className="relativeDiv justDisplayGrid">
                                                    <label htmlFor="price">Price:(on {jabFEE.acceptedCur})</label>
                                                    <input name="price" type="text"
                                                        defaultValue={nftEditInfo.price} 
                                                        onChange={(e)=> setValueNFT(e.target.name,Number(e.target.value))} 
                                                        required pattern="[0-9,]{1,21}" title="Just numbers and commas please. between 1 and 9,999,999,999."
                                                    />
                                                    { hasChanged === "price" && <Btnconfirmcancel xclassCSS={"justAbsolutePos justL-40T10"} title={"Click to Send"} animation={"animFadeFast minimumMarginTB"} typeIcon={"confirm"} btnAction={updateJustMongo} />}
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                    }
                    {
                        <div className="standardDivRowFullW justifyContentSpaced marginAuto">
                            <button onClick={reset}>Cancel and Exit</button>
                            {
                                (toEdit === "Authorized Issuing Account")
                                && <button className="minibtn" onClick={processData}>Submit</button> 
                            }
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Nfteditor;