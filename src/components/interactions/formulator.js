import React, { useState, useEffect } from 'react';
import Btnswitch from '../btns/btnswitch';
import Btninfo from '../btns/btninfo';
import { check } from '../../utils/helpers';
import Loader from '../loader';

const Patterns = [
    { name: 'general-string', pattern: "[&\\w\\s]{3,60}", title: 'Letters, numbers and & characters, are allowed. 3 to 25 max.'},
    { name: 'general-string-all', pattern: ".{3,100}", title: 'Letters, numbers and all posible caracters to use as links are allowed. 3 to 100 max.'},
    { name: 'general-string-slash', pattern: "[\/\\w\\s]{3,60}", title: 'Letters, numbers and slash(/) characters, are allowed. 3 to 25 max.'},
    { name: 'email', pattern: "[@.\\w\\s]{8,60}", title: 'Letters, numbers, @ and dots characters are allowed. 8 to 60 max.'},
    { name: 'general-number-dot', pattern: "[.\\d]{0,21}", title: 'Just Numbers 0 - 9 and dot are allowed. 0 to 21 max.'},
    { name: 'general-number-2max', pattern: "[\\d]{1,2}", title: 'Just Numbers 0 - 9. 1 to 2 max.'},
    { name: 'null', pattern: null, title: 'JAB the best place to earn some crypto!'},
]
// const inputs = [
//     { id: 'input-JAB-1', iType: 'text', iName: 'name', iLabel: true, iValue: any, iValueType: 'String', iRequired: true, iPattern: 'general-string', iInfo: true, Imsg: 'Title of the menu, the ones will be shown. I.e: Marketplace.'}},
//     { id: 'input-JAB-2', iType: 'text', iName: 'last_name', iLabel: true, iValue: any, iValueType: 'String', iRequired: true, iPattern: 'general-string', iInfo: true, Imsg: 'Title of the menu, the ones will be shown. I.e: Marketplace.'}},
//     { id: 'input-JAB-3', iType: 'email', iName: 'email', iLabel: true, iValue: any, iValueType: 'String', iRequired: true, iPattern: 'email', iInfo: true, Imsg: 'Title of the menu, the ones will be shown. I.e: Marketplace.'}},
//     { id: 'input-JAB-4', iType: 'text', iName: 'price1', iLabel: true, iValue: any, iRequired: true, iValueType: 'Number', iPattern: 'general-number-dot'},
//     { id: 'input-JAB-5', iType: 'date', iName: 'date_complexion', iLabel: true, iValue: any, iRequired: true, iValueType: 'Date', iPattern: 'null' },
//     { id: 'input-JAB-6', iType: 'text', iName: 'price2', iLabel: false, iValue: any, iRequired: true, iValueType: 'Number', iPattern: 'general-number-dot'},
//     { id: 'input-JAB-7', iType: 'switch', iName: 'active', iLabel: false, iValue: any, iRequired: true, iValueType: 'Boolean', iPattern: 'null'},
// ];

/**
 * Allows you to use a form to edit and send.
 * Parent must provide: mode, data+dataTypes, EP, userdata.
 * Note(**): if you need an iPattern for the input use 2x BackS i.e: "[&\\w\\s]{3,25}"
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} title - Optional if you need to show i.e: Editing NFT.
 * @param {[Object]} inputs as the array of definitions to handle. as example above. Note(** See above for iPattern)
 * @param {Boolean} devMode - Optional to see all the props and details. default as false.
 * @param {Function} closeCb mandatory to cancel or close formulator.
 * @param {String} actionType mandatory as defines if: "add", "update" or "delete".
 * @param {String} beEP mandatory as the BE end point to process the request. I.e: ${adminEP+"updateMainMenu"}
 * @param {Object} selectedToEdit mandatory if you want to edit/remove to assign values/default values.
 * @param {Function} cbOnSuccess mandatory to refresh any list you have made CRUD.
 * @param {[Object]} compareList optional if you need to compare fields on the list against the item you are adding. I.e: object.title === list[0].title.
 * @param {String} uniqueField mandatory to processData as this is the field unique to find on BE and compare to compareList.
 */

