import React, { useState, useEffect, useRef } from 'react';
import Img from 'gatsby-image';
import { graphql, useStaticQuery } from "gatsby"
//tab component
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Btnswitch from '../btns/btnswitch';
//helpers
import { formatDateTime, fecthDataRequest, getStoredField, sendPayloadSocket, socket, authSocket, setStoredField, initSocket } from '../../utils/helpers';
import Loader from '../loader';

//testing react/redux
import { useDispatch } from 'react-redux';
import { setNewMessages } from '../../features/notifications/notiSlice';
import Mesaggertop from '../messages/mesaggertop';
// end testing 

//constants
const beechatEP = "https://beechat.hive-engine.com/api/";
const epsBee = [
    { ep: "/messages/new",lsItem: "unread"},
    { ep: "messages/conversations",lsItem: "oldchats"},
    { ep: "users/friends",lsItem: "friendList"},
    { ep: "/users/friend-requests",lsItem: "friendRequests"},
    { ep: "users/settings",lsItem: "settings"},
    { ep: "users/channels",lsItem: "channels"},
]

// todo set a timer depending on user general>chat>settings
// logic so far:
// - as soon as I click on fixedbeechat, connect socket + auth to server
// - get all the data
// and test to see how the server sends you the message to refresh token 

const Beechatfixed = () => {

    const _socket = socket;

    const username = getStoredField("username");

    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            friends_icon: file(relativePath: {eq: "friends.png"}) {
                childImageSharp {
                    fixed(width: 30) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            blocked_icon: file(relativePath: {eq: "blocked.png"}) {
                childImageSharp {
                    fixed(width: 30) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
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
    
    // const [beeTokens, setBeeTokens] = useState(null); TODO set this tokens same from beechatchecker
    const [unread, setUnread] = useState([]);
    const [oldchats, setOldchats] = useState([]);
    const [currentChat, setCurrentChat] = useState([])
    const [friendList, setFriendList] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [settings, setSettings] = useState(null);
    const [channels, setChannels] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    //channels menu
    const [createChannel, setCreateChannel] = useState(false);
    // end channels menu
    const [inputChat, setInputChat] = useState("");
    // settings
    const [toUpdate, setToUpdate] = useState(false);
    // end settings
    const [loadingData, setLoadingData] = useState(false);
    const [conversation, setConversation] = useState(null);
    const inputRef = useRef(null);

    //testing react/redux
    const dispatch = useDispatch();
    // end testing

    //for incomming messages
    const [incommingMsg, setIncommingMsg] = useState(null);
    // end for incomming messages

    // const [socket2, setSocket2] = useState(socket);
    const [deleted, setDeleted] = useState(false);
    // const [read, setRead] = useState(false);

    //check for local data to load.
    useEffect(() => {
        // here we should check again for the socket and try to open it again
        // if the user has reload the page
        if(_socket){
            console.log('Socket Still Here so we may use it');
        }else{
            console.log('Socket Not Here so we should fire a re-connection!!!');
            initSocket();
        }
        //as final method we get the data on each mount straigh from API & set all states.
        console.log(`Current currentchatid when loading this component: ${getStoredField("currentchatid")}`)
        const actualToken = getStoredField("bt");
        setLoadingData(true);
        var count = 0;
        epsBee.forEach(epData => {
            count++;
            fecthDataRequest(beechatEP + epData.ep,actualToken)
            .then(response => {
                console.log(`Results from: ${epData.ep}`);
                console.log(response);
                //here we set the states as they come
                if(epData.lsItem === "unread"){
                    setUnread(response);
                }else if(epData.lsItem === "oldchats"){
                    setOldchats(response);
                }else if(epData.lsItem === "friendList"){
                    setFriendList(response);
                }else if(epData.lsItem === "friendRequests"){
                    setFriendRequests(response);
                }else if(epData.lsItem === "settings"){
                    setSettings(response);
                }else if(epData.lsItem === "channels"){
                    setChannels(response);
                }
                if(count >= epsBee.length){ setLoadingData(false)};

            }).catch(error => console.log(`Error getting ${epData.lsItem}`,error));
        });
        //unmount must set the currentchatid to "" as for now we only use this on the chat
        return () => {
            if(localStorage.getItem("_NoneOfYourBusiness") !== null){
                console.log("Cleared of currentchatid");
                setStoredField("currentchatid","");
            }
        };
    },[]);

    useEffect(() => {
        if(conversation && conversation.id){
            //now we ask the currentChat and present when received.
            // we could show a loader but a different one
            console.log(`Conversation set as id:${conversation.id}`);
            console.log('Getting chat id: ', conversation.id);
            //we set in LS
            setStoredField("currentchatid",conversation.id);
            const token = getStoredField("bt");
            fecthDataRequest(beechatEP + `messages/chats?conversation_id=${conversation.id}`,token)
            .then(response => {
            setCurrentChat(response);
            // console.log(response);
            const count = response.filter(msg => msg.read === true).length;
            if(count > 0){
                sendPayloadSocket({
                    "type": "acknowledgment",
                    "payload": {
                      "conversation_id": conversation.id,
                    }
                });
            }
            getUnread();
            }).catch(error => console.log('Error while getting a conversation.',error));
        }
    }, [conversation]);

    useEffect(() => {
        if(currentChat.length > 0){
            const fixedCont = document.querySelector("div.beeChatFixedCont");
            const arrayDivs = document.querySelectorAll("div.beeChatFixedMsgCont");
            const lastDivMessages = arrayDivs[arrayDivs.length - 1];
            fixedCont.scrollIntoView({block: "center", behavior: "smooth"});
            lastDivMessages.scrollIntoView({block: "start", behavior: "smooth"});
        }
        //try to set the socket as the initial one

    }, [currentChat]);

    function addMessage(msg){
        //filter to see if belongs to current chat or no
        const currentConversation = getStoredField("currentchatid");
        console.log(`Current conversation id on addMessage:${currentConversation}`);
        if(currentConversation){
            console.log(`Current stored Conversation id: ${currentConversation}`);
            if(msg.conversation_id === currentConversation){
                console.log('Same id adding to currentChat');
                setCurrentChat(prevState => [...prevState, msg]);
                //set as read right now
                sendPayloadSocket({"type": "acknowledgment","payload": {"conversation_id": msg.conversation_id,}
                });
                // TODO the logic when "acknowledged" comes in
            }else{
                console.log('Not Same || conversation not set yet... fire request to unread....');
                setIncommingMsg(msg);
                // TODO. take the advantage of the redux store, so we can also handle as a state
                // the incomming messages, to be shown on top of all the app
                // also todo -> add the link so when the user click on it, it will go directly to the chat.
                // this may be a general chat setting as well.
                getUnread();
            }
        }else{
            console.log('currentConversation not set..Please dev check!!');
            setIncommingMsg(msg);
            getUnread();
        }
    }

    function getUnread(){
        const actualToken = getStoredField("bt");
        fecthDataRequest(beechatEP + "/messages/new",actualToken)
        .then(response => {
            setUnread(response);
            // console.log(response);
            (response.length > 0) ? setStoredField("newmessages","true") : setStoredField("newmessages","false");
            (response.length > 0) ? dispatch(setNewMessages(true)) : dispatch(setNewMessages(false));
        })
        .catch(error => console.log('Error fetching unread from bee API',error));
    }

    // We could test to open a new socket here and see if it works as the
    // previuos is opened already...

    function re_auth_socket(){
        console.log("Refresh token.....");
        const refresh_token =  getStoredField("brt");
        fecthDataRequest(beechatEP + "users/refresh-token",refresh_token)
        .then(response => {
            if(response.token){
                setStoredField("bt",response.token); //new access_token for bee chat API.
                authSocket(response.token);
            }
        })
    }

    useEffect(() => {
        if(_socket){
            console.log(`Socket on Beechat Fixed State:${_socket.readyState}`);
            _socket.onmessage = function(event) {
                console.log('Event fired on Fixed Bee');
                console.log(event);
                if(event.data){
                    const pData = JSON.parse(event.data);
                    if(pData.type === "chat-message"){
                        console.log('We got a message');
                        console.log(pData.payload);
                        // console.log(`Current conversation id:${conversation.id}`);
                        addMessage(pData.payload);
                    }else if(pData.type==="reauthentication-required"){
                        re_auth_socket();
                    }
                    else if(pData.type === "message-deleted"){
                        // removeMessage(pData.payload);
                        //testing to set a new state but filtering the received as deleted
                        const msgId = pData.payload.id;
                        setDeleted(msgId);
                    }
                }
            }
            // TODO we must handle all the events as we do in helpers
            // re-auth, etc etc...
        }
    }, [_socket]);

    // useEffect(() => {
    //     if(unread.length > 0){
    //         //testing the filter
    //         const uniqueIds = unread.filter(onlyUnique);
    //         console.log(uniqueIds);
    //         setUnread(uniqueIds);
    //     }
    // }, [unread])

    // function onlyUnique(value, index, self) {
    //     return self.indexOf(value) === index;
    // }
    const handleDataChat = (event) => {
        if((event.key === 'Enter' || event.target.id === "btnSendChatData") && inputChat){
            const members = conversation.members.filter(member => member !== username);
            console.log('Sending:',inputChat);
            console.log('Sending to:');
            console.log(members);
            console.log(`Current conversation.id:${conversation.id}`);
            console.log(`Current conversation type: ${conversation.type}`);
            if(conversation.type === "dm"){
                members.forEach(member => {
                    sendPayloadSocket({
                        "type": "chat-message",
                        "payload": {
                          "conversation_id": conversation.id,
                          "to": member,
                          "message": inputChat,
                        }
                    });
                })
            }else{
                sendPayloadSocket({
                    "type": "chat-message",
                    "payload": {
                        "conversation_id": conversation.id,
                        "to": null,
                        "message": inputChat,
                    }
                });
            }
            
            //clear the input
            // TODO
            inputRef.current.value = "";
            setInputChat("");
        }
        // if(inputChat){
        //     const username = getStoredField("username");
        //     const members = conversation.members.filter(member => member !== username);
        //     console.log('Sending:',inputChat);
        //     console.log('Sending to:');
        //     console.log(members);
        //     members.forEach(member => {
        //         sendPayloadSocket({
        //             "type": "chat-message",
        //             "payload": {
        //               "conversation_id": conversation.id,
        //               "to": member,
        //               "message": inputChat,
        //             }
        //         });
        //     })
        // }
    }
    function uniqueBy(a, cond) {
        return a.filter((e, i) => a.findIndex(e2 => cond(e, e2)) === i);
    }

    function loadUnredMsgs(id){
        const count = unread.filter(conversation => conversation.conversation_id === id).length;
        return (count > 0) ? String(count) : null;
    }

    function sendPayload(type,payload){
        // TODO
        // filter just to send needed payloads
        // i.e: check if msg is read so we wont send an ack cuz not needed, and so on....
        sendPayloadSocket({
            "type": type,
            "payload": payload
        });
    };

    const closeCurrentChat = () => {
        setStoredField("currentchatid","xx-1d");
        setCurrentChat([]);
        setConversation(null);
    }

    // const loadChatBellow = (chat) => {
    //     // TODO fix this as
    //     // we set the currentChat in click...
    //     // so each time we move by clicking we will have the right conversation.
    //     // depending on the conversation.id I will ask for the data to set the currentChat.
    //     // ........
    //     setConversation(chat);
    //     const token = getStoredField("bt");
    //     setCurrentChat([]);
    //     console.log('Getting chat id: ', chat.id);
    //     fecthDataRequest(beechatEP + `messages/chats?conversation_id=${chat.id}`,token)
    //     .then(response => {
    //         console.log(response); 
    //         setCurrentChat(response);
    //         //here we must set all this messages as READ, depending on user's settings for now
    //         // just set as READ by default.
    //         //check if any unread.
    //         const count = unread.filter(conversation => conversation.conversation_id === chat.id).length;
    //         if(count > 0){
    //             console.log('Setting this conversation as read');
    //             sendPayloadSocket({
    //                 "type": "acknowledgment",
    //                 "payload": {
    //                   "conversation_id": chat.id,
    //                 }
    //             });
    //         }
    //         //here for now we could fire another request unread
    //         getUnread();
    //     }).catch(error => console.log('Error while getting a conversation.',error));
    // }

    // TODO: test the real chat live with another one maybe aggroed......

    return (
        <div>
            {/* incomming message to show on top */}
            {
                incommingMsg && 
                    <Mesaggertop message={`Incomming Message from:${incommingMsg.from}\nMessage: ${String(incommingMsg.content).substr(0,10) + '...'}`} enableTime={true} timeToHide={5000} callBack={() => setIncommingMsg(null)} />
            }
            {/* end incomming message */}
            <h1>Messages</h1>
            {
                loadingData && 
                    <div className="standardDivRowFlex100pX100pCentered">
                        <Loader logginIn={true} typegif={"spin"} />
                    </div>
            }
            {
                !loadingData &&
                <Tabs>
                    <TabList>
                        <Tab>Active Chats</Tab>
                        <Tab>My Channels</Tab>
                        <Tab>Friends</Tab>
                        <Tab>Settings</Tab>
                    </TabList>
                    <TabPanel>
                        <div className="standardFlexRowMinH400">
                            <div className="standardCol30p">
                                <ul className="standardUlColPlain smallText justWidth70">
                                    {
                                        (oldchats && oldchats.length > 0) &&
                                            oldchats.map(chat => {
                                                return (
                                                    <li className={`borderUlLi justHeightAuto pointer relativeDiv ${(getStoredField("currentchatid") === chat.id) ? 'activeChat' : null}`} 
                                                        key={`${chat.id}-chatsActive`} 
                                                        // instead of this let set straight conversation
                                                        // then in useeffect for conversation
                                                        // we set the current chat bellow, load and show.
                                                        // it may work I think.
                                                        // onClick={() => loadChatBellow(chat)}
                                                        onClick={() => setConversation(chat)}
                                                    >
                                                        {
                                                            chat.type === "dm" ?    chat.members.filter(member => member !== getStoredField("username"))
                                                                                    : 
                                                                                    chat.members.filter(member => member !== getStoredField("username")).map(
                                                                                        member => {
                                                                                            return (
                                                                                                <p key={`${member}-chatMember`}>{member}</p>
                                                                                            )
                                                                                        }
                                                                                    )
                                                                                    
                                                        } 
                                                        <span className="miniIndicatorAbs">{loadUnredMsgs(chat.id)}</span>
                                                    </li>
                                                )
                                            })
                                    }
                                    </ul>
                                    {
                                        conversation && <div>
                                                            <div className="fontSmall standardDivRowFlex80p" title="The owner of this chat.">
                                                                <Img fixed={data.owner_icon.childImageSharp.fixed} /> 
                                                                <p className="miniMarginLeft">{conversation.creator}</p>
                                                            </div>
                                                            <div className="standardDivRowFlex80p">
                                                                <button className="fontXssmall" onClick={closeCurrentChat}>Close chat</button>
                                                            </div>
                                                        </div>
                                    }
                                </div>
                            <div className="standardCol70p">
                                {
                                    currentChat.length === 0 &&
                                    <div>
                                        <p>Please select a chat to open here.</p>
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
                                                    <div key={message.timestamp} className={`${deleted === message.id ? 'animMsgDeleted' : 'standardFlex100AutoH'} ${username !== message.from ? 'justAlignEnd': null}`}>
                                                        <div className={'beeChatFixedMsgCont relativeDiv'} key={message.timestamp}>
                                                            <span className="miniPaddings minWidth">{message.content}</span>
                                                            <Img fixed={ImgSrc} className="miniIconAbs" title={message.read ? 'Delivered & Read' : 'Delivered not read yet'} />
                                                            {
                                                                message.from === getStoredField("username") &&
                                                                <div className="miniDivAbsRight justbackground">
                                                                    <Img fixed={data.dots_icon.childImageSharp.fixed} />
                                                                    <ul className="showOptionsHovered standardUlHide smallText">
                                                                        <li onClick={() => sendPayload("delete-message", { "id": message.id })}>
                                                                            Delete
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            }
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
                                                />
                                            <button id="btnSendChatData" className="miniMarginLeft" onClick={handleDataChat}>Send</button>
                                            <div className="btnEmoticonsChat miniMarginLeft">
                                                <Img fixed={data.smile.childImageSharp.fixed} />
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                                {/* {
                                    conversation &&
                                    <div className="standardDivRowFullW">
                                        <p className="smallText noMargins">On this Chat:</p>
                                            {
                                                conversation.members.map(member => {
                                                    return (
                                                        <span className="smallText miniMarginLeft" key={`${member}-mychats`}>"{member === getStoredField("username") ? 'You' : member}"</span>
                                                    )
                                                })
                                            }
                                    </div>
                                } */}
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className="standardFlexColMinH400">
                            {/* <div 
                                dangerouslySetInnerHTML={{
                                    __html: JSON.stringify(channels)
                                }}
                            /> */}
                            <ul className="standardUlRowFlexAuto">
                                <li>
                                    <button onClick={() => setCreateChannel(true)}>Create</button>
                                </li>
                                <li>
                                    <button>Modify</button>
                                </li>
                                <li>
                                    <button>Delete</button>
                                </li>
                            </ul>
                            {
                                (channels.length === 0 && !createChannel) &&
                                    <p>Looks like you don't have any channel yet.</p>
                            }
                            {
                                createChannel &&
                                    <div>
                                        <div>
                                            <label htmlFor="channel_name">Channel Name:</label>
                                            <input type="text" name="channel_name"/>
                                        </div>
                                        <div>
                                            <button>Create</button>
                                            <button onClick={() => setCreateChannel(false)}>Cancel</button>
                                        </div>
                                    </div>
                            }
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className="standardFlexColMinH400">
                            {/* <div 
                                dangerouslySetInnerHTML={{
                                    __html: JSON.stringify(friendList)
                                }}
                            /> */}
                            {
                                (friendList.friends) &&
                                <ul className="standardUlRowFlexAuto">
                                    <li className="standardFlex120Row justiAlig">
                                        <Img fixed={data.friends_icon.childImageSharp.fixed} /> {friendList.friends.length}
                                    </li>
                                    <li>
                                        <ul>
                                            {
                                                friendList.friends.map(friend => {
                                                    return (
                                                        <li key={`${friend}`}>{friend}</li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </li>
                                    <li>TODO friend requests</li>
                                    <li className="standardFlex120Row justiAlig">
                                        <Img fixed={data.blocked_icon.childImageSharp.fixed} /> {friendList.blocked.length}
                                    </li>
                                </ul>
                            }
                            <ul className="standardUlRowFlexAuto">
                                <li>
                                    <button>Add</button>
                                </li>
                                <li>
                                    <button>Modify/Block</button>
                                </li>
                                <li>
                                    <button>Un-friend</button>
                                </li>
                            </ul>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className="standardFlexColMinH400">
                            {/* <div 
                                dangerouslySetInnerHTML={{
                                    __html: JSON.stringify(settings)
                                }}
                            /> */}
                            {
                                settings &&
                                <ul className="standardUlVerSmall">
                                    <li>
                                        Direct Messages: Only received from friends
                                        <Btnswitch sideText={"Yes/No"} 
                                            showValueDevMode={true} 
                                            btnAction={() => setToUpdate(true)} 
                                            initialValue={settings.dm.only_from_friends}
                                        />
                                    </li>
                                    <li>Use mail mode</li>
                                    <li>
                                        <label htmlFor="frecuency_interval">Frecuency to check messages </label>
                                        <select name="frecuency_interval">
                                            <option defaultValue="not_selected">Choose please</option>
                                            <option defaultValue="1hr">1 hour</option>
                                            <option defaultValue="half_hr">30 minutes</option>
                                            <option defaultValue="15m">15 minutes</option>
                                            <option defaultValue="5m">5 minutes</option>
                                            <option defaultValue="1m">1 minute</option>
                                            <option defaultValue="40s">40 seconds</option>
                                            <option defaultValue="20s">20 seconds. Our Server's Max rate.</option>
                                        </select>
                                    </li>
                                    <li>
                                        Automatic mark as read when open chat window
                                        <Btnswitch sideText={"Yes/No"} 
                                            showValueDevMode={true} 
                                            btnAction={() => setToUpdate(true)} 
                                            initialValue={false}
                                        />
                                    </li>
                                    <li>
                                        On startup live mode to chat
                                        <Btnswitch sideText={"Yes/Use offline"} 
                                            showValueDevMode={true} 
                                            btnAction={() => setToUpdate(true)} 
                                            initialValue={true}
                                        />
                                    </li>
                                    <li>
                                        On incomming messages show preview always?
                                        <Btnswitch sideText={"Yes/No"} 
                                            showValueDevMode={true} 
                                            btnAction={() => setToUpdate(true)} 
                                            initialValue={true}
                                        />
                                    </li>
                                    {
                                        toUpdate &&
                                        <div>
                                            <button>Save Changes</button>
                                            <button onClick={() => setToUpdate(false)}>Cancel</button>
                                        </div>
                                    }
                                </ul>
                            }
                        </div>
                    </TabPanel>
                </Tabs>
            }
        </div>
    )
}

export default Beechatfixed;