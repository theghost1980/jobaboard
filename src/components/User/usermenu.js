import React, { useEffect, useState } from 'react';
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
    const [open, setOpen] = useState(false);
    //testing react-redux
    // const count = useSelector(selectCount);
    const newmessages = useSelector(selectNotifications);
    console.log(`Actual value newmessages from usermenu:${newmessages}`);
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
            event: file(relativePath: {eq: "bell.png"}) {
                childImageSharp {
                    fixed(width: 20) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhql queries

    return (
            <div className="userMenuContainer">
                <ul className={`ulMenuOptionUser ${fixed ? `makeFixeduserMenu` : null}`}>
                    <Link to="/app/profile" className="gralLink">
                        <li className="menuOptionLi">
                            <Img fixed={data.profileIcon.childImageSharp.fixed} className="imgOptionsUser" />
                        </li>
                    </Link>
                    <Link to="/app/wallet" className="gralLink">
                        <li className="menuOptionLi">
                            <Img fixed={data.walletIcon.childImageSharp.fixed} className="imgOptionsUser" />
                        </li>
                    </Link>
                    <Link to="/app/tokens" className="gralLink">
                        <li className="menuOptionLi">
                            <Img fixed={data.tokensIcon.childImageSharp.fixed} className="imgOptionsUser"  />
                        </li>
                    </Link>
                    <Link to="/app/jobs" className="gralLink">
                        <li className="menuOptionLi">
                            <Img fixed={data.jobsIcon.childImageSharp.fixed} className="imgOptionsUser"  />
                        </li>
                    </Link>
                    {/* TODO make the settings option to set chat as flyer or fixed. */}
                    <Link to="/app/beechatfixed" className="gralLink">
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
                        <Link to="/app/adminpanel" className="gralLink">
                            <li className="menuOptionLi">
                                <Img fixed={data.adminPanelLogo.childImageSharp.fixed} className="imgOptionsUser" />
                            </li>
                        </Link> 
                    }
                    {/* <li>
                        <Notifications username={userdata.username} token={userdata.token}/>
                    </li> */}
                    <li className={`menuOptionLi ${open ? 'selectedMenu': null}`} className="gralLink">
                        {/* TODO make the settings option to set chat as flyer or fixed. */}
                        <div onClick={() => setOpen(!open)}>
                            <Img fixed={data.notiIcon.childImageSharp.fixed} className="imgOptionsUser"  />
                        </div>
                    </li>
                </ul>
                <div className={open ? 'openNoti': 'closedNoti'}>
                    <Notifications 
                        username={userdata.username} 
                        token={userdata.token} 
                        fixedBellowUM={fixed ? 'makeMeFixed60px' : null}    
                    />
                </div>
            </div>
    )
}

export default UserMenu;