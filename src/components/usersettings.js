import React, { useEffect } from 'react';
// import { navigate } from "gatsby";
//hiveio/keychain
// import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//HOC components
// import { AuthContext } from '../components/HOC/authProvider';
//components
// import Layout from '../components/layout';
//helpers
import { check } from '../utils/helpers';

//constants
const notificationsEP = process.env.GATSBY_notiEP;

const UserSettings = () => {

    // const { state:userdata } = useContext(AuthContext);
    const userdata = check();

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
                'x-access-token': userdata.token,
            },
        });
        return response; 
    };
    //////END data fecthing PUT/GET
    ///////On Mount
    const mount = () => {
        //check for notifications
        console.log(`Check Noti for:${userdata.username}`);
        if(userdata.username && userdata.token){
            getData(`${notificationsEP}${userdata.username}`)
            .then(data => {
                console.log(data);
                data.json()
                
                .then(msg => {
                    console.log(msg);
                    //testing to set whole object as received
                    // setProfile(msg);
                    // setNoti(msg);
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

    return (
            <div>
                <h1>User Settings Page - protected route</h1>
                <h2>TODO</h2>
                <p>Hi there, {userdata.username}</p>
            </div>
    )
}

export default UserSettings;