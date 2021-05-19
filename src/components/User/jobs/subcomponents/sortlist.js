import React, { useState } from 'react';
import Btncollapse from '../../../btns/btncollapse';

/**
 * Used it to visualize a record of any type and amount of fields. 
 * (***) you can specify if the link is a txIb by using {..., link: true, txLink: true }
 * xtraData: is optional to add as side content on that field.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {[Object]} fieldsArray - array of fields to present to user.
 * @param {Function} cbSetOrderBy - Optional The function/CB to return the option to ordeBy.
 * @param {Function} cbSetOrderByAsc - mandatory to toogle asc field on parent's state.
 * @param {Boolean} toogleValue mandatory from parent to switch the image on Btncollapse.js.
 * @param {Boolean} devMode - Optional to see all the props and details. default as false.
 */

const Sortlist = (props) => {
    const { fieldsArray, cbSetOrderBy, devMode, xclassCSS, cbSetOrderByAsc, toogleValue } = props;
    //functions/CB
    function fixFieldToShow(field){
        const _field = String(field).split("_").join(" ");
        return _field.substring(0,1).toUpperCase() + _field.substring(1);
    }
    //END functions/CB
    return (
        <div className="displayFlex normalTextSmall justAligned">
            <label htmlFor="order_by" className="miniMarginRight">Sort Results By:</label>
            <select name="order_by" onChange={(e) => cbSetOrderBy(e)}>
                <option defaultValue="">order options</option>
                {
                    fieldsArray.map(field => {
                        return (
                            <option key={field.id} value={field.field}>{fixFieldToShow(field.field)}</option>
                        )
                    })
                }
            </select>
            <Btncollapse xclassCSS={"miniMarginLeft"} miniSizes={true} title={`Ordered result ${toogleValue ? 'Ascendent' : 'Descendent'}`}
                toogleValue={toogleValue} btnAction={() => cbSetOrderByAsc()}
            />
        </div>
    )
}

export default Sortlist;
