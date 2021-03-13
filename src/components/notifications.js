import React, { useState, useEffect } from 'react';
import Img from 'gatsby-image';
import { graphql, useStaticQuery } from "gatsby"

//constants
const notificationsEP = process.env.GATSBY_notiEP;

function Notifications(props) {
    const { username, token, fixedBellowUM } = props;

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
        return response; 
    };
    //////END data fecthing PUT/GET
    ///////On Mount
    const mount = () => {
        //check for notifications
        console.log(`Check Noti for:${username}`);
        if(username && token){
            getData(`${notificationsEP}${username}`)
            .then(data => {
                data.json()
                .then(msg => {
                    console.log(msg);
                    //testing to set whole object as received
                    // setProfile(msg);
                    setNoti(msg);
                })
                .catch(err => {
                    console.log('Error on msg');
                    console.log(err);
                });
            })
            .catch(error => {
                console.log('Error while requesting notifications data to API.');
                console.log(error);
            });
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
            # notifications_icon: file(relativePath: {eq: "notifications.png"}) {
            #     childImageSharp {
            #         fixed(width: 30) {
            #             ...GatsbyImageSharpFixed_withWebp
            #         }
            #     }
            # }
        }`
    );
    /////end graphql

    return (
        <div className={`notificationsCont ${fixedBellowUM}`}>
            <div className="standardDivRowFullW">
                <ul className="ulNotifications">
                    {
                        noti.map(notification => {
                            return (
                                <li key={notification._id} onClick={() => setNotiSelected(notification)}>
                                    <div className="standardDivRowFlex">
                                        <p>{notification.title} - {notification.createdAt}</p>
                                        <div className="standardBlock25px">
                                            <Img fixed={data.view_icon.childImageSharp.fixed} />
                                        </div>
                                    </div>
                                </li>
                            )
                        })
                    }
                    {/* <div>
                        <Img fixed={data.save_icon.childImageSharp.fixed} className="iconNoti" />
                        <Img fixed={data.delete_icon.childImageSharp.fixed} className="iconNoti"  />
                    </div> */}
                </ul>
                {
                    (notiSelected !== null) &&
                        <div className={`notiSelectedCont`}>
                            <p className="normalTextSmall">{notiSelected.title}</p>
                            <p className="normalTextSmall">By {notiSelected.type}</p>
                            <p className="normalTextSmall">{notiSelected.content}</p>
                            <button className="normalTextSmall" onClick={() => setNotiSelected(null)}>close</button>
                        </div>
                }
            </div>
            {/* menu options for notifications - TO finish */}
            <div className="menuOptionNotificationsCont">
                <ul className="standardUlRowFlexAuto">
                    <li>
                        <div>
                            <Img fixed={data.archive_icon.childImageSharp.fixed} />
                        </div>
                    </li>
                    <li>
                        <div>
                            <Img fixed={data.checked_icon.childImageSharp.fixed} />
                        </div>
                    </li>
                    <li>
                        <div>
                            <Img fixed={data.deleteAll_icon.childImageSharp.fixed} />
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Notifications;
