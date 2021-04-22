import React, { useState, useEffect } from 'react';
import { graphql, useStaticQuery, Link } from "gatsby"
//helpers
import { check, formatDateTime } from '../../utils/helpers';
import Btnclosemin from '../btns/btncloseMin';
import Actionuser from './actionsuser';
import Absscreenwrapper from '../absscreenwrapper';
import Menuhover from '../interactions/menuhover';
import Loader from '../loader';
import Tablinator from '../interactions/tablinator';

//constants
const userEP = process.env.GATSBY_userEP;
const adminEP = process.env.GATSBY_adminEP;
const itemsMenu = [
    {title: 'User', cbProp: 'manageUsers', subMenu: [ 'List All Users', 'Filter Options'],},
    {title: 'User Logs', cbProp: 'manageLogs', subMenu: [ 'List All user Logs', 'Filter Options']},
]
//end constants

const Manageusers = () => {
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

    const userdata = check();
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]); //TODO
    const [selectedLogUser, setSelectedLogUser] = useState(null);
    const [showList, setShowList] = useState(false);
    const [showLogs, setShowLog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [action, setAction] = useState(null);

    //new ones to organise
    const [option, setOption] = useState({ 
        option: '',     //as option: users, users_logs
        subOption: '',  //as subOption:
    });
    const [loadingData, setLoadingData] = useState(false);
    const [userLogs, setUserLogs] = useState(null);
    const [loadingExtraData, setLoadingExtraData] = useState(false);
    //end new ones

    function splitDateTime(str){
        const dateTime = String(selectedLogUser.createdAt).split('T');
        const date = dateTime[0].split('-');
        const arranged = date.reverse().join("/");
        const time = dateTime[1].split('Z')[0];
        const ar = time.split(':');
        return arranged +" "+ ar[0]+":"+ar[1];
    }
    function getUsers(){
        getDataWT(userEP,userdata.token)
        .then(response => {
            if(response.length > 0){
                setUsers(response);
            }
        })
        .catch(err => {console.log('Error while fetching data from BE', err)})
    }
    
    const listUsers = () => {
        setLoadingData(true);
        getDataWT(userEP,userdata.token)
        .then(response => {
            // console.log(response);
            if(response.length > 0){
                //present results
                console.log(response);
                setUsers(response);
                // setShowList(true);
            }else{
                console.log(response);
            }
            setLoadingData(false);
        })
        .catch(err => {
            console.log('Error while fetching data from BE', err);
            setLoadingData(false);
        })
    };

    const getUserLogs = (username) => {
        setLoadingExtraData(true);
        getData(adminEP+"getLogs",userdata.token, { username: username })
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setUserLogs(response.result);
            }
            setLoadingExtraData(false);
        }).catch(error => {
            console.log('Error getting user logs.',error);
            setLoadingExtraData(false);
        });
    }

    const getLogs = () => {
        getDataWT(adminEP+"alllogs",userdata.token)
        .then(response => {
            console.log(response);
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
    async function getData(url = '', token,filter) { 
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'x-access-token': token,
                'filter': JSON.stringify(filter),
            },
        });
        return response.json(); 
    };
    ///////////////////////////////////////

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

   //to load on init
   useEffect(() => {
    getUsers();
   },[]);
   //END to load on init

    return (
        <div className="standardContentMargin">
            <Menuhover items={itemsMenu} clickedSubItemCB={(opt) => setOption(opt)} xtraclassCSS={"jusBordersRounWhiteBack"}/>
            {
                loadingData &&
                <div className="standardDiv30Percent justMargin0auto">
                    <Loader logginIn={loadingData} typegif={"spin"}/>
                </div>
            }
            {
                (option === "List All Users") && users &&
                <Tablinator toShow={['username','usertype','banned','email']} items={users} devMode={false} clickedSubItemCB={(item) => setSelectedUser(item)}/>
            }
            {
                selectedUser &&
                <div className="standardFlex100AutoH border1pxRounded relativeDiv">
                    <div className="standardContentMargin">
                        <div className="standardDivRowFullW">
                            <div>
                                <img src={selectedUser.avatar} className="miniAvatar" />
                            </div>
                            <div>
                                { console.log(selectedUser) }
                                <p>User: {selectedUser.username}</p>
                                <p>Type: {selectedUser.usertype}</p>
                                <p>Banned: {selectedUser.banned.toString()}</p>
                                {
                                    selectedUser.email && <p>Mail: {selectedUser.email}</p>
                                }
                            </div>
                        </div>
                        <div className="standardDivRowFullW">
                            <div className="smallText">
                                <div className="standardFlexColBordered width90 justiAlig marginsTB justRounded">
                                    <p className="minimumMarginTB">JAB Member Since:</p>
                                    <p className="minimumMarginTB">{formatDateTime(selectedUser.createdAt)}</p>
                                </div>
                                {   
                                    selectedUser.updatedAt &&
                                    <div className="standardFlexColBordered width90 justiAlig marginsTB justRounded">
                                        <p className="minimumMarginTB">Last Update on Profile:</p>
                                        <p className="minimumMarginTB">{formatDateTime(selectedUser.updatedAt)}</p>
                                    </div>
                                }
                            </div>
                            <div className="smallText">
                            {   
                                selectedUser.following &&
                                <div className="standardFlexColBordered width90 marginsTB justRounded">
                                    <div className="standardContentMargin">
                                        <p className="minimumMarginTB">JABers I follow:</p>
                                        <ul className="overflowYscroll justMaxHeight">
                                            {
                                                selectedUser.following.map(user => {
                                                    return (
                                                        user ?  <li key={`${user}-JABerIFollow`}>
                                                                    <a href={`/portfoliouser?query=${user}`} className="aFlexAlignedCont" target="_blank" rel="noopener noreferrer">{user}</a>
                                                                </li> : null
                                                    )
                                                })
                                            }
                                            
                                        </ul>
                                    </div>
                                </div>
                            }
                        </div>            
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
                            <li key="menu-actions-UserAdmin-3">
                                <button className="btnMini" onClick={() => getUserLogs(selectedUser.username)}>See Logs</button>
                            </li>
                        </ul>
                        <Btnclosemin classCSS="closeBtnAbs" btnAction={() => setSelectedUser(null)} />
                    </div>
                    {
                        loadingExtraData &&
                        <div className="standardDiv30Percent justMargin0auto">
                            <Loader logginIn={loadingExtraData} typegif={"blocks"}/>
                        </div>
                    }
                    {
                        userLogs &&
                        <div className="relativeDiv marginsTB">
                            <Btnclosemin classCSS="closeBtnAbs zIndexTop whiteBack" btnAction={() => setUserLogs(null)} />
                            <Tablinator xclassCSS={"marginsTB"}
                                toShow={['createdAt','event','ipaddress','username']} 
                                items={userLogs} devMode={false} clickedSubItemCB={(item) => console.log(item)}
                            />
                        </div>
                    }
                </div>
            }
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
            
                <div className="standardDiv60Percent marginLeft">
                    {
                        showList &&
                        <ul className="standardUlHorSmall">
                        {
                                users.map(user => {
                                    return (
                                        <li key={`${user._id}-list-users-jobaboard`}
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
                                <li key={`${log._id}-log-User-jobaboard`}
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
