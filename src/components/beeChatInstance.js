import React, { useState } from 'react';
import BeeChat from '../components/BeeChat/mainBeeChat';

const ChatInstance = () => {
    const [opened, setOpened] = useState(false);

    return (
        <div className={`beeChatInstanceContainer ${opened ? `openBeeChat` : `hideBeeChat`}`}>
            {
                opened && <BeeChat />
            }
            {
                <button onClick={() => setOpened(!opened)} className={`${opened ? `btnChatOpened`: null }`}>
                    {opened ? 'Minimize' : 'Chat'}
                </button>
            }
        </div>
    )
}

export default ChatInstance;