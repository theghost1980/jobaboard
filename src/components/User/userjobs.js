import React, { useState, useEffect } from 'react';
//components
import SubmenuRender from './submenurender';
import Jobs from '../User/jobs/jobs';
import Managejobs from '../User/jobs/managejobs';
import Manageportfolio from '../User/jobs/manageportfolio';
import Myorders from '../User/orders/myorders';
import Jobix from '../User/jobs/jobix';
import { check } from '../../utils/helpers';
import { useStaticQuery, graphql, Link, navigate } from "gatsby"
import Img from 'gatsby-image';
import Absscreenwrapper from '../absscreenwrapper';
import Previewjob from './jobs/previewjob';
import Menujobs from './jobs/menujobs';
import Loader from '../loader';
import Visualizator from '../Blog/visualizator';
import Tablinator from '../interactions/tablinator';

//constants
const jobEP = process.env.GATSBY_jobEP;
//end constants

const Userjobs = () => {
    const userdata = check();

    const [selected, setSelected] = useState("");
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJOb] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [highLigthThisField, setHighLigthThisField] = useState({ field: '', compareTo: ''});

    //search jobs for this user on mongoDB
    useEffect(() => {
        loadMyJobs();
    },[]);

    function loadMyJobs(){
        setLoadingData(true);
        getData(`${jobEP}${userdata.username}`)
        .then(response => {
            console.log(response);
            if(response.message === "No jobs for this user"){
                //no jobs found
                console.log('No jobs for this user!');
            }else if(response.length > 0){
                setJobs(response)
            }
            setLoadingData(false);
        })
        .catch(error => {
            console.log('Error fecthing Job Data from BE.',error);
            setLoadingData(false);
        });
    }
    //fecthing data
    async function getData(url = '') {
        const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-access-token': userdata.token
        },
        });
        return response.json(); 
    };
    //end fetching data
    function closeJOB(){
        setSelectedJOb(null);
    }

    const goIndexJobUpdate = () => {
        loadMyJobs();
        setSelected("");
    }
    
    return (
        <div>
            {/* jobs menu absolute on top */}
            <div className="menuJobsContainer">
                <ul className="ulJobMenu">
                    <li className={`${selected === "" ? 'activeSelected justMiniPadding justMiniRounded': null}`} onClick={goIndexJobUpdate}>Job Dashboard</li>
                    <li className={`${selected === "jobs" ? 'activeSelected justMiniPadding justMiniRounded': null}`} onClick={() => setSelected("jobs")}>New Job</li>
                    <li className={`${selected === "managejobs" ? 'activeSelected justMiniPadding justMiniRounded': null}`} onClick={() => setSelected("managejobs")}>Manage Jobs</li>
                    <li className={`${selected === "manageportfolio" ? 'activeSelected justMiniPadding justMiniRounded': null}`} onClick={() => setSelected("manageportfolio")}>Manage Portfolio</li>
                    <li className={`${selected === "myorders" ? 'activeSelected justMiniPadding justMiniRounded': null}`} onClick={() => setSelected("myorders")}>My orders</li>
                    {/* <li className={`${selected === "jobix" ? 'activeSelected justMiniPadding justMiniRounded': null}`} onClick={() => setSelected("jobix")}>Jobito Helper</li> */}
                </ul>
            </div>
            {
                (selected === "") &&
                    <div>
                        <h1>Job Dashboard</h1>
                        <Visualizator 
                            hiveUser={"jobaboard"}
                            filter_tags={['jabers-dashboard']}
                            limit={3}
                            openMode={"onTopOfAll"}
                        />
                        {
                            loadingData &&
                                <div style={{ width: '100px', margin: '0 auto'}}>
                                    <Loader logginIn={true} />
                                </div>
                        }
                        {
                            (jobs.length === 0 && !loadingData) && 
                                <div className="standarDiv320x200h">
                                    <p>Looks like you have no Jobs/Services created.</p>
                                    <p>Ask for assistance or</p>
                                    <button onClick={() => setSelected("jobs")}>Create Job</button>
                                </div>
                        }
                        {
                            selectedJob &&
                                <Absscreenwrapper xtraClass={"justifyFlexStart"}>
                                    {/* {
                                        userdata.logged &&
                                        <Menujobs />
                                    } */}
                                    <Previewjob job={selectedJob} cbClose={closeJOB} />
                                </Absscreenwrapper>
                        }
                        {
                            (jobs.length > 0) &&
                             <Tablinator 
                                clickedSubItemCB={(job) => console.log('Clicked on job:', job)}
                                items={jobs}
                                titleTable={'My Jobs/Gigs/Services'}
                                toShow={['active','category','createdAt','job_type','nft_symbol','paying_price']}
                                pagination={{ perPage: 10, controls: false }}
                                highLight={highLigthThisField}
                             />
                        }
                    </div>
            }
            {
                (selected === "jobs") &&
                    <SubmenuRender path={`/app/createjobs`} component={Jobs}/>
            }
            {
                (selected === "managejobs") &&
                    <SubmenuRender path={`/app/managejobs`} component={Managejobs}/>
            }
            {
                (selected === "manageportfolio") &&
                    <SubmenuRender path={`/app/manageportfolio`} component={Manageportfolio}/>
            }
            {
                (selected === "myorders") &&
                    <SubmenuRender path={`/app/myorders`} component={Myorders}/>
            }
            {/* {
                (selected === "jobix") &&
                    <SubmenuRender path={`/app/jobassistant`} component={Jobix}/>
            } */}
        </div>
    )
}

export default Userjobs;