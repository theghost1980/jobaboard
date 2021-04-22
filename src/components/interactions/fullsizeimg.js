import React, { useState, useEffect } from 'react';
import Absscreenwrapper from '../absscreenwrapper';
import Btnclosemin from '../btns/btncloseMin';

/**
 * Sets a Ul horizontal menu and pass active prop to parent to activate childs css classes on hovered.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Function} closeCB - The function/CB to close.
 * @param {String} refImg - -----.
 */

const Fullsizeimg = (props) => {

    const { xclassCSS, refImg, closeCB } = props;
    //functions/CB

    //END functions/CB
    return (
        <Absscreenwrapper>
            <div className="standardDiv60Percent justMargin0auto relativeDiv justMarginAuto">
                <Btnclosemin classCSS="posCenterBottomm30 whiteBack btnWhiteBackAbsClose" btnAction={() => closeCB(false)}/>
                <img 
                    // src={nftMongo.thumb} 
                    ref={refImg} 
                />
            </div>
        </Absscreenwrapper>
    )
}

export default Fullsizeimg;