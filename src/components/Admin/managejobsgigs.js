import React, { useState, useEffect } from 'react';
import { check, formatDateTime } from '../../utils/helpers';
import Tablinator from '../interactions/tablinator';
import Btnswitch from '../btns/btnswitch';

//constants
const userEP = process.env.GATSBY_userEP;
const adminEP = process.env.GATSBY_adminEP;

const Managejobsgigs = () => {
    const userdata = check();
    const [option, setOption] = useState("");
    const [loadingData, setLoadingData] = useState(false);
    const [allJobs, setAllJobs] = useState([]);
    const [loadingExtraData, setLoadingExtraData] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [edit, setEdit] = useState(false);
    const [editedFields, setEditedFields] = useState({
        blocked: false, note: "",
    })

    //functions/CB
    function updateEditedFields(name,value){
        setEditedFields(prevState => { return {...prevState, [name]: value}});
    }
    const editJob = () => {
        if(editedFields.note === ''){
            return alert('Note field is mandatory to process this request!');
        }
        // TODO send this to OPLogger.
        const formdata = new FormData();
        formdata.append("blocked", editedFields.blocked);
        formdata.append("note", editedFields.note);
        formdata.append("updateAt", new Date().toString());
        console.log('Now we send the post request to BE.',editedFields);
        const headers = {'x-access-token': userdata.token, 'filter': JSON.stringify({ _id: selectedJob._id })};
        postDataWT(adminEP+"updateJobField",headers,formdata)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                getAllJobs();
                setEdit(false);
                setSelectedJob(null);
                alert('Job Updated!');
            }
        }).catch(error => console.log('Error updating a field from admins.',error));
    }
    function getAllJobs(){
        const headers = { 'x-access-token': userdata.token, 'filter': JSON.stringify({}), 'limit': 0, 'sort': JSON.stringify({}) };
        getDataWT(adminEP+"getJob",headers)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setAllJobs(response.result);
            }
        })
        .catch(err => {
            console.log('Error while fetching data from BE - admins', err);
        })
    }
    /////////DATA fecthing////////////
    async function getDataWT(url = '', headers) { 
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: headers,
        });
        return response.json(); 
    };
    async function postDataWT(url = '', headers, formdata) { 
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: headers,
            body: formdata,
        });
        return response.json(); 
    };
    ///////END DATA////////////////
    //END functions/CB
    //to load on init
    useEffect(() => {
        getAllJobs();
    },[]);
    //END to load on init

    return (
        <div className="standardContentMargin">
            <h2>Hi from Manage Jobs/Gigs</h2>
            <p>TODO: Maybe this section may include:</p>
            <ul>
                <li>List Jobs, CRUD Jobs/Gigs</li>
                <li>Log Jobs activities and so on.</li>
            </ul>
            { 
                allJobs && 
                <div>
                    <Tablinator items={allJobs} toShow={['username','createdAt','job_type','nft_symbol','active']}
                        titleTable={"All Jobs on Users"} devMode={true} clickedSubItemCB={(item) =>setSelectedJob(item)}
                    />
                </div>
            }
            {
                selectedJob &&
                <div>
                    <img src={selectedJob.images[0]} className="imageMedium" />
                    <p>Id: {selectedJob._id}</p>
                    <p>Category: {selectedJob.category}</p>
                    <p>Sub category: {selectedJob.category}</p>
                    <p>Description: {selectedJob.description}</p>
                    <p>Title: {selectedJob.title}</p>
                    <p>Job type: {selectedJob.job_type}</p>
                    <p>Nft symbol: {selectedJob.nft_symbol}</p>
                    <p>Paying price: {selectedJob.paying_price}</p>
                    <p>Promoted: {selectedJob.promoted.toString()}</p>
                    <p>Active: {selectedJob.active.toString()}</p>
                    <p>Verifyed profiles only: {selectedJob.verifyed_profiles_only.toString()}</p>
                    <p>Created At: {formatDateTime(selectedJob.createdAt)}</p>
                    <p>Blocked: {selectedJob.blocked.toString()}</p>
                    {
                        selectedJob.note && <p>Note: {selectedJob.note}</p>
                    }
                    {
                        edit &&
                        <div>
                            <form className="formVertFlex">
                                <label htmlFor="note">Note:(explain the reason, mandatory)</label>
                                <textarea name="note" onChange={(e) => updateEditedFields(e.target.name,e.target.value)}
                                    defaultValue={selectedJob.note}
                                />
                                <Btnswitch xtraClassCSS={'justAligned'} initialValue={selectedJob.blocked} sideText={selectedJob.blocked ? `Unblock it`: `Block it`} 
                                    btnAction={(cen) => updateEditedFields("blocked",cen)}
                                />
                            </form>
                        </div>
                    }
                    <div className="standardDisplayJusSpaceAround ">
                        <button onClick={() => setSelectedJob(null)}>close</button>
                        <button onClick={() => setEdit(!edit)}>Edit</button>
                        {
                            edit &&  <button onClick={editJob}>Submit</button>
                        }
                    </div>
                </div>
            }
        </div>
    )
}

export default Managejobsgigs;


// {
//     "days_to_complete": 1,
//     "images": [
//       "https://res.cloudinary.com/dbcugb6j4/image/upload/v1617114743/file_1617114742147_xbox-repair-1_jnvm8j.jpg",
//       "https://res.cloudinary.com/dbcugb6j4/image/upload/v1617114743/file_1617114743161_xbox-repair-2_ua5wev.jpg",
//       "https://res.cloudinary.com/dbcugb6j4/image/upload/v1617114743/file_1617114743163_xbox-repair-3_sk77so.jpg"
//     ],
//     "escrow_type": "system",
//     "escrow_username": "TODO-NEXT-features",
//     "_id": "606336781a450e0015c358c1",
//     "username": "workerjab1",
//     "category": "Electronics",
//     "description": "I can fix your XBOX in 2 days. But if too bad I will keep it and send you tokens in exchange.",
//     "sub_category": "Repairs",
//     "title": "i will repair your XBOX 360 very fast.",
//     "job_type": "employee",
//     "nft_symbol": "WQ ",
//     "paying_price": 2,
//     "promoted": true,
//     "active": true,
//     "verifyed_profiles_only": true,
//     "createdAt": "2021-03-30T14:32:20.000Z",
//     "__v": 0
//   }