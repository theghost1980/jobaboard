import React, { useState, useEffect } from 'react';
//components
import SubmenuRender from './submenurender';
import Jobs from '../User/jobs/jobs';
import Managejobs from '../User/jobs/managejobs';
import Manageportfolio from '../User/jobs/manageportfolio';
import Jobix from '../User/jobs/jobix';
import { check } from '../../utils/helpers';
import { useStaticQuery, graphql, Link, navigate } from "gatsby"
import Img from 'gatsby-image';
import Absscreenwrapper from '../absscreenwrapper';
import Previewjob from './jobs/previewjob';
import Menujobs from './jobs/menujobs';
//constants
const jobEP = process.env.GATSBY_jobEP;
//end constants

const Userjobs = () => {
     //graphql queries
     const data = useStaticQuery(graphql`
     query {
         statusIcon: file(relativePath: {eq: "status.png"}) {
             childImageSharp {
                 fixed(width: 30) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
         tokenIcon: file(relativePath: {eq: "tokens.png"}) {
             childImageSharp {
                 fixed(width: 30) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
     }
     `);
     //end grapqhql queries

    const userdata = check();

    const [selected, setSelected] = useState("");
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJOb] = useState(null);

    //search jobs for this user on mongoDB
    useEffect(() => {
        getData(`${jobEP}${userdata.username}`)
        .then(response => {
            console.log(response);
            if(response.message === "No jobs for this user"){
                //no jobs found
                return console.log('No jobs for this user!');
            }else if(response.length > 0){
                setJobs(response)
            }
        })
        .catch(error => {
            console.log('Error fecthing Job Data from BE.',error);
        })
    },[]);

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
    //end fetchin data
    function closeJOB(){
        setSelectedJOb(null);
    }
    
    return (
        <div>
            {/* jobs menu absolute on top */}
            <div className="menuJobsContainer">
                <ul className="ulJobMenu">
                    <li onClick={() => setSelected("")}>Job Dashboard</li>
                    <li onClick={() => setSelected("jobs")}>New Job</li>
                    <li onClick={() => setSelected("managejobs")}>Manage Jobs</li>
                    <li onClick={() => setSelected("manageportfolio")}>Manage Portfolio</li>
                    <li onClick={() => setSelected("jobix")}>Jobito Helper</li>
                </ul>
            </div>
            {
                (selected === "") &&
                    <div>
                        <h1>Job Dashboard</h1>
                        {
                            (jobs.length === 0) && 
                                <div className="standarDiv320x200h">
                                    <p>Looks like you have no Jobs/Services created.</p>
                                    <p>Ask for assistance or</p>
                                    <button onClick={() => setSelected("jobs")}>Create Job</button>
                                </div>
                        }
                        {
                            selectedJob &&
                                <Absscreenwrapper>
                                    {
                                        userdata.logged &&
                                        <Menujobs />
                                    }
                                    <Previewjob job={selectedJob} cbClose={closeJOB} />
                                </Absscreenwrapper>
                        }
                        {
                            (jobs.length > 0) &&
                            <div>
                                <ul className="standardUlHorMini wrapDiv coloredContrast3Soft justRounded">
                                    {
                                        jobs.map(job => {
                                            return (
                                                <li key={job._id} onClick={() => setSelectedJOb(job)}>
                                                    <div className="miniDiv2 fontSmall coloredContrast1 relativeDiv scaleHovered justRounded">
                                                        <div>
                                                            <img src={job.images.length > 0 ? job.images[0]: 'https://res.cloudinary.com/dbcugb6j4/image/upload/v1615643565/noimage-JAB_geyicy.png'} 
                                                                className="miniImg boxShadowBottom"
                                                            />
                                                        </div>
                                                        <div className="standardContentMargin">
                                                            <h3 className="noMargintop bolder">{job.title}</h3>
                                                            <div className="whiteBack absDivRow2">
                                                                <p className="bolder biggerText noMargins">{job.paying_price}</p>
                                                                <Img fixed={data.tokenIcon.childImageSharp.fixed} />
                                                                <p className="bolder">-{job.nft_symbol}</p>
                                                            </div>
                                                            <div className="absDivRow whiteBack hoveredOpaacity justRounded">
                                                                <Img fixed={data.statusIcon.childImageSharp.fixed} />
                                                                <p>{job.active ? 'Active - Published':'Not Active'}</p>
                                                            </div>
                                                            <p className="noMargins">Created: {job.createdAt}</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
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
                (selected === "jobix") &&
                    <SubmenuRender path={`/app/jobassistant`} component={Jobix}/>
            }
        </div>
    )
}

export default Userjobs;