import React, { useState, useEffect } from 'react';
import Img from 'gatsby-image';
import { graphql, useStaticQuery, StaticQuery } from "gatsby"

//constants
const notificationsEP = process.env.GATSBY_notiEP;

function Notifications(props) {
    const { username, token } = props;

    const [open, setOpen] = useState(false);
    // const [notification, setNotification] = useState([{
    //     type: String,
    //     title: String,
    //     createdAt: Date,
    //     content: String,
    //     opened: Boolean,
    //     username: String = (username ? username : "")
    // }]);
    const [noti, setNoti] = useState([]);

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
        }`
    );
    /////end graphql

    return (
        <div className="notificationsCont">
            <button onClick={() => setOpen(!open)}>Notifications {noti.length}</button>
            {
                open &&
                    <ul className="ulNotifications">
                        {
                            noti.map(notification => {
                                return (
                                    <li key={notification._id} className="notificationParent">
                                        {notification.title}
                                        <div className="notificationContentCont">
                                            <h3>{notification.title}</h3>
                                            <p>{notification.createdAt}</p>
                                            <p>{notification.content}</p>
                                            <div>
                                                <Img fixed={data.save_icon.childImageSharp.fixed} className="iconNoti" />
                                                <Img fixed={data.delete_icon.childImageSharp.fixed} className="iconNoti"  />
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
            }
        </div>
    )
}

export default Notifications;
