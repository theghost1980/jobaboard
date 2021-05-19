import React, { useState, useEffect } from 'react';
import { check } from '../../../../utils/helpers';
import ImageUploader from "react-images-upload";
import Loader from '../../../loader';
import Absscreenwrapper from '../../../absscreenwrapper';
import Tablinator from '../../../interactions/tablinator';
import { useStaticQuery, graphql } from 'gatsby';
import Imageeditor from './imageeditor';
import Sliderjobimages from './sliderjobimages';
import Btninfo from '../../../btns/btninfo';

//constants
const jobEP = process.env.GATSBY_jobEP;
const orderEP = process.env.GATSBY_orderEP;
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const job_types =[{ id: 'employee-1-JAB', title: 'Employee(Who offers a Job/Service. I.e: I want to get hired.)', value: 'employee'}, { id: 'employer-2-JAB', title: 'Employer(Who needs somebody to do Job/Service. I.e: I want to hire a professional.)', value: 'employer'},];
//END constants

/**
 * Use to Edit/Delete a Job.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Object} job the object to edit/delete.
 * @param {String} job_id the id of the Job.
 * @param {Function} cbClose to close the component.
 * @param {String} action from parent as 'edit' or 'delete'.
 * @param {Boolean} devMode - Optional to see all the props and details. default as false.
 */

