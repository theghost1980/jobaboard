import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../../utils/helpers';
import Btnoutlink from '../btns/btnoutlink';

//constants
const fieldsDateAr = [ 'createdAt', 'Date', 'updatedAt', 'ts', 'timestamp'];
//END constants

/**
 * Sets a Ul horizontal menu and pass active prop to parent to activate childs css classes on hovered.
 * (1) - { field: '_id', limitTo: 10, link: true } -> limitTo: amount of max chars to show, link if link.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Function} clickedSubItemCB - The function/CB to return the hovered item on menu.
 * @param {[Object]} items - The Array of objects to map and present.
 * @param {Object} toShow - The props you want to display of this array of items' As ['name','title','query','active']
 * @param {String} titleTable - Optional, if provided will show a title on Top as a Tr.
 * @param {Object} highLight - optional if you need to highligth a record based on equalTo. as { field: 'field', compareTo: any }
 * @param {Object} arraySpecs - optional if you need to limit a field or make it a link. (1)
 * @param {Object} pagination - optional if you need to show N record per "page" with a clickeable options menu to move. As { perPage: 10, controls: Boolean }.
 * @param {Boolean} devMode - Optional to see all the props and details. default as false.
 */

const Tablinator = (props) => {

    const { xclassCSS, clickedSubItemCB, items, toShow, devMode, titleTable, highLight, arraySpecs, pagination } = props;
    const [orderBy, setOrderBy] = useState({ keyOrderBy: '', asc: false });
    const [itemsToShow, setItemsToShow] = useState(null);
    // for pagination
    const [itemsPagination, setItemsPagination] = useState(null);
    const [selectedPage, setSelectedPage] = useState({ index: 0, page: 1 });
    // END for pagination
    //to load on init
    useEffect(() => {
        if(devMode){ console.log('Received on props: tablinator,', { xclassCSS, clickedSubItemCB, items, toShow, devMode, titleTable, highLight, arraySpecs, pagination } );}
        if(items){
            console.log('Applying some showing rules to the state:');
            const newOne = [];
            items.map(item => {
                const newObject = {};
                Object.entries(item).forEach(([key,value]) => {
                    if(toShow.find(showThis => showThis === key) || key === '_id'){
                        newObject[key]= checkSpecs(value,key);
                    }
                })
                newOne.push(newObject);
            });
            if(pagination){
                function paginate (arr, size) {
                    return arr.reduce((acc, val, i) => {
                      let idx = Math.floor(i / size)
                      let page = acc[idx] || (acc[idx] = [])
                      page.push(val)
                  
                      return acc
                    }, [])
                }
                let page_size = pagination.perPage;
                let pages = paginate(newOne, page_size);
                setItemsPagination(pages);
                console.log('pagination:', pages);
            }
            console.log('New One, all applied:', newOne);
            setItemsToShow(newOne);
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
        const toSend = items.find(_item => _item._id === item._id);
        if(devMode){ console.log('Clicked and about to send it to parent IF exists CB:', toSend);}
        if(clickedSubItemCB){
            clickedSubItemCB(toSend);
        }
    }
    function compare(a, b) {
        if( !isNaN(a[orderBy.keyOrderBy]) && !isNaN(b[orderBy.keyOrderBy]) ){
            if(devMode) console.log('Comparing as Numbers Detected.');
            const asNumbers = { a: Number(a[orderBy.keyOrderBy]), b: Number(b[orderBy.keyOrderBy])};
            if ( asNumbers.a < asNumbers.b ){ return  orderBy.asc ? 1 : -1 };
            if ( asNumbers.a > asNumbers.b ){ return  orderBy.asc ? -1 : 1 };
        }else{
            if(devMode) console.log('Comparing as Others(Strings, Booleans, etc.) Detected.');
            if ( a[orderBy.keyOrderBy] < b[orderBy.keyOrderBy] ){ return  orderBy.asc ? 1 : -1 };
            if ( a[orderBy.keyOrderBy] > b[orderBy.keyOrderBy] ){ return  orderBy.asc ? -1 : 1 };
        };
        return 0;
    }
    function fixTitle(field){
        const _field = String(field).split("_").join(" ");
        return String(_field).substring(0,1).toLocaleUpperCase() + String(_field).substring(1,String(_field).length)
    }
    function checkSpecs(content,field){
        if(devMode){ console.log('Received:', { content, field })};
        if(fieldsDateAr.find(dateField => dateField === field)){
            return formatDateTime(content);
        }
        if(arraySpecs){
            const found = arraySpecs.find(item => item.field === field); //i.e {field: 'tx_id', limitTo: 4, link: true },
            if(devMode){ console.log('Found:', found)};
            if(found && found.limitTo){
                if(content === "" || content === null || content === undefined) { return 'Not Set.'}
                const toReturn = String(content).substring(0,Number(found.limitTo)) + "...";
                if(found.link && found.typeLink === "jabExplorer"){
                    return <Btnoutlink xclassCSS={"justWidth100"} link={`/jabexplorer?tx_id=${content}`} textLink={toReturn} toolTip={"Click to view details of this Tx on chain explorer"}/>
                }else{
                    return toReturn;
                }
            }
        }
        return (content === "" || content === null || content === undefined) ? 'Not Set' : String(content);
    }
    //END functions/CB

    //load on state changes
    useEffect(() => {
        if(devMode){ console.log('Order by:', orderBy )};
        if(itemsToShow){ setItemsToShow( itemsToShow.sort( compare ) )};
        // if(itemsPagination){ 
        //     const pageActualSorted = itemsPagination[selectedPage.index].sort(( compare ));
        //     console.log('Actual page sorted: ',pageActualSorted);
        //     const itemsPaginationTemp = itemsPagination.filter(item => item !== pageActualSorted);
        //     setItemsPagination(prevState => [...prevState, pageActualSorted ]);
        //  };
    },[orderBy]);
    //END load on state changes

    return (
        <div className={xclassCSS} title="Click on each column header to Order List By.">
            {
                titleTable ? <h4 className="minimumMarginTB textAlignedCenter">{titleTable}</h4> : null
            }
            {
                !pagination ?
                <table className={`tablePortPublic smallText marginsTB relativeDiv`}>
                    <tbody>
                        <tr className="trTablePortP">
                            {
                                toShow.map(keyItem => {
                                    return (
                                        <th key={`${keyItem}-KeyJAB`} onClick={() => setOrderBy({ keyOrderBy: keyItem, asc: !orderBy.asc })} className="pointer" title={`Order by ${keyItem}`}>
                                            {fixTitle(keyItem)}
                                        </th>
                                    )
                                })
                            }
                        </tr>
                        {   itemsToShow &&
                            itemsToShow.map(item => {
                                return (
                                    <tr key={item._id} className={`trTableWhite standardLiHovered ${checkHighLight(item)}`} onClick={() => selectedItem(item)}>
                                        {
                                            toShow.map(showThis => {
                                                return (
                                                    <td key={`${item._id}-${showThis}`}>{item[showThis] ? item[showThis] : 'Not Set'}</td>
                                                )
                                            })
                                        }
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>    
                :
                <div>
                <table className={`tablePortPublic smallText marginsTB relativeDiv`}>
                    <tbody>
                        <tr className="trTablePortP">
                            {
                                toShow.map(keyItem => {
                                    return (
                                        <th key={`${keyItem}-KeyJAB`} onClick={() => setOrderBy({ keyOrderBy: keyItem, asc: !orderBy.asc })} className="pointer" title={`Order by ${keyItem}`}>
                                            {fixTitle(keyItem)}
                                        </th>
                                    )
                                })
                            }
                        </tr>
                        {   itemsPagination &&
                            itemsPagination[selectedPage.index].map(item => {
                                return (
                                    <tr key={item._id} className={`trTableWhite standardLiHovered ${checkHighLight(item)}`} onClick={() => selectedItem(item)}>
                                        {
                                            toShow.map(showThis => {
                                                return (
                                                    <td key={`${item._id}-${showThis}`}>{item[showThis] ? item[showThis] : 'Not Set'}</td>
                                                )
                                            })
                                        }
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                {
                    itemsPagination &&
                    <div>
                        <ul className="standardUlHorMini justFlexWrap">
                            {
                                itemsPagination.map((page,index) => {
                                    return (
                                        <li key={`${index}-pagination-JAB`} 
                                            onClick={() => setSelectedPage({ index: index, page: index + 1})}
                                            className={`marginRight pointer ${selectedPage.index === index ? 'activePage' : null }`}
                                        >
                                            {index + 1}
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <p className="normalTextSmall">Total: {items.length} {titleTable ? titleTable : null}</p>
                    </div>
                }
                </div>
            }
        </div>
    )
}

export default Tablinator;


//removed code////
{/* {
    itemsLocal.map(item => {
        return (
            <tr key={item._id} className={`trTableWhite standardLiHovered ${checkHighLight(item)}`} onClick={() => selectedItem(item)}>
                {
                    toShow.map(showThis => {
                        return (
                            <td key={`${item._id}-${showThis}`}>
                            {
                                item.hasOwnProperty(showThis) ? 
                                    (showThis === 'createdAt' || showThis === 'updatedAt' || showThis === 'timestamp') ? formatDateTime(item[showThis].toString()) : checkSpecs(item[showThis].toString(),showThis)
                                : 'Not Set.'
                            }
                            </td>
                        )
                    })
                }
            </tr>
        )
    })
} */}
//removed code////