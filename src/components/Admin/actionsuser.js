import React, { useState } from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

import Loader from '../loader';

//constants
// const userEP = process.env.GATSBY_userEP;
const adminEP = process.env.GATSBY_adminEP;
//end constants

const Actionuser = (props) => {
    const { action, data } = props;
    const crazyGuy = (data.user === data.admin);
    const [sendingAction, setSendingAction] = useState(false);
    const [response, setResponse] = useState(null);

    /////graphql queries
    const dataQL = useStaticQuery(graphql`
     query { 
        banHammer: file(relativePath: {eq: "ban-hammer.jpeg"}) {
            childImageSharp {
                fixed(width: 120) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        }
        funnyGuy: file(relativePath: {eq: "funnyGuy.png"}) {
            childImageSharp {
                fixed(width: 320) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        }
    }`);
    /////end graphql

    /////////DATA fecthing////////////
    //--->>>     /ban/:username'
    async function postDataWT(url = '', _token, _data) { 
        console.log(`asking for:${url}`);
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'x-access-token': `${_token}`
            },
            body: new URLSearchParams({
                username: _data.username,
                reason: _data.reason,
            }),
        });
        return response.json(); 
    };
    ///////////////////////////////////////

    function handleAction(action){
        if(action){
            console.log("Ready to",action);
            setSendingAction(true);
            const _data = {
                username: data.user,
                reason: 'Bad MOFO!',
            }
            postDataWT(`${adminEP}ban/${data.user}`,data.token, _data)
            .then(response => {
                console.log(response);
                if(response.banned){
                    //user was banned.
                    // Reload user's list???? TODO
                    // present message on center screen with results.
                    // we should create a component just for messages on top of eveything
                    setSendingAction(false);
                    setResponse(`User ${data.user} was Banned!. You may close this window.`);
                }
            })
            .catch(error => {
                console.log('Error when banning user.',error);
            })
        }
    }

    return (
            <div className="standardContentMargin">
                {
                    !crazyGuy &&
                    <div>
                        <h3>Actions on Users</h3>
                        <p>Ready to {action} -> {data.user}</p>
                        {
                            (action === "ban") &&
                                <div className="standardDivColHalfW justiAlig">
                                    {
                                        sendingAction && <Loader logginIn={true} />
                                    }
                                    {
                                        (!sendingAction && !response) &&
                                        <>
                                            <div>
                                                <Img fixed={dataQL.banHammer.childImageSharp.fixed} />
                                            </div>
                                            <div>
                                                <button onClick={() => handleAction(action)}>Yes Ban Hammer. No mercy!</button>
                                            </div>
                                        </>
                                    }
                                    {
                                        response && <p>{response}</p>
                                    }
                                </div>
                        }
                        {
                            (action === "noti") &&
                                <div></div>
                        }
                        {
                            (action === "email") &&
                                <div></div>
                        }
                    </div>
                }
                {
                    crazyGuy && 
                    <div style={{ background: '#F7F7F7'}}>
                        <p className="centered">I cannot do that. Bad boy!.</p>
                        <Img fixed={dataQL.funnyGuy.childImageSharp.fixed} />
                    </div>
                }
            </div>
    )
}

export default Actionuser;