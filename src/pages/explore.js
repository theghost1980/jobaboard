import React, { useState, useEffect } from 'react';
import { useStaticQuery, graphql, Link, navigate } from "gatsby"
import Img from 'gatsby-image';

//components
import Layout from '../components/layout';
import Loader from '../components/loader';
import Absscreenwrapper from '../components/absscreenwrapper';
import Menujobs from '../components/User/jobs/menujobs';
import Previewjob from '../components/User/jobs/previewjob';
import { check } from '../utils/helpers';

//constants
const jobEP = process.env.GATSBY_jobEP;
//end constants

// TODO: pass the current category/sub category as context so the page
// will display the required category

const Explore = (props) => {
    const userdata = check();
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

    const [resultQuery, setResultQuery] = useState([]);
    const [loadingQuery, setLoadingQuery] = useState(false);
    const query  = props.location.search || null;
    const [selectedJob, setSelectedJOb] = useState(null);
    // console.log(props);

    //search jobs 
    useEffect(() => {
        setLoadingQuery(true);
        console.log(`Asking to:${jobEP}publicAllJobs`)
        getData(`${jobEP}publicAllJobs`)
        .then(response => {
            setResultQuery(response.result);
            setLoadingQuery(false);
        })
        .catch(error => {
            console.log('Error fecthing Job Data from BE.',error);
            setLoadingQuery(false);
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
        },
        });
        return response.json(); 
    };
    //end fetchin data

    function closeJOB(){
        setSelectedJOb(null);
    }

    return (
        <Layout>
            <div className="exploreContainer">
                <h1>Explore Page</h1>
                <p>query={query} For now brings all. TODO</p>
                {
                    loadingQuery &&
                        <div className="standardDivRowFlex100pX100pCentered">
                            <Loader logginIn={true} />
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
                    (resultQuery && resultQuery.length > 0)
                        &&
                        <div>
                            <ul className="standardUlHorMini wrapDiv coloredContrast3Soft justRounded">
                                    {
                                        resultQuery.map(job => {
                                            return (
                                                <li key={job._id} onClick={() => setSelectedJOb(job)}>
                                                    <div className="miniDiv fontSmall coloredContrast1 relativeDiv scaleHovered justRounded">
                                                        <div className="jobImgContainer">
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
                                                            {/* <div className="absDivRow whiteBack hoveredOpaacity">
                                                                <Img fixed={data.statusIcon.childImageSharp.fixed} />
                                                                <p>{job.active ? 'Active - Published':'Not Active'}</p>
                                                            </div> */}
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
        </Layout>
    )
}

export default Explore;