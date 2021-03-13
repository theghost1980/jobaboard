import React from 'react';

const Channels = (props) => {
    const { data } = props;
    // console.log(data);
    //it's just an array containing the data.

    return (
        <>
            <p>My Channels{data.length.toString()}</p>
        </>
    )
}

export default Channels;