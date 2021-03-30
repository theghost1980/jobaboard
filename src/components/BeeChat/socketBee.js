import React, { useState, useEffect, createContext } from 'react';
import io from 'socket.io-client';

//constants
const beechatSocket = process.env.GATSBY_socketBeeChat;

const Socketbee = createContext(null);

const Socketbee = (props) => {

    const { connect } = props;
    
    let socket;

    if(socket){
        socket.onopen = function(e) {
            console.log("[open] Connection established");
        };
        socket.onmessage = function(event) {
            console.log(`[message] Data received from server: ${event.data}`);
        };
        socket.onclose = function(event) {
            if (event.wasClean) {
                console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.log('[close] Connection died');
            }
        };
        socket.onerror = function(error) {
            console.log(`[error] ${error.message}`);
        };
    };

    const connectSocket = () => {
        socket = io.connect(beechatSocket);
    }

      //function to init the socket
    //   function initSocket(){
    //     //TODO define a test .env var to activate all this messages under condition.
    //     console.log(`Connecting to: ${beechatSocket}`);
    //     let socket = new WebSocket(beechatSocket);
    //     socket.onopen = function(e) {
    //         console.log("[open] Connection established");
    //         setSocket(socket);
    //     };
    //     socket.onmessage = function(event) {
    //         console.log(`[message] Data received from server: ${event.data}`);
    //     };
    //     socket.onclose = function(event) {
    //         if (event.wasClean) {
    //             console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    //             // console.log(`readyState: ${socket.readyState}`);
    //         } else {
    //             // e.g. server process killed or network down
    //             // event.code is usually 1006 in this case
    //             console.log('[close] Connection died');
    //             // console.log(`readyState: ${socket.readyState}`);
    //         }
    //     };
    //     socket.onerror = function(error) {
    //         console.log(`[error] ${error.message}`);
    //         // console.log(`readyState: ${socket.readyState}`);
    //     };
    // }

    

    return (
        <Socketbee.Provider value={ws}>
            {props.children}
        </Socketbee.Provider>
    )
}

export default Socketbee;