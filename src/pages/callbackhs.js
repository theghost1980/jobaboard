import React, { useEffect } from 'react';
import { navigate } from 'gatsby';
//components
import Loader from '../components/loader';
//utils
import { encode } from '../utils/helpers';

// var hivesigner = require('hivesigner');
//constants
const authEP = process.env.GATSBY_authEP;
//end constants

//Methods for later on
// Custom json
// client.customJson(requiredAuths, requiredPostingAuths, id, json, function (err, res) {
//   console.log(err, res)
// });

const Callbackhs = (props) => {
    // const [profile, setProfile] = useState({
    //     access_token: "",
    //     username: "",
    //     expires_in: "",
    //     state: "",
    //     profilePicUrl: "",
    //     token:  "",
    //     logginIn:  true,
    //     usertype:  "",
    //     loginmethod: 'HS'
    // });
    // console.log(props);
    //to run only once on load, when the props are received
    useEffect(() => {
        const query = new URLSearchParams(props.location.search);
        const access_token = query.get('access_token');
        const username = query.get('username');
        if(access_token && username){
            const expires_in = query.get('expires_in');
            const state = query.get('state');
            // const client = new hivesigner.Client({
            //     app: 'jobaboard',
            //     callbackURL: 'http://localhost:8000/callbackhs',
            //     scope: ['vote', 'comment'],
            //     accessToken: access_token,
            // });
            //getprofile from BE, GET AUTH POST request.
            //now we must ask token on BE + bring usertype & profile_pic if any
            //////////////////BE POST AUTH request//////////
            //server back-end
            postData(`${authEP}checkGatsbySig2`, username)
            .then(data => {
                console.log(data);
                data.json()
                .then(msg => {
                    console.log(msg);
                    const { profile_PicURL, token, usertype, auth} = msg;
                    // //set all upcomming data.
                    if(auth){
                        //set localData, call check() & go to profile
                        const profile = {
                            profilePicUrl:  encode(profile_PicURL),
                            token:  encode(token),
                            access_token: encode(access_token), //used just for Hivesigner logged users
                            logged:  encode(true),
                            logginIn:  encode(false),
                            username:  encode(username),
                            usertype:  encode(usertype),
                            expires_in: encode(expires_in),
                            state: encode(state),
                            loginmethod: encode('HS'),
                        };

                        // console.log(profile);

                        const JSONprofile = JSON.stringify(profile);
                        localStorage.setItem("_NoneOfYourBusiness",JSONprofile);
                        //redirect to profile
                        // TODO maybe there should be a dashboard, with news, etc.
                        navigate("/app/profile");
                    }else{
                        //redirect person to login page
                        console.log('No possible to AUTH from BE server');
                        navigate("/app/login")
                    }
                })
            })
            .catch(error => {
                console.log('Error while logging to API.');
                console.log(error);
            });
            //end back-end
            ////////////////////////////////////////////////
            // client.me(function(err,res){
            //     if(err) return console.log('Error getting profile user Hivesigner');
            //     if(res){
            //         // console.log(res);
            //         //we have the profile, we can setDataUser, setDataUser.method: 'HS'.
            //         setProfile({
            //             access_token: access_token,
            //             username: username,
            //             expires_in: expires_in,
            //             state: state,
            //             logged: true,
            //             profilePicUrl: res.user_metadata.profile.profile_image,
            //             token:  "",
            //             logginIn:  false,
            //             usertype:  "",
            //             loginmethod: 'HS'
            //         });
            //     }
            // })
        }
    },[props.location.search]);

    //////////Fecthing/POST request////////////
    ////////Fetching POST request to backend
    async function postData(url = '', account) {
        const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //   credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            // 'Content-Type': 'application/json'
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        //   redirect: 'follow', // manual, *follow, error
        //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: new URLSearchParams({
                'account': account,
            }),
        });
        return response; 
    };
    ////////END Fecthing POST to BE
    ///////////////////////////////////////////

    //TODO as soon as we received the valid data
    //set localstorage encoded + the userdata, must now be defined as logged_with: 'HS' instead of 'KCH'.
    //so we should refactor all the check() function on helpers, in order to see how the user is logged in.
    // also we need to define diferent methods later on to: sign transactions, broadcast, using HS or KCH.

    // const getProfile = () => {
    //     if(profile.logged){
    //         const client = new hivesigner.Client({
    //             app: 'jobaboard',
    //             callbackURL: 'http://localhost:8000/callbackhs',
    //             scope: ['vote', 'comment'],
    //             accessToken: profile.access_token,
    //         });
    //         client.me(function(err,res){
    //             if(err) return console.log('Error getting profile user Hivesigner');
    //             if(res){
    //                 console.log(res);
    //                 //we have the profile, we can setDataUser, setDataUser.method: 'HS'.
    //             }
    //         })
    //     }
    // }

    // const logOutHS = () => {
    //     if(profile.logged){
    //         const client = new hivesigner.Client({
    //             app: 'jobaboard',
    //             callbackURL: 'http://localhost:8000/callbackhs',
    //             scope: ['vote', 'comment'],
    //             accessToken: profile.access_token,
    //         });
    //         client.revokeToken(function (err, res) {
    //             console.log(err, res)
    //         });
    //     }
    // }
    
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', width: '100%',
            height: '100vh'
        }}>
            {
                <Loader logginIn={true} />
            }
        </div>
    )
}

export default Callbackhs;