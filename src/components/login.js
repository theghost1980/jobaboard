import React, { useEffect, useState, useContext } from 'react';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//HOC
// import { AuthContext } from '../components/HOC/authProvider';
//components/wrappers
import onClickOutside from 'react-onclickoutside';
import Loader from './loader';
import { cryptoUtils } from '@hiveio/dhive';
//utils
import { encode } from '../utils/helpers';
//constants
const starWars = process.env.GATSBY_starWars;
const authEP = process.env.GATSBY_authEP;
//end constants



const Login = (props) => {
    //props from parents
    const { cancelOnClick, 
            successfulLogin } = props;
    //end props from parents

    // const { setData } = useContext(AuthContext);

    //state constants
    const [account, setAccount] = useState("");
    const [logginIn, setLogginIn] = useState(false);

    //functions, callbacks
    Login.handleClickOutside = () => {
        // console.log('Clicked out side me');
        cancelOnClick(false);
    };
    ////////Fetching POST request to backend
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
        return response; 
    };
    ////////END Fecthing POST to BE
    ////////async login function
    async function loginUser(){
        const keyChain = await keychain(window, 'requestSignBuffer', account, starWars, 'Posting');
        const {data, success, msg, cancel, notActive} = keyChain;
        if(success){ 
            // console.log('Message signed!');
            // console.log(keyChain);
            //now for testing the server back-end
            const dataUsername = data.username;
            postData(`${authEP}checkGatsbySig`, dataUsername, msg)
            .then(data => {
                console.log(data);
                data.json()
                .then(msg => {
                    console.log(msg);
                    const { profile_PicURL, token, usertype} = msg;
                    //set all upcomming data.
                    const profile = {
                        profilePicUrl:  encode(profile_PicURL),
                        token:  encode(token),
                        logged:  encode(true),
                        logginIn:  encode(false),
                        username:  encode(dataUsername),
                        usertype:  encode(usertype)
                    };
                    const JSONprofile = JSON.stringify(profile);
                    localStorage.setItem("_NoneOfYourBusiness",JSONprofile);
                    successfulLogin();
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

    return (
        <div className="loginCont" id="loginContainer">
                {
                    !logginIn &&
                        <div>
                            <p>Log in Using @hive-keychain</p>
                            <input type="text" id="username" placeholder="@username here please"
                            onChange={(event) => setAccount(event.target.value)}
                            />
                            <button type='submit' id="btnLogin" onClick={loginByClick}>Login</button>
                        </div>
                }
                {
                    logginIn && <Loader logginIn={logginIn} />
                }
        </div>
    )
};

const clickOutsideConfig = {
    handleClickOutside: () => Login.handleClickOutside
};

export default onClickOutside(Login, clickOutsideConfig);