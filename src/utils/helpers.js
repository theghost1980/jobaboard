//libs
import { navigate } from "gatsby"
import { isKeychainInstalled, hasKeychainBeenUsed } from '@hiveio/keychain';
//JWT
const jwt = require('jsonwebtoken');
//constants
const secret = process.env.GATSBY_SECRET;
const beechatEP = process.env.GATSBY_beeChatEP;
//helper functions/callbacks
// export const isBrowser = () => typeof window !== "undefined";

// TODO: I will create my own encoding function.
// the kay is from a given word/key I will encode all inside LS when the info is sensitive.
// let's try to save key,values as well so we keep the secret inside the .env
// TODO bellow
// TODO important ---> remove this shit from project.....var bcrypt = require('bcryptjs');

//get data Bee chat re-factored
export async function fecthDataRequest(urlGet,token){
    const headers = token ? {'Authorization': `Bearer ${token}`} : {};
    const response = await fetch(urlGet, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache', 
        headers: headers,
    });
    return response.json(); 
}
async function fecthDataRequestOut(urlGet,token){
    const headers = token ? {'Authorization': `Bearer ${token}`} : {};
    const response = await fetch(urlGet, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache', 
        headers: headers,
    });
    return response; 
}
////end bee
//////////////////////

export function formatDateTime(str){
    const arDate = String(str).split("T")[0].split("-").reverse().join("/");
    const arTime = String(str).split("T")[1].split("Z")[0].split(":");
    const hMs = arTime[0] + ":" + arTime[1] + ":" + String(Number(arTime[2]).toFixed(0));
    // console.log(`${arDate} at ${hMs}`);
    return `${arDate} at ${hMs}`;
}

export function encode( str ) {
    return window.btoa(unescape(encodeURIComponent( str )));
}

export function decode( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}
export function iterateEntries(node) {
    const newNode = {};
    Object.entries(node).forEach(([key, val]) => (newNode[key] = decode(val)));
    return newNode;
}

export const isBrowser = () => typeof window !== "undefined"
export const check = () =>
  isBrowser() 
    ? checkIt()
    : { logged: false, username: "", profilePicUrl: "", usertype: "", logginIn: false, token: "", loginmethod: "", access_token: "", bt: "", brt: "", banned: false, ts: "", msg: '', currentchatid: "", newmessages: "" }

//////////////////SOCKET//////////////////////
// all socket handlers
//variables/constants
const beechatSocket = process.env.GATSBY_socketBeeChat;
export var socket;

export function sendPayloadSocket(data){
    if(socket === null){ return console.log('Socket not open || defined. Please fix this.')};
    if(socket.readyState === 1){
        console.log('Sending as payload:');
        console.log(data);
        socket.send(JSON.stringify(data));
    }else{
        console.log('Socket not ready.');
    }
};

export function authSocket(token){
    sendPayloadSocket({
        "type": "authenticate",
        "payload": {
            "token": `${token}`
        }
    });
}

function checkSocket(){
    if(socket){
        console.log('Socket still here. No need to reconnect.');
    }else{
        const beeT = getStoredField("bt");
        if(beeT !== null && beeT !== ""){
            initSocket();
        }
    }
}

export function logOutBee(){
    fecthDataRequestOut(beechatEP + "users/logout",getStoredField('bt'))
    .then(response => {
        if(response.status === 204){
            console.log('User logged out from Bee Api.');
            //set socket to null to force closing the actual connection.
            socket = null;
        }else{
            console.log('Something happend when logging user out. Bee API.');
            console.log(response);
        }
    })
    .catch(error => console.log('Error loggin user out from bee.',error));
}

