import React, { useEffect, useState } from 'react';
// import { navigate } from "gatsby";
//hiveio/keychain
// import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//components
import Layout from '../../components/layout';
// import Loader from '../../components/loader';
//constants
// const userEP = process.env.GATSBY_userEP;
// const secret = process.env.GATSBY_SECRET;

const Profile = (props) => {
    // console.log(props);
    // const [loadingData, setLoadingData] = useState(false);
    // //testing to redirect from here
    // const userdata = window.localStorage.getItem('_NoneOfYourBusiness');
    // if(userdata == null || userdata == ""){ navigate("/")};
    // //end testing
    // const [profile, setProfile] = useState({
    //     avatar: "",
    //     banned: false,
    //     following: [],
    //     createdAt: Date,
    //     updatedAt: Date,
    //     fullname: "",
    //     username: "",
    //     usertype: "",
    //     location: "",
    //     bio: "",
    //     instagram_link: "",
    //     twitter_link: "",
    //     portfolio_link: "",
    //     soundcloud_link: "",
    //     email: "",
    //     _id: "",
    // });

    /////////////////////////
    // const mount = () => {
    //     console.log('mounted');
    //     //check for userdata
    //     var userdata = localStorage.getItem('_NoneOfYourBusiness');
    //     if(userdata !== null && userdata !== ""){
    //         try {
    //             userdata = JSON.parse(userdata);
    //             if(userdata.token !== "" && userdata.token !== null){
    //                 //means the token is there so we can validate token.
    //                 //TODO validate token
    //                 console.log('TODO validate token & load DATA user');
    //             }
    //         } catch (error) {
    //             //if the parse do not work probably the data is corrupted
    //             // navigate("/");
    //             console.log(error);
    //         }
    //     }else{
    //         navigate("/");
    //         console.log('Redirect');
    //     }
    //     // TODO fix later on
    //     // if(!userdata.logged){
    //     //     console.log('protected route, please login');
    //     //     navigate("/");
    //     // }else{
    //     //     setLoadingData(true);
    //     //     getData(`${userEP}${userdata.username}`)
    //     //     .then(data => {
    //     //         data.json()
    //     //         .then(msg => {
    //     //             setLoadingData(false);
    //     //             console.log(msg);
    //     //             //testing to set whole object as received
    //     //             setProfile(msg);
    //     //         });
    //     //     })
    //     //     .catch(error => {
    //     //         console.log('Error while requesting user data to API.');
    //     //         console.log(error);
    //     //     });
    //     // ...end mount components
      
    //     const unmount = () => {
    //       console.log('unmounted')
    //       // ...
    //     }
    //     return unmount
    // };
    // useEffect(mount, []);
    //end f/c on init/mounted
    /////////////////////////

    ///////functions,callbacks
    ////////Fetching POST request to backend
    // async function getData(url = '') {
    //     const response = await fetch(url, {
    //     method: 'GET', // *GET, POST, PUT, DELETE, etc.
    //     mode: 'cors', // no-cors, *cors, same-origin
    //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //     //   credentials: 'same-origin', // include, *same-origin, omit
    //     headers: {
    //         // 'Content-Type': 'application/json'
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json',
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
    //handle profile's State 
    // const updateProfile = (name,value) => {
    //     setProfile(prevState => {
    //         return {...prevState, [name]: value}
    //     });
    // };
    //END profile's State
    //update profile
    // const handleUpdate = (event) => {
    //     event.preventDefault();
    //     //set updatedAt
    //     const updateDate = new Date();
    //     updateProfile('updatedAt', updateDate)
    //     updateData(`${userEP}update/${profile.username}`,profile)
    //     .then(data => {
    //         data.json()
    //         .then(msg => {
    //             console.log('Profiled Updated!');
    //             console.log(msg);
    //             //testing to set whole object as received
    //             setProfile(msg);
    //         });
    //     })
    //     .catch(error => {
    //         console.log('Error while updating user data to API.');
    //         console.log(error);
    //     });
    // };
    //end update profile
    ///////end f/c

    return (
        <Layout>
                <div className="profileCont">
                    <h1>@ - Profile Page</h1>
                    {/* {
                        loadingData ? <Loader logginIn={true} />
                            :
                            <form id="profileUserForm" onSubmit={handleUpdate}>
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
                    }*/}
                </div>
        </Layout>
    )
}

export default Profile;