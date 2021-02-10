import React, { useEffect, useState } from 'react';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';

const Login = () => {
    const [hivekeychain, sethivekeychain] = useState(false);
    const [accountName, setAccountName] = useState(null);

    //initial test for hiveio/keychain to see if installed
    useEffect(() => {
        //initial test to see if hiveio/keychain installed on browser
        if(isKeychainInstalled){
            sethivekeychain(true);
            console.log('Hiveio/keychain is installed');
        }else{
            sethivekeychain(false);
            console.log('Hiveio/keychain Not installed');
        }
    },[]);

    const logginHiveKeyChain = async (event) => {
        event.preventDefault();

        if (accountName === null || accountName === ""){ return console.log("Input @username account please!")};

        const keyChain = await keychain(window, 'requestSignBuffer', accountName, 'test Saturnoman.com signbuffer hiveIO/keychain', 'Posting');

        const {data, success, msg, cancel, notInstalled, notActive} = keyChain;
        // All good
        if(success) {
            // do your thing
            // console.log(msg);
            console.log(keyChain);
            alert(`Welcome ${data.username}`);
            //now we could ask for this user's data and present it as:
            // - accountName, reputation, profileUrl on screen
            // and
            // - pass variables as context to the next page which is the postEditor.js
        }
        // User didn't cancel, so something must have happened
        else if(!cancel) {
          if(notActive) {
            alert('Please allow Keychain to access this website')
          } else if(notInstalled) {
            alert('Please install Keychain')
          } else {
            // error happened - check msg
            console.log(msg);
          }
        }
        
    };

    return (
        <div>
            <h1>Login</h1>
            {
                <div className="hiveKeyChainCont">
                    {
                        hivekeychain &&
                        <form onSubmit={logginHiveKeyChain} className="formLogin">
                            <input type="text" id="username" placeholder="@username here please" required 
                                onChange={(event) => setAccountName(event.target.value)}
                            />
                            <button type='submit' id="btnLogin">Login with HiveIO/Keychain</button>
                            <p>Or</p>
                        </form>
                    }
                </div>
            }
        </div>
    )
}

export default Login;