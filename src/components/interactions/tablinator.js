import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../../utils/helpers';

/**
 * Sets a Ul horizontal menu and pass active prop to parent to activate childs css classes on hovered.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Function} clickedSubItemCB - The function/CB to return the hovered item on menu.
 * @param {[Object]} items - The Array of objects to map and present.
 * @param {Object} toShow - The props you want to display of this array of items' As ['name','title','query','active']
 * @param {String} titleTable - Optional, if provided will show a title on Top as a Tr.
 * @param {Object} highLight - optional if you need to highligth a record based on equalTo. as { field: 'field', compareTo: any }
 * @param {Boolean} devMode - Optional to see all the props and details. default as false.
 */

const Tablinator = (props) => {

    const { xclassCSS, clickedSubItemCB, items, toShow, devMode, titleTable, highLight } = props;
    const [keyOrderBy, setKeyOrderBy] = useState("");

    //to load on init
    useEffect(() => {
        if(devMode){
            console.log('Received on props: tablinator,', { xclassCSS, clickedSubItemCB, items, toShow, devMode, titleTable, highLight } );
        }
    },[]);
    //END to load on init

    //functions/CB
    function checkHighLight(item){
        if(highLight){
            if(devMode) {console.log(item[highLight.field])};
            if(item[highLight.field] && item[highLight.field] === highLight.compareTo){
                return 'highLightRow'
            }else{
                return null
            }
        }
    }
    const selectedItem = (item) => {
        if(devMode){ console.log('Clicked and about to send it to parent IF exists CB:', item);}
        if(clickedSubItemCB){
            clickedSubItemCB(item);
        }
    }
    function compare(a, b,) {
        if ( a[keyOrderBy] < b[keyOrderBy] ){ return -1 };
        if ( a[keyOrderBy] > b[keyOrderBy] ){ return 1 };
        return 0;
    }
    const orderBy = (key) => {
        if(devMode) {console.log('Order By:', key)};
        function compare(a, b) {
            if ( a[key] < b[key] ){ return -1 };
            if ( a[key] > b[key] ){ return 1 };
            return 0;
        }
        const ordered = items.sort( compare );
        if(devMode) {console.log(ordered) };
        setListItems(ordered);
    }
    //END functions/CB

    return (
        <div className={xclassCSS} title="Click on each column header to Order List By.">
            {
                titleTable ? <h4 className="minimumMarginTB textAlignedCenter">{titleTable}</h4> : null
            }
            <table className={`tablePortPublic smallText marginsTB relativeDiv`}>
                <tbody>
                    <tr className="trTablePortP">
                        {
                            toShow.map(keyItem => {
                                return (
                                    <th key={`${keyItem}-KeyJAB`} onClick={() => setKeyOrderBy(keyItem)} className="pointer" title={`Order by ${keyItem}`}>
                                        {String(keyItem).substring(0,1).toLocaleUpperCase() + String(keyItem).substring(1,String(keyItem).length)}
                                    </th>
                                )
                            })
                        }
                    </tr>
                    {
                        items.sort( compare ).map(item => {
                            return (
                                <tr key={item._id} className={`trTableWhite standardLiHovered ${checkHighLight(item)}`} onClick={() => selectedItem(item)}>
                                    {
                                        toShow.map(showThis => {
                                            return (
                                                <td key={`${item._id}-${showThis}`}>
                                                {
                                                    item.hasOwnProperty(showThis) ? 
                                                        (showThis === 'createdAt' || showThis === 'updatedAt' || showThis === 'timestamp') ? formatDateTime(item[showThis].toString()) : item[showThis].toString()
                                                    : 'not assigned yet.'
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