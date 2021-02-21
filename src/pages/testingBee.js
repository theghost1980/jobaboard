import React, { useState } from 'react';
import BeeChat from '../components/BeeChat/mainBeeChat';

const TestBee = () => {
    const [opened, setOpened] = useState(false);
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
        </div>
    )
}

export default TestBee;