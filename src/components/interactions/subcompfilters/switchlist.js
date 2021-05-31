import React from 'react'
import Btnswitch from '../../btns/btnswitch';

// const _switchList = [
//     { id: 'switch-3', iniValue: false, sideText: 'Local Users', name: 'switch-3', btnInfo: true, infoMsg: 'Depending on your location, the system will try to filter people near by.'},
//     { id: 'switch-1', iniValue: false, sideText: 'Users with completed Gig/Services', name: 'switch-1'},
//     { id: 'switch-2', iniValue: false, sideText: 'Top Users', name: 'switch-2'},
// ];

/**
 * Render a list of switches. See info on component above as definitions on list.
 * @param {String} xclassCSSUl - Class for the Ul.
 * @param {String} xclassCSSLi - Class for li items.
 * @param {function} clickCB - Call back to assign a value on each switch action
 * @param {[Object]} switchList the array you want to use. See definition example above.
 * @param {Boolean} miniSizes Optional to render a smaller icon on switch.
 * @param {Boolean} devMode optional to debug on console.
 */

const Switchlist = (props) => {
    const { xclassCSSUl, xclassCSSLi, clickCB, switchList, devMode, miniSizes } = props;

    //functions/CB
    const sendItem = (item) => {
        if(clickCB){
            clickCB(item);
        }
        if(devMode){
            console.log('Cen,Switch:',{ cen: cen, switch: switche.name})
        }
    }
    //END functions/CB
    return (
        <ul className={xclassCSSUl} id="ulFilters">
            {
                switchList.map(switche => {
                    return (
                        <li key={switche.id} className={xclassCSSLi}>
                            <Btnswitch 
                                xtraClassCSS={"justAligned space768"} 
                                miniSizes={miniSizes ? miniSizes : null } 
                                initialValue={switche.iniValue} 
                                sideText={switche.sideText} 
                                btnAction={(cen) => sendItem({ cen: cen, switch: switche.name})}
                                addInfoBtn={switche.btnInfo}
                                infoMsg={switche.infoMsg}
                            />
                        </li>
                    )
                })
            }
        </ul>
    )
}

export default Switchlist;
