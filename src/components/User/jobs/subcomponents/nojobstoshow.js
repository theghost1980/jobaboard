import React, { useEffect } from 'react';
import Browseby from '../../../Categories/browseby';

/**
 * Show the "no results + categories to browse down bellow".
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Object} pagination - optional for browseBy categories component. As { perPage: 10, controls: Boolean }.
 * @param {Boolean} devMode - Optional to see all the props and details. default as false.
 */

const Nojobstoshow = (props) => {
    const { xclassCSS, pagination, devMode } = props;

    //load on init
    useEffect(() => { if(devMode){ console.log('On props:', { xclassCSS, pagination, devMode })} },[]);
    //END load on init

    return (
        <div className={`standardContentMargin ${xclassCSS}`}>
            <h2 className="textColorWhite textShadowBasic">At this moment, this user do not have any Job/Gig or services.</h2>
            <h3 className="textColorWhite">If you know this user, please encourage him/her to start posting amazing JABS...I mean, Jobs.</h3>
            <h3 className="textColorWhite textShadowBasic">But please feel free to browse our categories</h3>
            <Browseby 
                size={"small"}
                pagination={pagination}
                xclassCSS={"whiteBack marginTop justRounded boxShadowBottom"}
                xclassCSSUl={"justSpaceEvenly"}
            /> 
        </div>
    )
}

export default Nojobstoshow;
