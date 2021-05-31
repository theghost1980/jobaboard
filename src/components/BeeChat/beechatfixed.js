import React, { useState, useEffect, useContext } from 'react';
// import { fecthDataBE } from '../../utils/logger';
import { check, encode, decode, formatDateTime, fecthDataRequest, getStoredField } from '../../utils/helpers';
import Socketbee from '../../components/BeeChat/socketBee';

//testing to get context from socketbee
import { Socket } from '../BeeChat/socketBee';

//TODO: later on move on their own component
//tab component
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Listitems from '../../components/interactions/listitems';
import Chatboard from '../../components/BeeChat/chatboard';
import Btninfo from '../../components/btns/btninfo';
import Btnconfirmcancel from '../../components/btns/btnconfirm';
import Btnactionwithconf from '../../components/btns/btnactionwconf';
import Notificationicon from '../../components/icons/notificationicon';
import Logotext from '../../components/icons/logotext';
import Btnswitch from '../../components/btns/btnswitch';
import Btnactionicon from '../btns/btnactionicon';
import Abswrapper from '../absscreenwrapper';
import Btnclosemin from '../btns/btncloseMin';

//constants
const beechatEP = "https://beechat.hive-engine.com/api/";
const epsBee = [
    { ep: "/messages/new",lsItem: "unread"},
    { ep: "messages/conversations",lsItem: "conversations"},
    { ep: "users/friends",lsItem: "friendList"},
    { ep: "/users/friend-requests",lsItem: "friendRequests"},
    { ep: "users/settings",lsItem: "settings"},
    { ep: "users/channels",lsItem: "channels"},
]
// END TODO
// TODO move this guy to the .env file.
const testMode = false;

// /**
//  * This component allow you to handle the socket and re-auths on BeeChat API. Among other things I will update later on.
//  * @param {Boolean} testMode - From .env file, If you need to activate some test button and state on top of the chat. Default false.
//  */

