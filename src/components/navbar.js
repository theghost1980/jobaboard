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
import { 
    check, 
    fecthDataRequest, 
    encode, 
    decode, 
    setStoredField, 
    getStoredField,
    sendPayloadSocket,
    initSocket,
    logOutBee,
     } from '../utils/helpers';
import UserMenu from './User/usermenu';

//testing react/redux
import { useDispatch, useSelector } from 'react-redux';
// import { setNewMessages } from '../features/notifications/notiSlice';
// import { selectProfile } from '../features/userprofile/profileSlice';
import { isKeychainInstalled, keychain } from '@hiveio/keychain';
import { setStored } from '../features/socket/socketSlice';
import { setValueOnProfile, selectProfile } from '../features/userprofile/profileSlice';
import { isBrowser } from '../utils/logger';
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

const Navbar = (props) => {
    const { fireReadLS } = props;
    //graphql queries
    const data = useStaticQuery(graphql`
    query {
        # append_menu: allMongodbGatsbyCategory {
        #     edges {
        #         node {
        #             id
        #             image
        #             sub
        #             query
        #             name
        #             subtitle
        #             title
        #         }
        #     }
        # }
        append_menu: allMongodbGatsbyCategories(sort: {fields: name}) {
          edges {
              node {
                  active
                  id
                  thumb
                  image
                  name
                  query
                  sub_category
                  subtitle
                  title
              }
          }
        }
        main_menu: allMongodbGatsbyMainMenus(sort: {fields: order, order: ASC}) {
            edges {
                node {
                    id
                    inner_link
                    title
                    link
                    hideOnLoggin
                    order
                }
            }
        }
        user_menu: allMongodbGatsbyMenuUser {
            edges {
                node {
                    id
                    inner_link
                    title
                }
            }
        }
        logoColor: file(relativePath: {eq: "logoColor.png"}) {
            childImageSharp {
                fluid {
                    ...GatsbyImageSharpFluid_withWebp
                }
            }
        }
        searchIcon: file(relativePath: {eq: "search.png"}) {
            childImageSharp {
                fixed(width: 30) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        } 
        menuIconBlack: file(relativePath: {eq: "menu_black.png"}) {
            childImageSharp {
                fixed(width: 40) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        }
        menuIconOrange: file(relativePath: {eq: "menu_orange.png"}) {
            childImageSharp {
                fixed(width: 40) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        }
    }
    `);
    //end grapqhql queries

    //data comming from context.
    //TODO
    // const { state: userdata, setData }  = useContext(AuthContext);
    const userdata = check();
    
    // end to load on changes
    // for testing we will call navbar without login.
    // useEffect(() => {
    //     loginBee();
    // },[]);
    // async function loginBee(){
    //     if(isKeychainInstalled){
    //         const userdata = { username: 'theghost1980'};
    //         const timestamp = Date.now();
    //         const ts = userdata.username + timestamp; 
    //         await window.hive_keychain.requestSignBuffer(userdata.username, ts, "Posting", function(result){
    //             const { message, success, error } = result;
    //             console.log(result);
    //             if(success){
    //                 const sig = result.result;
    //                 const urlGet = beechatEP + "users/login?" + `username=${userdata.username}&ts=${timestamp}&sig=${sig}`;
    //                 fecthDataRequest(urlGet, null)
    //                 .then(response => {
    //                     console.log(response);
    //                     const actualToken = response.token;
    //                     setStoredField("bt",response.token);
    //                     setStoredField("brt",response.refresh_token);
    //                     setStoredField("currentchatid","xxx");
    //                     setStoredField("ts",timestamp);
    //                     setStoredField("msg",sig);
    //                     initSocket();
    //                     fecthDataRequest(beechatEP + "messages/new",actualToken)
    //                     .then(response => {
    //                         if(response.length > 0){
    //                             setStoredField("newmessages","true");
    //                             // TODO how????
    //                             // dispatch(setNewMessages(true));
    //                         }else{
    //                             setStoredField("newmessages","false");
    //                             // TODO how????
    //                             // dispatch(setNewMessages(true));
    //                         }
    //                     }).catch(error => console.log('Error fetching NM on API BeeChat',error));
    //                 }).catch(error => console.log('Error fetching on API BeeChat',error));
    //             }else if (error){
    //                 // TODO handle error
    //             };
    //         });
    //     }
    // }
    // if(!userdata.authbee){
    //     //try a new login and sig using hiveKeyChain. for now, later on we must ask to the people of peakd to see how they do this.
    //     if(isKeychainInstalled){
    //         reLoginBee(userdata);
    //     }
    // }

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
    console.log('Actual pathname:', pathName);
    const [mobile, setMobile] = useState(false);
    function checkWidth(){
        const _screenWidth = window.innerWidth;
        if(devMode) { console.log('Resize Width Event _screenWidth:', _screenWidth) };
        setMobile(_screenWidth <= 980 ? true : false );
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

    // useEffect(() => {
    //     const unreadData = JSON.stringify(localStorage.getItem("unread"));
    //     if(unreadData !== null && unreadData !== ""){
    //         setNewMessages(true);
    //     }
    //     // return function cleanup() {
    //     //     console.log('Clean Up from navBar.js component!!!!');
    //     // };
    // },[]);

    //testing handling just one state here and passing it as props to login component
    // const [userdata, setUserdata] = useState({
    //     username: '', //hive account @username
    //     profilePicUrl: '',
    //     usertype: '',
    //     logginIn: false,
    //     logged: false,
    //     token: null,
    // });
    //end test

    // functions on this component
    const logUserOut = () => {
        // updateDataParent('logged',false);
        // setData();
        //check what type of log has been used
        // setNewMessages(false);

        //log out from bee API
        logOutBee();
        
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
        console.log('User Logged In!');
        console.log(`user:${account}, ts:${timestamp}, msg:${msg}`);
        setShowLogin(false);
        //check here for newmessages on beeChat.
        getDataBeeChat(account,timestamp,msg)
        //this one could be taking the user to dashboard or any other page
        navigate("/app/profile");
    };
    // const sucessDataBee = () => {
    //     console.log('SET new messages as true!');
    //     setNewMessages(true);
    // }

    // BeeChat fetching + socket init + wss auth
    //testing to auth once the socket it is been set
    // const mount = () => {
    //     console.log('mounted')
    //     const beeTokens = {
    //         token: localStorage.getItem('_GOfUb_T'),
    //         refresh_token: localStorage.getItem('_GOfUb_RT'),
    //     }
    //     if(socket && beeTokens.token !== null && beeTokens.token !== ""){
    //         console.log('Socket Set, also tokens set!!!!');
    //         console.log(`I was set and my readyState is:${socket.readyState}`);
    //         //now we auth
    //         sendPayloadSocket({
    //             "type": "authenticate",
    //             "payload": {
    //                 "token": `${beeTokens.token}`
    //             }
    //         });
    //     }else{
    //         console.log('Error on socket || on beeTokens object!');
    //         console.log('socket:',socket);
    //         console.log('beeTokens');
    //         console.log(beeTokens);
    //     }
        
    //     const unmount = () => {
    //         console.log('unmounted')
    //         // ...
    //     }
    //     return unmount
    // }
    // useEffect(mount, [socket]);
    // useEffect(() => {
    //     const beeTokens = {
    //         token: localStorage.getItem('_GOfUb_T'),
    //         refresh_token: localStorage.getItem('_GOfUb_RT'),
    //     }
    //     if(socket && beeTokens.token !== null && beeTokens.token !== ""){
    //         console.log('Socket Set, also tokens set!!!!');
    //         console.log(`I was set and my readyState is:${socket.readyState}`);
    //         //now we auth
    //         sendPayloadSocket({
    //             "type": "authenticate",
    //             "payload": {
    //                 "token": `${beeTokens.token}`
    //             }
    //         });
    //     }else{
    //         console.log('Error on socket || on beeTokens object!');
    //         console.log('socket:',socket);
    //         console.log('beeTokens');
    //         console.log(beeTokens);
    //     }
    // },[socket]);
    
    function getDataBeeChat(account,timestamp,msg){
        //first we must log in
        const urlGet = beechatEP + "users/login?" + `username=${account}&ts=${timestamp}&sig=${msg}`;
        fecthDataRequest(urlGet,null)
        .then(response => {
            localStorage.setItem("bToken", response.token);
            localStorage.setItem("brToken", response.refresh_token);
            // console.log('Results from BeeChat API if logged succesfully:');
            // console.log(response);
            // const actualToken = response.token;
            //set inside user data as localStorage.setItem("_NoneOfYourBusiness",JSONprofile);
            // TODO a possible try/catch if needed
            setStoredField("bt",response.token);
            setStoredField("brt",response.refresh_token);
            setStoredField("currentchatid","xxx");
            //set also the ts + msg to try log in bee API later on
            setStoredField("ts",timestamp);
            setStoredField("msg",msg);

            // const parsedProfile = JSON.parse(localStorage.getItem("_NoneOfYourBusiness"));
            // parsedProfile.bt = encode(response.token);
            // parsedProfile.brt = encode(response.refresh_token);
            // console.log('Showing profile object encoded with new bt & brt');
            // console.log(parsedProfile);
            // localStorage.setItem("_NoneOfYourBusiness",JSON.stringify(parsedProfile));
            // localStorage.setItem('_GOfUb_T', response.token);
            // localStorage.setItem('_GOfUb_RT',response.refresh_token);
            console.log('Tokens received from Bee, stored in LS into profile object encoded.');
            // fire the reading on socketBee
            //init/set the socket
            // setSocket(initSocket());

            // initSocket();
            

            // fecthDataRequest(beechatEP + "messages/new",actualToken)
            // .then(response => {
            //     console.log('Results from unread:');
            //     console.log(response);
            //     // localStorage.setItem("unread",JSON.stringify(response)); // save into LS 
            //     if(response.length > 0){
            //         // setNewMessages(true);
            //         setStoredField("newmessages","true");
            //         //using react/redux now.
            //         dispatch(setNewMessages(true));
            //     }else{
            //         setStoredField("newmessages","false");
            //         //using react/redux now.
            //         dispatch(setNewMessages(false));
            //     }
            //     console.log(`Actual value on newmessages:${getStoredField("newmessages")}`);
            // }).catch(error => console.log('Error fetching NM on API BeeChat',error));

        }).catch(error => console.log('Error fetching on API BeeChat',error));

        // getData(urlGet)
        // .then(result => {
        //     console.log('Results from BeeChat API if logged succesfully:');
        //     console.log(result);
        //     // from here we may send all this data to
        //     // token & refresh_tokens to localstorage (later on to cookies)
        //     if(result.token && result.refresh_token){
        //         localStorage.setItem('_GOfUb_T', result.token);
        //         localStorage.setItem('_GOfUb_RT',result.refresh_token);
        //         console.log('Tokens received from Bee, stored in LS.');
        //         //get data
        //         //ask for all data the first time now
        //         // no need to refresh just open socket here + get all data into LS and wait.

        //         console.log('Refreshing Token......');
        //         const urlRT = beechatEP + "users/refresh-token";
        //         getDataWT(urlRT, result.refresh_token)
        //         .then(response => {
        //             console.log(response);
        //             if(response.token){
        //                 // for now get unread and apply state of anynew HERE
        //                 const actualToken = response.token;
        //                 getDataWT(beechatEP + "messages/new",actualToken)
        //                 .then(response => {
        //                     console.log('Results from unread:');
        //                     console.log(response);
        //                     localStorage.setItem("unread",JSON.stringify(response)); // save into LS 
        //                     if(response.length > 0){
        //                         setNewMessages(true);
        //                         console.log('Setting MOFO to true!');
        //                         //ask the rest of data here & now.
        //                         epsBee.forEach(epData => {
        //                             getDataWT(beechatEP + epData.ep,actualToken)
        //                             .then(response => {
        //                                 console.log(`Results from: ${epData.ep}`);
        //                                 console.log(response);
        //                                 localStorage.setItem(epData.lsItem,JSON.stringify(response));
        //                             }).catch(error => console.log(`Error getting ${epData.lsItem}`,error));
        //                         })
        //                     }
        //                 })
        //                 // TODO get all the data here as the first time
        //                 // so user do not have to wait until timer executes.
        //                 // getOld(response.token);
        //                 // getFL(response.token);
        //                 // getFR(response.token);
        //                 // getSettings(response.token);
        //                 // getChannels(response.token);
        //             }
        //         })
        //         .catch(err => {
        //             console.log('Error trying to refresh the token');
        //             console.log(err);
        //         })
        //     };
        // })
        // .catch(error => {
        //     console.log('Error fetching on API BeeChat');
        //     console.log(error);
        // })
    }
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
    // end BeeChat

    // TODO
    //add event to detect if user scroll down to fixed on top the first part of nav bar
    // and

    //handle user's State / userData
    // const updateDataParent = (name,value) => {
    //     setUserdata(prevState => {
    //         return {...prevState, [name]: value}
    //     });
    // };
    //END special functions to/from children

    /////////////////////////
    //functions/callbacks to run on init/mounted
    // const mount = () => {
    //     console.log('mounted');
    //     //check if logged
    //     if(!userdata.logged){
    //         checkData();
    //     }
    //     // ...end mount components
        
    //     const unmount = () => {
    //         console.log('unmounted')
    //         // ...
    //     }
    //     return unmount
    // };
    // useEffect(mount, []);
    //end f/c on init/mounted
    /////////////////////////

    //functions, callbacks
    /////check browser data if good token(valid) take data else force auto-login
    // function checkData(){
    //     // localStorage.setItem(userdata.localItem, token);
    //     // localStorage.setItem('username', data.username);
    //     // localStorage.setItem('profilepic', profile_PicURL);
    //     let jwt = require('jsonwebtoken');
    //     const token = localStorage.getItem(userdata.localItem);
    //     const profilePic = localStorage.getItem('profilepic');
    //     const username = localStorage.getItem('username');
    //     ///let's just verify the token by using the jwt methods.
    //     if(!token || !username){
    //         //do nothing maybe later on we could > user_settings > auto-login: enable/disabled by user
    //         // so depending on that we force auto-login
    //         console.log('Token or username not present on localstorage');
    //     }else{
    //         jwt.verify(token, secret, function(err, decoded){
    //             if(err){
    //                 //force auto-login
    //                 console.log('Error while verifying token');
    //                 logUserOut();
    //                 // window.location.reload();
    //             }
    //             if(!decoded){
    //                 //force auto-login
    //                 console.log('Invalid Token');
    //                 logUserOut();
    //                 // window.location.reload();
    //             }
    //             //still valid token
    //             updateDataParent('logged',true);
    //             updateDataParent('username',username);
    //             updateDataParent('profilePicUrl', profilePic);
    //             updateDataParent('token',token);
    //             updateDataParent('logginIn', false);
    //             return console.log('Still valid, use the data on localstorage.');
    //         });
    //     }
    // };
    //END functions/callbacks to run on init/mounted
    /////////////////////////

    // const newmessages = getStoredField("newmessages");
    // console.log(`newmessages actual value:${newmessages}`);

    //functions/CB
    //testing to add navigating_on into redux on each user clicked on Menu
    const navigateToApp = (goingTo) => {
        console.log('User wants to go to:',goingTo);
        //TODO save into redux
        dispatch(setValueOnProfile({ type: "navigating_on", value: goingTo}));
      }
      //END testing to add navigating_on into redux on each user clicked on Menu
      //END functions/CB

    return (
            <nav>
                {
                    (pathName !== "/nftmarket" && pathName !== "/app/profile" && pathName !== "/checkout") 
                    &&
                    <div className={'menuBottomNav'}>
                        <ul className="menuBottomNavUl">
                            {
                            data.append_menu.edges.map(({ node: itemM}) => {
                                return (
                                    itemM.active ?
                                    <li key={`${itemM.id}-${itemM.query}`} className="ulParent">
                                        <div key={`${itemM.id}-ULDIV`}>{itemM.name}</div>
                                        <ul className="subMenuCatUL" key={`${itemM.id}-ULJAB`}>
                                        {
                                            itemM.sub_category.map(subItem => {
                                            return (
                                                <li key={`${itemM.id}-${subItem}`} className="normalTextSmall">
                                                    <Link onClick={() => navigateToApp("explore")} to={`/explore?category=${itemM.name}|sub_category=${subItem}`} className="subCatLink">
                                                        {subItem}
                                                    </Link>
                                                </li>
                                            )
                                            })
                                        }
                                        </ul>
                                    </li>
                                    : null
                                )
                            })
                            }
                        </ul>
                    </div>
                }

                <div className="navbarRow">
                    <Link onClick={() => navigateToApp("home")} to="/">
                        <div className="logoSVGCont">
                            {/* <img src={data.logoColor.publicURL} className="logoSVG" /> */}
                            <Img fluid={data.logoColor.childImageSharp.fluid} className="logoSVG" loading="eager" />
                        </div>
                    </Link>
                    <ul id="mainMenu" className="justPaddingRight20p">
                    {
                        data.main_menu.edges.map(({ node: menuItem }) => {
                        return (
                            <li key={`${menuItem.id}`} className={`${(menuItem.hideOnLoggin && userdata.logged) ? 'hideOnLoggin': null}`}>
                            {
                                menuItem.link ?
                                <Link onClick={() => navigateToApp(menuItem.title)} to={`${menuItem.inner_link}`}>{menuItem.title}</Link>
                                : (userdata.logged)  ? 
                                                <div className="profilePicCont" onClick={() => setMenuUserClicked(!menuUserClicked)}> 
                                                <img src={userdata.profilePicUrl} className="profilePic" alt="user jobaboard crypto job board" />
                                                {
                                                menuUserClicked &&
                                                    <ul className={`userMenu ${menuUserClicked ? 'showUserMenu' : null}`}>
                                                    {
                                                        data.user_menu.edges.map(({ node: usermenu }) => {
                                                        return (
                                                            <li key={`${usermenu.id}`}>
                                                                <Link to={`${usermenu.inner_link}`}
                                                                    onClick={() => navigateToApp(usermenu.title)}
                                                                >
                                                                {usermenu.title}
                                                                </Link>
                                                            </li>
                                                        )
                                                        })
                                                    }
                                                    {
                                                        userdata.usertype === "admin" ? <li key="adminPanelOnly-1">
                                                                                            <Link to="/app/adminpanel" className="adminPanelLink">Admin Panel</Link>
                                                                                        </li> 
                                                                                        : null
                                                    }
                                                    <li key="userMenuBtnLogOut-1">
                                                        <button onClick={logUserOut}>Log Out</button>
                                                    </li>
                                                    </ul>
                                                }
                                                {/* {
                                                menuUserClicked &&
                                                    <ul className={`userMenu ${menuUserClicked ? 'showUserMenu' : null}`}>
                                                    {
                                                        data.user_menu.edges.map(({ node: usermenu }) => {
                                                        return (
                                                            <li key={usermenu.id}>{usermenu.title}</li>
                                                        )
                                                        })
                                                    }
                                                    <li key="userMenuBtnLogOut-1">
                                                        <button onClick={logIn}>Log Out</button>
                                                    </li>
                                                    </ul>
                                                } */}
                                            </div>
                                            : <button onClick={() => setShowLogin(!showLogin)}>{menuItem.title}</button>
                            }
                            </li>
                        )
                        })
                    }
                    </ul>
                    <div>
                        <Coinprices devMode={true}
                            show={pathName === "/nftmarket"}
                        />
                    </div>
                </div>
                {/* Testing to have socketBee wrapping the usermenu */}
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