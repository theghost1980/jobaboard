import React, { useState, useEffect } from 'react';

/**
 * Sets a Ul horizontal menu and pass active prop to parent to activate childs css classes on hovered.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Function} clickedSubItemCB - The function/CB to return the hovered item on menu.
 * @param {[Object]} items - The Array of objects to map and present.
 * @param {Object} toShow - The props you want to display of this array of items' As ['name','title','query','active']
 * @param {Boolean} devMode - Optional to see all the props and details. default as false.
 */

const Tablinator = (props) => {

    const { xclassCSS, clickedSubItemCB, items, toShow, devMode } = props;
    if(devMode){
        console.log('Received on props::::');
        console.log(items);
        console.log(toShow);
    }
    const selectedItem = (item) => {
        if(devMode){ console.log('Clicked and about to send it to parent:', item);}
        clickedSubItemCB(item);
    }
    //END functions/CB
    return (
        <div>
            <table className="tablePortPublic smallText marginsTB relativeDiv">
                <tbody>
                    <tr className="trTablePortP">
                        {
                            toShow.map(keyItem => {
                                return (
                                    <th key={`${keyItem}-KeyJAB`}>{String(keyItem).substring(0,1).toLocaleUpperCase() + String(keyItem).substring(1,String(keyItem).length)}</th>
                                )
                            })
                        }
                    </tr>
                    {
                        items.map(item => {
                            return (
                                <tr key={item._id} className="trTableWhite standardLiHovered" onClick={() => selectedItem(item)}>
                                    {
                                        toShow.map(showThis => {
                                            return (
                                                <td key={`${item._id}-${showThis}`}>
                                                {
                                                    item[showThis] ? item[showThis].toString() : 'not assigned yet.'
                                                }
                                                </td>
                                            )
                                        })
                                    }
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Tablinator;