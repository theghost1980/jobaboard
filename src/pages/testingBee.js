import React, { useState } from 'react';
import Blockchainobserver from '../components/blockchainobserver';
// import BeeChat from '../components/BeeChat/mainBeeChat';

const TestBee = () => {
    // const [opened, setOpened] = useState(false);

    return (
        // <div className={`beeChatInstanceContainer ${opened ? `openBeeChat` : `hideBeeChat`}`}>
        //     {
        //         opened && <BeeChat />
        //     }
        //     {
        //         !opened && <button onClick={() => setOpened(!opened)}>Chat</button>
        //     }
        // </div>
        <div>
            <p>Hi :D</p>
            <Blockchainobserver />
        </div>
    )
}

export default TestBee;