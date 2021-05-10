import React, { useState } from 'react'
import Btncollapse from '../btns/btncollapse';
import Collapsablelist from './subcompfilters/collapsablelist';
import Switchlist from './subcompfilters/switchlist';
import Clickeablelist from './subcompfilters/clickeablelist';

//controlsType: 
//      - 'none' as a simple li - list clickable.
//      - 'radio' as for radio buttons.
//      - 'check' as for check buttons.
//      -  'min-max' as displaying a max & min inputs.

// const arrayFilter = [
//     { id: 'filter-1-JAB', title: 'Category', iconExpand: true, controlsType: 'none', displaySetBtns: true, innerData: ['cat 1','cat 2', 'cat 3'], ToCB: { name: 'field1', value: 'any'} },
//     { id: 'filter-2-JAB', title: 'Gig Type', iconExpand: true, controlsType: 'none', displaySetBtns: true, innerData: ['cat 1','cat 2', 'cat 3'], ToCB: { name: 'field1', value: 'any'} },
//     { id: 'filter-3-JAB', title: 'Gig Options', iconExpand: true, controlsType: 'none', displaySetBtns: true, innerData: ['cat 1','cat 2', 'cat 3'], ToCB: { name: 'field1', value: 'any'} },
//     { id: 'filter-4-JAB', title: 'Delivery Time', iconExpand: true, controlsType: 'none', displaySetBtns: true, innerData: ['cat 1','cat 2', 'cat 3'], ToCB: { name: 'field1', value: 'any'} },
// ]

/**
 * Render a clickeable menu used to filtering options.
 * @param {String} xclassCSS - Extra CSS class if needed.
 * @param {function} clickCB - Call back to assign a value on each switch action
 * @param {[Object]} arrayFilter the array you want to use. See definition example above.
 * @param {Boolean} devMode optional to debug on console.
 */

const Filtersquery = (props) => {

    const { clickCB, xclassCSS, devMode, arrayFilter } = props;

    const [filterSelected, setFilterSelected] = useState(null);

    //functions/CB
    const selectFilter = (item) => {
        if(filterSelected && item.title === filterSelected.title){
            setFilterSelected(null);
        }else{
            setFilterSelected(item);
            console.log('Selected:', item);
        }
    }
    const clickedItem = (item) => {
        if(clickCB){
            clickCB(item);
        }
        if(devMode){ console.log('Clicked on:', item)};
    }
    //END functions/CB

    return (
        <div>
            <div className="relativeDiv">
                <Collapsablelist 
                    arrayList={[
                        { title: 'Category', collapsable: true, list: arrayFilter.map((item) => {return { id: item.id, name: item.name, from: 'category'}} ) }, 
                        { title: 'Gig Type', collapsable: true, list: [{ id: 'job_type', name: 'Employer', from: 'job_type'}, { id: 'job_type', name: 'Employee' , from: 'job_type'},] }, 
                        { title: 'Delivery Options', collapsable: true, list: [{ id: 'sortby_delivery_1_day', name: '1  Day or less', from: 'delivery_options'}, { id: 'sortby_delivery_2_day', name: '2 Days', from: 'delivery_options'}, { id: 'sortby_delivery_0_day', name: '3 Days or more', from: 'delivery_options'}] },
                        { title: 'No Filters Needed', collapsable: true, list: [{ id: 'job_type', name: 'Employer Gigs All', from: 'no_filters'}, { id: 'job_type', name: 'Employee Gigs All' , from: 'no_filters'}, { id: 'job_type', name: 'All' , from: 'no_filters'},] }, 
                    ]}
                    clickCB={(item) => clickedItem(item)}
                    devMode={false}
                />
                {/* <Clickeablelist 
                    list={arrayFilter}
                    clickCB={(item) => console.log('Clicked on:', item)}
                    xclassCSSUl={"standardUlColPlain whiteBack justBorders justMinWidth200px"} xclassCSSLi={"standardLiHovered"}
                /> */}
            </div>
            <Switchlist miniSizes={true} xclassCSSUl={"standardUlRowFlexPlain justSpaceAround normalTextSmall"}
                clickCB={(itemSwitch) => console.log('item Switch clicked', itemSwitch)}
                switchList={[
                    { id: 'switch-3', iniValue: false, sideText: 'Local Users', name: 'query_local_users', btnInfo: true, infoMsg: 'Depending on your location, the system will try to filter people near by.'},
                    { id: 'switch-1', iniValue: false, sideText: 'Users with completed Gig/Services', name: 'query_exp_jab'},
                    { id: 'switch-2', iniValue: false, sideText: 'Top Users', name: 'query_top_users'},

                ]}
            />
            {/* <ul className="standardUlRowFlexPlain">
                {
                    arrayFilter.map(item => {
                        return (
                            <li key={item.id} className={`pointer relativeDiv ${filterSelected && filterSelected.title === item.title ? 'activeInnerMenu' : null}`}>
                                <div className="standardDivRowWHAuto justAligned justBorders" onClick={() => selectFilter(item)}>
                                    <div className="standardContentMarginLR standardDivRowWHAuto justAligned">
                                        <p className="miniMarginTB">{item.title}</p>
                                        {item.iconExpand ? <Btncollapse xclassCSS={"miniMarginLeft"} toogleValue={(filterSelected && filterSelected.title === item.title)}  miniSizes={true} btnAction={(val) => console.log(val)} /> : null }
                                    </div>
                                </div>
                                {
                                    filterSelected && item.controlsType === 'none' && //in case none control we display a simple clickeable list.
                                    <ul className={`standardUlColPlain textColorBlack zIndexTop whiteBack justMinWidth200px justAbsolutePos ${filterSelected.title === item.title ? 'justBorders': null }`}>
                                        <div className="standardContentMargin">
                                        {
                                            filterSelected.innerData.map(dataItem => {
                                                return (
                                                    <li key={`${dataItem}-JAB-filters`} className={`standardLiHovered ${filterSelected.title === item.title ? 'showDiv': 'noShowDiv'}`}
                                                        onClick={() => clickedItem(dataItem)}
                                                    >
                                                        {dataItem}
                                                    </li>
                                                )
                                            })
                                        }
                                        {
                                            filterSelected && (item.displaySetBtns === true) && filterSelected.btnArray &&
                                            <div className="standardDisplayJusSpaceAround marginsTB justHeight35p">
                                                {
                                                    filterSelected.btnArray.map(btn => {
                                                        return (
                                                            <button key={`${btn.title}-btnFilters-JAB`} className={`justNoPadding ${btn.css}`}>
                                                                {btn.title}
                                                            </button>
                                                        )
                                                    })
                                                }
                                            </div>
                                        }
                                        </div>
                                    </ul>
                                }
                            </li>
                        )
                    })
                }
            </ul> */}
        </div>
    )
}

export default Filtersquery;
