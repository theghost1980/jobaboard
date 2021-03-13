import React, { useState, useEffect } from 'react';

const Friendlist = (props) => {

    const { data } = props;
    // console.log(data);
    const [input, setInput] = useState("");
    const [token, setToken] = useState("");
    const [socket, setSocket] = useState(null);

      //function to init teh socket
      function initSocket(){
        let socket = new WebSocket('wss://ws.beechat.hive-engine.com');
        socket.onopen = function(e) {
            console.log("[open] Connection established");
            setSocket(socket);
        };
        socket.onmessage = function(event) {
            console.log(`[message] Data received from server: ${event.data}`);
        };
        socket.onclose = function(event) {
            if (event.wasClean) {
                console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
                // console.log(`readyState: ${socket.readyState}`);
            } else {
                // e.g. server process killed or network down
                // event.code is usually 1006 in this case
                console.log('[close] Connection died');
                // console.log(`readyState: ${socket.readyState}`);
            }
        };
        socket.onerror = function(error) {
            console.log(`[error] ${error.message}`);
            // console.log(`readyState: ${socket.readyState}`);
        };
    }
    ///////END function to init the socket
    //TODO: arreglar esto como hiciste con check()
    //de manera que puedas usar el token valido importando desde helpers.
    //testing to get the token on LS
    useEffect(() => {
        const databeeUser = localStorage.getItem('beeUser');
        if(databeeUser){
            const jsonDataBeeUser = JSON.parse(databeeUser);
            setToken(jsonDataBeeUser.token);
            //now we can init socket
            initSocket();
        };
    },[]);
    //end testing

    //testing to auth once the socket it is been set
    useEffect(() => {
        if(socket){
            console.log(`I was set and my readyState is:${socket.readyState}`);
            //now we auth
            sendPayloadSocket({
                "type": "authenticate",
                "payload": {
                    "token": `${token}`
                }
            });
        }
    },[socket])

    const sendFriendRequest = (event) => {
        if(!input || input === "") return console.log('No input. No Sauce for you!');
        event.preventDefault();
        sendPayloadSocket({
            "type": "request-friendship",
            "payload": {
                "username": `${input}`
            }
        });
        //it looks like readyState 1 "OPEN" 3 "CLOSED"
    }

    function sendPayloadSocket(data){
        if(socket.readyState === 1){
            socket.send(JSON.stringify(data));
        }else{
            console.log('Socket not ready.');
        }
    };

    return (
        <>
            <p>friends: {data.friends.length.toString()}</p>
            <p>Blocked: {data.blocked.length.toString()}</p>
            <div>
                <input type="text" onChange={(event) => setInput(event.target.value)} />
                <button onClick={sendFriendRequest}>Add Friend</button>
            </div>
        </>
    )
}

export default Friendlist;