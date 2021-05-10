import React, { useState, useEffect } from 'react';


/**
 * Assign the project to an employee.
 * @param {String} xclassCSS - Extra CSS class if needed.
 * @param {[Object]} selectList the array to render as { id: -, field: -, value: -}. Value will be sent back and field in the middle will be rendered.
 * @param {String} field as the field you need to render to user & return to parent.
 * @param {String} labelText as the title for the label.
 * @param {Function} clickCB the cb to send the clicked item[field] back.
 * @param {Boolean} devMode optional to debug on console.
 */

const Selectdropd = (props) => {

    const { xclassCSS, selectList, clickCB, devMode, field, labelText } = props;
    const [option, setOption] = useState(null);

    //functions/CB
    function updateValue(name, value){
        setOption(prevState => { return { ...prevState, [name]: value }});
    }
    const handleSelected = (item) => {
        const value = item.target.value; 
        if(clickCB){ clickCB({ field: field, value: value }) };
        if(devMode) { console.log('Clicked on:', { field: field, value: value })};
        setOption(value);
    }
    //END functions/CB

    //load on init
    useEffect(() => {
        if(devMode){ console.log('Received as props:', { xclassCSS: xclassCSS, selectList: selectList, clickCB: clickCB, field: field }) };
    }, []);
    //END load on init

    //load on each change
    // useEffect(() => {
    //     if(option){ 
    //         if(devMode){ console.log('option:', option)}
    //         if(clickCB){ clickCB(option) };
    //     };
    // }, [option]);
    //END load on each change

    return (
        <div className={`standardDivColFullW ${xclassCSS}`}>
            <label htmlFor="selectList">{labelText}</label>
            <select name="selectList" onChange={handleSelected}>
                <option defaultValue="">{`Please select a ${field}`}</option>
                {
                    selectList.map(option => {
                        return (
                            <option key={option.id} value={option[field]}>
                                {option[field]}
                            </option>
                        )
                    })
                }
            </select>
            {
                option && option === "Other, specify" &&
                <div className="standardDivColFullW"> 
                    <label htmlFor={field}>The reason is:</label>
                    <textarea name={field} onChange={(e) => clickCB({ field: e.target.name, value: e.target.value })} required />
                </div>
            }
        </div>
    )
}

export default Selectdropd;
