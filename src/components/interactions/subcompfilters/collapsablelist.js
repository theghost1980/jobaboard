import React, { useState, useEffect } from 'react'
import Btncollapse from '../../btns/btncollapse';
import Clickeablelist from './clickeablelist';

// example definition:
// arrayList={[
//     { title: 'Category', collapsable: true, data: arrayFilter }, { title: 'Gig Type', collapsable: true }, { title: 'Delivery Options', collapsable: true },
// ]}

/**
 * Render a clickeable/expandable list/menu.
 * @param {String} xclassCSS - Optional Extra CSS class if needed.
 * @param {function} clickCB - Optional Call back to assign a value on each switch action
 * @param {[Object]} arrayList the array you want to use as [{ title: '', collapsable: Boolean }];
 * @param {Boolean} devMode Optional to debug on console.
 */

const Collapsablelist = (props) => {
    const { xtraClass, clickCB, arrayList, devMode } = props;
    const [clickedON, setClickedON] = useState("");

    //funcions/CB
    const selectClicked = (item) => {
        setClickedON(item === clickedON ? "" : item);
    }
    const sendItem = (item) => {
        if(clickCB){
            clickCB(item);
            setClickedON("");
        }
        if(devMode){ console.log('Clicked on:', item)};
    }
    //END functions/CB

    //to load on init
    useEffect(() => {
        if(devMode){
            console.log('Received on props. Collapsable list.');
            console.log('xtraClass',xtraClass);
            console.log('clickCB',clickCB);
            console.log('arrayList',arrayList);
        }
    },[]);
    //END to load on init

    return (
        <ul className={`standardUlRowFlexPlain ${xtraClass}`}>
            {
                arrayList.map(item => {
                    return(
                        <li key={`${item.title}-collapsableMenu-JAB`} 
                            className={`pointer relativeDiv ${clickedON === item.title ? 'activeInnerMenu' : null }`}
                        >
                            <div className="standardDivRowWHAuto justAligned justBorders">
                                <div className="standardContentMarginLR standardDivRowWHAuto justAligned" onClick={() => selectClicked(item.title)} >
                                    <p className="miniMarginTB">{item.title}</p>
                                    {item.collapsable ? <Btncollapse xclassCSS={"miniMarginLeft"} toogleValue={(clickedON === item.title)}  miniSizes={true} /> : null }
                                </div>
                            </div>
                            {
                                clickedON === item.title && item.list &&
                                <Clickeablelist 
                                    devMode={false}
                                    list={item.list}
                                    clickCB={(item) => sendItem(item)}
                                    xclassCSSUl={"justTopZindex textColorBlack justAbsolutePos standardUlColPlain whiteBack justBorders justMinWidth200px"} xclassCSSLi={"standardLiHovered"}
                                />
                            }
                        </li>
                    )
                })
            }
        </ul>
    )
}

export default Collapsablelist;