export function initSocket(){
    //TODO define a test .env var to activate all this messages under condition.
    console.log(`Connecting to: ${beechatSocket}`);
    let _socket = new WebSocket(beechatSocket);
    _socket.onopen = function(e) {
        console.log("[open] Connection established, setting socket");
        // setSocket(socket);
        socket = _socket;
        //auth
        // authSocket(token);
        // testing reading fromls to see if works
        const _token = getStoredField("bt");
        authSocket(_token);
    };
    _socket.onmessage = function(event) {
        console.log(`[message] Data received from server: ${event.data}`);
        //try to parse
        const data = JSON.parse(event.data);
        console.log('Data parsed:');
        console.log(data);
        if(data.type === "reauthentication-required" && getStoredField("brt")){
            console.log("Refresh token.....");
            //getter
            // const parsedProfile = JSON.parse(localStorage.getItem("_NoneOfYourBusiness"));
            // const refresh_token = decode(parsedProfile.brt);
            const refresh_token =  getStoredField("brt");
            console.log(`I have received from getter:brt as:${refresh_token}`);
            //end getter
            // const refresh_token = localStorage.getItem('_GOfUb_RT');
            fecthDataRequest(beechatEP + "users/refresh-token",refresh_token)
            .then(response => {
                console.log(response);
                if(response.token){
                    //setter
                    // const parsedP = JSON.parse(localStorage.getItem("_NoneOfYourBusiness"));
                    // parsedP.bt = encode(response.token); // 
                    setStoredField("bt",response.token); //new access_token for bee chat API.
                    // localStorage.setItem("_NoneOfYourBusiness",JSON.stringify(parsedP));
                    //end setter
                    // localStorage.setItem('_GOfUb_T',response.token);
                    //auth again
                    authSocket(response.token);
                }
            })
        }
        //as soon as we get the new token, set it
    };
    _socket.onclose = function(event) {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            // console.log(`readyState: ${socket.readyState}`);
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            console.log('[close] Connection died');
            // console.log(`readyState: ${socket.readyState}`);
        }
    };
    _socket.onerror = function(error) {
        console.log(`[error] ${error.message}`);
        // console.log(`readyState: ${socket.readyState}`);
    };
    //testing to return the just created socket
    // return _socket;
};
//////////////////////////////////////////////
//check/set/get data on local storage function
export function setStoredField(field,value){
    const parsed = JSON.parse(localStorage.getItem("_NoneOfYourBusiness"));
    // Object.defineProperty(parsed, field, {
    //     value: encode(value),
    // });
    parsed[`${field}`] = encode(value);
    // TODO add as testing mode
    // console.log('Object to set::::');
    // console.log(parsed);
    // console.log(`I have set field:${field} as:${value} encoded:${encode(value)}`);
    localStorage.setItem("_NoneOfYourBusiness",JSON.stringify(parsed));
}
export function getStoredField(fieldToGet){
    // object['property']
    const parsed = JSON.parse(localStorage.getItem("_NoneOfYourBusiness"));
    const field = parsed[`${fieldToGet}`];
    // TODO add as testing mode
    // console.log(`Reading:${fieldToGet} as:${field} decoded:${decode(field)}`);
    return decode(field);
}
function tryLoginBee(){
    const actualToken = getStoredField("bt");
    if(actualToken){
        fecthDataRequest(beechatEP + "/users/verify",actualToken)
        .then(response => {
            console.log(response);
            //depending on response we re-auth using the ts/msg stored
            if(response.statusCode === 401 && response.error === "Unauthorized" && response.message === "Expired token"){
                //as ts is too old for server
                // for now logs user out
                alert('Session Expired. Please log in.');
                localStorage.clear();
                console.log('User Forced Logged OUT!');
                //TODO this need to be tested and fixed as right now I am seeing the alert 3 times....
                return navigate("/");
            }
        }).catch(error => {return console.log('Error fetching Bee API to test actual token',error)});
    }
}
export function checkIt(){
    var userdata = {
        logged: false,
        username: "",
        profilePicUrl: "",
        usertype: "",
        logginIn: false,
        token: "",
        loginmethod: "",
        access_token: "",
        bt: "",
        brt: "",
        banned: false,
        ts: "",
        msg: '',
        currentchatid: "",
        newmessages: "", 
    }
    if(typeof window !== "undefined"){
        if(isKeychainInstalled && hasKeychainBeenUsed){
            const data = localStorage.getItem('_NoneOfYourBusiness');
            if(data && data !== null && data !== ""){
                try {
                    const dataJson = JSON.parse(data);
                    // console.log(dataJson);
                    const dataJsonDeco = iterateEntries(dataJson);
                    // console.log(dataJsonDeco);
                    if(dataJsonDeco.token && dataJsonDeco.token !== null && dataJsonDeco.token !== ""){
                        jwt.verify(dataJsonDeco.token, secret, function(err, decoded){
                            if(err){
                                console.log('Error while verifying token');
                                //force auto-login
                            }
                            if(!decoded){
                                console.log('Invalid Token');
                                //test to delete the userdata from browser to prevent problems and unnecessary checks.
                                localStorage.removeItem('_NoneOfYourBusiness');
                                console.log('userdata Removed from local storage!!!!');
                                //force auto-login
                            }else if(decoded){
                                // TODO: depending on which loginmethod, fill data
                                // or maybe just iterate and assign???
                                // TODO: -> use the banned param comming from server to allow or deny logs in
                                userdata = {
                                    logged: true,
                                    username: dataJsonDeco.username,
                                    profilePicUrl: dataJsonDeco.profilePicUrl,
                                    usertype: dataJsonDeco.usertype,
                                    logginIn: false,
                                    token: dataJsonDeco.token,
                                    loginmethod: dataJsonDeco.loginmethod,
                                    access_token: dataJsonDeco.access_token,
                                    bt: dataJsonDeco.bt,
                                    brt: dataJsonDeco.brt,
                                    banned: dataJsonDeco.banned,
                                    ts: dataJsonDeco.ts,
                                    msg: dataJsonDeco.msg,
                                    currentchatid: dataJsonDeco.currentchatid,
                                    newmessages: dataJsonDeco.newmessages,
                                }
                                console.log('Still valid, used data on localstorage.');
                                // testing to check if valid data for bee Chat
                                //testing to check for socket on each loading/render as we
                                // do on auth
                                checkSocket();
                                tryLoginBee();
                            }
                        });
                    }else{
                        console.log('Token not present!!!');
                    }
                } catch (error) {
                    console.log('Error while trying to parse, data corrupted or changed!!!');
                    console.log('TODO auto-login');
                    // console.log(error);
                }
            }else{//force auto-login
                console.log('No userdata present.');
                console.log('TODO auto-login');
            }
            return userdata;
        }else{
            //not installed or not able to reach
            console.log('If you are using Chrome, there is a bug. Just before log in, click on the hive-keychain extension first.');
            console.log('Maybe the extension is not installed, please go to http://www,getthextensionhere.com');
            return userdata;
        }
    }else{
        return userdata;
    }
}
//end h/c