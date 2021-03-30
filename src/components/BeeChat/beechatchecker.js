import React, { useState, useEffect, useContext } from 'react';
// import { check } from '../../utils/helpers';
// import { useStaticQuery, graphql } from 'gatsby';
// import Img from 'gatsby-image';

// //testing timeoutCollection
// import { intervalCollection } from 'time-events-manager';

// //constants
// const beechatEP = process.env.GATSBY_beeChatEP;
// const intervalTimer = 40000; //in ms.
// //variables
// var timerBeeChat = null;
// const beechatSocket = process.env.GATSBY_socketBeeChat;

// Component Logic
// Check if timer is on, if not enable it.
// In timer function:
    // read from LS the token & refresh_token
    // if tokens, ask for:
    // 1. refresh_token to keep session active
    // TODO: replace using cookies or think in another way more efficient.
    //  1.1 save into LS
    // 2. ask for unread messages -> set State
    //  2.1 save into LS
    // 3. ask for old messages if any -> set State
    //  3.1 save into LS
    // 4. ask for friend list
    //  4.1 save into LS
    // 5. ask for settings
    //  5.1 save into LS
    // 6. ask for user channels
    //  6.1 save into LS

// Fetching data BeeChat
// export function getDataBeeChat(_beeTokens){
//     // EPoints ['users/refresh-token','/messages/new','/messages/conversations','/users/friends','/users/friend-requests','/users/settings','/users/channels']
//     console.log('Asking all data on beeChat API.');
//     askBeeAPI("users/refresh-token",_beeTokens.refresh_token)
//     .then(response => {
//         if(response.token){ //means success getting authenticated on beeChat API.
//             const replied_token = response.token;
//             //ask for unread messages
//             askBeeAPI("/messages/new",replied_token)
//             .then(response => {
//                 console.log('Results unread msgs:');
//                 localStorage.setItem("unread",JSON.stringify(response)); // save into LS 
//                 // now ask for /messages/conversations
//                 askBeeAPI("/messages/conversations",replied_token)
//                 .then(response => {
//                     console.log('Results old/all msgs:');
//                     console.log(response);
//                     // save into LS 
//                     localStorage.setItem("oldmessages",JSON.stringify(response));
//                     //now ask for /users/friends
//                     askBeeAPI("/users/friends",replied_token.token)
//                     .then(response => {
//                         console.log('Results friends:');
//                         console.log(response);
//                         localStorage.setItem("friendlist",JSON.stringify(response)); // save into LS 
//                         //now ask for /users/friend-requests
//                         askBeeAPI("/users/friend-requests",replied_token)
//                         .then(response => {
//                             console.log('Results FR:');
//                             console.log(response);
//                             localStorage.setItem("friendrequests",JSON.stringify(response)); // save into LS 
//                             //now ask for /users/settings
//                             askBeeAPI("/users/settings",replied_token)
//                             .then(response => {
//                                 console.log('Results settings:');
//                                 console.log(response);
//                                 localStorage.setItem("settings",JSON.stringify(response)); // save into LS 
//                                 // FINALLY as for /users/channels
//                                 askBeeAPI("/users/channels",replied_token)
//                                 .then(response => {
//                                     console.log('Results channels:');
//                                     console.log(response);
//                                     localStorage.setItem("channels",JSON.stringify(response)); // save into LS 
//                                     console.log('End asking data from BE chat API!');
//                                 }).catch(err => console.log('Error channels BC API.',err));
//                             }).catch(err => console.log('Error settings BC API.',err));
//                         }).catch(err => console.log('Error friendrequests BC API.',err));
//                     }).catch(err => console.log('Error friendlist BC API.',err));
//                 }).catch(err => console.log('Error getting oldmsgs BC API.',err));
//             })
//             .catch(err => console.log('Error getting Unread Msgs BC API.',err));
//         }
//     })
//     .catch(err => console.log('Error asking refresh_token on BC API.',err));
// }
// export async function askBeeAPI(EP,token){
//     const urlRT = beechatEP + EP;
//     getData(urlRT, token)
//     .then(response => {
//         return response;
//         // console.log(response);
//         // if(response.token){
//         //     // when received a token now we ask for all info.
//         //     getUnread(response.token);
//         //     getOld(response.token);
//         //     getFL(response.token);
//         //     getFR(response.token);
//         //     getSettings(response.token);
//         //     getChannels(response.token);
//         // }
//     })
//     .catch(err => {
//         console.log('Error trying to refresh the token');
//         console.log(err);
//         return err;
//     })
// };
// async function getData(url,refresh_token){
//     const response = await fetch(url, {
//         method: 'GET',
//         mode: 'cors',
//         cache: 'no-cache', 
//         headers: {
//             'Authorization': `Bearer ${refresh_token}`
//         },
//     });
//     return response.json();
// }
// end fecthing data

