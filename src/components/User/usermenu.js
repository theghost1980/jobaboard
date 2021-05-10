import React, { useEffect, useState, useContext } from 'react';
//components
import Notifications from '../notifications';
import { Link, useStaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';
import { check, getStoredField } from '../../utils/helpers';
import Beechatchecker from '../BeeChat/beechatchecker';
//testing react/redux
import { useSelector } from 'react-redux';
// import { selectCount } from '../../features/counter/counterSlice';
import { selectNotifications } from '../../features/notifications/notiSlice';

//testing to get context from socketbee
import { Socket } from '../BeeChat/socketBee';
import Sitesearch from '../interactions/sitesearch';
import Coinprices from '../coinsprices';
// import {
//     decrement,
//     increment,
//     incrementByAmount,
//     incrementAsync,
//     selectCount,
//     counterSlice,
//   } from '';
  //end testing reac/redux

const UserMenu = (props) => {
    const userdata  = check();
    const [fixed, setFixed] = useState(false);
    const [openNoti, setOpenNoti] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);
    const [topMiniMessage, setTopMiniMessage] = useState(null);
    const [actualMenu, setActualMenu] = useState("");
    //testing react-redux
    // const count = useSelector(selectCount);
    const newmessages = useSelector(selectNotifications);
    // console.log(`Actual value newmessages from usermenu:${newmessages}`);

    const socketBee = useContext(Socket);
    //set event on scroll down to fix the user menu on top.
    useEffect(() => {
        function checkScroll(){
            if(window.pageYOffset >= 152){
                setFixed(true);
            }else{
                setFixed(false)
            }
        }
        window.document.addEventListener('scroll', checkScroll);
        //unmount
        return () => {
            window.document.removeEventListener('scroll', checkScroll);
        };
    },[])

    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            adminPanelLogo: file(relativePath: {eq: "admin-panel.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            walletIcon: file(relativePath: {eq: "wallet.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            tokensIcon: file(relativePath: {eq: "tokens.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            jobsIcon: file(relativePath: {eq: "jobs.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            profileIcon: file(relativePath: {eq: "profile.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            chatIcon: file(relativePath: {eq: "chat.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            notiIcon: file(relativePath: {eq: "notifications.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            market: file(relativePath: {eq: "market.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            event: file(relativePath: {eq: "bell.png"}) {
                childImageSharp {
                    fixed(width: 20) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            searchIcon: file(relativePath: {eq: "search.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhql queries

    //to handle on every state change
    useEffect(() => {
        //TODO
        // we may to change this from context to redux
        // doing the same as chatmessage and setting it up as null after some time
        // and test it as right know when opened a new page, it do not get the context.
        // if the redux do not work as well then LEAVE the pages out of the /app domain as "without new incomming messages"
        // OR include those pages into app domain 
        if(socketBee && socketBee.chatMessage){
            if(socketBee.chatMessage.to === userdata.username){
                setTopMiniMessage(socketBee.chatMessage);
                // console.log(socketBee.chatMessage);
                setTimeout(() => setTopMiniMessage(null),4000);
            }
        }
    },[socketBee]);
    //END to handle on every state change

    return (
            <div className="userMenuContainer">
                <ul className={`ulMenuOptionUser  ${fixed ? `makeFixeduserMenu fadeInLonger` : null}`}>
                    <Link to="/app/profile" className="gralLink" onClick={() => setActualMenu("Profile")}>
                        <li className="menuOptionLi">
                            <Img fixed={data.profileIcon.childImageSharp.fixed} className="imgOptionsUser" />
                        </li>
                    </Link>
                    {/* <Link to="/app/wallet" className="gralLink" onClick={() => setActualMenu("Wallet")}>
                        <li className="menuOptionLi">
                            <Img fixed={data.walletIcon.childImageSharp.fixed} className="imgOptionsUser" />
                        </li>
                    </Link> */}
                    <Link to="/app/tokens" className="gralLink" onClick={() => setActualMenu("NFTs")}>
                        <li className="menuOptionLi">
                            <Img fixed={data.tokensIcon.childImageSharp.fixed} className="imgOptionsUser"  />
                        </li>
                    </Link>
                    <Link to="/app/jobs" className="gralLink" onClick={() => setActualMenu("Jobs")}>
                        <li className="menuOptionLi">
                            <Img fixed={data.jobsIcon.childImageSharp.fixed} className="imgOptionsUser"  />
                        </li>
                    </Link>
                    <Link to="/nftmarket" className="gralLink" onClick={() => setActualMenu("NFT Market")}>
                        <li className="menuOptionLi">
                            <Img fixed={data.market.childImageSharp.fixed} className="imgOptionsUser"  />
                        </li>
                    </Link>
                    {/* TODO make the settings option to set chat as flyer or fixed. */}
                    <Link to="/app/beechatfixed" className="gralLink" onClick={() => setActualMenu("Beechat")}>
                        <li className="menuOptionLi relativeDiv">
                            <Img fixed={data.chatIcon.childImageSharp.fixed} className="imgOptionsUser"  />
                            {
                                (newmessages) &&
                                <div className="absInfoItem">
                                    <div className="fadeInLongerInf">
                                        <Img fixed={data.event.childImageSharp.fixed}/>
                                    </div>
                                </div>
                            }
                        </li>
                    </Link>
                    {
                    (userdata.usertype === "admin") &&
                        <Link to="/app/adminpanel" className="gralLink" onClick={() => setActualMenu("Admin panel")}>
                            <li className="menuOptionLi">
                                <Img fixed={data.adminPanelLogo.childImageSharp.fixed} className="imgOptionsUser" />
                            </li>
                        </Link> 
                    }
                    {/* <li>
                        <Notifications username={userdata.username} token={userdata.token}/>
                    </li> */}
                    <li className={`menuOptionLi ${openNoti ? 'selectedMenu': null}`} className="gralLink">
                        {/* TODO make the settings option to set chat as flyer or fixed. */}
                        <div onClick={() => setOpenNoti(!openNoti)}>
                            <Img fixed={data.notiIcon.childImageSharp.fixed} className="imgOptionsUser"  />
                        </div>
                    </li>
                    <li className={`menuOptionLi ${openSearch ? 'selectedMenu': null}`} className="gralLink">
                        <div onClick={() => setOpenSearch(!openSearch)}>
                            <Img fixed={data.searchIcon.childImageSharp.fixed} className="imgOptionsUser"  />
                        </div>
                    </li>
                    {
                        fixed && <Coinprices xtraClassCSSLogos={"whiteBack justRoundedFull miniMarginLeft"} xtraClassCSSUl={"textColorWhite"} show={true} />
                    }
                    {
                        fixed && actualMenu !== '' &&
                        <p className="marginLeft textColorWhite">On: {actualMenu}</p>
                    }
                </ul>
                <div className={openSearch ? 'openNoti': 'closedNoti'}>
                    <Sitesearch 
                        fixedBellowUM={fixed ? 'makeMeFixed60px jusBordersRounWhiteBack' : null} 
                    />
                </div>
                <div className={openNoti ? 'openNoti': 'closedNoti'}>
                    <Notifications 
                        username={userdata.username} 
                        token={userdata.token} 
                        fixedBellowUM={fixed ? 'makeMeFixed60px' : null}    
                    />
                </div>
                {
                    topMiniMessage &&
                    <div className={`standardDivRowFullW backColorOldLace justJustifiedContent ${fixed ? 'makeMeFixed60px' : null}`}>
                        <p>On Chat -> {topMiniMessage.from} says: {String(topMiniMessage.content).substring(0,20) +"..."} (Link go there TODO)</p>
                    </div>
                }
            </div>
    )
}

export default UserMenu;