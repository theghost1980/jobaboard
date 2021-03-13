import React, { useState, useContext } from 'react';
import { useStaticQuery, graphql, Link, navigate } from "gatsby"
//components
import Img from 'gatsby-image';
import Login from './login';
import Absscreenwrapper from './absscreenwrapper';
import Coinprices from './coinsprices';
//context - HOC
// import { AuthContext } from '../components/HOC/authProvider';
//helpers
import { check } from '../utils/helpers';
import UserMenu from './User/usermenu';
//hivesigner SDK + init
var hivesigner = require('hivesigner');

//constants
const secret = process.env.GATSBY_SECRET;
const callbackURL = process.env.GATSBY_callbackURL;
//end constants

const Navbar = () => {
    //graphql queries
    const data = useStaticQuery(graphql`
    query {
        append_menu: allMongodbGatsbyCategory {
            edges {
                node {
                    id
                    image
                    sub
                    query
                    name
                    subtitle
                    title
                }
            }
        }
        main_menu: allMongodbGatsbyMainMenu {
            edges {
                node {
                    id
                    inner_link
                    title
                    link
                    hideOnLoggin
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
    }
    `);
    //end grapqhql queries

    //data comming from context.
    //TODO
    // const { state: userdata, setData }  = useContext(AuthContext);
    const userdata = check();

    // TODO move this as a nice annoying message on bellow the logo as warning
    // + limit features adding the banned param inside the private routers
    if(userdata.banned === true){
        alert('You have been Banned. Please Contact the admins as you only have some limited features on this platform.!\nTODO: Show this more nicely in a component bellow logo.');
    }

    // console.log(userdata);
    //state constants/vars
    const [showLogin, setShowLogin] = useState(false);
    const [menuUserClicked, setMenuUserClicked] = useState(false);
    //end state constants/vars

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
    const successLogin = () => {
        console.log('User Logged In!');
        setShowLogin(false);
        //this one could be taking the user to dashboard or any other page
        navigate("/app/profile");
    };

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

    return (
            <nav>

<div className={`menuBottomNav`}>
                    <ul className="menuBottomNavUl">
                        {
                        data.append_menu.edges.map(({ node: itemM}) => {
                            return (
                            <li key={itemM.id} className="ulParent">
                                <div>{itemM.name}</div>
                                <ul className="subMenuCatUL">
                                {
                                    itemM.sub.map(subItem => {
                                    return (
                                        <li key={`${itemM.id}-${subItem}`}>
                                            <Link to={`/explore?subcat=${subItem}`} className="subCatLink">
                                                {subItem}
                                            </Link>
                                        </li>
                                    )
                                    })
                                }
                                </ul>
                            </li>
                            )
                        })
                        }
                    </ul>
                </div>

                <div className="navbarRow">
                    <Link to="/">
                        <div className="logoSVGCont">
                            {/* <img src={data.logoColor.publicURL} className="logoSVG" /> */}
                            <Img fluid={data.logoColor.childImageSharp.fluid} className="logoSVG" loading="eager" />
                        </div>
                    </Link>
                    <ul id="mainMenu">
                    {
                        data.main_menu.edges.map(({ node: menuItem }) => {
                        return (
                            <li key={`${menuItem.id}`} className={`${(menuItem.hideOnLoggin && userdata.logged) ? 'hideOnLoggin': null}`}>
                            {
                                menuItem.link ?
                                <Link to={`${menuItem.inner_link}`}>{menuItem.title}</Link>
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
                        <Coinprices />
                        {/* TODO: must a component apart */}
                        <div className="searchContainer">
                            <input type="text" className="searchInput" placeholder="find your next job" />
                            <Img fixed={data.searchIcon.childImageSharp.fixed} className="imgSearch" />
                        </div>
                    </div>
                </div>
                
                {
                    userdata.logged && <UserMenu />
                }
                {
                    showLogin 
                    && 
                    <Absscreenwrapper>
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