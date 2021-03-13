import React from 'react';

const Importantmsg = (props) => {
    const { message, clickToClose } = props;

    return (
        <div className="messageOnAbsScreenCont centered">
            <div className="standardContentMargin">
                <p>Apparently there was an error.</p>
                <p>Rest assured we will handle this in the next 24 hrs.</p>
                <p>We recommend you to repeat the actions you were doing.</p>
                <p>If a transfer was made, we will send your money back after some checks.</p>
                <div className="standardContentMargin contrasted">
                    <div className="paddings">
                        <p>If needed, take note of the following data:</p>
                        <p>{message}</p>
                    </div>
                </div>
                <button onClick={clickToClose}>Ok thanks, I will continue.</button>
            </div>
        </div>
    )
}

export default Importantmsg;