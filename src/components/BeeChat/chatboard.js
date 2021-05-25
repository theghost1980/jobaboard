import React, { useState, useEffect, useRef } from 'react';
import { fecthDataRequest, formatDateTime } from '../../utils/helpers';
import Img from 'gatsby-image';
import { graphql, useStaticQuery } from "gatsby"

// constants
const userEP = process.env.GATSBY_userEP;
const beechatEP = "https://beechat.hive-engine.com/api/";

/**
 * Display the danger icon. 
 * Note: Must set the "relativeDiv" class always!
 * @param {String} chatStatus - Mandatory as the actual status of the socketBee. "online" is required to perform any OP.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Object} _conversation - Info about the current conversation set to show/handle.
 * @param {Function} cbHandlePayloadOUT - The function/CB to handle the payloads sent/received to pass to socketBee.
 * @param {Object} incommingMsg - The payload of chat-message to receive from socketBee.
 * @param {String} username - Username to pass on.
 */

const Chatboard = (props) => {
    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            checked: file(relativePath: {eq: "checked.png"}) {
                childImageSharp {
                    fixed(width: 17) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            dchecked: file(relativePath: {eq: "double_checked.png"}) {
                childImageSharp {
                    fixed(width: 17) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            smile: file(relativePath: {eq: "smileCool.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            dots_icon: file(relativePath: {eq: "dots_icon.png"}) {
                childImageSharp {
                    fixed(width: 15) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            owner_icon: file(relativePath: {eq: "owner.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhql queries

    const { xclassCSS, _conversation, cbHandlePayloadOUT, username, incommingMsg, chatStatus, leaveCB } = props;
    const [currentChat, setCurrentChat] = useState([]); //in case i forget to set it when using it.
    const [conversation, setConversation] = useState([]);
    const [inputChat, setInputChat] = useState("");
    const inputRef = useRef(null);

    //functions/CB
    const handleDataChat = (event) => {
        if((event.key === 'Enter' || event.target.id === "btnSendChatData") && inputChat && chatStatus === "online"){
            const members = conversation.members.filter(member => member !== username);
            console.log('Sending:',inputChat);
            console.log('Sending to:');
            console.log(members);
            console.log(`Current conversation.id:${conversation.id}`);
            console.log(`Current conversation type: ${conversation.type}`);
            cbHandlePayloadOUT({
                "type": "chat-message",
                "payload": {
                  "conversation_id": conversation.id,
                  "to": conversation.type === "dm" ? members[0] : null,
                  "message": inputChat,
                }
            });
            // if(conversation.type === "dm"){
            //     cbHandlePayloadOUT({
            //         "type": "chat-message",
            //         "payload": {
            //           "conversation_id": conversation.id,
            //           "to": members[0],
            //           "message": inputChat,
            //         }
            //     });
            //     // members.forEach(member => {
            //     //     cbHandlePayloadOUT({
            //     //         "type": "chat-message",
            //     //         "payload": {
            //     //           "conversation_id": conversation.id,
            //     //           "to": member,
            //     //           "message": inputChat,
            //     //         }
            //     //     });
            //     //     // sendPayloadSocket({
            //     //     //     "type": "chat-message",
            //     //     //     "payload": {
            //     //     //       "conversation_id": conversation.id,
            //     //     //       "to": member,
            //     //     //       "message": inputChat,
            //     //     //     }
            //     //     // });
            //     // })
            // }else{
            //     cbHandlePayloadOUT({
            //         "type": "chat-message",
            //         "payload": {
            //           "conversation_id": conversation.id,
            //           "to": null,
            //           "message": inputChat,
            //         }
            //     });
            //     // sendPayloadSocket({
            //     //     "type": "chat-message",
            //     //     "payload": {
            //     //         "conversation_id": conversation.id,
            //     //         "to": null,
            //     //         "message": inputChat,
            //     //     }
            //     // });
            // }
            inputRef.current.value = "";
            setInputChat("");
        }
    }
    function lookUp(item, tofind){
        return String(item) === String(tofind); 
    }
    /////data fecthing
    async function getUserData(url = '', headers = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: headers,
        });
        return response.json(); 
    };
    /////END data fetching
    //END functions/CB

    // on init
    // useEffect(() => {
        
    // },[]);
    // END on init

    //On each change of state
    // useEffect(() => {
    //     if(userList.length > 0){
    //         console.log(userList);
    //         console.log(userList.find(user => user.username === 'theghost1980').avatar)
    //     }
    // },[userList]);
    useEffect(() => {
        if(incommingMsg){
            console.log('Received from > general testings > Socket Bee :D ->',incommingMsg);
            if(incommingMsg.conversation_id === conversation.id){
                setCurrentChat(prevState => [...prevState, incommingMsg]);
            }else{
                //we handle it per user config.
                // if show any on all site. use the topmessnger
                // if show a particular user messenger as well
                // else non...just activate unread with dispatcher or pass directly to usermenu
            }
        }
    }, [incommingMsg]);
    useEffect(() => {
        if(conversation && conversation.id && chatStatus === "online"){
            console.log('Getting conv id:',conversation.id);
            const token = localStorage.getItem("bToken");
            fecthDataRequest(beechatEP + `messages/chats?conversation_id=${conversation.id}`,token)
            .then(response => {
                setCurrentChat(response); 
                cbHandlePayloadOUT({ //send the payload as read for this conversation
                    "type": "acknowledgment",
                    "payload": {
                        "conversation_id": conversation.id
                    }
                });
            }).catch(error => console.log('Error while getting a conversation.',error));
        }
    }, [conversation]);
    useEffect(() => {
        if(_conversation && _conversation.id){
            console.log(_conversation);
            setConversation(_conversation);
        }
    }, [_conversation]);
    useEffect(() => {
        if(currentChat.length > 0){
            const fixedCont = document.querySelector("div.beeChatFixedCont");
            const arrayDivs = document.querySelectorAll("div.beeChatFixedMsgCont");
            const lastDivMessages = arrayDivs[arrayDivs.length - 1];
            // fixedCont.scrollIntoView({inline: "start", behavior: "smooth"});
            // lastDivMessages.scrollIntoView({block: "end", behavior: "smooth"});
            fixedCont.scrollTo({
                top: lastDivMessages.getBoundingClientRect().bottom,
                behavior: "smooth",
            })
        }
    }, [currentChat]);
    // END On each change of state
  
    return (
        <div className="standardDivColFullW">
            {
                (!currentChat || currentChat.length === 0) &&
                <div>
                    <p className="textAlignedCenter">Please select a chat to open here.</p>
                </div>
            }
            {
                (currentChat && currentChat.length > 0) &&
                <div>
                    <div className="beeChatFixedCont">
                    {
                        currentChat.map(message => {
                            const ImgSrc = message.read ? data.dchecked.childImageSharp.fixed : data.checked.childImageSharp.fixed
                            return (    
                                <div key={message.timestamp} className={`${'standardFlex100AutoH'} ${username !== message.from ? 'justAlignEnd': null}`}>
                                    <div className={'beeChatFixedMsgCont relativeDiv'} key={message.timestamp}>
                                        <span className="miniPaddings minWidth">{message.content}</span>
                                        <Img fixed={ImgSrc} className="miniIconAbs" title={message.read ? 'Delivered & Read' : 'Delivered not read yet'} />
                                        {/* {
                                            message.from === getStoredField("username") &&
                                            <div className="miniDivAbsRight justbackground">
                                                <Img fixed={data.dots_icon.childImageSharp.fixed} />
                                                <ul className="showOptionsHovered standardUlHide smallText">
                                                    <li onClick={() => sendPayload("delete-message", { "id": message.id })}>
                                                        Delete
                                                    </li>
                                                </ul>
                                            </div>
                                        } */}
                                    </div>
                                    <p className="beeChatTsFrom">{message.from} wrote at {formatDateTime(message.timestamp)}</p>
                                </div>
                            )
                        })
                    }
                    </div>
                    <div className="inputSenderCont">
                        <label htmlFor="inputChat miniMarginLeft">Input:</label>
                        <input className="miniMarginLeft" 
                            type="text" 
                            name="inputChat" 
                            autoFocus 
                            onChange={(e) => setInputChat(e.target.value)}
                            onKeyDown={handleDataChat}
                            ref={inputRef}
                            className="justWebKitFillAvail"
                            />
                        <button id="btnSendChatData" className="miniMarginLeft" onClick={handleDataChat}>Send</button>
                        <div className="btnEmoticonsChat miniMarginLeft">
                            <Img fixed={data.smile.childImageSharp.fixed} />
                        </div>
                    </div>
                    <div className="standardDivRowFullW justSpaceBewteen">
                        <button onClick={() => setCurrentChat([])}>Close</button>
                        <button onClick={() => leaveCB()}>Leave</button>
                    </div>
                </div>
            }
        </div>
    )
}

export default Chatboard;