import React, { useState, useEffect } from 'react';
import { graphql, useStaticQuery, Link } from "gatsby"
//helpers
import { check } from '../utils/helpers';
//components
import Img from 'gatsby-image';
import Adminhome from '../components/Admin/adminhome';
import Manageusers from '../components/Admin/manageusers';
import Managewebcontent from '../components/Admin/managewebcontent';
import Managenfts from '../components/Admin/managenfts';
import Managejobsgigs from './Admin/managejobsgigs';

// import Loader from '../components/loader';
// import Notifications from './notifications';
//constants
const userEP = process.env.GATSBY_userEP;
const adminEP = process.env.GATSBY_adminEP;
//end constants

// TODO
//add a loader + lock smoothly the inputs so the user knows the info it is updating.
// after success on update data, present a notification somewhere "profile updated!!"

const AdminPanel = () => {

    const userdata = check();
    //options : home - users - gigs - nfts - escrow
    const [componentSelected, setComponentSelected] = useState("home"); 

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [logs, setLogs] = useState([]);

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
        }`
    );
    /////end graphql

    // const [loadingData, setLoadingData] = useState(true);
    // const [profile, setProfile] = useState({
    //     avatar: "",
    //     banned: false,
    //     following: [],
    //     createdAt: Date,
    //     updatedAt: Date,
    //     fullname: "",
    //     username: userdata.username,
    //     location: "",
    //     bio: "",
    //     instagram_link: "",
    //     twitter_link: "",
    //     portfolio_link: "",
    //     soundcloud_link: "",
    //     email: "",
    //     _id: "",
    // });

    /////////data fecthing PUT/GET////////
     ////////Fetching POST request to backend
    //  async function getData(url = '') {
    //     const response = await fetch(url, {
    //     method: 'GET', // *GET, POST, PUT, DELETE, etc.
    //     mode: 'cors', // no-cors, *cors, same-origin
    //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //     //   credentials: 'same-origin', // include, *same-origin, omit
    //     headers: {
    //         // 'Content-Type': 'application/json'
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json',
    //         'x-access-token': userdata.token
    //     },
    //     //   redirect: 'follow', // manual, *follow, error
    //     //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    //     // body: new URLSearchParams({
    //     //         'username': username
    //     //     }),
    //     });
    //     return response; 
    // };
    ////////END Fecthing GET to BE
    ///////PUT fetch = Update User data
    // async function updateData(url = '', data) {
    //     const response = await fetch(url, {
    //     method: 'PUT', // *GET, POST, PUT, DELETE, etc.
    //     mode: 'cors', // no-cors, *cors, same-origin
    //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //     //   credentials: 'same-origin', // include, *same-origin, omit
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //         'Accept': 'application/json',
    //         'x-access-token': userdata.token
    //     },
    //     //   redirect: 'follow', // manual, *follow, error
    //     //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    //     body: new URLSearchParams(
    //         data
    //     ),
    //     });
    //     return response; 
    // };
    ///////END Put fetch
    /////////end DATA fecthing////////////
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

    const listUsers = () => {
        getDataWT(userEP,userdata.token)
        .then(response => {
            console.log(response);
            if(response.length > 0){
                //present results
                console.log(response);
                setUsers(response);
            }else{
                console.log(response);
            }
        })
        .catch(err => {
            console.log('Error while fetching data from BE', err);
        })
    }

    function selectThisUser(e){
        // console.log(e);
        const selected = users.find(user => user.username === e);
        setSelectedUser(selected);
        console.log(selected);
    }

    const getLogs = () => {
        getDataWT(adminEP+"alllogs",userdata.token)
        .then(response => {
            console.log(response);
            if(response.length > 0){
                setLogs(response);
            }else{
                console.log('Something happend. Call crypto-police.',response);
            }
        })
        .catch(err => {
            console.log('Error while fetching data from logs!',err);
        })
    }
    //    //update profile
    //    const handleUpdate = (event) => {
    //     event.preventDefault();
    //     //set updatedAt
    //     const updateDate = new Date();
    //     updateProfile('updatedAt', updateDate);
    //     updateData(`${userEP}update/${userdata.username}`,profile)
    //     .then(data => {
    //         data.json()
    //         .then(msg => {
    //             if(msg.auth === false){
    //                 console.log('Error on update!');
    //                 console.log(msg.message);
    //             }else{
    //                 console.log('Profiled Updated!');
    //                 console.log(msg);
    //                 //testing to set whole object as received
    //                 setProfile(msg);
    //             }
    //         });
    //     })
    //     .catch(error => {
    //         console.log('Error while updating user data to API.');
    //         console.log(error);
    //     });
    // };
    // //end update profile

    // //handle profile's State 
    // const updateProfile = (name,value) => {
    //     setProfile(prevState => {
    //         return {...prevState, [name]: value}
    //     });
    // };
    // //END profile's State

    /////////////////////////
    // const mount = () => {
    //     console.log('mounted');
    //     //check for userprofile
    //     console.log(`Asking profile data from:${userdata.username}`);
    //     //TODO
    //     // maybe we could store the user data, until it chages in order to ask again and gain speed on loading >S ??
    //     getData(`${userEP}${userdata.username}`)
    //     .then(data => {
    //         data.json()
    //         .then(msg => {
    //             setLoadingData(false);
    //             console.log(msg);
    //             //testing to set whole object as received
    //             setProfile(msg);
    //         });
    //     })
    //     .catch(error => {
    //         console.log('Error while requesting user data to API.');
    //         console.log(error);
    //     });
    //     // ...end mount components
      
    //     const unmount = () => {
    //       // ...
    //     }
    //     return unmount
    // };
    // useEffect(mount, []);
    //end f/c on init/mounted
    /////////////////////////

    return (
        <div className="adminPanelCont">
            <div className="adminPanelMenu">
                <h1>Admin Panel</h1>
                <ul className="standardUlVerSmall">
                    <li onClick={() => setComponentSelected("home")}
                        className={`standardLink ${componentSelected === "home" ? `activeInnerMenu`: null}`}
                    >
                        Admin Home/Dashboard
                    </li>
                    <li onClick={() => setComponentSelected("webcontent")}
                        className={`standardLink ${componentSelected === "webcontent" ? `activeInnerMenu`: null}`}
                    >
                        Web Content
                    </li>
                    <li onClick={() => setComponentSelected("users")}
                        className={`standardLink ${componentSelected === "users" ? `activeInnerMenu`: null}`}
                    >
                        Users
                    </li>
                    <li onClick={() => setComponentSelected("gigs")}
                        className={`standardLink ${componentSelected === "gigs" ? `activeInnerMenu`: null}`}
                    >
                        Jobs/Gigs
                    </li>
                    <li onClick={() => setComponentSelected("nfts")}
                        className={`standardLink ${componentSelected === "nfts" ? `activeInnerMenu`: null}`}
                    >
                        NFTs
                    </li>
                    <li className="standardLink">
                        Escrow System ASK?
                    </li>
                    {/* <li>
                        <button onClick={listUsers}>List all Users</button>
                    </li>
                    <li>
                        <button onClick={getLogs}>Get Users Logs</button>
                    </li>
                    <li>Jobs/Gigs Logs</li>
                    <li>Anonymous Visits</li>
                    <li>NFT Market</li> */}
                </ul>
            </div>
            <div className="adminRenderContainer marginBottom">
                    {
                        (componentSelected === "home") && <Adminhome />
                    }
                    {
                        (componentSelected === "users") && <Manageusers />
                    }
                    {
                        (componentSelected === "webcontent") && <Managewebcontent />
                    }
                    {
                        (componentSelected === "gigs") && <Managejobsgigs />
                    }
                    {
                        (componentSelected === "nfts") && <Managenfts />
                    }
            </div>
            {
                users.length > 0 ?
                    <div className="listUsersCont">
                        <select name="selectListUsers" className="selectorUserList" onChange={(e) => selectThisUser(e.target.value)}>
                            <option value="default" key="usersList-1">Found {users.length.toString()} users.</option>
                            {
                                users.map(user => {
                                    return (
                                            <option key={user.id} value={user.username}
                                                name={user.username}
                                            >
                                                {user.username}
                                            </option>
                                    )
                                })  
                            }
                        </select>
                        {
                            selectedUser &&
                                <div>
                                    <ul className="ulListUserAdminPanel">
                                        <li>
                                            <img src={selectedUser.avatar} className="adminPanelProfilePicUser" />
                                        </li>
                                        <li>Username: {selectedUser.username}</li>
                                        <li>User Type: {selectedUser.usertype}</li>
                                        <li>Banned: {selectedUser.banned.toString()}</li>
                                        <li>Created At: {selectedUser.createdAt}</li>
                                        { 
                                            selectedUser.updatedAt && 
                                            <li>
                                                Updated At: {selectedUser.updatedAt}
                                            </li>
                                        }
                                        <div className="actionMenuAbs">
                                            <li>Open Hive profile 
                                                <a href={`https://hive.blog/@${selectedUser.username}`} target="_blank" rel="noreferrer">
                                                    <Img fixed={data.external_link.childImageSharp.fixed} className="actionIcon" />
                                                </a>
                                            </li>
                                            <li>Open on Hive-Blocks 
                                                <a href={`https://hiveblocks.com/@${selectedUser.username}`} target="_blank" rel="noreferrer">
                                                    <Img fixed={data.external_link.childImageSharp.fixed} className="actionIcon"  />
                                                </a>
                                            </li>
                                            <li>Open Hive-wallet 
                                                <a href={`https://wallet.hive.blog/@${selectedUser.username}/transfers`} target="_blank" rel="noreferrer">
                                                    <Img fixed={data.hive_icon.childImageSharp.fixed} className="actionIcon"  />
                                                </a>
                                            </li>
                                        </div>
                                    </ul>
                                </div>
                        }
                    </div>
                    : null
            }
            {
                (logs.length > 0) && 
                    <ul className="logResultContainer">
                        {
                            logs.map(log => {
                                return (
                                    <li key={log.id}>
                                        User:{log.username} Date/Time:{log.createdAt} User Type:{log.usertype}
                                    </li>
                                )
                            })
                        }
                    </ul>
            }
            {/* <Notifications username={userdata.username} token={userdata.token}/>
            {
                loadingData ? <Loader logginIn={true} />
                    :
                    <>
                    <div className="rowContainer">
                        <div className="userProfilePicCont">
                            <img src={userdata.profilePicUrl} className="userProfilePic" />
                        </div>
                        <form id="profileUserForm" onSubmit={handleUpdate}>
                        <h1>@{userdata.username} - Profile Page</h1>
                        <label className="lblProfileUser">
                            Full Name:
                            <input type="text" name="fullname" className="inputFormProfileUSer" 
                                value={profile.fullname} 
                                onChange={(e) => {updateProfile(e.target.name,e.target.value)}}
                            />
                        </label>
                        <label className="lblProfileUser">
                            Bio:
                            <textarea type="text" name="bio" className="inputFormProfileUSer"  
                                id="bioInputProfile"
                                value={profile.bio}
                                onChange={(e) => {updateProfile(e.target.name,e.target.value)}}
                            />
                        </label>
                        <label className="lblProfileUser">
                            Location:
                            <input type="text" name="location" className="inputFormProfileUSer" 
                                value={profile.location}
                                onChange={(e) => {updateProfile(e.target.name,e.target.value)}}
                            />
                        </label>
                        <label className="lblProfileUser">
                            Instagram:
                            <input type="text" name="instagram_link" className="inputFormProfileUSer"  
                                value={profile.instagram_link}
                                onChange={(e) => {updateProfile(e.target.name,e.target.value)}}
                            />
                        </label>
                        <label className="lblProfileUser">
                            Twitter:
                            <input type="text" name="twitter_link" className="inputFormProfileUSer"  
                                value={profile.twitter_link}
                                onChange={(e) => {updateProfile(e.target.name,e.target.value)}}
                            />
                        </label>
                        <label className="lblProfileUser">
                            Portfolio:
                            <input type="text" name="portfolio_link" className="inputFormProfileUSer"  
                                value={profile.portfolio_link}
                                onChange={(e) => {updateProfile(e.target.name,e.target.value)}}
                            />
                        </label>
                        <label className="lblProfileUser">
                            Sound Cloud:
                            <input type="text" name="soundcloud_link" className="inputFormProfileUSer"  
                                value={profile.soundcloud_link}
                                onChange={(e) => {updateProfile(e.target.name,e.target.value)}}
                            />
                        </label>
                        <label className="lblProfileUser">
                            Email:
                            <input type="text" name="email" className="inputFormProfileUSer" 
                                value={profile.email}
                                onChange={(e) => {updateProfile(e.target.name,e.target.value)}}
                            />
                        </label>
                        <div className="btnActionsProfileCont">
                            <button className="btnActProfile" type='submit'>
                                Update
                            </button>
                            <button className="btnActProfile">Cancel</button>
                        </div>
                    </form>
                    </div>
                </>
            } */}
        </div>
    )
}

export default AdminPanel;