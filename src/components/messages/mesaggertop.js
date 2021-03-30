import React, { useEffect } from 'react';
import { Link } from 'gatsby';

/**
 * Assign the project to an employee.
 * @param {String} message - The message you want to show to user.
 * @param {Boolean} enableTime - If true enables the auto-hide(requires a time in 1000ms in timeToHide )
 * @param {Number} timeToHide - Time in ms to activate the auto-hide.
 * @param {function} callBack - To close on the caller's side.
 * @param {String} linkToVisit - inner link as string to present to user.
 * @param {String} linkText - The title of the link to present to user.
 */

const Mesaggertop = (props) => {
    const { message, enableTime, timeToHide, callBack, linkToVisit, linkText } = props;

    useEffect(() => {
        if(enableTime){
            setTimeout(closeMe,timeToHide);
        }
    });
    function closeMe(){
        callBack();
    }
    return (
        <div className="messagerTopContainer fadeInLonger">
            <div className="standardContentMargin">
                <p>{`${message}`}</p>
                {
                    (linkToVisit && linkToVisit !== "")
                    && <Link className="greenLink centered" to={`${linkToVisit}`}>{linkText}</Link>
                }
            </div>
        </div>
    )
}

export default Mesaggertop;