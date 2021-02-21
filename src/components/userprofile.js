import React, { useState, useEffect } from 'react';
//helpers
import { check } from '../utils/helpers';
//components
import Loader from '../components/loader';
import Notifications from './notifications';
//constants
const userEP = process.env.GATSBY_userEP;

// TODO
//add a loader + lock smoothly the inputs so the user knows the info it is updating.
// after success on update data, present a notification somewhere "profile updated!!"

const UserProfile = () => {
    const userdata = check();

    const [loadingData, setLoadingData] = useState(true);
    const [profile, setProfile] = useState({
        avatar: "",
        banned: false,
        following: [],
        createdAt: Date,
        updatedAt: Date,
        fullname: "",
        username: userdata.username,
        location: "",
        bio: "",
        instagram_link: "",
        twitter_link: "",
        portfolio_link: "",
        soundcloud_link: "",
        email: "",
        _id: "",
    });

    /////////data fecthing PUT/GET////////
     ////////Fetching POST request to backend
     async function getData(url = '') {
        const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //   credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            // 'Content-Type': 'application/json'
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-access-token': userdata.token
        },
        //   redirect: 'follow', // manual, *follow, error
        //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        // body: new URLSearchParams({
        //         'username': username
        //     }),
        });
        return response; 
    };
    ////////END Fecthing GET to BE
    ///////PUT fetch = Update User data
    async function updateData(url = '', data) {
        const response = await fetch(url, {
        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //   credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'x-access-token': userdata.token
        },
        //   redirect: 'follow', // manual, *follow, error
        //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: new URLSearchParams(
            data
        ),
        });
        return response; 
    };
    ///////END Put fetch
    /////////end DATA fecthing////////////
       //update profile
       const handleUpdate = (event) => {
        event.preventDefault();
        //set updatedAt
        const updateDate = new Date();
        updateProfile('updatedAt', updateDate);
        updateData(`${userEP}update/${userdata.username}`,profile)
        .then(data => {
            data.json()
            .then(msg => {
                if(msg.auth === false){
                    console.log('Error on update!');
                    console.log(msg.message);
                }else{
                    console.log('Profiled Updated!');
                    console.log(msg);
                    //testing to set whole object as received
                    setProfile(msg);
                }
            });
        })
        .catch(error => {
            console.log('Error while updating user data to API.');
            console.log(error);
        });
    };
    //end update profile

    //handle profile's State 
    const updateProfile = (name,value) => {
        setProfile(prevState => {
            return {...prevState, [name]: value}
        });
    };
    //END profile's State

    /////////////////////////
    const mount = () => {
        console.log('mounted');
        //check for userprofile
        console.log(`Asking profile data from:${userdata.username}`);
        //TODO
        // maybe we could store the user data, until it chages in order to ask again and gain speed on loading >S ??
        getData(`${userEP}${userdata.username}`)
        .then(data => {
            data.json()
            .then(msg => {
                setLoadingData(false);
                console.log(msg);
                //testing to set whole object as received
                setProfile(msg);
            });
        })
        .catch(error => {
            console.log('Error while requesting user data to API.');
            console.log(error);
        });
        // ...end mount components
      
        const unmount = () => {
          // ...
        }
        return unmount
    };
    useEffect(mount, []);
    //end f/c on init/mounted
    /////////////////////////

    return (
        <div className="profileCont">
            <Notifications username={userdata.username} token={userdata.token}/>
            <h1>@{userdata.username} - Profile Page</h1>
            {
                loadingData ? <Loader logginIn={true} />
                    :
                    <>
                    <div className="userProfilePicCont">
                            <img src={userdata.profilePicUrl} className="userProfilePic" />
                    </div>
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
                </>
            }
        </div>
    )
}

export default UserProfile;