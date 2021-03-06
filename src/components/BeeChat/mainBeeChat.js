import React, { useState, useEffect } from 'react';
//components
import Loader from '../loader';
import Tabulator from '../tabulator';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//constants
const beechatEP = "https://beechat.hive-engine.com/api/";
// TODO:
// Note: The main idea is to get the chat as "independent as possible" like the facebook chat, draggeable, so you can place it anywhere and use it at will
// To do that, when user log in:
// Log in, get tokens
// get friend lists, friend-requests
// get user settings
// get user channels

const BeeChat = () => {
    const iniStateBeeDataUser = [
        { id: 'jobaboard-hive-tab-x1', name: 'Friendlist', title: 'Friends', data: {}},
        { id: 'jobaboard-hive-tab-x2', name: 'Friendrequests', title: 'Requests', data: []},
        { id: 'jobaboard-hive-tab-x3', name: 'Channels', title: 'My Channels', data: []},
        { id: 'jobaboard-hive-tab-x4', name: 'Conversations', title: 'Chats', data: []},
        { id: 'jobaboard-hive-tab-x5', name: 'Settings', title: 'Settings', data: {}}
    ];
    const [beeDataUser, setBeeDataUser] = useState(iniStateBeeDataUser);
    const timestamp = Date.now();
    const initialState = {
        username: '',
        token: '',
        refresh_token: '',
        admin: false,
    }
    const [beeUser, setBeeUser] = useState(initialState);

    //Handle STATES
    const updateState = (name,value) => {
        setBeeUser(prevState => {
            return {...prevState, [name]: value}
        });
    };
    // const updateDataUserState = (name,value) => {
    //     setBeeUser(prevState => {
    //         return {...prevState, [name]: value}
    //     });
    // };
    //END handle STATES

    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);

    //to run on init of component, check if beeChat on LS
    useEffect(() => {
        //check for beeUSer/beeChatData data on LS
        const databeeUser = localStorage.getItem('beeUser');
        const beeChatData = localStorage.getItem('beeChat');
        if(beeChatData && databeeUser){
            //try to parse data and check
            try {
                const jsonData = JSON.parse(beeChatData);
                const jsonDataBeeUser = JSON.parse(databeeUser);
                //check for token and if it is still valid.
                if(jsonDataBeeUser.token){
                    getDataWT(beechatEP+"users/verify",jsonDataBeeUser.token)
                    .then(response => {
                        console.log(response);
                        //if valid parse data
                        if(response.username){
                            //load all the data present on jsonData
                            setBeeUser(jsonDataBeeUser);
                            setBeeDataUser(jsonData);
                            setConnected(true);
                            //here we could connect to socket
                            
                        }else if(response.message === "Expired token" || response.err === "Unauthorized"){
                            //token expired
                            console.log('Token not valid anymore.');
                            //delete data from LS so the user must login again.
                            localStorage.removeItem('beeChat');
                            localStorage.removeItem('beeUser');
                            console.log('BeeChat LS data deleted');
                        }else{
                            //token not valid. try to refresh
                            console.log(`beeChat says,\nerr:${response.error}\nmsg:${response.message}`);
                            //try to refresh because we have valid data on LS
                            // refreshToken(jsonDataBeeUser.token)
                            // .then(response => {
                            //     console.log('token Super-Fresh!');
                            //     //here we can set data for beeuser
                            //     setBeeUser(jsonDataBeeUser);
                            //     setBeeDataUser(jsonData);
                            //     setConnected(true);
                            // })
                            // .catch(err => {
                            //     console.log('Error while trying to refresh token.',err);
                            // });
                        }
                        //from here we could then try to parse the rest of data
                        //if not valid, force login again.???
                    })
                    .catch(error => {
                        console.log('Error trying to verify the token found on LS',error);
                    });
                }
            } catch (error) {
                console.log('Error trying to parse the beeChat data');
                console.log(error);
            }
        }else{
            console.log('One of the items is not present to validate the LS of beeCHat instance');
        }
    },[])
    //////////////////
    useEffect(() => {
        setBeeDataUser(beeDataUser);
    },[beeDataUser])

    ///////////////////////
    //GET functions
    async function getData(url = '') {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache', 
        });
        return response.json(); 
    };
    async function getDataWT(url = '', _token) { 
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Authorization': `Bearer ${_token}`
            },
        });
        return response.json(); 
    };
    async function getDataWTNoJsonR(url = '', _token) { 
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Authorization': `Bearer ${_token}`
            },
        });
        return response; 
    };
    //END get functions
    ///////////////////////
    async function signMessage(_username, _timestamp){
        const signature = _username + _timestamp;
        const keyChain = await keychain(window, 'requestSignBuffer', _username, signature, 'Posting');
        const {data, success, msg, cancel, notActive} = keyChain;
        if(success){
            return  { result: true, message: msg} 
        }else if(!cancel) {
            if(notActive) {
                return { result: false, message:'Please allow Keychain to access this website'}
            } else {
                return { result: false, message: keyChain }
            }
        }else if (cancel){
            return { result: false, message:'User cancelled login.'}
        }
    }

    async function initBeeSession(){
        if(beeUser.username === "" || beeUser.username === null){
            return console.log('No input, no sauce for you!');
        }
        setConnecting(true);
        localStorage.setItem('_GOfUb',timestamp);
        await signMessage(beeUser.username,timestamp)
        .then(data => {
            if(data.result){
                //call get friend list fecthing
                const ts = localStorage.getItem('_GOfUb');
                const urlGet = beechatEP + "users/login?" + `username=${beeUser.username}&ts=${ts}&sig=${data.message}`;
                getDataWT(urlGet,beeUser.token)
                .then(result => {
                    // console.log(result);
                    if(result.token && result.refresh_token){
                        //save it to localStorage
                        localStorage.setItem('_GOfUb_T', result.token);
                        localStorage.setItem('_GOfUb_RT',result.refresh_token);
                        setBeeUser(result);
                        setConnected(true);
                        //now we call multiple fetch requests
                        getAllUrls(result.token)
                        .then(arrayPromises => {
                            // console.log(arrayPromises);
                            const DataBeeUser = iniStateBeeDataUser.map((item,index) => {
                                // console.log(arrayPromises[index]);
                                return { id: item.id ,name: item.name, title: item.title, data: arrayPromises[index]};
                            });
                            // console.log(DataBeeUser);
                            setBeeDataUser(DataBeeUser);
                            //set data arrays into localstorage
                            //todo encode
                            localStorage.setItem('beeChat', JSON.stringify(DataBeeUser));
                            //now save into locastorage the beeUser data
                            localStorage.setItem('beeUser',JSON.stringify(result));
                            // console.log('Data Saved into LS');
                        })
                        // console.log(responses);
                        setConnecting(false);
                    }else{
                        console.log('Not token || no refresh_token provided!!');
                        setConnecting(false);
                    }
                })
                .catch(err => {
                    console.log('Error GET friend list');
                    console.log(err);
                    setConnecting(false);
                });
            }else{
                console.log(`Failed to sign\nReason: ${data.message}`);
                setConnecting(false);
            }
        })
        .catch(error => {
            console.log('Error trying to sign message:');
            console.log(error);
            setConnecting(false);
        });
    }

    async function tryConnectUser(event){
        event.preventDefault();
        //call async function to sign message.
        //save timestamp into locastorage
        localStorage.setItem('_GOfUb',timestamp);
        await signMessage(beeUser.username,timestamp)
        .then(data =>{
            // console.log(data);
            if(data.result){
                //now call the GET request
                const ts = localStorage.getItem('_GOfUb');
                const urlGet = beechatEP + "users/login?" + `username=${beeUser.username}&ts=${ts}&sig=${data.message}`;
                getData(urlGet)
                .then(result => {
                    console.log(result);
                    if(result.token && result.refresh_token){
                        //save it to localStorage
                        localStorage.setItem('_GOfUb_T', result.token);
                        localStorage.setItem('_GOfUb_RT',result.refresh_token);
                        setBeeUser(result);
                        setConnected(true);
                    }
                })
                .catch(error => {
                    console.log('Error fetching on API BeeChat');
                    console.log(error);
                })
            }else{
                console.log(`Failed to sign\nReason: ${data.message}`);
            }
        }).catch(error => {
            console.log('Error trying to sign message:');
            console.log(error);
        })

    };

    async function getAllUrls(_token){
        const urls = [
            `${beechatEP}users/friends`,
            `${beechatEP}users/friend-requests`,
            `${beechatEP}/users/channels`,
            `${beechatEP}/messages/conversations`,
            `${beechatEP}users/settings`
        ];
        try {
            var data = await Promise.all(
                urls.map(
                    url =>
                        getDataWT(url,_token)
                        .then(response => response)
                        ));
            return (data)
        } catch (error) {
            console.log('Error executing multiple requests for beeChat User');
            console.log(error)
            throw (error)
        }
    }

    async function getFriends(){
        if(beeUser.token){
            const urlEP = beechatEP + "users/friends";
            getDataWT(urlEP, beeUser.token)
            .then(response => {
                //check if expired token to refresh token.
                if(response.message === "Expired token"){
                    //call method to refresh-token
                    refreshToken(beeUser.token);
                }else{
                    console.log(response);
                }
            })
            .catch(error => {
                console.log('Error trying to fetch friend list from BeeChat API');
                console.log(error);
            })
        }
    };

    //refresh-token


    async function getFriendsReq(){
        if(beeUser.token){
            const urlEP = beechatEP + "users/friend-requests";
            getDataWT(urlEP, beeUser.token)
            .then(response => {
                //check if expired token to refresh token.
                if(response.message === "Expired token"){
                    //call method to refresh-token
                    refreshToken(beeUser.token);
                }else{
                    console.log(response);
                }
            })
            .catch(error => {
                console.log('Error trying to fetch friends requests from BeeChat API');
                console.log(error);
            })
        }
    };

    //get settings
    async function getSettings(){
        if(beeUser.token){
            const urlEP = beechatEP + "users/settings";
            getDataWT(urlEP, beeUser.token)
            .then(response => {
                //check if expired token to refresh token.
                if(response.message === "Expired token"){
                    //call method to refresh-token
                    refreshToken(beeUser.token);
                }else{
                    console.log(response);
                }
            })
            .catch(error => {
                console.log('Error trying to fetch Settings from BeeChat API');
                console.log(error);
            })
        }
    }

    const logOut = () => {
        //send token as bearer & wait for response
        getDataWTNoJsonR(beechatEP+"users/logout",beeUser.token)
        .then(response => {
            console.log(response);
            setBeeUser(initialState);
            setConnected(false);
            localStorage.removeItem('beeChat');
            localStorage.removeItem('beeUser');
        })
        .catch(err => {
            console.log('Error trying to log user out from beeChat!',err);
        })
    }

    //refresh-token
    async function refreshToken(token){
        console.log('Refreshing Token......');
        const urlRT = beechatEP + "users/refresh-token";
        getDataWT(urlRT, token)
        .then(response => {
            console.log(response);
            if(response.token){
                //update state
                updateState('token', response.token);
                console.log('Token Updated on State!');
            }
        })
        .catch(err => {
            console.log('Error trying to refresh the token');
            console.log(err);
        })
    };

    return (
        <div className="beeChatCont">
            {/* <h1>BeeChat Instance</h1> */}
            {
                connected   ?   <div>
                                    <p>User: {beeUser.username} - Status: {connected ? 'Connected' : 'Disconnected'}</p>
                                    {/* <ul className="actionsMenuBeeChat">
                                        <li>
                                            <button onClick={getFriends}>Get friends List</button>
                                        </li>
                                        <li>
                                            <button onClick={getFriendsReq}>Get friend-requests</button>
                                        </li>
                                        <li>
                                            <button onClick={getSettings}>Get Settings</button>
                                        </li>
                                        <li>
                                            <button onClick={logOut}>Log Out</button>
                                        </li>
                                    </ul> */}
                                    <Tabulator datatabs={beeDataUser} />
                                    <button onClick={logOut}>Log Out</button>
                                </div> 
                            :   
                                <div className="divLogBeeChat">
                                    <input type="text" name="username" 
                                        required className="inpBeeChatUser"
                                        onChange={(event) => updateState(event.target.name,event.target.value)}
                                    />
                                    <button onClick={initBeeSession}>
                                        {connecting ? 'Connecting' : 'Connect to BeeChat'}
                                    </button>
                                </div>
            }
            {
                connecting && <Loader logginIn={true} typegif="dots" />
            }
        </div>
    )
}

export default BeeChat;