const Beechatchecker = () => {

    // function activateTrigger(){
    //     specialCB();
    // }

    // // Todo => if logged activate check on each mount.
    // // todo -> a function to fire the check of new unread messages at will.
    // const userdata = check();
    // //
    // // const [oldchats, setOldchats] = useState([]);
    // const [beeTokens, setBeeTokens] = useState(null);
    // // const [friendList, setFriendList] = useState([]);
    // // const [friendRequests, setFriendRequests] = useState([]);
    // // const [settings, setSettings] = useState(null);
    // // const [channels, setChannels] = useState([]);

    // // testing to use socket here
    // const [socket, setSocket] = useState(null);
    // // end testing socket

    // ///////////socket tests///////////
    //  //function to init the socket
    //  function initSocket(){
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
    // ///////END function to init the socket
    // //testing to auth once the socket it is been set
    // useEffect(() => {
    //     //as a test for now
    //     const token = localStorage.getItem('_GOfUb_T');
    //     if(socket && token !== null && token !== ""){
    //         console.log(`I was set and my readyState is:${socket.readyState}`);
    //         //now we auth
    //         sendPayloadSocket({
    //             "type": "authenticate",
    //             "payload": {
    //                 "token": `${token}`
    //             }
    //         });
    //     }else{
    //         console.log('Error on socket || on beeTokens object!');
    //     }
    // },[socket]);
    // function sendPayloadSocket(data){
    //     if(socket.readyState === 1){
    //         console.log('Sending as payload:');
    //         console.log(data);
    //         socket.send(JSON.stringify(data));
    //     }else{
    //         console.log('Socket not ready.');
    //     }
    // };
    // ///////////end socket tests///////

    // //beeChat functions
    // //refresh-token
    // async function refreshToken(token){
    //     console.log('Refreshing Token......');
    //     const urlRT = beechatEP + "users/refresh-token";
    //     getData(urlRT, token)
    //     .then(response => {
    //         // TODO handle errors:
    //         // if internet down
    //         // if something different comes from the request.
    //         //setting tokens as new as received:
    //         console.log(response);
    //         if(response.token){
    //             localStorage.setItem('_GOfUb_T',response.token);
    //             //testing to set the socket here on each new access token received
    //             initSocket();
    //             // when received a token now we ask for all info.
    //             getUnread(response.token);
    //             getOld(response.token);
    //             getFL(response.token);
    //             getFR(response.token);
    //             getSettings(response.token);
    //             getChannels(response.token);
    //         }
    //     })
    //     .catch(err => {
    //         console.log('Error trying to refresh the token');
    //         console.log(err);
    //     })
    // };
    
    // //get unread messages
    // async function getUnread(token){
    //     const urlGet = beechatEP + "messages/new"; 
    //         getData(urlGet,token)
    //         .then(result => {
    //             // TODO handle errors:
    //             // if internet down
    //             // if something different comes from the request.
    //             console.log('Results unread msgs:');
    //             console.log(result);
    //             // save into LS 
    //             localStorage.setItem("unread",JSON.stringify(result));
    //         })
    //         .catch(error => {console.log('Error fetching on API BeeChat',error)});
    // }
    // // get old messages -> GET /messages/conversations
    // async function getOld(token){
    //     const urlGet = beechatEP + "messages/conversations"; 
    //         getData(urlGet,token)
    //         .then(result => {
    //             // TODO handle errors:
    //             // if internet down
    //             // if something different comes from the request.
    //             console.log('Results old/all msgs:');
    //             console.log(result);
    //             // save into LS 
    //             localStorage.setItem("oldmessages",JSON.stringify(result));
    //         })
    //         .catch(error => {console.log('Error fetching on API BeeChat',error)});
    // }
    // //get friend list GET /users/friends
    // async function getFL(token){
    //     const urlGet = beechatEP + "users/friends"; 
    //     getData(urlGet,token)
    //     .then(result => {
    //         // TODO handle errors:
    //         // if internet down
    //         // if something different comes from the request.
    //         console.log('Results friend list:');
    //         console.log(result);
    //         // save into LS 
    //         localStorage.setItem("friendlist",JSON.stringify(result));
    //     })
    //     .catch(error => {console.log('Error fetching on API BeeChat',error)});
    // }
    // //get friend requests GET /users/friend-requests
    // async function getFR(token){
    //     const urlGet = beechatEP + "users/friend-requests"; 
    //     getData(urlGet,token)
    //     .then(result => {
    //         // TODO handle errors:
    //         // if internet down
    //         // if something different comes from the request.
    //         console.log('Results friend requests:');
    //         console.log(result);
    //         // save into LS 
    //         localStorage.setItem("friendrequests",JSON.stringify(result));
    //     })
    //     .catch(error => {console.log('Error fetching on API BeeChat',error)});
    // }
    // // GET /users/settings
    // async function getSettings(token){
    //     const urlGet = beechatEP + "users/settings";
    //     getData(urlGet,token)
    //     .then(result => {
    //         // TODO handle errors:
    //         // if internet down
    //         // if something different comes from the request.
    //         console.log('Results user settings:');
    //         console.log(result);
    //         // save into LS 
    //         localStorage.setItem("settings",JSON.stringify(result));
    //     })
    //     .catch(error => {console.log('Error fetching on API BeeChat',error)});
    // }
    // // GET /users/channels
    // async function getChannels(token){
    //     const urlGet = beechatEP + "users/channels";
    //     getData(urlGet,token)
    //     .then(result => {
    //         // TODO handle errors:
    //         // if internet down
    //         // if something different comes from the request.
    //         console.log('Results user channels:');
    //         console.log(result);
    //         // save into LS
    //         localStorage.setItem("channels",JSON.stringify(result));
    //     })
    //     .catch(error => {console.log('Error fetching on API BeeChat',error)});
    // }
    // //end beeChat functions

    // //timer functions
    // function timerFunction(){
    //     console.log('BeeChecker working+++++ each,',intervalTimer);
    //     //check if userlogged && beetokens present.
    //     const _beeTokens = {
    //         token: localStorage.getItem('_GOfUb_T'),
    //         refresh_token: localStorage.getItem('_GOfUb_RT'),
    //     }
    //     if(userdata.logged && _beeTokens.token !== null && _beeTokens.token !== "" && _beeTokens.refresh_token !== null & _beeTokens.refresh_token !== ""){
    //         //assign token to state
    //         setBeeTokens(_beeTokens);
    //         //now ask to refresh token OLD way
    //         refreshToken(_beeTokens.refresh_token);
    //         // new way using only one fn
    //         // getDataBeeChat(_beeTokens);
    //     }else{
    //         //user logged ou so kill me.
    //         console.log('Per no data present. Killing timer beeChat.');
    //         clearInterval(timerBeeChat);
    //     }
    // }
    // function activationFunction(){
    //     timerBeeChat = setInterval(timerFunction,intervalTimer);
    //     // console.log(intervalCollection.get(0));
    // }
    // //calling clock
    // // clock3();
    // //end timer functions

    // useEffect(() => {
    //     //testing the timercollection lib
    //     const allTimers = intervalCollection.getAll();
    //     console.log('Before checking on timerBeeChat !== null');
    //     console.log(allTimers);
    //     const foundedT = allTimers.filter(timer => timer.interval === intervalTimer);
    //     //end testing

    //     //check for timer
    //     if(timerBeeChat === null && foundedT.length === 0){
    //         //not active, activate it
    //         // but first call the function itself one time only to do a first check
    //         // timerFunction()
    //         console.log(`Timer was not active. Activating it. Interval ${intervalTimer} ms.`);

    //         activationFunction();
            
    //         //testing the timercollection lib
    //         const allTimers2 = intervalCollection.getAll();
    //         console.log('After activation');
    //         console.log(allTimers2);
    //         //end testing

    //     }else{
    //         // TODO
    //         // if founded.length > 1 means there is 2 timers of intervals === so we must delete one.
    //         // TODO
    //         console.log(`Timer is still active. Interval ${intervalTimer} ms.`);
    //         //check on ls to set the anynew.
    //         // const _unread = JSON.parse(localStorage.getItem("unread"));
    //         // if(_unread && _unread !== null){
    //         //     console.log(`Value on LS UNREAD:${_unread.length}`);
    //         //     if(_unread.length > 0){
    //         //         setAnyNew(true);
    //         //     }
    //         // }else{
    //         //     console.log('No unread data yet!!!');
    //         // }
    //     }
    //     //now we must unmount the timer to prevent memory leaks.
    //     // return () => {
    //     //     // TODO: we should check or user-settings in order to decide
    //     //     // if we left the checking on or off
    //     //     console.log("cleaned up on BeechatChecker!!!");
    //     //     clearImmediate(timerBeeChat);
    //     //     console.log("timerBeeChat is dead.");
    //     // };
    // },[])


    // async function getDataWT(url,refresh_token){
    //     const response = await fetch(url, {
    //         method: 'GET',
    //         mode: 'cors',
    //         cache: 'no-cache', 
    //         headers: {
    //             'Authorization': `Bearer ${refresh_token}`
    //         },
    //     });
    //     return response.json();
    // }

    ////fetching data
    // async function getData(url = '',_token) {
    //     const response = await fetch(url, {
    //         method: 'GET',
    //         mode: 'cors',
    //         cache: 'no-cache', 
    //         headers: {
    //             'Authorization': `Bearer ${_token}`
    //         },
    //     });
    //     return response.json(); 
    // };
    // /////end fetching data

    return (
        <div className="absInfoItem">
            {/* {   
                (anyNew) &&
                    <div className="fadeInLongerInf">
                        <Img fixed={data.event.childImageSharp.fixed}/>
                    </div>
            } */}
        </div>
    )
}

export default Beechatchecker;