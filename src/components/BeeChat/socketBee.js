import React, { useState, useEffect, createContext } from 'react';
import { fecthDataRequest } from '../../utils/helpers';
import Loader from '../loader';

//testing dispatcher here
//testing react/redux
import { useDispatch, useSelector } from 'react-redux';
import { setNewMessages } from '../../features/notifications/notiSlice'
import { selectStored } from '../../features/socket/socketSlice';
//constants
const beechatSocket = process.env.GATSBY_socketBeeChat;
const beechatEP = process.env.GATSBY_beeChatEP;

//testing to pass the socket as context
const Socket = createContext(null);
export { Socket }

//testing to set the socket as a var on top of all components
// TODO and test
// what if we export this var _socket and retrieve it at beechat fixed?
// we could:
// check if not null, then check state, depending on readyState - connect or open.
// if var = null then create a new one and kill it as you are doing right now on unmount.
// TODO: if above do not work then we must handle the socket as a state within the store using as a reference:
// - https://github.com/hive-engine/beechat-frontend/blob/master/plugins/api.js
// - https://github.com/hive-engine/beechat-frontend/blob/master/store/index.js

// var _socket;

// TODO here.
// test to handle when new messages arrives to set the dispatcher on redux as unreaded.
// add the inner components as lists, chats from fixedbeechat
// make them as components so it can be easy to edit or handle.
// leaving this one as the main who only handles: send, reception and connection.
// all the rest do the rest.
// Important Notes:
// 1. It seems the token from API Bee do not expires, at least not from more than 8 hrs. The way is coded allows to use the last token saved in LS.

/**
 * This component allow you to handle the socket and re-auths on BeeChat API. Among other things I will update later on.
 * @param {Function} cbMessages - The call back to pass the incoming messages as they "get here".
 * @param {Boolean} readLS - A boolean constant we send from parents to force him read all the LS data. Specifically to read the token & refresh_token from LS.
 * @param {Function} sendChatS - from other components, to show the actual status of the socketBee. 'Connected'
 * @param {Function} handlePayLoad - Function/CB to handle the payload from other components to send here to server.
 * @param {Boolean} testBtn - Show/Hide a connect btn to test the Hive KeyChain first signature and connection to beeChat API + socket.
 */

