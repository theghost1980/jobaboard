import React, { useState, useEffect } from 'react';
import Img from 'gatsby-image';
import { graphql, useStaticQuery } from "gatsby"
import { formatDateTime } from '../utils/helpers';

//constants
const notificationsEP = process.env.GATSBY_notiEP;

function Notifications(props) {
    const { username, token, fixedBellowUM, newOnes } = props;

    // const [open, setOpen] = useState(false);
    // const [notification, setNotification] = useState([{
    //     type: String,
    //     title: String,
    //     createdAt: Date,
    //     content: String,
    //     opened: Boolean,
    //     username: String = (username ? username : "")
    // }]);
    const [noti, setNoti] = useState([]);
    const [notiSelected, setNotiSelected] = useState(null);
    const [newNotifications, setNewNotifications] = useState(false);

     /////////data fecthing PUT/GET////////
     ////////Fetching POST request to backend
     async function getData(url = '') {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-access-token': token,
            },
        });
        return response.json(); 
    };
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata   ? fetch(url, { method: requestType, contentType: 'application/json', headers: headers,})
                                        : fetch(url, { method: requestType, contentType: 'application/json', headers: headers, body: formdata});
        return (await response).json(); 
    };
    //////END data fecthing PUT/GET

    ///////On Mount
    const mount = () => {
        //check for notifications
        console.log(`Check Noti for:${username}`);
        //for to reload the notifications.
        setNoti([]);
        if(username && token){
            getData(`${notificationsEP}${username}`)
            .then(response => {
                console.log(response);
                setNoti(response);
            })
            .catch(error => { console.log('Error while requesting notifications data to API.', error) });
        }
        // ...end mount components
        const unmount = () => {
          // ...
        }
        return unmount
    };
    useEffect(mount, []);
    //end f/c on init/mounted
    ////////////////////////////////////////

    /////graphql queries
    const data = useStaticQuery(graphql`
        query {
            save_icon: file(relativePath: {eq: "save.png"}) {
                childImageSharp {
                    fixed(width: 32) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            delete_icon: file(relativePath: {eq: "delete.png"}) {
                childImageSharp {
                    fixed(width: 32) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            archive_icon: file(relativePath: {eq: "archive-white.png"}) {
                childImageSharp {
                    fixed(width: 32) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            view_icon: file(relativePath: {eq: "view-white.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            checked_icon: file(relativePath: {eq: "checked-white.png"}) {
                childImageSharp {
                    fixed(width: 32) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            deleteAll_icon: file(relativePath: {eq: "delete-all.png"}) {
                childImageSharp {
                    fixed(width: 32) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            alarmIcon: file(relativePath: {eq: "bell.png"}) {
                childImageSharp {
                    fixed(width: 15) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }`
    );
    /////end graphql

    //load on state changes
    useEffect(() => {
        if(notiSelected && !notiSelected.opened){
            markAsRead();
        }
    },[notiSelected]);
    useEffect(() => {
        if(noti && noti.length > 0){
            const founds = noti.filter(notif => !notif.opened);
            if(founds.length > 0){
                if(newOnes){
                    newOnes(true);
                }
            }else{
                if(newOnes){
                    newOnes(false);
                }
            }
        }
    }, [noti]);
    //END load on state changes

    // functions/CB
    function updateState(noti_id, newNoti){
        const oldState = noti;
        const filtered = oldState.filter(noti => noti._id !== noti_id);
        filtered.push(newNoti);
        setNoti(filtered);
    }
    const markAsRead = () => {
        const headers = {'x-access-token': token, 'operation': 'markread', 'noti_id': notiSelected._id };
        dataRequest(notificationsEP+"handleNotification", "POST", headers, null).then(response => {
            console.log(response);
            if(response.status === 'sucess' && response.message === "Set as read"){
                const readNoti = response.result;
                updateState(readNoti._id, readNoti);
            }
        }).catch(error => { console.log('Error fetching noti.', error) });
    }
    // END functions/CB

    return (
        <div className={`notificationsCont relativeDiv ${fixedBellowUM}`}>
            {
                newNotifications && <Img fixed={data.alarmIcon.childImageSharp.fixed} className="" />
            }
            <div className="standardDivRowFullW">
                <ul className="ulNotifications">
                    {
                        noti.map(notification => {
                            return (
                                <li key={notification._id} onClick={() => setNotiSelected(notification)}>
                                    <div className={`standardDivRowFullWAuto ${!notification.opened ? 'justBordersRounded' : null }`}>
                                        <p>{notification.title} - {formatDateTime(notification.createdAt)} {!notification.opened ? null : 'read' }</p>
                                    </div>
                                </li>
                            )
                        })
                    }
                </ul>
                {
                    (notiSelected !== null) &&
                        <div className={`notiSelectedCont`}>
                            <div>
                                <ul className="standardUlRow normalTextSmall">
                                    <li className="pointer">Archive</li>
                                    <li className="pointer">Delete</li>
                                    <li className="pointer" onClick={() => setNotiSelected(null)}>Close</li>
                                </ul>
                            </div>
                            <div className="justMarginBottom">
                                <div className="standardContentMargin whiteBack textColorContrast2 justRoundedMini">
                                    <div className="contentMiniMargins">
                                        <p className="normalTextSmall justBoldtext">{notiSelected.title}</p>
                                        <p className="normalTextSmall">Marker As: {notiSelected.type} / Sent By: {notiSelected.made_by}</p>
                                        <p className="normalTextSmall">{notiSelected.content}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                }
            </div>
        </div>
    )
}

export default Notifications;
