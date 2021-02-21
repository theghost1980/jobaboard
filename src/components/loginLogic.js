import React, { useEffect, useState, useContext } from 'react';
import { useStaticQuery, graphql, Link } from "gatsby";
import Img from 'gatsby-image';

//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//constants
const starWars = process.env.GATSBY_starWars;
const authEP = process.env.GATSBY_authEP;
//end constants

//libs
// import { updateDataUser } from '../services/auth';

//dhive
const { Client, Signature, cryptoUtils } = require("@hiveio/dhive");

// >>>>>>>TODO<<<<<<<<
// COntext or a way to pass the data user from one page/components to another
// >>>>>>>>>>><<<<<<<<<<<

const Loginlogic = () => {
    const [userData, setUserData] = useState({
        userName: '',
        profilePicUrl: '',
        userType: null,
        logginIn: false,
        logged: false,
        localItem: '_NoneOfYourBusiness',
        token: null,
    });
    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            loader: file(relativePath: {eq: "loading.gif"}) {
                publicURL
            }
        }
    `);
    //end grapqhql queries

    //testing the useeffect hook
    const mount = () => {
        console.log('mounted');
        async function autologin(){
            if(isKeychainInstalled || hasKeychainBeenUsed){
                const _username = localStorage.getItem('username');
                if(_username){
                    //call auto-login
                    //set loggin to show loaders
                    updateData('logginIn',true); 
                    const keyChain = await keychain(window, 'requestSignBuffer', _username, starWars, 'Posting');
                    const {data, success, msg, cancel, notActive} = keyChain;
                    console.log(keyChain);
                    if(success){ 
                        postData(`${authEP}checkGatsbySig`, data.username, msg)
                        .then(data => {
                            data.json()
                            .then(msg => {
                                const { profile_PicURL, token} = msg;
                                updateData('username',_username);
                                updateData('logginIn', false);
                                updateData('logged', true);
                                updateData('profilePicUrl', profile_PicURL);
                                updateData('token',token);
                                localStorage.setItem(userData.localItem, token);
                                localStorage.setItem('username', _username);
                            })
                        })
                        .catch(error => {
                            console.log('Error while logging to API.');
                            console.log(error);
                        });
                    } else if(cancel){
                        //user cancelled so...
                        updateData('logginIn',false);
                    }else if(!cancel) {
                        if(notActive && hasKeychainBeenUsed) {
                            //specific case for chrome. Tested on mozilla and it works as expected but chrome
                            //does something to the windows so for now fixed as, not available auto-login on chrome.
                            console.log('Auto-login not available on Chrome. We keep working to fix this Chrome Bug. Stay Tuned!');
                            updateData('logginIn',false);
                        } else {
                            console.log(msg);
                        }
                    }
                };//possible deletion of localstorage.      
            } else {//not key-chain installed ask for it.
                console.log('Please Install the keychain extension at httpwww.www.ww.www');
            };
        };
        autologin();
        // ...end mount components
      
        const unmount = () => {
          console.log('unmounted')
          // ...
        }
        return unmount
      }
    useEffect(mount, [])
    //end testing

    //first check on load
    // const useMountEffect = (fun) => useEffect(fun, []);
    //autologin function
    // useEffect(()=> {
    //     async function autologin(){
    //         // if(hasKeychainBeenUsed || isKeychainInstalled){
    //             const _username = localStorage.getItem('username');
    //             if(_username){
    //                 //call auto-login
    //                 //set loggin to show loaders
    //                 updateData('logginIn',true);
    //                 let starWars = process.env.GATSBY_starWars; 
    //                 const keyChain = await keychain(window, 'requestSignBuffer', _username, starWars, 'Posting');
    //                 const {data, success, msg, cancel, notActive} = keyChain;
    //                 console.log(keyChain);
    //                 if(success){ 
    //                     postData('http://localhost:3000/api/auth/checkGatsbySig', data.username, msg)
    //                     .then(data => {
    //                         data.json()
    //                         .then(msg => {
    //                             const { profile_PicURL, token} = msg;
    //                             updateData('username',_username);
    //                             updateData('logginIn', false);
    //                             updateData('logged', true);
    //                             updateData('profilePicUrl', profile_PicURL);
    //                             updateData('token',token);
    //                             localStorage.setItem(userData.localItem, token);
    //                             localStorage.setItem('username', userData.userName);
    //                         })
    //                     })
    //                     .catch(error => {
    //                         console.log('Error while logging to API.');
    //                         console.log(error);
    //                     });
    //                 }else if(!cancel) {
    //                     if(notActive) {
    //                     alert('Please allow Keychain to access this website')
    //                     } else {
    //                     console.log(msg);
    //                     }
    //                 }
    //             };//possible deletion of localstorage.      
    //         // };//leave to user the login as they want. 
    //     };
    //     autologin();
    // },[]);
    // useEffect(() => {
    //     if(hasKeychainBeenUsed || isKeychainInstalled){
    //         console.log('Keychain Available. Go on.');
    //         //check for username on local storage
    //         const _username = localStorage.getItem('username');
    //         if(_username){
    //             //call auto-login
    //             autologin(_username);
    //             return null
    //         }
    //     } else {
    //         console.log('Keychain never used and not installed');
    //     }
    // },[]);

    //handle user's State / userData
    function updateData(name,value){
        setUserData(prevState => {
            return {...prevState, [name]: value}
        })
        //now we mess up with the global userdataG
        // updateDataUser(name,value);
    }

    // useEffect(() => {
    //     console.log(userData);
    // },[userData]);

    // async function verifyMsg(msgReceived,accountReceived){
    //     const starWars = 'Signing in Into JobAboard'; //must come from.env - on server.
    //     try {
    //         const dataRemote = Signature.fromString(msgReceived).recover(cryptoUtils.sha256(starWars)).toString();
    //         // console.log(`DataRemote: \n${dataRemote}`);
    //         //now we should compare the received pubKey with the one stored for this account
    //         // console.log(`Searching into dhive for acc:${accountReceived}`);
    //         const client = new Client("https://api.hive.blog"); //for now we use only API - TODO: ask to the guy if the best practice if to have several in case one fails
    //         client.database.getAccounts([`${accountReceived}`])
    //         .then(results => {
    //             if(results.length > 0){
    //                 // console.log(results);
    //                 //check if posting pubKey match
    //                 const postingAccount = results[0].posting;
    //                 // console.log(postingAccount);
    //                 const key = postingAccount.key_auths[0].find(item => item === dataRemote);
    //                 if(key){
    //                     console.log(`Found & Matched PubKey/DataRemote on DB. For ${accountReceived}`);
    //                     //now we can emit the jwt token.
    //                     // TODO HERE
    //                 }else{
    //                     console.log(`No possible to authorise.`);
    //                 }
    //             } else {
    //                 console.log('User not exists on DB.')
    //             }
    //         }).catch(error => {
    //             console.log('Error while trying to get Data from user');
    //             console.log(error);
    //         })   
    //     } catch (error) {
    //         console.log('Error with Signature Received!!!');
    //         // console.log(error);
    //     }
    // }

    //fetch post - para el back-end
    // Ejemplo implementando el metodo POST:
    async function postData(url = '', account, signature) {
        const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //   credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            // 'Content-Type': 'application/json'
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        //   redirect: 'follow', // manual, *follow, error
        //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: new URLSearchParams({
                'account': account,
                'signature': signature,
            }),
        });
        return response; // parses JSON response into native JavaScript objects
    };
    //end fetch post

    async function login(){
        if(!userData.userName || userData.userName === null || userData.userName === '') return console.log('No input. No sauce for you!');
        //set loggin to show loaders
        updateData('logginIn',true);
        const keyChain = await keychain(window, 'requestSignBuffer', userData.userName, starWars, 'Posting');
        const {data, success, msg, cancel, notActive} = keyChain;
        if(success){ 
            console.log('Message signed!');
            console.log(keyChain);
            //now we verify the msg received
            // verifyMsg(msg,'theghost1980'); for local testing

            //now for testing the server back-end
            postData(`${authEP}checkGatsbySig`, data.username, msg)
            .then(data => {
                console.log(data);
                data.json()
                .then(msg => {
                    console.log(msg);
                    const { profile_PicURL, token} = msg;
                    //set logginIn to false.
                    updateData('logginIn', false);
                    updateData('logged', true);
                    //set profile pic ir any comming from backEnd && no local on MongoDB.
                    updateData('profilePicUrl', profile_PicURL);
                    //set token in dataUser
                    updateData('token',token);
                    //save into localStorage.
                    localStorage.setItem(userData.localItem, token);
                        // save the username to execute auto-login on each reload
                    localStorage.setItem('username', userData.userName);
                    //pass as context
                    // TODO
                    //From this point on, we can check:
                    // - if token present on localStorage.
                    // - ask for a check to see if it is valid sending it as requested var[x-access-token]
                    // - ask for a check on important actions.
                })
            })
            .catch(error => {
                console.log('Error while logging to API.');
                console.log(error);
            });
            //end back-end tests

        }else if(!cancel) {
            if(notActive) {
                alert('Please allow Keychain to access this website');
                updateData('logginIn',false);
            } else {
                updateData('logginIn',false);
                console.log(msg);
                console.log(keyChain);
            }
        }else if (cancel){
            //user cancelled so...
            updateData('logginIn',false);
        }
    };

    return (
        <div className="loginLogicCont">
            {/* {
                userData.logginIn &&
                    <div className="loaderCont">
                        <img src={data.loader.publicURL} className="loaderImgGif" alt="loading amazing info from jobaboard" />
                    </div>
            } */}
            {
                userData.logged &&
                    <img src={userData.profilePicUrl} alt="User Profile ID from jobaboard" />
            }
            <input type="text" onChange={(e) => updateData(e.target.name,e.target.value)} placeholder="username Here" name="userName" />
            <button onClick={login}>Test to sign/decode</button>
            <Link to="/business">Move to Business Page</Link>
        </div>
    )
}

export default Loginlogic;