const Socketbee = (props) => {
    let _socket;
    const [token, setToken] = useState(null);
    const [socket, setSocket] = useState(null);
    const [chatMessage, setChatMessage] = useState(null);
    const [chatStatus, setChatStatus] = useState("");
    const { cbMessages, readLS, sendChatS, testBtn, handlePayLoad } = props;

    //testing react/redux
    const dispatch = useDispatch();
    const storedData = useSelector(selectStored);
    // end testing

    // const { connect } = props;
    
    // let socket;

    // if(socket){
    //     socket.onopen = function(e) {
    //         console.log("[open] Connection established");
    //     };
    //     socket.onmessage = function(event) {
    //         console.log(`[message] Data received from server: ${event.data}`);
    //     };
    //     socket.onclose = function(event) {
    //         if (event.wasClean) {
    //             console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    //         } else {
    //             console.log('[close] Connection died');
    //         }
    //     };
    //     socket.onerror = function(error) {
    //         console.log(`[error] ${error.message}`);
    //     };
    // };

    // const connectSocket = () => {
    //     socket = io.connect(beechatSocket);
    // }

      //function to init the socket
    //   function initSocket(){
    //     //TODO define a test .env var to activate all this messages under condition.
    //     console.log(`Connecting to: ${beechatSocket}`);
    //     let socket = new WebSocket(beechatSocket);
    //     socket.onopen = function(e) {
    //         console.log("[open] Connection established");
    //         setSocket(socket);
    //     };
    //     socket.onmessage = function(event) {
    //         console.log(`[message] Data received from server: ${event.data}`);
    //     };
    //     socket.onclose = function(event) {
    //         if (event.wasClean) {
    //             console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    //             // console.log(`readyState: ${socket.readyState}`);
    //         } else {
    //             // e.g. server process killed or network down
    //             // event.code is usually 1006 in this case
    //             console.log('[close] Connection died');
    //             // console.log(`readyState: ${socket.readyState}`);
    //         }
    //     };
    //     socket.onerror = function(error) {
    //         console.log(`[error] ${error.message}`);
    //         // console.log(`readyState: ${socket.readyState}`);
    //     };
    // }

    //Useeffects
    //////// To load on init + unmount.
    useEffect(() => {
        const token = localStorage.getItem("bToken");
        if(token){
            verifyToken(token); //and auth again.
        }else{
            console.log('No data for bee on LS.');
        }

        // setChatStatus('Init');
        // triggerReadLS();

        // return () => {
        //     console.log('Killing _socket')
        //     _socket = null;
        // };
    }, []);
    function verifyToken(token){
        fecthDataRequest(beechatEP + "users/verify",token)
        .then(response => {
            if(response.username){
                setToken(token);
            }else{
                getNewToken(localStorage.getItem("brToken"));
            }
        }).catch(error => {console.log('Error on token verification.', error)});
    }
    function getNewToken(refresh_token){
        fecthDataRequest(beechatEP + "users/refresh-token",refresh_token)
        .then(response => {
            if(response.token){
                localStorage.setItem("bToken", response.token);
                setToken(response.token);
            }
        }).catch(error => console.log('Error refresh_token.',error));
    }
    //////// end to Load on init
    ///On each changes
    useEffect(() => {
        console.log('Stored Data LS: ',storedData);
        if(storedData){
            createSocket();
        }
    },[storedData]);
    useEffect(() => {
        if(token){
            if(socket){
                socket.send(JSON.stringify({ "type": "authenticate","payload": {"token": `${token}`}}));
            }else{
                createSocket();
            }

            //check if valid token
            // setChatStatus('Verifying');
            // fecthDataRequest(beechatEP + "users/verify",token)
            // .then(response => {
            //     // console.log(response);
            //     if(response.username){//still valid. we may init socket if needed.
            //         if(!socket){
            //             console.log('No socket so create a new one!');
            //             //let's set the socket as this will fire the state
            //             createSocket(token);
            //         }else{
            //             console.log('_socket readyState:',_socket.readyState);

            //             // setSocket(_socket);
            //             // if(socket.readyState === 3){
            //             //     console.log('socket was on 3 so...open it again now.');
            //             //     createSocket();
            //             // }else if(socket.readyState === 1){
            //             //     sendPayloadSocket({"type": "authenticate","payload": {"token": `${token}`}}); 
            //             // }
            //         }
            //     }else{
            //         fecthDataRequest(beechatEP + "users/refresh-token",refresh_token)
            //         .then(response => {
            //             // console.log(response); 
            //             if(response.token){
            //                 localStorage.setItem("bToken", response.token);
            //                 setToken(response.token);
            //                 //this will trigger again this whole function.
            //             }
            //         }).catch(error => console.log('Error refresh_token.',error));
            //     }
            //     // if(response.statusCode === 401 && response.error === "Unauthorized" && response.message === "Expired token"){
                    
            //     // }
            // }).catch(error => {
            //     console.log('Error fetching Bee API to test actual token',error)
            // });
            
            //as soon as they are here. 
            // 1, check validity to init the socket.
        }
    }, [token]);
    useEffect(() => {
        console.log('Socket State:');
        console.log(socket);
        if(socket){ 
            if(socket.readyState === 3){
                setSocket(new WebSocket(beechatSocket));
            }
            if(socket.readyState === 1 && chatStatus !== 'online'){
                socket.send(JSON.stringify({ "type": "authenticate","payload": {"token": `${token}`}}));
            }
            socket.onopen = function(e) {
                console.log("[open] Connection established On Socket State!");
                //auth
                socket.send(JSON.stringify({ "type": "authenticate","payload": {"token": `${token}`}}));
            };
            // console.log(socket);
            // console.log('socket readyState: ', socket.readyState);
            // if(socket.readyState === 1){//ready to send the auth
            //     console.log("[open] Connection established on final SOCKET, AUTH socket");
            //     sendPayloadSocket({
            //         "type": "authenticate",
            //         "payload": {
            //             "token": `${token}`
            //         }
            //     }); 
            // }
            //     else if(socket.readyState === 3){
            //     createSocket();
            // }
            // socket.onopen = function(e) {
                
            // }
            socket.onmessage = function(event) {
                console.log(`[message] Data received from server: ${event.data}`);
                const data = JSON.parse(event.data);
                if(data.type === "reauthentication-required" || (data.type === "status" && !data.payload.authenticated)){
                    getNewToken(localStorage.getItem("brToken"));
                }else if(data.type === "status" && data.payload.authenticated){
                    verifyNew();
                    setChatStatus('online');
                }else if(data.type === "chat-message"){
                    setChatMessage(data.payload);
                }
                // console.log('Data parsed:', data);
                // console.log(data);
                // if(data.type === "reauthentication-required"){
                //     console.log('Re-Auth please!');
                //     // get a new token and send payload to wss
                //     const refresh_token = localStorage.getItem("brToken");
                //     fecthDataRequest(beechatEP + "users/refresh-token",refresh_token)
                //     .then(response => {
                //         console.log('New response from, re-auth',response);
                //         if(response.token){
                //             localStorage.setItem("bToken", response.token);
                //             //testing to auth and then set the new token.
                //             sendPayloadSocket({
                //                 "type": "authenticate",
                //                 "payload": {
                //                     "token": `${response.token}`
                //                 }
                //             });
                //             // setToken(null);
                //             setToken(response.token);
                //             //this will trigger again this whole function.
                //         }else{
                //             fecthDataRequest(beechatEP + "users/refresh-token",refresh_token)
                //             .then(response => {
                //                 // console.log(response); 
                //                 if(response.token){
                //                     localStorage.setItem("bToken", response.token);
                //                     setToken(response.token);
                //                     //this will trigger again this whole function.
                //                 }
                //             }).catch(error => console.log('Error refresh_token.',error));
                //         }
                //     }).catch(error => console.log('Error refresh_token.',error));
                // }else if(data.type === "chat-message"){
                //     //for now pass as context
                //     console.log('Received chat message on Socketbee!');
                //     sendMessageCB(data.payload);
                //     setChatMessage(data.payload);
                //     //testing to use make a fetch request to API bee and then set the new messages into dispatcher
                //     verifyNew();
                // }else if(data.type == "status" && data.payload.authenticated){
                //     console.log('We are authed on Bee no need for now to re-auth. Just when the server ask for it');
                //     setChatStatus('online');
                // }else{
                //     console.log('Received general message on Socketbee!');
                //     sendMessageCB(data);
                // }

            };
            socket.onclose = function(event) {
                if (event.wasClean) {
                    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
                    setChatStatus('closed');
                    //try to open again.
                    createSocket();
                }else{
                    console.log('[close] Connection died');
                    setChatStatus('closed');
                    createSocket();
                }
            };
            socket.onerror = function(error) {
                console.log(`[error] ${error.message}`);
                setChatStatus('error');
            };
        }
    }, [socket]);
    useEffect(() => {
        if(readLS){
            console.log('A read has been fired. Oh...');
            triggerReadLS();
        }
    },[readLS]);
    useEffect(() => {
        if(chatStatus){
            sendChatS(chatStatus);
        }
    },[chatStatus]);
    useEffect(() => {
        if(handlePayLoad && chatStatus === "online"){
            console.log('PayLoad received to send',handlePayLoad);
            sendPayloadSocket(handlePayLoad);
        }
    },[handlePayLoad]);
    useEffect(() => {
        if(chatMessage){ setTimeout(() => setChatMessage(null),500)};
    },[chatMessage]);
    ///End On each changes
    // END Useeffects

    //functions/CB
    function verifyNew(){
        const actualToken = localStorage.getItem("bToken");
        if(actualToken){
            fecthDataRequest(beechatEP + "messages/new",actualToken)
            .then(response => {
                dispatch(setNewMessages((response.length > 0)));
            }).catch(error => console.log('Error fetching NM on API BeeChat - SocketBee',error));
        }
    }
    function sendMessageCB(chatMessage){
        if(cbMessages){
            cbMessages(chatMessage);
        }
    }
    //CB from/to children
    const getFromChild = (value) => {
        console.log('From Child: ',value);
    }
    const payloadFromChild = (payload) => {
        console.log('Received payload from children');
        sendPayloadSocket(payload);
    } 
    const fireRead = (cen) => {
        console.log('From Child: ',cen);
        // if(cen){
        //     triggerReadLS();
        // }
    }
    //END CB from/to children
    function triggerReadLS(){
        // console.log('Reading LS, BeeChat tokens data');
        const _bToken = localStorage.getItem("bToken");
        if(_bToken){
            setToken(_bToken); 
        }else{
            setChatStatus('No data LS');
        }
    }
    function createSocket(){
        // _socket = new WebSocket(beechatSocket);
        _socket = new WebSocket(beechatSocket);
        _socket.onopen = function(e) {
            console.log("[open] Connection established, Setting the State socket...");
            setSocket(_socket);
        }
        // _socket.onmessage = function(event) {
        //     console.log(`[message] Data received from server: ${event.data}`);
        //     const data = JSON.parse(event.data);
        //     // console.log('Data parsed:', data);
        //     if(data.type === "reauthentication-required"){
        //         console.log('Re-Auth please!');
        //         // get a new token and send payload to wss
        //         const refresh_token = localStorage.getItem("brToken");
        //         fecthDataRequest(beechatEP + "users/refresh-token",refresh_token)
        //         .then(response => {
        //             console.log('New response from, re-auth',response);
        //             if(response.token){
        //                 localStorage.setItem("bToken", response.token);
        //                 //testing to auth and then set the new token.
        //                 sendPayloadSocket({
        //                     "type": "authenticate",
        //                     "payload": {
        //                         "token": `${response.token}`
        //                     }
        //                 });
        //                 // setToken(null);
        //                 setToken(response.token);
        //                 //this will trigger again this whole function.
        //             }else{
        //                 fecthDataRequest(beechatEP + "users/refresh-token",refresh_token)
        //                 .then(response => {
        //                     // console.log(response); 
        //                     if(response.token){
        //                         localStorage.setItem("bToken", response.token);
        //                         setToken(response.token);
        //                         //this will trigger again this whole function.
        //                     }
        //                 }).catch(error => console.log('Error refresh_token.',error));
        //             }
        //         }).catch(error => console.log('Error refresh_token.',error));

        //     }else if(data.type === "chat-message"){
        //         //for now pass as context
        //         console.log('Received chat message on Socketbee!');
        //         sendMessageCB(data.payload);
        //         setChatMessage(data.payload);
        //         //testing to use make a fetch request to API bee and then set the new messages into dispatcher
        //         verifyNew();
        //     }else if(data.type == "status" && data.payload.authenticated){
        //         console.log('We are authed on Bee no need for now to re-auth. Just when the server ask for it');
        //         // for now calling from here to check new messages
        //         verifyNew();
        //         setChatStatus('online');
        //     }else{
        //         console.log('Received general message on Socketbee!');
        //         sendMessageCB(data);
        //     }
        // };
    }
    function sendPayloadSocket(data){
        if(socket === null){ return console.log('Socket not open || defined. Please fix this.')};
        if(socket.readyState === 1){
            console.log('Sending as payload:',data);
            socket.send(JSON.stringify(data));
        }else{
            console.log('Socket not ready.');
            // testing to send the initsocket right here under thus not ready condition
            // initSocket();
        }
    };
    const initialConnect = async () => {
        const timestamp = Date.now();
        const ts = 'theghost1980' + timestamp; 
        await window.hive_keychain.requestSignBuffer('theghost1980', ts, "Posting", function(result){
            console.log(result);
            const { success, error } = result;
            if(success){
                const { data } = result;
                const { username, message } = data;
                const sig = result.result;
                const urlGet = beechatEP + "users/login?" + `username=${username}&ts=${timestamp}&sig=${sig}`;
                fecthDataRequest(urlGet, null)
                .then(response => {
                    console.log(response);
                    if(response.statusCode !== 401 && !response.error){
                        const { admin, token, refresh_token, username } = response;
                        localStorage.setItem("bToken", token);
                        localStorage.setItem("brToken", refresh_token);
                        setToken(token);
                    }
                    // const actualToken = response.token;
                    // setStoredField("bt",response.token);
                    // setStoredField("brt",response.refresh_token);
                    // setStoredField("currentchatid","xxx");
                    // setStoredField("ts",timestamp);
                    // setStoredField("msg",sig);
                    // initSocket();
                    // fecthDataRequest(beechatEP + "messages/new",actualToken)
                    // .then(response => {
                    //     if(response.length > 0){
                    //         setStoredField("newmessages","true");
                    //         // TODO how????
                    //         // dispatch(setNewMessages(true));
                    //     }else{
                    //         setStoredField("newmessages","false");
                    //         // TODO how????
                    //         // dispatch(setNewMessages(true));
                    //     }
                    // }).catch(error => console.log('Error fetching NM on API BeeChat',error));

                }).catch(error => console.log('Error fetching on API BeeChat',error));
            }else if (error){
                // TODO handle error
            };
        });
    }
    //end functions/CB

    return (
        <Socket.Provider value={{
            chatStatus: chatStatus,
            setter: getFromChild,
            fire: fireRead,
            chatMessage: chatMessage, //the out socketBee has received and send as context to childs.
            payloadFromChild: payloadFromChild, //the payload comming from children.
        }}>
            <div> 
                {
                    testBtn && 
                    <div>
                        <button onClick={initialConnect}>Connect as test</button>
                        <button onClick={() => sendPayloadSocket({ "type": "authenticate", "payload": { "test": `errorForSure`}})}
                        >
                            PayloadError
                        </button>
                    </div>
                }
                {/* <p>Stats:{chatStatus}</p> */}
                {props.children}
            </div>
        </Socket.Provider>
    )
}

export default Socketbee;