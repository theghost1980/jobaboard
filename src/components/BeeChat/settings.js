import React from 'react';

const Settings = (props) => {
    const { data } = props;
    // console.log(data);
    //it's just an array containing the data.

    return (
        <>
            <p>Settings</p>
            <p>Direct Messages: {data.dm.only_from_friends.toString()}</p>
            {
                data.dm.only_from_friends ? <p>Only friends can send DM.</p>
                    : <p>Everyone can send you pm.</p>
            }
        </>
    )
}

export default Settings;