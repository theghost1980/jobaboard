import React from 'react';

const Friendrequests = (props) => {
    const { data } = props;
    console.log(data);
    //it's just an array containing the data.

    return (
        <>
            <p>friends requests: {data.length.toString()}</p>
            {
                data.map(requests => {
                    return (
                        <div>
                            <a href={`https://hive.blog/@${requests.username}`}
                                target="_blank" rel="noreferrer"
                            >
                                {requests.username} </a> wants to be your friend.
                            <div>
                                <div>Accept</div>
                                <div>Decline</div>
                            </div>
                        </div>
                    )
                })
            }
        </>
    )
}

export default Friendrequests;