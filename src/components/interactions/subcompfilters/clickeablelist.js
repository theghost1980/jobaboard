import React, { useEffect } from 'react';

/**
 * Render a list of switches. See info on component above as definitions on list.
 * @param {String} xclassCSSUl - Class for the Ul.
 * @param {String} xclassCSSLi - Class for li items.
 * @param {function} clickCB - Call back to assign a value on each switch action
 * @param {[Object]} list the array you want to use. See definition example above.
 * @param {Boolean} devMode optional to debug on console.
 */

const Clickeablelist = (props) => {
    const { xclassCSSUl, xclassCSSLi, clickCB, list, devMode } = props;

    //to load on init
    useEffect(() => {
        if(devMode){
            console.log('Received on props:');
            console.log('xclassCSSUl',xclassCSSUl);
            console.log('xclassCSSLi',xclassCSSLi);
            console.log('clickCB',clickCB);
            console.log('list',list);
        }
    },[]);
    //END to load on init

    //functions/CB
    const sendItem = (item) => {
        if(clickCB){
            clickCB(item);
        }
        if(devMode){ console.log('Clicked on:',item)};
    }
    //END functions/CB

    return (
        <ul className={xclassCSSUl}>
            {
                list.map(item => {
                    return (
                        <li key={`${item.id}-${item.name}-JAB`} className={xclassCSSLi} onClick={() => sendItem(item)}>
                            {item.name}
                        </li>
                    )
                })
            }
        </ul>
    )
}

export default Clickeablelist;

