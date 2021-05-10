import React, { useState, useEffect } from 'react';

/**
 * Sets a Ul horizontal menu and pass active prop to parent to activate childs css classes on hovered.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Function} clickedSubItemCB - The function/CB to return the hovered item on menu.
 * @param {[Object]} items - The Array of objects to map and present.
 * @param {Boolarn} devMode to console on log.
 */

const Menuhover = (props) => {

    const { xclassCSS, clickedSubItemCB, items, devMode } = props;
    // const items = [
    //     {title: 'Manage Categories', cbProp: 'manageCat', subMenu: [ 'List Categories'],},
    //     {title: 'Manage Platform', cbProp: 'managePlat', subMenu: [ 'List Options', 'Fire a Rebuild Hook']},
    //     {title: 'Logs', cbProp: 'manageLogs', subMenu: [ 'List Logs']},
    // ]
    const [selectedItem, setSelectedItem] = useState(null);

    //functions/CB
    const onMouseE = (item) => {
        if(devMode) { console.log('Mouse Enter on Menu Hoover:', item) };
        setSelectedItem(item);
    }
    const selectedSub = (subItem) => {
        // console.log('Click on', subItem);
        if(devMode) { console.log('Clicked on subItem on Menu Hoover:', subItem) };
        clickedSubItemCB(subItem);
    }
    //END functions/CB
    return (
        <div>
            <ul className="standardUlRowFlexPlain justifyContentSEvenly">
                {
                    items.map(item => {
                        return (
                            <div key={`${item.cbProp}-DIVADMIN-Jab`} onMouseLeave={() => setSelectedItem(null)}>
                                <li className="standardLiHoveredRounded relativeDiv" key={`${item.cbProp}-Item`} onMouseEnter={() => onMouseE(item)}>
                                    {item.title}
                                </li>
                                {   selectedItem && selectedItem.title === item.title &&
                                    <ul className="justAbsolutePos standardUlVerSmallPlain whiteBack zIndexTop">
                                        {
                                            selectedItem.subMenu.map(subItem => {
                                                return (
                                                    <li className="standardLiHovered" key={`${subItem}-sub-Item-JAB`} onClick={() => selectedSub(subItem)}>{subItem}</li>
                                                )
                                            })
                                        }
                                    </ul>
                                }
                            </div>
                        )
                    })
                }
            </ul>
        </div>
    )
}

export default Menuhover;