const Editjob = (props) => {
    const userdata = check();
    const { job, job_id, xclassCSS, devMode, cbClose, action } = props;
    //graphql queries
    const data = useStaticQuery(graphql`
        query{
            cats: allMongodbGatsbyCategories(sort: {fields: name}) { totalCount edges { node { active id thumb image name query sub_category subtitle title } } }
        }
    `);//end grapqhl queries
    const initialJobState = {
        username: userdata.username,
        category: job.category,
        sub_category: job.sub_category,
        title: job.title,
        days_to_complete: job.days_to_complete, //by default 1 day.
        job_type: job.job_type,
        nft_symbol: job.nft_symbol,
        description: job.description,
        // images: job.images, 
        paying_price: job.paying_price,
        promoted: job.promoted, 
        active: job.active, 
        verifyed_profiles_only: job.verifyed_profiles_only,
        // file: [File],
    };
    const [nfts, setNfts] = useState(null);
    const [token, setToken] = useState(null);
    const [state, setstate] = useState(initialJobState);
    const [loadingData, setLoadingData] = useState(true);
    const [subCats, setSubCats] = useState(null);
    const [resultOp, setResultOp] = useState({ status: '', message: '', result: [], jsx: [] });

    //functions/CB
    const sendData = (event) => {
        setLoadingData(true);
        event.preventDefault();
        sendRequest();
    }
    const sendRequest = () => {
        const headers = { 'x-access-token': userdata.token, 'job_id': job_id, 'operation': action }; ///job_id
        const formdata = new FormData();
        if(action === 'edit'){
            const testData = {};
            console.log('state to process:', state);
            Object.entries(state).forEach(([key,value]) => {
                formdata.append(key,value);
                testData[key]=value;
            });
            formdata.append("updatedAt", new Date());
            testData['updatedAt'] = new Date();
            if(devMode){ console.log('About to send data in formdata:', testData)}
        }else if(action === 'delete'){
            const answer = window.confirm(`Are you sure to delete the Job: ${state.title}?`);
            if(!answer){
                return cbClose();
            }
            formdata.append("action_type","delete_job");
            formdata.append("job_id",job_id);
            formdata.append("data",JSON.stringify(state));
        }
        requestData(jobEP+"updateJob", "POST", headers, formdata).then(response => {
            if(devMode){ console.log(response) };
            setResultOp({ status: response.status, message: response.message, result: response.result });
            setLoadingData(false);
        }).catch(error => { 
            console.log('Error fetching data to BE.', error);
            setLoadingData(false);
        });
    }
    function getNftsUser(){
        const headers = {'x-access-token': userdata.token, 'query': JSON.stringify({ account: userdata.username, }), 'sortby': JSON.stringify({ symbol: 1 }) };
        requestData(nfthandlermongoEP + "getNFTquery", "GET", headers, null).then(response => {
            console.log(response);
            if(response.status === 'sucess'){ setNfts(response.result) };
            setLoadingData(false);
        }).catch(error => {
            console.log('Error getting NFTs.', error);
            setLoadingData(false);
        })
    }
    const handleSelectedCat = (event) => {
        const cat = event.target.value;
        const _subCats = data.cats.edges.filter(({node: category}) => category.name === cat)[0].node.sub_category;
        setSubCats(_subCats);
        updateState("category",cat);
    }
    function updateState(name,value){
        setstate(prevState => { return {...prevState, [name]: value }});
    }
    //fecthing data
    async function requestData(url = '', requestType, headers, formdata) {
        const response = !formdata ? fetch(url, { method: requestType, headers: headers,}) : fetch(url, { method: requestType, headers: headers, body: formdata});
        return (await response).json(); 
    };
    //end fetching data
    //END functions/CB

    //to load on init
    useEffect(() => {
        if(devMode) { console.log('My props:', {job, job_id, xclassCSS, devMode, action, cbClose})}
        if(job_id){
            let promise_hasOrders = new Promise(function(resolve,reject){
                const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ job_id: job_id, username_employee: userdata.username, status: 'to Complete' }), 'limit': 4, 'sortby': JSON.stringify({ null: 'null' }), }
                requestData(orderEP+"getOrderquery", "GET", headers, null).then(response => {
                    if(devMode){ console.log(response)};
                    if(response.status === 'sucess' && response.result.length > 0){
                        const _lenght = response.result.length;
                        setResultOp({ 
                                status: 'Not Editable', 
                                message: `There is ${_lenght} Order${_lenght === 1 ? '':'s'} in progress, related to this Job, as "To Complete". Please create a new Gig/Service or contact the counter part, to cancel the associated order!.`,
                                result: response.result,
                            });
                        resolve('Has Orders');
                    }else{
                        resolve('Has No Orders');
                    }
                    setLoadingData(false);
                }).catch(error => { reject({ error: error }) });
            });
            promise_hasOrders.then(result =>{
                console.log('Promise result: ', result);
                if(result === 'Has Orders'){ return null };
                if(result === 'Has No Orders'){
                    if(action === 'edit'){
                        const _subCats = data.cats.edges.filter(({node: category}) => category.name === state.category )[0].node.sub_category;
                        setSubCats(_subCats);
                        getNftsUser();
                    }else if(action === 'delete'){
                        sendRequest();
                    }
                }
            }).catch(error => { console.log('Error getting Order on BE.', error) });
        }
    },[]);
    //END to load on init

    //to load on state change
    useEffect(() => { if(nfts){ setToken(nfts.find(nft => nft.symbol === state.nft_symbol)) }; },[nfts]);
    useEffect(() => { if(token){ updateState("nft_symbol",token.symbol); } },[token]);
    useEffect(() => { if(state && devMode){ console.log('state changes:', state) }; },[state]);
    //END to load on state change

    return (
        <Absscreenwrapper xtraClass={"justifyFlexStart"}>
            <div className={`${xclassCSS} justTop100p standardDiv80Auto whiteBack justBordersRounded`}>
                <div className="standardContentMargin">
                {
                    resultOp.status === 'Not Editable' &&
                    <div className="displayFlex justFlexDirection">
                        <h1>Selected Job is {resultOp.status}</h1>
                        <p>{resultOp.message}</p>
                        <p>Found orders:</p>
                        <Tablinator 
                            clickedSubItemCB={(item) => console.log('Clicked on:', item)}
                            items={resultOp.result}
                            toShow={['_id','status','username_employer','nft_id','nft_amount','total_amount']}
                        />
                    </div>
                }
                {
                    resultOp.status === 'sucess' &&
                    <div className="displayFlex justFlexDirection">
                        <h1>Job operation is {resultOp.status} status</h1>
                        <p>{resultOp.message}</p>
                    </div>
                }
                {
                    (loadingData) &&
                    <div className="standardDivRowFlex100pX100pCentered">
                        <Loader logginIn={loadingData} />
                    </div>
                }
                {
                    (action === 'edit') && !loadingData && resultOp.status === '' &&
                    <div>
                        <h1>About to Edit</h1>
                        {   job &&
                                <div className="standardDivRowFullW">
                                    <Sliderjobimages size={"mini"} job={job} />
                                </div>
                        }
                        <form className="formVertFlex2" onSubmit={sendData}>
                            <div className="standardDivRowFullW justiAlig">
                                <h2 name="title" disabled defaultValue={state.title}>Title: {state.title}</h2>
                                <Btninfo size={"mini"} msg={'If you must change the title. We recommend delete the Gig and create a new one.'} />
                            </div>
                            <label htmlFor="days_to_complete">Days to complete</label>
                            <input name="days_to_complete" defaultValue={state.days_to_complete} onChange={(e)=> updateState(e.target.name,e.target.value)} required pattern="[0-9]{1,2}" title="Just Numbers 0 - 9. 0 to 2 characters max." />
                            <label htmlFor="job_type">Job Type</label>
                            <select name="job_type" defaultValue={state.job_type} onChange={(e)=> updateState(e.target.name,e.target.value)} required>
                                {job_types.map(job => { return ( <option key={job.id} value={job.value}>{job.title}</option>)})}
                            </select>
                            <label htmlFor="description">Description</label>
                            <textarea name="description" required defaultValue={state.description} onChange={(e)=>updateState(e.target.name,e.target.value)}  />
                            <label htmlFor="category">Category</label>
                            <select name="category" required defaultValue={state.category} onChange={handleSelectedCat}>
                            { data.cats.edges.map(({ node:cat }) => { 
                                if(!cat.active) return null
                                    return ( <option key={cat.id}>{cat.name}</option> )
                                })
                            }
                            </select>
                            <label htmlFor="sub_category">Sub Category</label>
                            {   subCats &&
                                <select name="sub_category" required defaultValue={state.sub_category} onChange={(e)=>updateState(e.target.name,e.target.value)}>
                                    <option defaultValue="Select one Option"></option>
                                    { subCats.map(subcat => { return ( <option key={`${subcat}-categoryJAB`}>{subcat}</option> ) }) }
                                </select>
                            }
                            {   nfts && token &&
                                <div>
                                    <div className="standardDivRowFullW justiAlig"> <p className="xtraMiniMarginTB4p">Selected NFT: </p> <p className="justBoldtext xtraMiniMarginTB4p miniMarginLeft miniMarginRight">{token.symbol}</p> <p className="xtraMiniMarginTB4p">Casting price: </p> <p className="justBoldtext xtraMiniMarginTB4p miniMarginLeft">{token.price_base_on_cast} HIVE.</p> </div>
                                    <ul className="standardUlRowFlexPlain overflowXscroll">
                                        {
                                            nfts.filter(_token => _token.price_base_on_cast > 0 ).map(_token => {
                                                return (
                                                    <li key={_token._id} className={`pointer hoveredBordered miniMarginLeft ${token.symbol === _token.symbol ? 'activeSelected justBordersRounded' : null }`} onClick={() => setToken(_token)}>
                                                        <div className="textAlignedCenter"> 
                                                            <div> <img src={_token.thumb} className="miniImageJobs" /> </div>
                                                            <p className="xSmalltext justBoldtext">{_token.symbol}</p>
                                                            <p className="xSmalltext">{_token.price_base_on_cast} HIVE</p>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            }
                            <label htmlFor="paying_price">{state.job_type === "employee" ? 'I will ask ': 'I will Pay '}</label>
                            <input name="paying_price" required onChange={(e)=> updateState(e.target.name,Number(e.target.value))}  defaultValue={state.paying_price} pattern="[0-9.]{1,21}" title="Just Numbers 0 - 9 and dot are allowed. 0 to 21 characters max."  />
                            <label htmlFor="verifyed_profiles_only">Accept only Verified profiles</label>
                            <input type="checkbox" name="verifyed_profiles_only" onChange={(e)=> updateState(e.target.name,e.target.checked)} defaultChecked={state.verifyed_profiles_only} />
                            <label htmlFor="active">Active</label>
                            <input type="checkbox" name="active" onChange={(e)=> updateState(e.target.name,e.target.checked)} defaultChecked={state.active} />
                            <label htmlFor="promoted">Promoted</label>
                            <input type="checkbox" name="promoted" onChange={(e)=> updateState(e.target.name,e.target.checked)} defaultChecked={state.promoted} />
                            <button className="justMargin0auto justWidth100" type="submit">Update</button>
                        </form>
                    </div>
                }
                {
                    !loadingData && 
                    <div>
                        <button className="justMargin0auto justWidth100" onClick={() => cbClose()}>OK</button>
                    </div>
                }
                </div>
            </div>
        </Absscreenwrapper>
    )
}

export default Editjob;
