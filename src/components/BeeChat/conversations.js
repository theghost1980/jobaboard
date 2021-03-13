import React from 'react';

const Conversations = (props) => {
    const { data } = props;
    // console.log(data);
    //it's just an array containing the data.

    return (
        <>
            <p>Chats: {data.length.toString()}</p>
        </>
    )
}

export default Conversations;