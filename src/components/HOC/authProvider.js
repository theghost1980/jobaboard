import React, { createContext, useEffect, useState } from 'react';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//utils
import { check } from '../../utils/helpers';
export const AuthContext = createContext('');
//constants
const initialState = check();
// console.log(initialState);
//end constants

const AuthProvider = ({children}) => {
    // const [userdata, setUserdata] = useState()
    const [userdata, setUserdata] = useState(initialState);

    const mount = () => {
        // console.log('mounted auth provider');
        // async function autoLogin(){
        //     //TODO
        // }
        handleState();
        // const unmount = () => {
        //     //   console.log('unmounted  auth provider')
        //     // handleState();
        //     // ...
        // }
        // return unmount
      }
    useEffect(mount, []);

    //handle user's State / userData
    // const updateData = (name,value) => {
    //     setUserdata(prevState => {
    //         return {...prevState, [name]: value}
    //     });
    // };
    // function setData(){
    //     const state = check();
    //     console.log(`State on authprovider:`);
    //     console.log(state);
    //     setUserdata(state);
    // }
    const handleState = () => {
        setUserdata(check());
    }
    //END special functions

    return (
        <AuthContext.Provider value={{ state: userdata, setData: handleState }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;