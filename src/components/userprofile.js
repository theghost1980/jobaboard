import React, { useState, useEffect } from 'react';
//helpers
import { check, encode, formatDateTime } from '../utils/helpers';
//components
import Loader from '../components/loader';
import { navigate } from 'gatsby';

import { useDispatch } from 'react-redux';
import { setStored } from '../features/socket/socketSlice';

// import Img from 'gatsby-image';

//TODO make this as a module in > utils
//cloudinary
// import { Cloudinary } from "@cloudinary/base";
// import { format } from '@cloudinary/base/actions/delivery';
// import { jpg } from '@cloudinary/base/qualifiers/format';
// import { png } from '@cloudinary/base/qualifiers/animatedFormat';
// // Create and configure your Cloudinary instance.
// const cld = new Cloudinary({
//     cloud: {
//       cloudName: 'dbcugb6j4'
//     }
//   }); 
/////////////////////

//constants
const userEP = process.env.GATSBY_userEP;

// TODO
//add a loader + lock smoothly the inputs so the user knows the info it is updating.
// after success on update data, present a notification somewhere "profile updated!!"

const UserProfile = () => {
    const userdata = check();
    const [loadingData, setLoadingData] = useState(true);
    const [uploadingData, setuploadingData] = useState(false);
    const [following, setFollowing] = useState(null);
    //state to test the image uploading and then received here as response.secure_url
    // const [imageUploaded, setimageUploaded] = useState("");

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
        file: File,
    });

    //testing to set here the readDataLS of redux
    const dispatch = useDispatch();
    dispatch(setStored(true));

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
            'x-access-token': userdata.token
        },
        });
        return response; 
    };
    async function getDataWH(url = '', headers = {}) {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors', 
            headers: headers,
        });
        return response.json(); 
    };
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
    //now update data with put + file, using the same as the uploadimage
    async function updateDataWTFileImg(url = '', formData) {
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token
            },
            body: formData,
        });
        return response.json(); 
    };
    ///////END post fetch

    ///testing just to handle the image
    // async function updateImg(url = '', formData) {
    //     const response = await fetch(url, {
    //         method: 'POST', //
    //         mode: 'cors', // no-cors, *cors, same-origin
    //         headers: {
    //             'x-access-token': userdata.token
    //         },
    //         //   redirect: 'follow', // manual, *follow, error
    //         //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    //         body: formData,
    //     });
    //     return response.json(); 
    // };
    /////end testing image handling

    /////////end DATA fecthing////////////
       //update profile
       const handleUpdate = (event) => {
        event.preventDefault();
        //set updatedAt
        const updateDate = new Date();
        updateProfile('updatedAt', updateDate);
        //old method without the profile image in it and as form-url-encoded in headers content-type
        // updateData(`${userEP}update/${userdata.username}`,profile)
        // .then(data => {
        //     data.json()
        //     .then(msg => {
        //         if(msg.auth === false){
        //             console.log('Error on update!');
        //             console.log(msg.message);
        //         }else{
        //             console.log('Profiled Updated!');
        //             console.log(msg);
        //             //testing to set whole object as received
        //             setProfile(msg);
        //         }
        //     });
        // })
        // .catch(error => {
        //     console.log('Error while updating user data to API.');
        //     console.log(error);
        // });
        setuploadingData(true);
        const formdata = new FormData();
        if(profile.file){
            formdata.append("file",profile.file, profile.file.name);
        }
        formdata.append("avatar", profile.avatar);
        formdata.append("updatedAt", updateDate);
        formdata.append("fullname", profile.fullname);
        formdata.append("location", profile.location);
        formdata.append("bio", profile.bio);
        formdata.append("instagram_link", profile.instagram_link);
        formdata.append("twitter_link", profile.twitter_link);
        formdata.append("portfolio_link", profile.portfolio_link);
        formdata.append("soundcloud_link", profile.soundcloud_link);
        formdata.append("email", profile.email);
        // formdata.append("profile", profile);

        updateDataWTFileImg(`${userEP}update/${userdata.username}`,formdata)
        .then(data => {
            if(data.auth === false){
                console.log('Error on update!');
                console.log(data.message);
                setuploadingData(false);
            }else{
                console.log('Profiled Updated!');
                console.log(data);
                //TODO ask data from BE again to update the localStorage DATA
                //----->> TODO.
                //modify only the profile PIC as the other data is still valid
                //read data from ls
                const lsProfile = localStorage.getItem("_NoneOfYourBusiness");
                const lsProfileJSON = JSON.parse(lsProfile);
                lsProfileJSON.profilePicUrl = encode(data.avatar);
                //stringify 
                const strLsProfile = JSON.stringify(lsProfileJSON);
                //now save again.
                localStorage.setItem("_NoneOfYourBusiness",strLsProfile);
                //praise the lord, plug & pray.
                //testing results: 

                //testing to set whole object as received
                setProfile(data);
                //force reload components per navigate to profile again
                navigate("/app/profile");
                setuploadingData(false);
            }
        })
        .catch(error => {
            console.log('Error while updating user data to API + image.',error);
            setuploadingData(false);
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

    const uploadedImage = React.useRef(null);

    const selectedImgFile = (event) => {
        // console.log(event.target.files[0].name);
        if(event.target.files === null){ return console.log('User cancelled uploading image!')}
        const imgFile = event.target.files[0];
        if(imgFile.type === "image/jpeg" || imgFile.type === "image/png"){
            const { current } = uploadedImage;
            current.file = imgFile;
            const reader = new FileReader();
            reader.onload = e => {
                current.src = e.target.result;
            };
            reader.readAsDataURL(imgFile);

            //now we pass the file as a test
            updateProfile('file',event.target.files[0]);
            /////////////
            ///testing uploading one image to BE
            // const formData = new FormData();
            // formData.append("file", event.target.files[0], imgFile.name);
            // formData.append( "name", String(imgFile.name).split(".")[0]);
            // //add a loader or something to show progress to user....
            // setuploadingData(true);
            // updateImg(userEP+"saveImage",formData)
            // .then(response => {
            //     // console.log(response);
            //     //response received
            //     if(typeof response === 'object'){
            //         //check now for secure_url property
            //         setimageUploaded(response.secure_url);
            //         console.log(`Showing bellow:${response.secure_url}`);
            //     }
            //     setuploadingData(false);
            //     //now we print the image bellow as the image we have received:
            //     // 
            // })
            // .catch(error => {
            //     console.log('Error uploading img to BE',error);
            //     //error received
            //     setuploadingData(false);
            // })
            ///end testing
            ////////////
        }else{
            console.log('File Must be Image type: jpeg/png.');
            return null
        }
    }

    /////////////////////////
    const mount = () => {
        console.log('mounted');
        // const headers = { 'x-access-token': userdata.token, 'tolookup': null, 'query': JSON.stringify({ following: 1 })};
        // getDataWH(userEP+"jabUserField",headers).then(response => {
        //     console.log(response);
        //     if(response.status === "sucess" && response.result.following.length > 0){
        //         const _following = response.result.following;
        //         if(_following.length === 1 && _following[0] === ""){
        //             return setFollowing(null);
        //         }
        //         setFollowing(response.result.following);
        //     }
        // }).catch(error => console.log('Error asking for following field',error));
        //check for userprofile
        console.log(`Asking profile data from:${userdata.username}`);
        //TODO
        // maybe we could store the user data, until it chages in order to ask again and gain speed on loading >S ??
        getData(`${userEP}${userdata.username}`)
        .then(data => {
            data.json()
            .then(msg => {
                console.log('User profile');
                console.log(msg);
                //testing to set whole object as received
                setProfile(msg);
                if(msg.following){
                    setFollowing(msg.following);
                }
                setLoadingData(false);
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
            {
                loadingData ? <Loader logginIn={true} typegif={"spin"} />
                    :
                    <>
                    <div className={`rowContainer ${uploadingData ? 'disableDiv': null}`}>
                        <div className="rowRightPicContainer">
                            <div className="userProfilePicCont">
                                <img src={profile.avatar} 
                                    className="userProfilePic" 
                                    ref={uploadedImage}    
                                    alt={profile._id}
                                />
                            </div>
                            <div className="profilePicSelector">
                                {/* <label className="miniText margins">{profile.avatar}</label> */}
                                <input type="file" 
                                    onChange={selectedImgFile} 
                                    accept="image/*"
                                    multiple={false} 
                                />
                                {/* <img ref={uploadedImage} src={imageUploaded} />
                                {
                                    uploadingData && <p>Uploading Image to server....</p>
                                } */}
                            </div>
                            {
                                (profile.createdAt) &&
                                <div className="smallText">
                                    <div className="standardFlexColBordered width90 justiAlig marginsTB justRounded">
                                        <p className="minimumMarginTB">JAB Member Since:</p>
                                        <p className="minimumMarginTB">{formatDateTime(profile.createdAt)}</p>
                                    </div>
                                    {   
                                        profile.updatedAt &&
                                        <div className="standardFlexColBordered width90 justiAlig marginsTB justRounded">
                                            <p className="minimumMarginTB">Last Update on Profile:</p>
                                            <p className="minimumMarginTB">{formatDateTime(profile.updatedAt)}</p>
                                        </div>
                                    }
                                    {   
                                        following &&
                                        <div className="standardFlexColBordered width90 marginsTB justRounded">
                                            <div className="standardContentMargin">
                                                <p className="minimumMarginTB">JABers I follow:</p>
                                                <ul className="overflowYscroll justMaxHeight">
                                                    {
                                                        following.map(user => {
                                                            return (
                                                                user ?  <li key={`${user}-JABerIFollow`}>
                                                                            <a href={`/portfoliouser?query=${user}`} className="aFlexAlignedCont" target="_blank" rel="noopener noreferrer">{user}</a>
                                                                        </li> : null
                                                            )
                                                        })
                                                    }
                                                    
                                                </ul>
                                            </div>
                                        </div>
                                    }
                                </div>
                            }
                            {
                                uploadingData &&
                                    <div>
                                        <Loader logginIn={true} typegif={"dots"} />
                                    </div>
                            }
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
            }
        </div>
    )
}

export default UserProfile;