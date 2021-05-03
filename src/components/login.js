import React, { useEffect, useState, useContext } from 'react';
import { useStaticQuery, graphql } from "gatsby"
import Img from 'gatsby-image';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//HOC
// import { AuthContext } from '../components/HOC/authProvider';
//components/wrappers
import onClickOutside from 'react-onclickoutside';
import LoginHS from './hivesigner/loginHS';
import Loader from './loader';
//utils
import { encode, check } from '../utils/helpers';
import { cryptoUtils } from '@hiveio/dhive';

//testing react/redux
import { useDispatch } from 'react-redux';
import { setValueOnProfile } from '../features/userprofile/profileSlice';
// end testing 

// import { getDataBeeChat } from './BeeChat/beechatchecker';
//constants
const starWars = process.env.GATSBY_starWars;
const authEP = process.env.GATSBY_authEP;
const beechatEP = "https://beechat.hive-engine.com/api/";
//end constants



const Login = (props) => {
    //testing react/redux
    const dispatch = useDispatch();
    // end testing

    const userdata = check();
    //props from parents
    const { cancelOnClick, 
            successfulLogin,
        } = props;
    //end props from parents

    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            keychainLogo: file(relativePath: {eq: "keychain_logo.png"}) {
                childImageSharp {
                    fixed(width: 200) {
                        # ...GatsbyImageSharpFixed_withWebp
                        ...GatsbyImageSharpFixed_withWebp_noBase64
                    }
                }
            }
        }
    `);
    //end grapqhql queries

    // useEffect(() => {
    //     return function cleanup() {
    //         console.log('Clean Up from login.js component!!!!');
    //     };
    // },[])

    // const { setData } = useContext(AuthContext);

    //state constants
    const [account, setAccount] = useState("");
    const [logginIn, setLogginIn] = useState(false);

    //functions, callbacks
    Login.handleClickOutside = () => {
        if(!userdata.logged){
            // console.log('Clicked out side me');
            cancelOnClick(false);
        }
    };

    // log in into Beechat
    function logInBeeChat(timestamp,msg){
        // testing on beechat here as soon as the user is logged in
        const urlGet = beechatEP + "users/login?" + `username=${account}&ts=${timestamp}&sig=${msg}`;
        getData(urlGet)
        .then(result => {
            console.log('Results from BeeChat API if logged succesfully:');
            console.log(result);
            // from here we may send all this data to
            // token & refresh_tokens to localstorage (later on to cookies)
            if(result.token && result.refresh_token){
                localStorage.setItem('_GOfUb_T', result.token);
                localStorage.setItem('_GOfUb_RT',result.refresh_token);
                console.log('Tokens received from Bee, stored in LS.');
            };
        })
        .catch(error => {
            console.log('Error fetching on API BeeChat');
            console.log(error);
        })
        //end testing beeChat
    }
    // end log in in
    // fecthing GET on BEECHAT
    async function getData(url = '') {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache', 
        });
        return response.json(); 
    };
    // async function getDataWT(url = '',_token) {
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
    // ///////////
    ////////Fetching request to backend
    async function postData(url = '', account, signature, ts) {
        const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //   credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            // 'Content-Type': 'application/json'
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'ts': ts,
        },
        //   redirect: 'follow', // manual, *follow, error
        //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: new URLSearchParams({
                'account': account,
                'signature': signature,
            }),
        });
        return response; 
    };
    ////////END Fecthing POST to BE
    ////////async login function
    async function loginUser(){
        const timestamp = Date.now();
        const ts = account + timestamp; 
        // -----------testing to modify
        //old way without ts
        // const keyChain = await keychain(window, 'requestSignBuffer', account, starWars, 'Posting');
        // end old way
        // new way using ts
        const keyChain = await keychain(window, 'requestSignBuffer', account, ts, 'Posting');
        // end new way
        // ------------end testing
        const {data, success, msg, cancel, notActive} = keyChain;
        console.log(data);
        if(success){ 
            const dataUsername = data.username;
            postData(`${authEP}checkGatsbySig`, dataUsername, msg, ts)
            .then(data => {
                console.log(data);
                data.json()
                .then(response => {
                    console.log(response);
                    const { profile_PicURL, token, usertype, banned} = response;
                    //testing to log into beechat after user was logged into JAB
                    // logInBeeChat(timestamp,msg);
                    // end testing

                    // TODO -> Important
                    // Get the settings under the > Setting table on MongoDB
                    // btw we need to create that.
                    // it will help us to: - set the chat as the user wants + other future options.
                    //set all upcomming data.

                    //testing react redux store
                    dispatch(setValueOnProfile({ type: "username", value: dataUsername}));
                    dispatch(setValueOnProfile({ type: "logged", value: true}));
                    dispatch(setValueOnProfile({ type: "usertype", value: usertype}));
                    dispatch(setValueOnProfile({ type: "token", value: token}));
                    // end testing redux

                    const profile = {
                        profilePicUrl:  encode(profile_PicURL),
                        token:  encode(token),
                        logged:  encode(true),
                        logginIn:  encode(false),
                        username:  encode(dataUsername),
                        usertype:  encode(usertype),
                        loginmethod: encode('KCH'),
                        banned: encode(banned),
                        newmessages: encode("x1-f"),
                        authbee: encode(false),
                    };
                    const JSONprofile = JSON.stringify(profile);
                    localStorage.setItem("_NoneOfYourBusiness",JSONprofile);
                    successfulLogin(account,timestamp,msg);
                    if(banned){
                        alert('You have been Banned. Please Contact the admins as you only have some limited features on Job A Board.!');
                    }
                    // setData();
                    //From this point on, we can check:
                    // - if token present on localStorage.
                    // - ask for a check to see if it is valid sending it as requested var[x-access-token]
                    // - ask for a check on important actions.
                })
            })
            .catch(error => {
                console.log('Error while logging to API.');
                console.log(error);
                setLogginIn(false);
            });
            //end back-end
        }else if(!cancel) {
            if(notActive) {
                alert('Please allow Keychain to access this website');
                setLogginIn(false);
            } else {
                setLogginIn(false);
                console.log(msg);
                console.log(keyChain);
            }
        }else if (cancel){
            //user cancelled so...
            setLogginIn(false);
        }
    };
    ////////end asyn login function
    const loginByClick = () => {
        //validation
        if(!account || account === null || account === '') return console.log('No input. No sauce for you!');
        //call async login function
        setLogginIn(true);
        loginUser();
    };

    const actionByEnter = (event) => {
        if(event.key === 'Enter' || event.keyCode === 13){
            if(account){
                setLogginIn(true);
                loginUser();
            }
        }
    }

    return (
        <div className={`loginCont ${logginIn ? 'addAutoW': null }`} id="loginContainer">
                {
                    logginIn && <Loader logginIn={logginIn} />
                }
                {
                    !logginIn &&
                            <div>
                                <h2>Log in Options</h2>
                                <input type="text" id="username" placeholder="@username here please"
                                    onChange={(event) => setAccount(event.target.value)}
                                    onKeyDown={actionByEnter}
                                />
                                <div id="btnLogin" onClick={loginByClick}>
                                    <Img fixed={data.keychainLogo.childImageSharp.fixed} className="keyChainImg" />
                                </div>
                            </div>
                }
                {
                    !logginIn && <LoginHS username={account} />
                }
        </div>
    )
};

const clickOutsideConfig = {
    handleClickOutside: () => Login.handleClickOutside
};

export default onClickOutside(Login, clickOutsideConfig);