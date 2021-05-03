import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../../utils/helpers';
import Btnclosemin from '../btns/btncloseMin';
import OutLink from '../btns/btnoutlink';

// TODO: add a mechanism to set options: Update, Edit, Delete.
/**
 * Used it to visualize a record of any type and amount of fields. 
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} imgClassCSS - Mandatory if you need to show a main image for this record.
 * @param {Function} clickedSubItemCB - Optional The function/CB to return the hovered item on menu.
 * @param {Function} closeCB - Optional, The function/CB to send the closing action to.
 * @param {[Object]} item - The single object to visualize and interact to.
 * @param {Object} toShow - The props you want to display of this array of items' As [{}] each object can be as: { field:'image', type: 'String', link: true }, you can omit the link but not the field,type.
 * @param {Object} imageMainField - as { imgField: 'image'}. Mandatory to render a record with a main image to show.
 * @param {String} titleRecord - Optional if you want to show a hTag on top of the record.
 * @param {Boolean} devMode - Optional to see all the props and details. default as false.
 * @param {Boolean} miniSizes - optional if you require smaller sizes of all
 */

 const Recordnator = (props) => {
    const { xclassCSS, imgClassCSS, clickedSubItemCB, item, toShow, devMode, imageMainField, titleRecord, closeCB, miniSizes } = props;

    //to load on init
    useEffect(() => {
        if(devMode){
            console.log('Received on props::::');
            console.log(`xclassCSS: ${xclassCSS}`);
            console.log(`imgClassCSS: ${imgClassCSS}`);
            console.log(`clickedSubItemCB: ${clickedSubItemCB}`);
            console.log(`items: ${item}`);
            console.log('toShow:', toShow);
            console.log(`imageMainField: ${imageMainField}`);
            console.log(`titleRecord: ${titleRecord}`);
            console.log(`closeCB ${closeCB}`);
            console.log(`miniSizes ${miniSizes}`);
        }
        // Object.entries(item).forEach(([key,value]) => {
        //     console.log(`key: ${key}, value: ${value}`);
        // })
    },[]);
    //END to load on init

    //functions/CB
    function checkItem(item,type){
        if(devMode){
            console.log('Received:',item);
            console.log('typeof:',type);
        }
        switch (type) {
            case ('String'):
                return String(item);
            case ('Number'):
                return String(item);
            case ('Boolean'):
                return String(item);
            case ('Date'):
                return formatDateTime(item);
            case ('Array'):
                return item.join(' ,');
            default:
                break;
        }
    }
    const closeME = () => {
        if(devMode){ console.log('Clicked on Close');}
        if(closeCB){
            closeCB();
        }
    }
    //END functions/CB

     return (
        <div className={`${xclassCSS} relativeDiv`}>
            {
                closeCB &&  <Btnclosemin btnAction={closeME} classCSS={"justAbsolutePos justPosAbsRightTop"}/>
            }
            {
                titleRecord ?  
                    miniSizes ? <h4 className="minimumMarginTB textAlignedCenter">{titleRecord}</h4> : <h2 className="minimumMarginTB textAlignedCenter">{titleRecord}</h2>
                : 
                null
            }
            {
                imageMainField && <img src={item[imageMainField.imgField]} className={`${imgClassCSS}`}/>
            }
            <div key={`${item._id}-${item.symbol}`} className={miniSizes ? 'smallText' : null } >
                {
                    toShow.map(showField => {
                        return (
                            <div key={`${item._id}-${showField.field}`} className={`standardDivRowWHAuto justSpaceAround contentMiniMargins`}>
                                <p className="justWidth30 xtraMiniMarginTB4p justOverflowX">{String(showField.field).substring(0,1).toUpperCase() + String(showField.field).substring(1,String(showField.field).length)}</p> 
                                <p className="justWidth70 xtraMiniMarginTB4p">
                                    {
                                    item.hasOwnProperty(showField.field) ? 
                                        showField.link ? <OutLink xclassCSS={"normalTextSmall"} link={`${item[showField.field]}`} textLink={checkItem(item[showField.field],showField.type)} /> : checkItem(item[showField.field],showField.type) 
                                        : 'not set'
                                    }
                                </p>
                            </div>
                        )
                    })
                }
            </div>
         </div>
     )
 }

 export default Recordnator;