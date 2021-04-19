import React, { useState, useEffect } from 'react';
import { useStaticQuery, graphql } from "gatsby"
import Img from 'gatsby-image';

//components
import Layout from '../components/layout';
import Loader from '../components/loader';
import Absscreenwrapper from '../components/absscreenwrapper';
import Menujobs from '../components/User/jobs/menujobs';
import Previewjob from '../components/User/jobs/previewjob';
import { check } from '../utils/helpers';
import Jobresult from '../components/User/jobs/subcomponents/jobresult';
import Btnswitch from '../components/btns/btnswitch';

//constants
const jobEP = process.env.GATSBY_jobEP;
//end constants

// TODO: pass the current category/sub category as context so the page
// will display the required category

function cleanQuery(q){
    const newNode = {};
    Object.entries(q).forEach(([key, val]) => {
        if(val !== null && val !== "" && val !== "none"){
            return (newNode[key] = val);
        }
    });
    return newNode;
}

const Explore = (props) => {
    const userdata = check();
    //graphql queries
    const data = useStaticQuery(graphql`
    query { 
        filterIcon: file(relativePath: {eq: "filtering.png"}) {
            childImageSharp {
                fixed(width: 35) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        }
        cats: allMongodbGatsbyCategory(sort: {fields: name}) {
            totalCount
                edges {
                    node {
                        id
                        sub
                        name
                    }
                }
        }
        employeeIcon: file(relativePath: {eq: "employee.png"}) {
             childImageSharp {
                 fixed(width: 50) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
         employerIcon: file(relativePath: {eq: "employer.png"}) {
             childImageSharp {
                 fixed(width: 50) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         } 
         allIcon: file(relativePath: {eq: "all.png"}) {
             childImageSharp {
                 fixed(width: 50) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
    }
    `);
    //end grapqhql queries

    const [resultQuery, setResultQuery] = useState([]);
    const [loadingQuery, setLoadingQuery] = useState(false);
    const [defaultQuery, setDefaultQuery] = useState(null);
    const query  = props.location.search;
    // console.log('Received prop to work with:');
    // console.log(query);
    // if(!query){//apply a default value
    //     setDefaultQuery('explore?category=Graphics%20&%20Design|sub_category=none');
    // }
    
    const [selectedJob, setSelectedJOb] = useState(null);
    const initialStateQ = { job_type: "", active: true, category: "", sub_category: ""};
    const [filterQuery, setFilterQuery] = useState(initialStateQ);
    const [showFilters, setShowFilters] = useState(false);
    const [limit, setLimit] = useState(0);
    const [subCats, setSubCats] = useState(null);
    const [selectedSubCat, setSelectedSubCat] = useState("");
    // console.log(props);

    // useEffect(() => {
    //     //as a test as soon as we set one value we execute the filtering.
    //     // for now directly on BE.
    //     if(filterQuery !== initialStateQ){
    //         setLoadingQuery(true);
    //         console.log('Sending new query....');
    //         console.log(filterQuery);
    //         getDataQ(jobEP + "publicAllJobsQuery",filterQuery,0)
    //         .then(response => {
    //             console.log(response);
    //             setResultQuery(response.result);
    //             setLoadingQuery(false);
    //         })
    //         .catch(error => {
    //             console.log('Error asking for a filtered query on BE',error);
    //             setLoadingQuery(false);
    //         });
    //     }

    // }, [filterQuery]);

    function setValueQuery(name,value){
        setFilterQuery(prevState => {
            return { ...prevState, [name]: value }
        })
    }

    async function sendQuery(q){
        getDataQ(jobEP + "publicAllJobsQuery",q,limit)
        .then(response => {
            console.log(response);
            // TODO handle pagination
            // if results > max per page(which can be a parameter set as a constant or .env var)
            setResultQuery(response.result);
            setLoadingQuery(false);
        })
        .catch(error => {
            console.log('Error asking for a filtered query on BE',error);
            setLoadingQuery(false);
        });
    }

    // to load on each change of state
    useEffect(() => {
        if(defaultQuery){
            setLoadingQuery(true);
            var passedQ = {
                category: "", sub_category: ""
            }
            const cleanQ = decodeURI(defaultQuery);
            // console.log(cleanQ);
            const category = cleanQ.split("?category=")[1].split("|");
            passedQ.category = category[0];
            const sub_category = category[1].split("sub_category=")[1];
            passedQ.sub_category = sub_category;
            if(category[0]){
                setValueQuery("category",category[0]);
            }
            if(sub_category){
                setValueQuery("sub_category",sub_category);
            }
            passedQ.active = true;
            const cleanedQ = cleanQuery(passedQ);
            console.log('To execute on this cleaned one:');
            console.log(cleanedQ);
            sendQuery(cleanedQ);
            setDefaultQuery(null);
        }
    }, [defaultQuery]);
    //search jobs 
    useEffect(() => {
        if(query){
            setLoadingQuery(true);
            var passedQ = {
                category: "", sub_category: ""
            }
            const cleanQ = decodeURI(query);
            // console.log(cleanQ);
            const category = cleanQ.split("?category=")[1].split("|");
            passedQ.category = category[0];
            const sub_category = category[1].split("sub_category=")[1];
            passedQ.sub_category = sub_category;
            if(category[0]){
                setValueQuery("category",category[0]);
            }
            if(sub_category){
                setValueQuery("sub_category",sub_category);
            }
            passedQ.active = true;
            const cleanedQ = cleanQuery(passedQ);
            console.log('To execute on this cleaned one:');
            console.log(cleanedQ);
            sendQuery(cleanedQ);
        }
    },[query]);

    //to load on init
    useEffect(() => {
        if(!query){
            setDefaultQuery('explore?category=Graphics%20&%20Design|sub_category=none');
        }
    }, []);
    //END to load on init

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
    async function getDataQ(url = '',query = {}, limit = Number) {
        const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'query': JSON.stringify(query),
            'limit': limit,
        },
        });
        return response.json(); 
    };
    //end fetchin data

    function closeJOB(){
        setSelectedJOb(null);
    }

    const executeQuery = () => {
        console.log('Executing query + filters selected');
        console.log(filterQuery,limit);
        if(filterQuery !== initialStateQ){
            setShowFilters(false);
            setLoadingQuery(true);
            console.log('Sending new query....');
            const newNode = cleanQuery(filterQuery);
            console.log(newNode);
            sendQuery(newNode);
        };
    }

    const handleSelectedCat = (event) => {
        const cat = event.target.value;
        setValueQuery("category",cat);
        if(cat !== null && cat !== ""){
            const _subCats = data.cats.edges.filter(({node: category}) => category.name === cat)[0].node.sub;
            setSubCats(_subCats);
        }else{
            setSubCats(null);
        }
    }

    const clearQuery = () => {
        setLoadingQuery(false);
        setFilterQuery(initialStateQ);
        setShowFilters(false);
    }

    const prepareQuery = () => {
        setFilterQuery(initialStateQ);
        setShowFilters(!showFilters);
    }

    return (
        <Layout>
            <div className="exploreContainer">
                {/* <p>query={query} For now brings all. TODO</p> */}
                {/* todo set this one as a component to re-use where needed */}
                <h1>Explore Categories</h1>
                <div className="standardDivRowFullW">
                        <p>Filters:</p>
                        <div className="pointer standardDiv40px40pxPlain justiAlig scaleHovered" onClick={prepareQuery}>
                            <Img fixed={data.filterIcon.childImageSharp.fixed} />
                        </div>
                </div>
                {
                    showFilters &&
                    <div className="normalTextSmall standardFlexColBordered justRounded softBackground marginsTB">
                        <div className="miniMargins">
                        <div>
                            <div className="standardDivRowFullW justifyContentSpaced">
                                <p>Job/Service Type</p>
                                <div className="standardDivRowFullW justifyContentSpaced textAlignedCenter miniMarginBottom">
                                    <div className={`standardDiv30Percent justiAlig bordersRounded hoveredBoxShadow pointer ${filterQuery.job_type === "employee" ? 'activeSelected' : null}`}
                                        onClick={() => setValueQuery("job_type","employee")}
                                    >
                                        <Img fixed={data.employeeIcon.childImageSharp.fixed} title={"Published to get hired"} className="miniMarginTop" />
                                        <p>Offering a Service/Job</p>
                                    </div>
                                    <div className={`standardDiv30Percent justiAlig bordersRounded hoveredBoxShadow pointer ${filterQuery.job_type === "employer" ? 'activeSelected' : null}`}
                                        onClick={() => setValueQuery("job_type","employer")}
                                    >
                                        <Img fixed={data.employerIcon.childImageSharp.fixed} title={"Published to Hire a professional"} className="miniMarginTop"/>
                                        <p>Looking for a Service/Professional</p>
                                    </div> 
                                    <div className={`standardDiv30Percent justiAlig bordersRounded hoveredBoxShadow pointer ${!filterQuery.job_type ? 'activeSelected' : null}`}
                                        onClick={() => setValueQuery("job_type","")}
                                    >
                                        <Img fixed={data.allIcon.childImageSharp.fixed} title={"Published to Hire and to be Hired"} className="miniMarginTop"/>
                                        <p>Bring All Available(by default)</p>
                                    </div>
                                </div>
                            </div>
                            <div className="standardDivRowFullW justifyContentSpaced">
                                <label htmlFor="category">Category</label>
                                <select name="category" onChange={handleSelectedCat}>
                                    <option defaultValue="Select one Option"></option>
                                    {
                                        data.cats.edges.map(({ node:cat }) => {
                                            return (
                                                <option key={cat.id}>{cat.name}</option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                            <div className="standardDivRowFullW justifyContentSpaced">
                                <label htmlFor="sub_category">Sub Category</label>
                                {   subCats &&
                                    <select name="sub_category" onChange={(e)=>setValueQuery(e.target.name,e.target.value)}>
                                    <option defaultValue="Select one Option"></option>
                                    {
                                        subCats.map(subcat => {
                                            return (
                                                <option key={`${subcat}-categoryJAB`}>{subcat}</option>
                                            )
                                        })
                                    }
                                </select>
                                }
                            </div>
                            <div className="standardDivRowFullW justifyContentSpaced">
                                <label className="justWidth30" htmlFor="limit">Limit to:</label>
                                <input className="justWidth70" type="text" name="limit" onChange={(e) => setLimit(e.target.value)} />
                            </div>
                            <Btnswitch 
                                btnAction={() => console.log('Pressed!')} 
                                showValueDevMode={true}
                                sideText={"Pro Users"}
                                initialValue={false}
                            />
                            <Btnswitch 
                                btnAction={() => console.log('Pressed!')} 
                                showValueDevMode={true}
                                sideText={"Top Users"}
                                initialValue={false}
                            />
                            <Btnswitch 
                                btnAction={() => console.log('Pressed!')} 
                                showValueDevMode={true}
                                sideText={"Verifyed Users"}
                                initialValue={false}
                                title={"Show only users who have passed our KYC."}
                            />
                            <Btnswitch 
                                btnAction={() => console.log('Pressed!')} 
                                showValueDevMode={true}
                                sideText={"Users with experience on JAB"}
                                initialValue={false}
                                title={"Show only users who have completed at least, 1 service/hiring on JAB."}
                            />
                            {/* <Btnswitch 
                                btnAction={(cen) => cen ? setValueQuery("job_type","employee"):setValueQuery("job_type","employer")} 
                                showValueDevMode={true}
                                sideText={"Show me only JABers"}
                                title={"JABers are the ones who look to get hired."}
                                initialValue={false}
                            /> */}
                        </div>
                        <div className="standardDivRowFullW marginAuto justifyContentSEvenly">
                            <button onClick={clearQuery}>Clear/Hide</button>
                            <button onClick={executeQuery}>Apply</button>
                        </div>
                        </div>
                    </div>
                }
                {/* end future component */}
                {
                    loadingQuery &&
                        <div className="standardDivRowFlex100pX100pCentered miniMarginTB">
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
                            <Previewjob job={selectedJob} cbClose={closeJOB} userdata={userdata} />
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
                                                // to test carousel removed: onClick={() => setSelectedJOb(job)}
                                                <li key={job._id}>
                                                    <Jobresult job={job} logged={userdata.logged} openCb={() => setSelectedJOb(job)} sourceQuery={"explore"} />
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                        </div>
                }
                {
                    (resultQuery.length === 0 && !showFilters && !loadingQuery) &&
                        <div>
                            <p>No Results for</p>
                            <p>Cat: {filterQuery.category} > {filterQuery.sub_category}</p>
                            <p>Try another Category using the filter :D</p>
                        </div>
                }
                <div>
                    <p>TODO we could have 2 or 3 sections as</p>
                    <ul>
                        <li>Top users</li>
                        <li>Trending cats AND so on</li>
                        <li>Also what we do if no query was passed? bring something as default??</li>
                    </ul>
                </div>
            </div>
        </Layout>
    )
}

export default Explore;