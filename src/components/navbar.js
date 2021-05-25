import React, { useState, useEffect } from 'react';
//testing to get context from socketbee
import { Socket } from './BeeChat/socketBee';
import { useStaticQuery, graphql, Link, navigate } from "gatsby"
//components
import Img from 'gatsby-image';
import Login from './login';
import Absscreenwrapper from './absscreenwrapper';
import Coinprices from './coinsprices';
//context - HOC
// import { AuthContext } from '../components/HOC/authProvider';
//helpers
import { check, fecthDataRequest, encode, decode, setStoredField, getStoredField, sendPayloadSocket, initSocket, logOutBee, } from '../utils/helpers';
import UserMenu from './User/usermenu';

//testing react/redux
import { useDispatch, useSelector } from 'react-redux';
// import { setNewMessages } from '../features/notifications/notiSlice';
// import { selectProfile } from '../features/userprofile/profileSlice';
import { isKeychainInstalled, keychain } from '@hiveio/keychain';
import { setStored } from '../features/socket/socketSlice';
import { setValueOnProfile, selectProfile } from '../features/userprofile/profileSlice';
import { isBrowser } from '../utils/logger';
import Navbartop from './NavBarSub/navbartop';
// end testing 

//hivesigner SDK + init
var hivesigner = require('hivesigner');

// //socket test
// var socket;

//constants
const secret = process.env.GATSBY_SECRET;
const callbackURL = process.env.GATSBY_callbackURL;
const beechatEP = process.env.GATSBY_beeChatEP;
const devMode = true;
// const beechatEP = "https://beechat.hive-engine.com/api/";
const epsBee = [
    { ep: "messages/conversations",lsItem: "oldmessages"},
    { ep: "users/friends",lsItem: "friendlist"},
    { ep: "users/settings",lsItem: "settings"},
    { ep: "users/channels",lsItem: "channels"},
]
//end constants

/**
 * This component the navBar.
 * It will self detect the current width/scroll events to:
 * 1. Set itself to mobile like menu
 * 2. Render the usermenu.js as fixed on top.
 * @param {Boolean} devMode - optional to debug events on console.
 */

const Navbar = (props) => {
    const { fireReadLS, devMode } = props;
    const userdata = check();

    // TODO move this as a nice annoying message on bellow the logo as warning
    // + limit features adding the banned param inside the private routers
    if(userdata.banned === true){
        alert('You have been Banned. Please Contact the admins as you only have some limited features on this platform.!\nTODO: Show this more nicely in a component bellow logo.');
    }

    // testing profile redux here
    const _profile = useSelector(selectProfile);
    console.log('Value read on navigating_on:',_profile.navigating_on);
    // end testing

    // console.log(userdata);
    //state constants/vars
    const [showLogin, setShowLogin] = useState(false);
    const [menuUserClicked, setMenuUserClicked] = useState(false);
    //for context on get beeChat data
    // const [newMessages, setNewMessages] = useState(false);
    // const [socket, setSocket] = useState(null);

    // //testing react/redux
    const dispatch = useDispatch();
    // // end testing

    const [pathName, setPathName] = useState(
        global.window ? window.location.pathname : "notReady"
    );
    if(devMode){ console.log('Actual pathname:', pathName) };
    const [mobile, setMobile] = useState(false);
    function checkWidth(){
        const _screenWidth = window.innerWidth;
        if(devMode) { console.log('Resize Width Event _screenWidth:', _screenWidth) };
        setMobile(_screenWidth <= 1053 ? true : false );
    }
    useEffect(() => {
        checkWidth();
        window.addEventListener('resize',checkWidth);
        return () => { window.removeEventListener('resize', checkWidth);}
    }, []);
    useEffect(() => {
        if(devMode){ console.log('Mobile set as:', mobile)};
    }, [mobile]);
    //end state constants/vars

    // functions on this component
    const logUserOut = () => {
        logOutBee(); //log out from bee API
        
        if(userdata.loginmethod === "KCH"){
            localStorage.clear();
            navigate("/");
            console.log('User Logged OUT!');
        }else if(userdata.loginmethod === "HS"){
            const client = new hivesigner.Client({
                app: 'jobaboard',
                callbackURL: callbackURL,
                scope: ['vote', 'comment'],
                accessToken: userdata.access_token,
            });
            client.revokeToken(function (err, res) {
                console.log(err, res);
                if(err) return console.log(`Error trying to log HS user Out, err:${err}`);
                localStorage.clear();
                navigate("/");
                console.log('User Logged OUT!');
            });
        }else{
            //fatal error, no loginmethod assigned, something happend
            return console.log('No method finded. Call the crypto-police!!!');
        }
    }
    // end functions on this component

    //Special functions to/from children
    const cancelLogin = (value) => {
        console.log('Cancelled login by user.');
        setShowLogin(value);
    };
    const successLogin = (account,timestamp,msg) => {
        if(devMode){ console.log(`User Logged In!. user:${account}, ts:${timestamp}, msg:${msg}`); };
        setShowLogin(false);
        getDataBeeChat(account,timestamp,msg) //check here for newmessages on beeChat.
        navigate("/app/profile"); //this one could be taking the user to dashboard or any other page
    };
    
    function getDataBeeChat(account,timestamp,msg){ //first we must log in
        const urlGet = beechatEP + "users/login?" + `username=${account}&ts=${timestamp}&sig=${msg}`;
        fecthDataRequest(urlGet,null)
        .then(response => {
            localStorage.setItem("bToken", response.token);
            localStorage.setItem("brToken", response.refresh_token);
            setStoredField("bt",response.token);
            setStoredField("brt",response.refresh_token);
            setStoredField("currentchatid","xxx");
            setStoredField("ts",timestamp);
            setStoredField("msg",msg);
            if(devMode){ console.log('Tokens received from Bee, stored in LS into profile object encoded.') };
        }).catch(error => console.log('Error fetching on API BeeChat',error));
    }
    // end BeeChat
    //END Special functions to/from children

    async function getDataWT(url = '',_token) {
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
    async function getData(url = '') {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache', 
        });
        return response.json(); 
    };

    // const newmessages = getStoredField("newmessages");
    // console.log(`newmessages actual value:${newmessages}`);

    //functions/CB
    //testing to add navigating_on into redux on each user clicked on Menu
    const navigateToApp = (goingTo) => {
        if(devMode){ console.log('User wants to go to:',goingTo) };
        //TODO save into redux ??? maybe not needed.
        dispatch(setValueOnProfile({ type: "navigating_on", value: goingTo}));
    }
    //END testing to add navigating_on into redux on each user clicked on Menu
    const cbShowLogin = () => {
        setShowLogin(!showLogin);
    }
    //END functions/CB

    return (
            <nav>
                <Navbartop 
                    logUserOut={logUserOut} 
                    pathName={pathName} 
                    userdata={userdata} 
                    mobile={mobile} 
                    devMode={true} 
                    cbShowLogin={cbShowLogin} 
                    logginIn={showLogin}    
                />
                {
                    userdata.logged && <UserMenu />
                }
                {
                    showLogin 
                    && 
                    <Absscreenwrapper xtraClass={"justifyFlexCenter"}>
                        <Login 
                            cancelOnClick={cancelLogin} 
                            successfulLogin={successLogin}
                        />
                    </Absscreenwrapper>
                }
            </nav>
    )
}

export default Navbar;