const Beechatfixed = () => {

    const socketBee = useContext(Socket);
    // console.log(socketBee);
    // if(socketBee.setter){
    //     socketBee.setter("Hi there");
    // }
    const userdata = check();
    // const username = getStoredField("username");

    const [triggerRead, setTriggerRead] = useState(false);
    const [chatMessage, setChatMessage] = useState(null);
    const [payLoad, setPayLoad] = useState(null);
    const [typePayLoad, setTypePayLoad] = useState(null); //as "create-conversation", "rename-conversation", "leave-conversation", "request-friendship".

    //TODO: later on move on their own component
    const [chatStatus, setChatStatus] = useState(socketBee.chatStatus);
    const [selector, setSelector] = useState("");
    const [subselector, setSubselector] = useState("");
    const [unread, setUnread] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [friendList, setFriendList] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [settings, setSettings] = useState(null);
    const [channels, setChannels] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [updateObject, setUpdateObject] = useState(null);
    //END TODO

    //functions/CB
    const setIncommingChatMsg = (msg) => {
        if(msg.type && msg.type === "friendship-requested"){
            return setUpdateObject("friendRequests");
        }else if(msg.type === "acknowledged"){
            return setUpdateObject("unread");
        }
        setChatMessage(msg);
        setTimeout(() => setChatMessage(null),5000);
        if(conversation && conversation.id !== msg.conversation_id){
            return setUpdateObject("unread");
        }else if(conversation && conversation.id === msg.conversation_id){
            testTheCB({
                "type": "acknowledgment",
                    "payload": {
                        "conversation_id": conversation.id
                    }
            });
        }else if(!conversation){
            return setUpdateObject("unread");
        }
    };

    const setStatus = (status) => {
        setChatStatus(status);
    }
    const setThePayload = (_payload) => {
        // TODO handle this one locally so we dont have to refresh as the answer will be this one we can add friends to the actual list
        // {
        //     "type": "friendship-accepted",
        //     "payload": {
        //       "id": "01EKCB8D4PVDHBQ4MC7T4JFYAB",
        //       "username": "reazul-dev"
        //     }
        //   }
        setPayLoad(_payload);
        setTimeout(() => setPayLoad(null),1000); //for now delete it after 1s
    }

    const testTheCB = (_payload) => {
        if(_payload.type === "remove-friendship" || _payload.type === "block-user" || _payload.type === "unblock-user"){
            setUpdateObject("friendList");
        }else if(_payload.type === "accept-friendship" || _payload.type === "reject-friendship"){
            setUpdateObject("friendRequests"); //and a bit later friendList
            setTimeout(() => setUpdateObject("friendList"),500);
        };
        // console.log(_payload)
        // setPayLoad(_payload);
        socketBee.payloadFromChild(_payload);
        setTimeout(() => setPayLoad(null),1000); //for now delete it after 1s
    }

    const handleItem = (item) => {
        if(selector === "chats"){
            setConversation(null);
            console.log('Clicked and passes as:',item);
            setConversation(item);
        }
    }
    function getAllData(actualToken){
        // var count = 0;
        epsBee.forEach(epData => {
            // count++;
            fecthDataRequest(beechatEP + epData.ep,actualToken)
            .then(response => {
                console.log(`Results from: ${epData.ep}`);
                console.log(response); //here we set the states as they come
                if(epData.lsItem === "unread"){
                    setUnread([]);
                    setUnread(response);
                }else if(epData.lsItem === "conversations"){
                    setConversations([]);
                    setConversations(response);
                }else if(epData.lsItem === "friendList"){
                    setFriendList([]);
                    setFriendList(response);
                }else if(epData.lsItem === "friendRequests"){
                    setFriendRequests([]);
                    setFriendRequests(response);
                }else if(epData.lsItem === "settings"){
                    setSettings([]);
                    setSettings(response);
                }else if(epData.lsItem === "channels"){
                    setChannels([]);
                    setChannels(response);
                }
                // if(count >= epsBee.length){ setLoadingData(false)};
            }).catch(error => console.log(`Error getting ${epData.lsItem}`,error));
        });
    }
    // END functions/CB

    // To handle on every change of state
    // useEffect(() => {
    //     if(socketBee.chatStatus === "online"){
            
    //     }
    // },[socketBee.chatStatus]);
    useEffect(() => {
        if(updateObject){
            const toUpdate = epsBee.find(ep => ep.lsItem === updateObject);
            if(toUpdate){ //update this specific ep + object
                const actualToken = localStorage.getItem("bToken");
                console.log('Tp uodate per user request/modifications:',toUpdate);
                fecthDataRequest(beechatEP + toUpdate.ep,actualToken)
                .then(response => {
                    // console.log(response);
                    if(toUpdate.lsItem === "unread"){
                        setUnread(response);
                    }else if(toUpdate.lsItem === "conversations"){
                        setConversations(response);
                    }else if(toUpdate.lsItem === "friendList"){
                        setFriendList(response);
                    }else if(toUpdate.lsItem === "friendRequests"){
                        setFriendRequests(response);
                    }else if(toUpdate.lsItem === "settings"){
                        setSettings(response);
                    }else if(toUpdate.lsItem === "channels"){
                        setChannels(response);
                    }
                }).catch(error => console.log(`Error getting ${toUpdate.lsItem}`,error));
            }
            setUpdateObject(null);
        }
    },[updateObject]);
    // END To handle on every change of state

    //handle on init
    useEffect(() => {
        const token = localStorage.getItem("bToken");
        if(token){
            getAllData(token);
        };
    }, []);
    //END handle on init 

    const toggleSelector = (state) => {
        if(selector === state){
            setSelector("");
        }else{
            setSelector(state);
        }
    }

    const toogleSubSelector = (state) => {
        if(subselector === state){
            setSubselector("");
        }else{
            setSubselector(state);
        }
    }

    function updateState(state, name,value){
        if(state === 'type'){ setType(value)};
        if(state === 'payload'){ setPayLoad(prevState => { return {...prevState, [name]: value }})};
    }

    ///data fetching
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata   ? fetch(url, { method: requestType, contentType: 'application/x-www-form-urlencoded', headers: headers,})
                                        : fetch(url, { method: requestType, contentType: 'application/x-www-form-urlencoded', headers: headers, body: formdata});
        return (await response).json(); 
    };
    ///END data fetching

    const sendPayload = (event) => {
        event.preventDefault();
        if(typePayLoad === 'create-channel'){
            const actualToken = localStorage.getItem("bToken");
            // const formdata = new FormData(); 
            // formdata.append("name",payLoad.name);
            // const formdata = JSON.stringify({ payload: { name: payLoad.name }});
            const headers = { 'Authorization': `Bearer ${actualToken}` };
            dataRequest(beechatEP + `users/channels`, "POST", headers, { name: payLoad.name }).then(response => {
                console.log(response);
            }).catch(error => console.log('Error fetching post API beechat.', error));
            
        }else{
            socketBee.payloadFromChild(
                {
                    "type": typePayLoad,
                    "payload": payLoad,
                }
            );
        }
        setTypePayLoad(null);
        setPayLoad(null);
        getAllData();
    }

    useEffect(() => {
        console.log(typePayLoad, payLoad);
    },[typePayLoad, payLoad]);

    const leaveConversation = () => {
        if(conversation && conversation.id){
            socketBee.payloadFromChild(
                {
                    "type": "leave-conversation",
                    "payload": {
                      "conversation_id": conversation.id,
                    }
                  }
            );
            setConversation(null);
            setSelector('');
        }
    }
    // code removed
    // <Socketbee readLS={triggerRead} cbMessages={setIncommingChatMsg} sendChatS={setStatus} testBtn={false} 
    //     handlePayLoad={payLoad}
    // />
    // end code removed

    return (
        <div>
            {   testMode &&
                <div>
                    <button onClick={() => setTriggerRead(!triggerRead)}>trigger read</button>
                    {/* <button onClick={() => setThePayload({
                            "type": "create-conversation",
                            "payload": {
                            "to": "lyonmilla",
                            "message": "Hi"
                            }
                    })}>Send test payload</button> */}
                    <button onClick={() => socketBee.payloadFromChild({
                            "type": "create-conversation",
                            "payload": {
                            "to": "lyonmilla",
                            "message": "Hi"
                            }
                    })}>Send test payload context</button>
                    {
                        socketBee.chatMessage && <p>{JSON.stringify(socketBee.chatMessage)}</p>
                    }
                    {
                        socketBee.chatStatus && 
                        <div className="standardDivRowFullW">
                            <p> Chat: {socketBee.chatStatus}</p>
                            {
                                socketBee.chatStatus === "online" &&
                                <div className="aInlineFlexPlain">
                                    {unread && unread.length > 0 ? <Notificationicon xclassCSS={"fadeInLongerInf"} typeDiv={"notAbsolute"} /> : null }
                                </div>
                            }
                        </div>
                    }
                </div>
            }
        <>
        <Tabs>
                <TabList>
                    <Tab>Chats <Btninfo xclassMsg={"justWidth200"} size={"mini"} msg={"Bee Chat is still in develop. The messages you send and received are not encrypted so please do not send sensitive data, passwords or personal information."} /></Tab>
                    {/* <Tab>Settings</Tab> */}
                </TabList>
                <TabPanel>
                    <div className={`${socketBee.chatStatus !== 'online' ? 'disableDiv2' : null}`} id="beechatFixed">
                        {
                            socketBee && socketBee.chatStatus &&
                            <p>Status: {socketBee.chatStatus}</p>
                        }
                        <div className="standardDivRowFullW jutsMinHeight320px">
                            <div className="standardDivColFullW justWidth30">
                                <ul className="standardUlColW90pFullH noMarginBTP justRounded brightText">
                                    <div className="miniMarginLeft">
                                        <li onClick={() => toggleSelector("chats")} className={`standardLiHovered marginLeft ${selector === "chats" ? 'listItemOpened':'listItemClosed'}`}>
                                            <div className="aInlineFlexPlain justAlignedSpaceAround justWidth100per">Chats <Btnconfirmcancel btnAction={() => setTypePayLoad('create-conversation')} xclassCSS={"whiteBack"} title={"Create new chat"} size={"mini"} typeIcon={"confirm"} /></div>
                                        </li>
                                        {
                                            (selector === "chats") && <Listitems unread={unread} items={conversations} toList={selector} userdata={userdata} selectedItemCb={handleItem}/>
                                        }
                                        <li onClick={() => toggleSelector("friends")} className={`standardLiHovered marginLeft ${selector === "friends" ? 'listItemOpened':'listItemClosed'}`}>
                                            <div className="aInlineFlexPlain justAlignedSpaceAround justWidth100per">Friends <Btnconfirmcancel btnAction={() => setTypePayLoad('request-friendship')} xclassCSS={"whiteBack"} title={"Add new friend"} size={"mini"} typeIcon={"confirm"} /></div>
                                        </li>
                                        {
                                            selector === "friends" && friendList &&
                                            <ul>
                                                <li onClick={() => toogleSubSelector("myfriends")} className={`standardLiHovered marginLeft ${subselector === "myfriends" ? 'listItemOpened':'listItemClosed'}`}>
                                                    Friends:{friendList.friends.length}
                                                </li>
                                                {
                                                    subselector === "myfriends" && friendList.friends &&
                                                    <ul className="standardUlVerSmall">
                                                        {
                                                            friendList.friends.map(friend => {
                                                                return (
                                                                    <li key={`${friend}-MYJABfriends`}>
                                                                        {friend} 
                                                                        <div className="aInlineFlexPlain">
                                                                            <Btnconfirmcancel title={"remove friend"} xclassCSS={"whiteBack"} size={"mini"}  typeIcon={"cancel"} 
                                                                                btnAction={() => testTheCB({
                                                                                    "type": "remove-friendship",
                                                                                    "payload": {
                                                                                        "username": friend
                                                                                    }
                                                                                })}
                                                                            /> 
                                                                            <Btnactionwithconf xclassCSS={"miniDiv15p whiteBack"} typeIcon={"block"} title={"Block this user!"} btnAction={() => testTheCB({
                                                                                "type": "block-user",
                                                                                "payload": {
                                                                                    "username": friend
                                                                                }
                                                                            })}  />
                                                                        </div>
                                                                    </li>
                                                                )
                                                            })
                                                        }
                                                    </ul>
                                                }
                                                <li onClick={() => setSubselector("notmyfriends")} className={`standardLiHovered marginLeft ${subselector === "notmyfriends" ? 'listItemOpened':'listItemClosed'}`}>
                                                    Blocked: {friendList.blocked.length}
                                                </li>
                                                {
                                                    subselector === "notmyfriends" && friendList.blocked &&
                                                    <ul className="standardUlVerSmall" >
                                                        {
                                                            friendList.blocked.map(blocked => {
                                                                return (
                                                                    <li key={`${blocked}-NOTMYJABfriends`}>
                                                                        {blocked}
                                                                        <Btnactionwithconf xclassCSS={"miniDiv15p whiteBack pointer"} typeIcon={"unblock"} title={"Unblock this user!"} btnAction={() => testTheCB({
                                                                                "type": "unblock-user",
                                                                                "payload": {
                                                                                    "username": blocked
                                                                                }
                                                                            })}  
                                                                        /> 
                                                                    </li>
                                                                )
                                                            })
                                                        }
                                                    </ul>
                                                }
                                            </ul>
                                        }
                                        <li onClick={() => toggleSelector("friendrequests")} className={`standardLiHovered marginLeft ${selector === "friendrequests" ? 'listItemOpened':'listItemClosed'}`}>
                                            Friend Requests
                                        </li>
                                        {
                                            selector && friendRequests &&
                                            <ul className="standardUlVerSmall">
                                                {
                                                    friendRequests.map(request => {
                                                        return (
                                                            <li key={request.id}>
                                                                <div className="standardDivColFullW">
                                                                    <p className="noMargins">{request.username}</p>
                                                                    <div className="standardDivRowFullW">
                                                                        <p className="noMargins">Accept</p>
                                                                        <Btnconfirmcancel title={"Accept the friendship"} btnAction={() => testTheCB({
                                                                                "type": "accept-friendship",
                                                                                "payload": {
                                                                                "id": request.id
                                                                                }
                                                                            }
                                                                        )} size={"mini"} xclassCSS={"whiteBack"}  typeIcon={"confirm"} />
                                                                    </div>
                                                                    <div className="standardDivRowFullW">
                                                                        <p className="noMargins">Decline</p>
                                                                        <Btnconfirmcancel title={"Decline the friendship"} xclassCSS={"whiteBack"} size={"mini"}  typeIcon={"cancel"} 
                                                                            btnAction={() => testTheCB({
                                                                                "type":"reject-friendship",
                                                                                "payload": {
                                                                                "id": request.id
                                                                                }
                                                                            })}
                                                                        /> 
                                                                    </div>
                                                                </div>  
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        }
                                        {/* <li onClick={() => toggleSelector("channels")} className={`standardLiHovered marginLeft ${selector === "channels" ? 'listItemOpened':'listItemClosed'}`}>
                                            <div className="aInlineFlexPlain justAlignedSpaceAround justWidth100per">Channels <Btnconfirmcancel btnAction={() => setTypePayLoad('create-channel')} xclassCSS={"whiteBack"} title={"Create new channel"} size={"mini"} typeIcon={"confirm"} /></div>
                                        </li>
                                        {
                                            (selector === "channels") && 
                                            <div>
                                                <Listitems items={channels} toList={selector} username={userdata.username}/>
                                                <li>TODO...</li>
                                            </div>
                                        } */}
                                    </div>
                                </ul>
                                <div className="standardDivFlexPlain justWH35 justMargin0auto miniMarginTB justiAlig">
                                    <Btnactionicon xclassCSS={"standardDivFlexPlain pointer justWH35 justMargin0auto miniMarginTB justiAlig"} typeIcon={"refresh"} btnAction={() => console.log('Click on refresh!')}
                                        title={"Force a reconnect if any errors on chat! TODO"}
                                    />
                                </div>
                                <div onClick={() => getAllData(localStorage.getItem("bToken"))}>
                                    <Logotext xclassCSS={"standardDivRow90W justiAlig textXSmallOrange"} text={"Powered By Beechat Hive"} logo={"beechat"} typeDiv={"notAbsolute"} />
                                </div>
                            </div>
                                    
                            <div className="standardDiv60Percent">
                                {
                                    selector === "chats" &&
                                    <Chatboard 
                                        username={userdata.username} 
                                        cbHandlePayloadOUT={testTheCB} 
                                        _conversation={conversation} 
                                        incommingMsg={socketBee.chatMessage}
                                        chatStatus={socketBee.chatStatus}
                                        leaveCB={leaveConversation}
                                    />   
                                }
                            </div>
                        </div>
                    </div>
                </TabPanel>
                {/* <TabPanel>
                    <div className={`${socketBee.chatStatus !== 'online' ? 'disableDiv2' : null}`}>
                    {
                        settings && settings.dm &&
                        <ul className="standardUlVerSmall">
                            <li>
                                Direct Messages: Only received from friends
                                <Btnswitch sideText={"Yes/No"} 
                                    btnAction={(cen) => console.log(cen)} 
                                    initialValue={settings.dm.only_from_friends}
                                />
                            </li>
                            <li>Use mail mode</li>
                            <li>
                                On incomming messages show preview always?
                                <Btnswitch sideText={"Yes/No"} 
                                    btnAction={(cen) => console.log(cen)} 
                                    initialValue={true}
                                />
                            </li>
                            {
                                <div>
                                    <button>Save Changes</button>
                                    <button>Cancel</button>
                                </div>
                            }
                        </ul>
                            }
                    </div>
                </TabPanel> */}
        </Tabs>
        </>
        {
            typePayLoad &&
            <Abswrapper xtraClass={"justiAlig"}>
                <div className="standardDiv80Auto justBordersRounded whiteBack">
                    <div className="standardContentMargin">
                        <Btnclosemin btnAction={() => setTypePayLoad(null)} />
                        <h3>About to {typePayLoad}</h3>
                        {
                            typePayLoad === 'request-friendship' &&
                            <form className="formVertFlex justWidth80" onSubmit={sendPayload}>
                                <label htmlFor="input_beeChat">Username:</label>
                                <input name="input_beeChat" onChange={(e) => updateState("payload", "username", e.target.value)} required />
                                <button type="submit" className="justWidth30 marginsTB ">{typePayLoad}</button>
                            </form>
                        }
                        {
                            typePayLoad === 'create-conversation' &&
                            <form className="formVertFlex justWidth80" onSubmit={sendPayload}>
                                <label htmlFor="input_beeChat">Username:</label>
                                <input name="input_beeChat" onChange={(e) => updateState("payload", "to", e.target.value )} required />
                                <label htmlFor="input_beeChat_message">Message:</label>
                                <input name="input_beeChat_message" onChange={(e) => updateState("payload", "message", e.target.value )} required />
                                <button type="submit" className="justWidth30 marginsTB">{typePayLoad}</button>
                            </form>
                        }
                        {
                            typePayLoad === 'create-channel' &&
                            <form className="formVertFlex justWidth80" onSubmit={sendPayload}>
                                <label htmlFor="input_beeChat_channel">Channel Name:</label>
                                <input name="input_beeChat_channel" onChange={(e) => updateState("payload", "name", e.target.value)} required />
                                <button type="submit" className="justWidth30 marginsTB ">{typePayLoad}</button>
                            </form>
                        }
                    </div>
                </div>
            </Abswrapper>
        }
    </div>
    )
};

export default Beechatfixed;