const Formulator = (props) => {
    const { xclassCSS, devMode, title, closeCb, inputs, actionType, beEP, compareList, selectedToEdit, uniqueField, cbOnSuccess } = props;
    const [data, setData] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [resultOp, setResultOp] = useState({ status: '', message: '', result: []});
    const userdata = check();

    //to load on init
    useEffect(() => {
        if(devMode){
            console.log("Received on props:");
            console.log("xclassCSS:", xclassCSS);
            console.log("title:", title);
            console.log("inputs", inputs);
            console.log("actionType", actionType);
            console.log("beEP", beEP);
            // console.log("compareList", compareList);
            console.log("selectedToEdit", selectedToEdit);
            console.log("cbOnSuccess", cbOnSuccess);
            console.log("uniqueField", uniqueField);
        }
        if(actionType === 'update' || actionType === 'delete'){
            getInitialState();
        }
    },[]);
    //END to load on init

    //to load on each change of state
    useEffect(() => {
        if(devMode && data){
            console.log('Data',data);
        }
    },[data]);
    //END to load on each change of state

    //functions/CB
    // function compareFieldToList(){ //it will return true if found on the list
    //     const found = compareList.filter(item => item[uniqueField] === data[uniqueField]);
    //     if(devMode){ console.log('Found:', found)};
    //     return (found.length === 1) //if 1 was found, returns true if not false.
    // }
    function getInitialState(){
        Object.entries(selectedToEdit).forEach(([key, value]) => {
            if(devMode){ console.log(key + ' -> ' + value) };
            if(key !== uniqueField && key !== '_id' && key !== '__v'){
                updateDataField('String',key,value);
            }
        });
    }
    function formatField(field){
        const arParts = String(field).split("_").map(part => String(part).substring(0,1).toUpperCase() + String(part).substring(1));
        return arParts.join(" ");
    }
    function updateDataField(typeInput,name,value,target){ //passing target just for devMode
        if(devMode){ console.log('typeInput:', typeInput)};
        const _value = typeInput === 'Number'   ? Number(value) 
                                                : typeInput === 'Boolean' ? Boolean(value) : value; //last as default as it comes, String;
        if(devMode){ 
            console.log(`Incomming input, name: ${name} typeof ${typeof value}`);
            console.log(`_value assigned: ${_value} typeof: ${typeof _value}`);
            console.log('e.target',target);
        };
        // if(name === uniqueField && compareFieldToList()){ return alert(`${uniqueField} found on list. Please choose another one`)}
        setData(prevState => { return { ...prevState, [name]: _value }});
        if(actionType === "add"){
            setData(prevState => { return { ...prevState, ['createdAt']: new Date() }});
        }else{
            setData(prevState => { return { ...prevState, ['updatedAt']: new Date() }});
        }
    }
    const processData = (event) => {
        event.preventDefault();
        setLoadingData(true);
        if(actionType === "add" || actionType === "update"){
            const uniqueDataField = selectedToEdit ? selectedToEdit[uniqueField] : data[uniqueField]
            const typeRequest = "POST";
            const headers = { 'x-access-token': userdata.token, 'titlemenu': uniqueDataField };
            const formdata = new FormData();
            const testObj = {};
            Object.entries(data).forEach(([key, value]) => {
                if(devMode){ console.log(key + ' -> ' + value) };
                    formdata.append(key,value);
                    testObj[key] = value;
            });
            if(devMode){ console.log('About to send:(already saved as formdata) ', testObj)};
            if(devMode){ console.log('As uniqueField:(uniqueDataField)', uniqueDataField)};
            dataRequest(typeRequest, beEP, headers, formdata)
            .then(response => {
                console.log(response);
                if(response.status === 'sucess'){
                    setResultOp({ status: response.status, message: `Item ${actionType}ed. You may close this.`});
                    cbOnSuccess(title)
                }else{
                    setResultOp({ status: response.status, message: response.message });
                }
                setLoadingData(false);
            }).catch(error => {
                console.log(`Error when sending data request ${typeRequest} to BE.`, error);
                setResultOp({ status: 'Error', message: error });
                setLoadingData(false);
            });
        }
        //TODO: delete as it can be done using a GET.
    }

    // headers: {
    //     'x-access-token': userdata.token,
    //     'query': JSON.stringify(query),
    //     'limit': limit,
    //     'sortby': JSON.stringify(sortby),
    // },
    ///data fecthing
    async function dataRequest(typeRequest, url, headers, formdata){
        const response = await fetch(url, { method: typeRequest, headers: headers, body: formdata,});
        return response.json();
    }
    ///END data fecthing
    //END functions/CB

    return (
        <div className="marginsTB">
            {
                !loadingData &&
                <div>
                    {
                        (resultOp.status === 'sucess')
                        ?
                        <div>
                            <h3>{resultOp.message}</h3>
                            <button onClick={closeCb}>Close</button>
                        </div>
                        :
                        <div>
                            <h3>{resultOp.message}</h3>
                        </div>
                    }
                </div>
            }
            {
                loadingData && 
                <div>
                    <Loader xtraClass={"standardDivRowFlex100pX100pCentered"} logginIn={loadingData} typegif={"blocks"}/>
                </div>
            }
            {
                !loadingData && title ? <p>{formatField(title)}</p> : null
            }
            {   !loadingData &&
                <form className="marginsTB" onSubmit={processData}>
                    <div className="standardFormColHorFullWAutoH relativeDiv colorX marginBottom">
                    {
                        inputs.map(item => {
                            return (
                                (item.iLabel === true) ?
                                    <div key={`${item.id}-${item.iName}`} className="standardFormColHorFullWAutoH">
                                        <label htmlFor={item.iName}>
                                            {formatField(item.iName)}{" "}
                                            {
                                                item.iInfo && <Btninfo size={"mini"} msg={item.iMsg} />
                                            }
                                        </label>
                                        <input type={item.iType} name={item.iName} required={item.iRequired} pattern={Patterns.filter(pat => pat.name === item.iPattern)[0].pattern} 
                                            placeholder={`Place your ${item.iName} here.`} title={Patterns.filter(pat => pat.name === item.iPattern)[0].title} 
                                            onChange={(e) => updateDataField(item.iValueType, e.target.name, e.target.value,e.target)}
                                            defaultValue={selectedToEdit ? selectedToEdit[item.iName] : ''}
                                            disabled={(actionType === 'update' || actionType === 'delete') && item.iName === uniqueField}
                                        />
                                    </div>
                                    :
                                    (item.iType === 'text' || item.iType === 'email' || item.iType === 'date')
                                        ? 
                                        <input type={item.iType} name={item.iName} required={item.iRequired} pattern={Patterns.filter(pat => pat.name === item.iPattern)[0].pattern} 
                                            key={`${item.id}-${item.iName}`} title={Patterns.filter(pat => pat.name === item.iPattern)[0].title} 
                                            placeholder={`Place your ${item.iName} here.`}
                                            onChange={(e) => updateDataField(item.iValueType, e.target.name,e.target.value,e.target)}
                                            defaultValue={selectedToEdit ? selectedToEdit[item.iName] : ''}
                                        />
                                        :
                                        <Btnswitch 
                                            xtraClassCSS={"justAligned"}
                                            btnAction={(cen) => updateDataField(item.iValueType, item.iName, cen, null)}
                                            initialValue={selectedToEdit ? selectedToEdit[item.iName] : false} sideText={formatField(item.iName)}
                                            addInfoBtn={item.iInfo} infoMsg={item.iMsg}
                                        />
                            )
                        })
                    }
                    </div>
                    <div className="standardDisplayJusSpaceAround">
                        <button type="button" onClick={closeCb}>cancel</button>
                        <button type="submit">
                            {actionType === 'add' ? 'Submit' : 'Update'}
                        </button>
                    </div>
                </form>
            }
        </div>
    )
}

export default Formulator;