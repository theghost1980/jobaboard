import React, { useEffect } from 'react';

/**
 * Use to Edit/Delete a Job.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} xclassCSSSelect - Optional The css Extra class for the select.
 * @param {String} xclassCSSOptions - Optional The css Extra class for the options.
 * @param {Object} arrayMenu the options to present to user when flyer menu is opened.
 * @param {Function} cbOptionSelected the callback to send the option to.
 * @param {Boolean} devMode - Optional to see all the props and details. default as false.
 */

const Flyermenu = (props) => {
    const { xclassCSS, arrayMenu, cbOptionSelected, devMode, xclassCSSSelect, xclassCSSOptions } = props;

    //load on init
    useEffect(() => {
        if(devMode){ console.log('Received as props:', { xclassCSS, arrayMenu, cbOptionSelected, devMode, xclassCSSSelect, xclassCSSOptions } )};
    },[]);
    //END load on init

    //functions/CB
    const sendOption = (option) => {
        if(devMode){
            if(!cbOptionSelected){ 
                console.log('Warning cbOptionSelected not set')
            }else{ console.log('About to send back:', option)}
        }
        if(cbOptionSelected){ cbOptionSelected(option) };
    }
    //END functions/CB
    return (
        <td className={`${xclassCSS} justAbsolutePos justPosMenuAbs`}>
            <select className={`${xclassCSSSelect} textColorWhite justBordersRounded justMiniPadding justbackgroundOrange`} onChange={(e) => sendOption(e.target.value)}>
            <option className="justBoldtext" defaultValue="">Select an option</option>
                {
                    arrayMenu.map(option => {
                        return (
                            <option className={`${xclassCSSOptions} justBoldtext`} key={`${option.title}-option-menu-JAB`} value={option.value}>{option.title}</option>
                        )
                    })
                }
            </select>
        </td>
    )
}

export default Flyermenu;