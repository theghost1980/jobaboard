import React, { useState, useEffect } from 'react';

// code example to use the menus and submenus
// items = [
//     {id: '1-JAB', title: 'Search NFT', hasSubMenu: false, clickeable: true }, 
//     {id: '2-JAB', title: 'Import', hasSubMenu: false, clickeable: true}, 
//     {
//         id: '3-JAB', 
//         title: 'Menu 3', 
//         hasSubMenu: true, 
//         clickeable: false,
//         subMenu: [
//             { id: 'sub-menu-Jab-1', title: 'Sub Menu 1', clickeable: true},
//             { id: 'sub-menu-Jab-2', title: 'Sub Menu 2', clickeable: true},
//         ],
//     },
// ]

/**
 * Sets a Ul horizontal menu and pass active prop to parent to activate childs css classes on hovered.
 * @param {Function} clickedSubItemCB - The function/CB to return the hovered item on menu.
 * @param {[Object]} items - The Array of objects to map and present. as [ {id: '1-JAB', title: 'Search NFT', hasSubMenu: false, clickeable: true }, ...]
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} xclassCSSUL - Optional The css Extra class for the Ul.
 * @param {Boolean} resetAfterCb - optional if you need to reset the state after the user click an item.
 * @param {Boolean} devMode - optional to show logs & props.
 */

const Menuside = (props) => {
    const { xclassCSS, xclassCSSUL, clickedSubItemCB, items, devMode, resetAfterCb } = props;
    // const items = [
    //     {id: '', title: 'Manage Categories', subMenu: [ 'List Categories'],},
    // ]
    const [selectedItem, setSelectedItem] = useState(null);

    //load on init
    useEffect(() => {
        if(devMode){
            console.log('Received on props:');
            console.log("items",items);
        }
    },[]);
    //END to load on init
    //functions/CB
    const clickedOnMenu = (menuItem,typeMenu) => {
        if(typeMenu === 'menu'){
            if(menuItem.title === selectedItem){
                setSelectedItem("");
            }else{
                setSelectedItem(menuItem.title);
            }
        }
        if(menuItem.clickeable){
            clickedSubItemCB(menuItem.title)
            if(resetAfterCb){ setSelectedItem("")};
        }
    }
    const selectedSub = (subItem) => {
        // console.log('Click on', subItem);
        clickedSubItemCB(subItem);
    }
    //END functions/CB
    return (
        <div className={`${xclassCSS}`}>
            <ul className={`${xclassCSSUL}`}>
                {
                    items.map(menuItem => {
                        return (
                            <div>
                                <li key={`${menuItem.id}-${menuItem.title}`}
                                    className={`${selectedItem === menuItem.title ? 'activeSelected listItemOpened activeSelectedText': 'listItemClosed'} standardLiHovered`}
                                    onClick={() => clickedOnMenu(menuItem,"menu")}
                                >
                                    {menuItem.title}
                                </li>
                                {
                                    menuItem.hasSubMenu && (menuItem.title === selectedItem) &&
                                    <ul>
                                        {
                                            menuItem.subMenu.map(subMenu => {
                                                return (
                                                    <li className="standardLiHovered"
                                                        key={`${subMenu.id}-${menuItem.id}`}
                                                        onClick={() => clickedOnMenu(subMenu,"submenu")}
                                                    >
                                                        {subMenu.title}
                                                    </li>
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

export default Menuside;