import React, { useEffect } from 'react';
import { navigate } from "gatsby";
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//components
import Layout from '../../components/layout';

const Profile = () => {
    //first check on password in case anyone try to access the link on browser
    // first things first we check if has used keychain to force auto-login.
    useEffect(() => {
        async function firstCheck(){
        if(hasKeychainBeenUsed){
            const dataH = localStorage.getItem("jobAboard");
            if(dataH !== null && dataH !== ""){
                // let dataHJSON = "";
                // try {
                //     dataHJSON = JSON.parse(dataH);
                //     if(dataHJSON.username !== null && dataHJSON.username !== "" && !dataHJSON.logged){
                //         const keyChain = await keychain(window, 'requestSignBuffer', dataHJSON.username, 'loggin in jobAboard signbuffer hiveIO/keychain', 'Posting');
                //         const {data, success} = keyChain;
                //         if(success){
                //             setAccount(data.username);
                //             setLogged(true);
                //         }
                //     } else if (dataHJSON.logged){ 
                //         setAccount(dataHJSON.username);
                //         setLogged(dataHJSON.logged);
                //         setProfilePic(dataHJSON.profile_image);
                //     }
                // } catch (error) {
                // //todo
                // }
            } else {//means no data present on local storage.
                alert('protected route, please login');
                navigate("/");
                return null
            }
        }else {//if no use of hive-keychain redirect at once.
            alert('protected route, please login');
            navigate("/");
            return null
        }
    }
        firstCheck();
    });

    return (
        <Layout>
            <div>
                <h1>Profile Page - protected route</h1>
                <h1>TODO</h1>
            </div>
        </Layout>
    )
}

export default Profile;