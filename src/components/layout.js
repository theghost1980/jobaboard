import React, { useState , useEffect } from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from 'gatsby-image';

//for login process + handling data hive user
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//dhive data handling
const { Client } = require("@hiveio/dhive");
//hivesigner
//info: callback uri: http://localhost:8000/logged
//testing a new uri /logged
//load hivesigner
// var hivesigner = require('hivesigner');

// var clientHS = new hivesigner.Client({
//   app: 'jobaboard',
//   callbackURL: '/logged',
//   scope: ['vote', 'comment'],
//   redirect_uris: ['/logged'],
// });
// clientHS.login({
//   account: `theghost1980`,
// });
//end loading hivesigner

const Layout = ({ children }) => {
  //state constants/vars
  const [logged, setLogged] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [account, setAccount] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [menuUserClicked, setMenuUserClicked] = useState(false);
  //end state constants/vars
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
    }
  `);
  //end grapqhql queries
  console.log(data.logoColor);

  // first things first we check if has used keychain to force auto-login.
  useEffect(() => {
     async function firstCheck(){
      if(hasKeychainBeenUsed && !logged){
        // console.log('Running from firstCheck');
        //then make auto-login
        // get data from local
        const dataH = localStorage.getItem("jobAboard");
        // console.log(dataH);
        if(dataH !== null && dataH !== ""){
          let dataHJSON = "";
          try {
            dataHJSON = JSON.parse(dataH);
            // console.log(dataHJSON);
            if(dataHJSON.username !== null && dataHJSON.username !== "" && !dataHJSON.logged){
              const keyChain = await keychain(window, 'requestSignBuffer', dataHJSON.username, 'loggin in jobAboard signbuffer hiveIO/keychain', 'Posting');
              const {data, success} = keyChain;
              if(success){
                setAccount(data.username);
                setLogged(true);
              }
            } else if (dataHJSON.logged){ //user switching between pages load data
              setAccount(dataHJSON.username);
              setLogged(dataHJSON.logged);
              setProfilePic(dataHJSON.profile_image);
            }
          } catch (error) {
            //todo
          }
        } //means no data present on local storage.
      }
    }
    if(!logged){
      firstCheck();
    }
    // console.log(`Logged value:${logged}`);
  },[logged]);

  const logIn = () => { 
    if(isKeychainInstalled){
      if(!logged){
        setShowLogin(true);
      }else {
        //TODO log out logic
        //we could 2 approaches of just setLogged as false or delete the data on local???? -ask @aggroed
        //or even auto-login could be a feature that each user can set on user_settings???
        //for now live it as deleting the object
        try {
          localStorage.removeItem("jobAboard");
          setLogged(false);
          setAccount("");
          console.log('Logged Out Successfully. For now deleting localStorage object. This can be changed later on as leaving the object but auto-log in on reload page.');
        } catch (error) {
          //TODO
        }
      }
    }else{
      alert('In order to use the hive-keychain as log in method. Please install it on your browser');
    }
  }

  const logginHiveKeyChain = async (event) => {
      // alert(`Loggin in as ${account}`);
      //login process
      event.preventDefault();
      if (account === null || account === ""){ return console.log("Input @username account please!")};
      const keyChain = await keychain(window, 'requestSignBuffer', account, 'loggin in jobAboard signbuffer hiveIO/keychain', 'Posting');
      const {data, success, msg, cancel, notActive} = keyChain;
      if(success) {
          //now grab data user's metadata using dhive
          const client = new Client("https://api.hive.blog"); //for now we use only API - TODO: ask to the guy if the best practice if to have several in case one fails
          client.database.getAccounts([`${data.username}`])
          .then(results => {
            const JSON_metadata = JSON.parse(results[0].posting_json_metadata);
            const profile_Pic = JSON_metadata.profile.profile_image;
            setProfilePic(profile_Pic);
            // console.log('Data received from hive using dhive');
            // console.log(results[0].posting_json_metadata);
            // console.log(JSON_metadata);
            // console.log(JSON_metadata);
            // setJsonMDUser(JSON_metadata);
            // console.log('END Data received------------------');
            //save pbkey on localstorage,username,loggedIn(true),dateTime(last log in made);
            // Store
            const dataH = {
              username: data.username, keyused: data.key, loggedin: new Date(), logged: true, pubKey: keyChain.publicKey,
              profile_image: profile_Pic,
            };
            localStorage.setItem("jobAboard", JSON.stringify(dataH));
            //end save on local store/
          }).catch(error => {
            console.log('Error while trying to get Data from user');
            console.log(error);
          })
            
          // console.log(keyChain);
          // alert(`Welcome ${data.username}`);
          setLogged(true);
      }
      else if(!cancel) {
        if(notActive) {
          alert('Please allow Keychain to access this website')
        } else {
          // console.log(msg);
        }
      }
      //end login process
      setShowLogin(false);
  }

  return (
    <div>
      <nav>
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
                <li key={`${menuItem.id}`} className={`${menuItem.hideOnLoggin && logged ? 'hideOnLoggin': null}`}>
                  {
                    menuItem.link ?
                      <Link to={`${menuItem.inner_link}`}>{menuItem.title}</Link>
                      : (logged)  ? 
                                    <div className="profilePicCont" onClick={() => setMenuUserClicked(!menuUserClicked)}> 
                                      <img src={profilePic} className="profilePic" alt="user jobaboard crypto job board" />
                                      {
                                      menuUserClicked &&
                                        <ul className={`userMenu ${menuUserClicked ? 'showUserMenu' : null}`}>
                                          {
                                            data.user_menu.edges.map(({ node: usermenu }) => {
                                              return (
                                                <li key={usermenu.id}>
                                                    <Link to={`${usermenu.inner_link}`}>
                                                      {usermenu.title}
                                                    </Link>
                                                  </li>
                                              )
                                            })
                                          }
                                          <li key="userMenuBtnLogOut-1">
                                            <button onClick={logIn}>Log Out</button>
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
                                  : <button onClick={logIn}>{menuItem.title}</button>
                  }
                </li>
              )
            })
          }
        </ul>
      </nav>
      <div className="menuBottomNav">
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
                            <li key={`${itemM.id}-zz`}>{subItem}</li>
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
      <main>{children}</main>
      {
        showLogin &&
        <div className="blackAbsCont">
          <div className="loginCont">
                <p>Log in Using @hive-keychain</p>
                <input type="text" id="username" placeholder="@username here please"
                  onChange={(event) => setAccount(event.target.value)}
                />
                <button type='submit' id="btnLogin" onClick={logginHiveKeyChain}>Login</button>
          </div>
        </div>
      }
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
