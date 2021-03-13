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
import { encode } from '../utils/helpers';
import { cryptoUtils } from '@hiveio/dhive';
//constants
const starWars = process.env.GATSBY_starWars;
const authEP = process.env.GATSBY_authEP;
//end constants



const Login = (props) => {
    //props from parents
    const { cancelOnClick, 
            successfulLogin } = props;
    //end props from parents

    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            keychainLogo: file(relativePath: {eq: "keychain_logo.png"}) {
                childImageSharp {
                    fixed(width: 200) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhql queries

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
                    const { profile_PicURL, token, usertype, banned} = msg;
                    // TODO -> Important
                    // Get the settings under the > Setting table on MongoDB
                    // btw we need to create that.
                    // it will help us to: - set the chat as the user wants + other future options.
                    //set all upcomming data.
                    const profile = {
                        profilePicUrl:  encode(profile_PicURL),
                        token:  encode(token),
                        logged:  encode(true),
                        logginIn:  encode(false),
                        username:  encode(dataUsername),
                        usertype:  encode(usertype),
                        loginmethod: encode('KCH'),
                        banned: encode(banned),
                    };
                    const JSONprofile = JSON.stringify(profile);
                    localStorage.setItem("_NoneOfYourBusiness",JSONprofile);
                    successfulLogin();
                    if(banned){
                        alert('You have been Banned. Please Contact the admins as you only have some limited features on this platform.!');
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

    return (
        <div className={`loginCont ${logginIn ? 'addAutoW': null}`} id="loginContainer">
                {
                    logginIn && <Loader logginIn={logginIn} />
                }
                {
                    !logginIn &&
                            <div>
                                <h2>Log in Options</h2>
                                <input type="text" id="username" placeholder="@username here please"
                                onChange={(event) => setAccount(event.target.value)}
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