import React, { useState, useEffect } from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

// constants
const userEP = process.env.GATSBY_userEP;

// TODO a way to detect internet failures so it won't proceed.
/**
 * This component allows user to:
 * -> Detect if actual user is following the presented user. If not, allow user to follow/unfollow on hive.
 * --> Send the customJson using HiveKeychain, Wait for answer and send result to the future component called topMessenger.
 * @param {String} xclassCSS - The css Extra class you want to assign to the main cont.
 * @param {String} xclassCSSbuttons - A css extra class for the buttons. Applied for boths.
 * @param {String} token - Decoded access user token from userdata to being able to interact with the BE.
 * @param {String} interactTo - The hive's username to interact to. I.e: To follow/unfollow this person.
 * @param {function} btnAction - Call back to assign a value on each finished follow/unfollow actions.
 */

const Follower = (props) => {
    const { xclassCSS, btnAction, token, interactTo, xclassCSSbuttons } = props;
    const [following, setFollowing] = useState([]);
    const [alreadyFollowing, setAlreadyFollowing] = useState(false);

    //functions/CB
    function updateField(query = {}){
        // TODO set an extra header as queryReturned as { field1: 1, field2: 1,...}
        const headers = { 'x-access-token': token,'query': JSON.stringify(query)};
        console.log('Sending headers as:',headers);
        postUserData(userEP+ "updateUserField",headers)
        .then(response => {
            console.log(response);
            if(response.status === "sucess"){
                setFollowing(response.result.following);
            }
        }).catch(error => console.log('Error updating user field.',error));
    }
    const followUser = () => {
        if(interactTo){
            const found = following.filter(user => user === interactTo);
            console.log(found);
            if(found.length === 0){
                //we can follow as not present
                updateField({ $push: { following: interactTo }});
            }
        }
    }
    const unfollowUser = () => {
        if(interactTo){
            const found = following.filter(user => user === interactTo);
            console.log(found);
            if(found.length >= 1){ //in case by any means was added a user twice.
                //we can unfollow as present
                updateField({ $pull: { following: interactTo }});
            }
        }
    }
    //END functions/CB

    //Data fecthing
    async function getUserData(url = '', headers = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: headers,
        });
        return response.json(); 
    };
    async function postUserData(url = '', headers = {}) {
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: headers,
        });
        return response.json(); 
    };
    //END Data fecthing

    //Calling on load
    useEffect(() => {
        //get the user's following field.
        const headers = { 'x-access-token': token, 'query': JSON.stringify({ following: 1}), };
        console.log('Asking to:',userEP+"jabUserField");
        getUserData(userEP+"jabUserField",headers)
        .then(response => {
            console.log(response);
            if(response.status === "sucess"){
                setFollowing(response.result.following);
            }
        }).catch(error => console.log('Error fetching user field BE.',error));
    },[]);
    //END Calling on load

    // calling on state changes
    useEffect(()=>{
        console.log(`Following:`,following);
        if(following){
            const found = following.filter(user => user === interactTo);
            if(found.length >= 1){ 
                setAlreadyFollowing(true);
            }else{
                setAlreadyFollowing(false);
            }
        }
    },[following]);
    // end on state changes

    const data = useStaticQuery(graphql`
        query{
            followIcon: file(relativePath: {eq: "follow.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            unfollowIcon: file(relativePath: {eq: "unfollow.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries

    const clicked = () => {
        // btnAction();
        console.log('I was clicked!');
    };

    return (
        <div className={`${xclassCSS} standardFlex120Col marginAuto justiAlig`}>
            <div className="standardFlex120Row justiAlig">
                {
                    alreadyFollowing ?
                        <div>
                            <div className={`${xclassCSSbuttons} standardFlex120Row marginTopRigthMin hoverText pointer justiAlig`}
                                onClick={unfollowUser}
                            >
                            <Img fixed={data.unfollowIcon.childImageSharp.fixed} title="Unfollow"  />
                            <p className="normalTextSmall textToHover">Unfollow</p>
                            </div>
                        </div>
                        :
                        <div>
                            <div className={`${xclassCSSbuttons} standardFlex120Row marginTopRigthMin hoverText pointer justiAlig`}
                                onClick={followUser}
                            >
                                <Img fixed={data.followIcon.childImageSharp.fixed} title="Follow"/>
                                <p className="normalTextSmall textToHover">Follow</p>
                            </div>
                        </div>
                }
            </div>
        </div>
    )
}

export default Follower;