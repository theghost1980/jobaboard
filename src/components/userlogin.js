import React, { useState, useContext, useEffect } from 'react';
// import { navigate } from "gatsby";
//hiveio/keychain
// import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//HOC components
// import { AuthContext } from '../../components/HOC/authProvider';
//components
import Layout from '../components/layout';

const UserLogin = (props) => {
    // const userdata = useContext(AuthContext);

    // const { userState } = props.location.state || false;

       /////////////////////////
    //functions/callbacks to run on init/mounted
    // const mount = () => {
    //     console.log('mounted');
    //     //check if logged
    //     if(!userState){
    //         console.log('protected route, please login');
    //         navigate("/");
    //     }else{
    //         // TODO
    //         //bring user's data from backEND, present.
    //     }
    //     // ...end mount components
        
    //     const unmount = () => {
    //         console.log('unmounted')
    //         // ...
    //     }
    //     return unmount
    // };
    // useEffect(mount, []);
    //end f/c on init/mounted
    /////////////////////////

    return (
            <div>
                <h1>User-Login Page - protected route callback</h1>
                <h2>TODO</h2>
            </div>
    )
}

export default UserLogin;