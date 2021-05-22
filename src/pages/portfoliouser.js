import React, { useState, useEffect} from 'react';
import Layout from '../components/layout';
import axios from 'axios';
import { check, formatDateTime } from '../utils/helpers';
import Jobresult from '../components/User/jobs/subcomponents/jobresult';
import Absscreenwrapper from '../components/absscreenwrapper';
import Menujobs from '../components/User/jobs/menujobs';
import Previewjob from '../components/User/jobs/previewjob';
import Loader from '../components/loader';
import Follower from '../components/interactions/follower';
import Browseby from '../components/Categories/browseby';
import Nojobstoshow from '../components/User/jobs/subcomponents/nojobstoshow';

//constants
const portfolio_EP = process.env.GATSBY_portfolioEP;
const publicEP = process.env.GATSBY_publicEP;
const noImage = process.env.GATSBY_noImg;
const pagination = { perPage: 5, controls: false }; 
// const pagination = null;
const devMode = true;
//end constants

const Porfoliouser = (props) => {
    const userdata = check();

    const [portfolio, setPortfolio] = useState(null);
    const [profile, setProfile] = useState(null);
    const [activeJobs, setActiveJobs] = useState(null);
    const [selectedJob, setSelectedJOb] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [noPortolfio, setNoPortolfio] = useState(false);
    const [lookedUpUser, setLookedUpUser] = useState(null);
    const [pages, setPages] = useState(null); //to store all query jobs results, as active.
    const [indexPage, setIndexPage] = useState(0);
    
    const query  = props.location.search || null;
    console.log(`Query portfolio user:${query}`);

    function closeJOB(){
        setSelectedJOb(null);
    }

    useEffect(() => {
        if(query){
            setLoadingData(true);
            const username = String(query).split('=')[1];
            setLookedUpUser(username);
            console.log('Querying on:',portfolio_EP+"queryUser"+" username:" + username);
            getData(portfolio_EP+"queryUser",username)
            .then(response => {
                console.log(response);
                if(!response.message){
                    setPortfolio(response);
                }
                if(response.status === "failed" && response.message === "User has no porfoltio yet"){
                    setNoPortolfio(true);
                }
            })
            .catch(error => console.log('Error fetching data from BE',error));
            
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'query': JSON.stringify({ username: username }),
            }

            axios.get(publicEP+"getField", { headers: headers })
            .then(response => {
                console.log(response);
                if(response.data.status === 'sucess'){
                    setProfile(response.data.result);
                }
            }).catch(error => console.log('Error trying to fetch user avatar from BE',error));
            
            getData(publicEP+"getActiveJobs", username)
            .then(response => {
                if(devMode){ console.log(response) };
                if(response.status === 'sucess'){
                    if(pagination && pagination.perPage > 0){
                            function paginate (arr, size) {
                                return arr.reduce((acc, val, i) => {
                                  let idx = Math.floor(i / size);
                                  let page = acc[idx] || (acc[idx] = []);
                                  page.push(val);
                                  return acc;
                                }, [])
                            }
                            let page_size = pagination.perPage;
                            let pages = paginate(response.result, page_size);
                            setPages(pages);
                            if(devMode){ console.log('pagination:', pages); };
                    }else{
                        setActiveJobs(response.result); //we have the array of active jobs on this user.
                    }
                    setLoadingData(false);
                }
            }).catch(error => {
                console.log('Error getting Jobs on PR from BE', error);
                setLoadingData(false);
            });
        }
    },[query]);
    
    /////////fecthing data////////////
    async function getData(url = '', _username) {
        const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'username': _username,
        },
        });
        return response.json(); 
    };
    // async function getDataFields(url = '', _query) {
    //     const response = await fetch(url, {
    //     method: 'GET', // *GET, POST, PUT, DELETE, etc.
    //     mode: 'cors', // no-cors, *cors, same-origin
    //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json',
    //         'query': JSON.stringify(_query),
    //     },
    //     });
    //     return response.json(); 
    // };
    //////////////////////////////////
    return (
        <Layout>
            {
                loadingData && 
                <div className="standarDiv200x200h">
                    <Loader logginIn={true} typegif={"spin"}/>
                </div>
            }
            <div className="standardDivRowFullW">
                {
                    selectedJob &&
                        <Absscreenwrapper>
                            {/* {
                                userdata.logged &&
                                <Menujobs />
                            } */}
                            <Previewjob job={selectedJob} cbClose={closeJOB} />
                        </Absscreenwrapper>
                }
                {
                    noPortolfio &&
                    <div className="portfolioFlexBig justWidth50">
                        <div className="contentMiniMargins">
                            <h1>Sorry but @{lookedUpUser} has no portfolio created.</h1>
                            <h3>If you know him, let him know the crypto police is looking for him!</h3>
                            {/* <h3>But please feel free to browse more Gig/Jobs.</h3>
                            <Browseby 
                                size={"small"}
                                pagination={{ pagination : true, perSlide: 2 }}
                                xclassCSS={"whiteBack marginTop justRounded boxShadowBottom"}
                                xclassCSSUl={"justSpaceEvenly"}
                            /> */}
                        </div>
                    </div>
                }
                {
                    (portfolio && profile) &&
                    <div className="portfolioFlexBig">
                        <div className="contentMiniMargins">
                        <h1>Portfolio of {portfolio.username}</h1>
                        <div className="justiAlig">
                            <img 
                                src={profile.avatar ? profile.avatar : noImage} 
                                className="imageMedium marginAuto" 
                                alt={`${profile.avatar ? profile.avatar : noImage}-${portfolio.username}`}
                            />
                        </div>
                        <blockquote className="italicText">"{portfolio.story_line}"</blockquote>
                        {
                            userdata.logged &&
                            <Follower xclassCSS={"whiteBack justBorders justRounded marginBottom"} token={userdata.token} interactTo={lookedUpUser} />
                        }
                        <p>Description: {portfolio.description}</p>
                        <p>Member since: {profile.createdAt}</p>
                        {
                            (portfolio.certifications && portfolio.certifications.length > 0)
                                &&
                                <div className="smallText">
                                    <h3>Certifications</h3>
                                    <table className="tablePortPublic">
                                        <tr className="trTablePortP">
                                            <th>Certified on</th>
                                            <th>Award/Certificate</th>
                                            <th>Year</th>
                                        </tr>
                                        {
                                            portfolio.certifications.map(cert => {
                                                return (
                                                    <tr className="trTableWhite">
                                                        <td>{cert.certified_on}</td>
                                                        <td>{cert.award}</td>
                                                        <td>{cert.year}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </table>
                                </div>
                        }
                        {
                            (portfolio.languages && portfolio.languages.length > 0)
                                &&
                                <div className="smallText">
                                    <h3>Languages</h3>
                                    <table className="tablePortPublic">
                                        <tr className="trTablePortP">
                                            <th>Language</th>
                                            <th>Level</th>
                                        </tr>
                                        {
                                            portfolio.languages.map(lang => {
                                                return (
                                                    <tr className="trTableWhite">
                                                        <td>{lang.language}</td>
                                                        <td>{lang.level}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </table>
                                </div>
                        }
                        {
                            (portfolio.education && portfolio.education.length > 0)
                                &&
                                <div className="smallText">
                                    <h3>Education</h3>
                                    <table className="tablePortPublic">
                                        <tr className="trTablePortP">
                                            <th>Country</th>
                                            <th>Degree</th>
                                            <th>Year</th>
                                        </tr>
                                        {
                                            portfolio.education.map(educ => {
                                                return (
                                                    <tr className="trTableWhite">
                                                        <td>{educ.country}</td>
                                                        <td>{educ.degree}</td>
                                                        <td>{educ.year}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </table>
                                </div>
                        }
                        {
                            (portfolio.skills && portfolio.skills.length > 0)
                                &&
                                <div className="smallText">
                                    <h3>Skills</h3>
                                    <table className="tablePortPublic">
                                        <tr className="trTablePortP">
                                            <th>Skill</th>
                                            <th>Experience</th>
                                        </tr>
                                        {
                                            portfolio.skills.map(skill => {
                                                return (
                                                    <tr className="trTableWhite">
                                                        <td>{skill.skill}</td>
                                                        <td>{skill.experience}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </table>
                                </div>
                        }
                        </div>
                    </div>
                }
                <div className="portfolioJobResults">
                {
                    noPortolfio &&
                    <div>
                        {
                            profile && 
                            <div className="justiAlig justWidth50">
                                <img 
                                    src={profile.avatar ? profile.avatar : noImage} 
                                    className="imageMedium justBorders marginAuto" 
                                    alt={`${profile.avatar ? profile.avatar : noImage}`}
                                />
                                {
                                    profile.createdAt &&
                                    <p className="textMediumWhite textAlignedCenter">Member since: {formatDateTime(profile.createdAt)}</p>
                                }
                                {   userdata && userdata.logged &&
                                    <Follower xclassCSS={"whiteBack justBorders justRounded marginBottom"} token={userdata.token || null} interactTo={lookedUpUser} />
                                }
                            </div>
                        }
                    </div>
                }
                {
                    (!loadingData)
                        &&
                        <div>
                            <h1 className="marginLeft miniMarginBottom">Active Jobs on this user</h1>
                            {
                                (pagination && pages && pages.length > 0) ?
                                <div>
                                    <p className="normalTextXSmall textColorWhite marginLeft miniMarginTB">Showing you: {(pages.length * pagination.perPage)} jobs available. Pages menu at bottom.</p>
                                    <ul className="standardUlHorMini wrapDiv coloredContrast3Soft justRounded">
                                        {
                                            pages[indexPage].map(job => {
                                                return (
                                                    // to test carousel removed: onClick={() => setSelectedJOb(job)}
                                                    <li key={job._id}>
                                                        <Jobresult sizeSlider={"small"} job={job} logged={userdata.logged} openCb={() => setSelectedJOb(job)} />
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                    <ul className="standardUlRowFlexPlain justiAlig">
                                        {
                                            pages.map((page,index) => {
                                                return (
                                                    <li key={`${index}-paginated-jobs-JAB`} className={`${indexPage === index ? 'activePage' : null } pointer scaleOnHover textColorWhite biggerText marginRight`} onClick={() => setIndexPage(index)}>
                                                        {index + 1}
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                                :
                                  (activeJobs && activeJobs.length > 0) && !pagination &&
                                    <div>
                                        <p className="normalTextXSmall textColorWhite marginLeft miniMarginTB">Showing you: {activeJobs.length} jobs available.</p>
                                        <ul className="standardUlHorMini wrapDiv coloredContrast3Soft justRounded">
                                        {
                                            activeJobs.map(job => {
                                                return (
                                                    // to test carousel removed: onClick={() => setSelectedJOb(job)}
                                                    <li key={job._id}>
                                                        <Jobresult sizeSlider={"small"} job={job} logged={userdata.logged} openCb={() => setSelectedJOb(job)} />
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
                    (!activeJobs || activeJobs.length === 0) && !loadingData && !pagination &&
                    <Nojobstoshow  devMode={true} pagination={{ pagination : true, perSlide: 2 }}/>
                }
                {
                    (!pages || pages.length === 0) && !loadingData && pagination &&
                    <Nojobstoshow  devMode={true} pagination={{ pagination : true, perSlide: 2 }}/>
                }
                </div>
            </div>
        </Layout>
    )
}

export default Porfoliouser;