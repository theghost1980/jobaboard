import React, { useState, useEffect } from 'react';
import { graphql, useStaticQuery, Link } from "gatsby"
//helpers
import { check } from '../../utils/helpers';
import Btnclosemin from '../btns/btncloseMin';
import Actionuser from './actionsuser';
import Absscreenwrapper from '../absscreenwrapper';

//constants
const userEP = process.env.GATSBY_userEP;
const adminEP = process.env.GATSBY_adminEP;
//end constants

const Manageusers = () => {
    const userdata = check();
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]); //TODO
    const [selectedLogUser, setSelectedLogUser] = useState(null);
    const [showList, setShowList] = useState(false);
    const [showLogs, setShowLog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [action, setAction] = useState(null);

    function splitDateTime(str){
        const dateTime = String(selectedLogUser.createdAt).split('T');
        const date = dateTime[0].split('-');
        const arranged = date.reverse().join("/");
        const time = dateTime[1].split('Z')[0];
        const ar = time.split(':');
        return arranged +" "+ ar[0]+":"+ar[1];
    }
    
    const listUsers = () => {
        getDataWT(userEP,userdata.token)
        .then(response => {
            console.log(response);
            if(response.length > 0){
                //present results
                console.log(response);
                setUsers(response);
                setShowList(true);
            }else{
                console.log(response);
            }
        })
        .catch(err => {
            console.log('Error while fetching data from BE', err);
        })
    };

    const getLogs = () => {
        getDataWT(adminEP+"alllogs",userdata.token)
        .then(response => {
            // console.log(response);
            if(response.length > 0){
                setLogs(response);
                setShowLog(true);
            }else{
                console.log('Something happend. Call crypto-police.',response);
            }
        })
        .catch(err => {
            console.log('Error while fetching data from logs!',err);
        })
    };

    /////////DATA fecthing////////////
    async function getDataWT(url = '', _token) { 
        console.log(`asking for:${url}`);
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'x-access-token': `${_token}`
            },
        });
        return response.json(); 
    };
    ///////////////////////////////////////

    /////graphql queries
    const data = useStaticQuery(graphql`
    query { 
        external_link: file(relativePath: {eq: "external-link.png"}) {
            childImageSharp {
                fixed(width: 32) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        }
        hive_icon: file(relativePath: {eq: "hive.png"}) {
            childImageSharp {
                fixed(width: 32) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        }
    }`);
    /////end graphql

    const lookUpUser = (event) => {
        const username = event.target.value;
        if(users){
            const foundedUser = users.filter(user => user.username === username);
            if(foundedUser[0]){
                setSelectedUser(foundedUser[0]);
                console.log(foundedUser[0]);
            }
            //here we set the state and show in render bellow the input as a expanded that the user can click to get
            // the details bellow.
        }else{
            //we could fire the bring all users at least the first time.
        }
    };

   const closeActions = () => setAction(null);

    return (
        <div className="standardContentMargin">
            <ul className="standardUlHor">
                <li key="menu-UserAdmin-1">
                    <button onClick={listUsers}>List All</button>
                    {
                        showList && <button className="btnMiniTextRed marginLeft" onClick={() => setShowList(false)}>close</button>
                    }
                </li>
                <li key="menu-UserAdmin-2">
                    <div>
                        <label htmlFor="accountSearch">Search: </label>
                        <input name="accountSearch" type="text" onChange={lookUpUser} />
                    </div>
                </li>
                <li key="menu-UserAdmin-3">
                    <button onClick={getLogs}>All Logs</button>
                    {
                        showLogs && <button className="btnMiniTextRed marginLeft" onClick={() => setShowLog(false)}>close</button>
                    }
                </li>
            </ul>
            <hr className="borderBottom" />
            <div className="standardDivRowFullW">
            <div className="standardDiv30Percent">
                    {
                        selectedUser &&
                        <div className="standardFlex100AutoH border1pxRounded relativeDiv">
                            <div className="standardContentMargin">
                                <img src={selectedUser.avatar} className="miniAvatar" />
                                <p>User: {selectedUser.username}</p>
                                <p>Type: {selectedUser.usertype}</p>
                                <p>Banned: {selectedUser.banned.toString()}</p>
                            </div>
                            <ul className="standardUlHorMini">
                                <li key="menu-actions-UserAdmin-1">
                                    <button className="btnMini" onClick={() => setAction("ban")}>Ban Hammer</button>
                                </li>
                                <li key="menu-actions-UserAdmin-2">
                                    <button className="btnMini" onClick={() => setAction("noti")}>Send Notification</button>
                                </li>
                                <li key="menu-actions-UserAdmin-3">
                                    <button className="btnMini" onClick={() => setAction("email")}>Send Email</button>
                                </li>
                            </ul>
                            <Btnclosemin classCSS="closeBtnAbs" btnAction={() => setSelectedUser(false)} />
                        </div>
                    } 
                </div> 
                <div className="standardDiv60Percent marginLeft">
                    {
                        showList &&
                        <ul className="standardUlHorSmall">
                        {
                                users.map(user => {
                                    return (
                                        <li key={`${user.id}-list-users-jobaboard`}
                                            className={`standardLiHovered ${user.banned ? 'userBanned': null}`}
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            Account: {user.username} - Type: {user.usertype}
                                        </li>
                                    )
                                })
                        }
                        </ul>
                    }
                </div> 
            </div>
            {
                    action && 
                    <Absscreenwrapper>
                        <div className="standardDiv70Auto justiAlig backGroundDed">
                            <Actionuser action={action} data={{
                            token: userdata.token,
                            admin: userdata.username,
                            user: selectedUser.username,
                            }}/>
                            <Btnclosemin classCSS={"closeBtnAbs"} btnAction={() => setAction(null)} />
                        </div>
                    </Absscreenwrapper>
            }
            {
                showLogs &&
                <ul className="standardUlHorSmall">
                    {
                        logs.map(log => {
                            return (
                                <li key={`${log.id}-log-User-jobaboard`}
                                    className="standardLiHovered"
                                    onClick={() => setSelectedLogUser(log)}
                                >
                                    Account: {log.username} - Type: {log.usertype} - Date: {log.createdAt} - From IP: {log.ipaddress}
                                </li>
                            )
                        })
                    }
                </ul>
            }
            {
                selectedLogUser &&
                    <div className="logsListUsers">
                        <div className="standardContentMargin">
                        <p>User: {selectedLogUser.username}</p>
                        <p>Event: {selectedLogUser.event}</p>
                        <p>Date/Time: {splitDateTime(selectedLogUser.createdAt)}</p>
                        <p>Usertype: {selectedLogUser.usertype}</p>
                        <p>Ip Address: {selectedLogUser.ipaddress}</p>
                        <Btnclosemin classCSS="closeBtnAbs" btnAction={() => setSelectedLogUser(false)} />
                        </div>
                    </div>
            }

            {/* <h2>Hi from Manage Users</h2>
            <p>TODO: Maybe this section may include:</p>
            <ul>
                <li>List actual: Users, search users.</li>
                <li>Manage users. Update, Ban hammer.</li>
                <li>Add notifications.</li>
                <li>Log Users activities.</li>
            </ul> */}
        </div>
    )
}

export default Manageusers;
