import React from 'react';
import Absscreenwrapper from '../absscreenwrapper';

const Confirmationmsg = (props) => {
    const { title, message, dataObject, clickToClose } = props;
    Object.keys(dataObject).map((key,index) => {
        console.log(key,index);
    })
    // var ind = 0;
    // const dataJSX = [dataObject].map(item => {
    //     ind++;
    //     return (
    //         <li key={`confirm-JSX${ind.toString()}`}></li>
    //     )
    // })
    return (
        <Absscreenwrapper>
            <div className="messageOnAbsScreenCont centered">
                <div className="standardContentMargin">
                    <h1>{title}</h1>
                    <p>{message}</p>
                    <div className="standardContentMargin contrasted">
                        <div className="paddings">
                            
                        </div>
                    </div>
                    <button onClick={clickToClose}>Ok thanks, I will continue.</button>
                </div>
            </div>
        </Absscreenwrapper>
    )
}

export default Confirmationmsg;