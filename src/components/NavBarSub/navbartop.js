import React, { useState, useEffect } from 'react';
import { useStaticQuery, graphql, Link, navigate } from "gatsby"
import Img from 'gatsby-image';
import Coinprices from '../coinsprices';

//testing react/redux
import { useDispatch, useSelector } from 'react-redux';
import { setValueOnProfile, selectProfile } from '../../features/userprofile/profileSlice';
import Menucats from './menucats';

/**
 * This is a sub component of navBar.
 * It will render the top bar as mobile or desktop, depending on prop passed by navbar
 * @param {Boolean} mobile - Mandatory to decide which renders occurs.
 * @param {Function} cbShowLogin - used to toogle the showlogin state on parent.
 * @param {Object} userdata mandatory as data user.
 * @param {String} pathName mandatory as this comes from navbar to let us know "where are we".
 * @param {Function} logUserOut CB to execute log out on parent.
 * @param {Boolean} logginIn - to receive when the log in screen in up, so we hive the mobile menu in case is opened.
 * @param {Boolean} devMode - optional to debug on console.
 */

const Navbartop = (props) => {
    const { mobile, devMode, cbShowLogin, userdata, pathName, logUserOut, logginIn } = props;
    const [menuUserClicked, setMenuUserClicked] = useState(false);
    const [menuClicked, setMenuClicked] = useState(false);

    // //testing react/redux
    const dispatch = useDispatch();
    // // end testing
    //graphql queries
    const data = useStaticQuery(graphql`
        query {
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
            hamMenuOrange: file(relativePath: {eq: "menu_orange.png"}) { 
                childImageSharp {
                    fixed(width: 50) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //END grapqhql queries

    //load on state changes
    useEffect(() => {
        if(logginIn){
            setMenuClicked(false);
        }
    },[logginIn]);
    //END load on state changes

    //functions/CB
    //testing to add navigating_on into redux on each user clicked on Menu
    const navigateToApp = (goingTo) => {
        if(devMode){ console.log('User wants to go to:',goingTo) };
        //TODO save into redux ??? maybe not needed.
        dispatch(setValueOnProfile({ type: "navigating_on", value: goingTo}));
        setMenuClicked(false);
    }
    const logUserOutCB = () => {
        setMenuClicked(false);
        logUserOut();
    }
    //END testing to add navigating_on into redux on each user clicked on Menu
    //END functions/CB

    return (
        <div className="standardDivFlexPlain justWidth100per">
            {
                (pathName !== "/nftmarket" && pathName !== "/app/profile" && pathName !== "/checkout")
                && !mobile &&
                <Menucats />
            }
            <div className="navbarRow">
                <Link to="/">
                    <div className="logoSVGCont">
                        {/* <img src={data.logoColor.publicURL} className="logoSVG" /> */}
                        <Img fluid={data.logoColor.childImageSharp.fluid} className="logoSVG" loading="eager" />
                    </div> 
                </Link>
                {
                    mobile && 
                    <div onClick={() => setMenuClicked(!menuClicked)}>
                        <Img fixed={data.hamMenuOrange.childImageSharp.fixed} className="marginRightX2 scaleOnHover" />
                    </div>
                }
                {/* TODO ADD this to div makeFixDiv onMouseLeave={() => setMenuClicked(false)} */}
                {
                    <div className={menuClicked ? 'makeFixDiv fadeInLonger' : null } onMouseLeave={() => setMenuClicked(false)} >
                        { menuClicked && <Menucats menuClicked={menuClicked}/> }
                        <ul className={`${(mobile) ? 'hideUl' : 'showUl'} mainMenuUl justPaddingRight20p ${menuClicked ? 'forcedUlRightSide' : null }`}>
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
                                                                                                <Link to="/app/adminpanel" className="adminPanelLink"
                                                                                                    onClick={() => navigateToApp("/app/adminpanel")}
                                                                                                >
                                                                                                    Admin Panel
                                                                                                </Link>
                                                                                            </li> 
                                                                                            : null
                                                        }
                                                        <li key="userMenuBtnLogOut-1">
                                                            <button onClick={logUserOutCB}>Log Out</button>
                                                        </li>
                                                        </ul>
                                                    }
                                                </div>
                                                : <button onClick={cbShowLogin}>{menuItem.title}</button>
                                }
                                </li>
                            )
                            })
                        }
                        </ul>
                    </div>
                }
            </div>
            <div>
                <Coinprices xtraClassCSS={"justMarginAuto"} devMode={true} show={pathName === "/nftmarket"} />
            </div>
        </div>
    )
}

export default Navbartop;