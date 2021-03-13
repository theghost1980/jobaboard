//libs
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//JWT
const jwt = require('jsonwebtoken');
//constants
const secret = process.env.GATSBY_SECRET;
//helper functions/callbacks
// export const isBrowser = () => typeof window !== "undefined";

export function encode( str ) {
    return window.btoa(unescape(encodeURIComponent( str )));
}

export function decode( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}
export function iterateEntries(node) {
    const newNode = {};
    Object.entries(node).forEach(([key, val]) => (newNode[key] = decode(val)));
    return newNode;
}

export const isBrowser = () => typeof window !== "undefined"
export const check = () =>
  isBrowser() 
    ? checkIt()
    : { logged: false, username: "", profilePicUrl: "", usertype: "", logginIn: false, token: ""}
    
//check data on local storage function
export function checkIt(){
    var userdata = {
        logged: false,
        username: "",
        profilePicUrl: "",
        usertype: "",
        logginIn: false,
        token: "",
        loginmethod: "",
        access_token: "",
        banned: false,
    }
    if(typeof window !== "undefined"){
        if(isKeychainInstalled && hasKeychainBeenUsed){
            const data = localStorage.getItem('_NoneOfYourBusiness');
            if(data && data !== null && data !== ""){
                try {
                    const dataJson = JSON.parse(data);
                    // console.log(dataJson);
                    const dataJsonDeco = iterateEntries(dataJson);
                    // console.log(dataJsonDeco);
                    if(dataJsonDeco.token && dataJsonDeco.token !== null && dataJsonDeco.token !== ""){
                        jwt.verify(dataJsonDeco.token, secret, function(err, decoded){
                            if(err){
                                console.log('Error while verifying token');
                                //force auto-login
                            }
                            if(!decoded){
                                console.log('Invalid Token');
                                //test to delete the userdata from browser to prevent problems and unnecessary checks.
                                localStorage.removeItem('_NoneOfYourBusiness');
                                console.log('userdata Removed from local storage!!!!');
                                //force auto-login
                            }else if(decoded){
                                // TODO: depending on which loginmethod, fill data
                                // or maybe just iterate and assign???
                                // TODO: -> use the banned param comming from server to allow or deny logs in
                                userdata = {
                                    logged: true,
                                    username: dataJsonDeco.username,
                                    profilePicUrl: dataJsonDeco.profilePicUrl,
                                    usertype: dataJsonDeco.usertype,
                                    logginIn: false,
                                    token: dataJsonDeco.token,
                                    loginmethod: dataJsonDeco.loginmethod,
                                    access_token: dataJsonDeco.access_token,
                                    banned: dataJsonDeco.banned,
                                }
                                console.log('Still valid, used data on localstorage.');
                            }
                        });
                    }else{
                        console.log('Token not present!!!');
                    }
                } catch (error) {
                    console.log('Error while trying to parse, data corrupted or changed!!!');
                    console.log('TODO auto-login');
                    // console.log(error);
                }
            }else{//force auto-login
                console.log('No userdata present.');
                console.log('TODO auto-login');
            }
            return userdata;
        }else{
            //not installed or not able to reach
            console.log('If you are using Chrome, there is a bug. Just before log in, click on the hive-keychain extension first.');
            console.log('Maybe the extension is not installed, please go to http://www,getthextensionhere.com');
            return userdata;
        }
    }else{
        return userdata;
    }
}
//end h/c