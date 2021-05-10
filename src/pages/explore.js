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
import Filtersquery from '../components/interactions/filtersquery';

//constants
const jobEP = process.env.GATSBY_jobEP;
const pubEP = process.env.GATSBY_publicEP;
const devMode = true;
const defaultQuery = { 
    category: "Graphics & Design", 
    active: true, 
}
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
        categories: allMongodbGatsbyCategories(sort: {fields: name}){
            edges {
              node {
                  active
                  id
                  thumb
                  image
                  name
                  query
                  sub_category
                  subtitle
                  title
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
         append_menu: allMongodbGatsbyCategories(sort: {fields: name}) {
          edges {
              node {
                  active
                  id
                  thumb
                  image
                  name
                  query
                  sub_category
                  subtitle
                  title
              }
          }
        }
    }
    `);
    //end grapqhql queries

    const [resultQuery, setResultQuery] = useState([]);
    const [loadingQuery, setLoadingQuery] = useState(false);
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

    const [queryToExecute, setQueryToExecute] = useState(null); //as {job_type: '', active: true, category: '', sub_category: ''}
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

    const executeFromFilters = (item) => {
        console.log(item)
        if(item.from === 'job_type'){
            // const filterQuery: { job_type: 'string', active: true, category: 'string'. sub_category: 'string' }
            // setValueQuery(item.from,String(item.name).toLowerCase());
            setQueryToExecute({ 
                job_type: String(item.name).toLowerCase(), 
                active: true, 
            });
            setLoadingQuery(true);
        }else if(item.from === 'category'){
            setQueryToExecute({  
                active: true, 
                category: item.name,
            });
            setLoadingQuery(true);
        }else if(item.from === "delivery_options"){
            const days = Number(String(item.name).split(" ")[0]);
            setQueryToExecute({
                active: true,
                days_to_complete: days,
            })
        }else if(item.from === "no_filters"){
            if(item.name === "All"){ setQueryToExecute({ active: true })}
            else{
                const job_type = String(item.name).split(" ")[0].toLowerCase();
                setQueryToExecute({
                    active: true,
                    job_type: job_type, 
                });
            }
        }
    }
    function setValueQuery(name,value){
        setFilterQuery(prevState => {
            return { ...prevState, [name]: value }
        })
    }

    async function sendQuery(q, limit, sortby){
        // TODO handle pagination
        const headers = { 'query': JSON.stringify(q), 'limit': limit, 'sortby': JSON.stringify(sortby),};
        if(devMode){ console.log('About to send:',{ ep: pubEP+"JobsQuery", headers: headers })};
        setLoadingQuery(true);
        dataRequest(pubEP+"JobsQuery", "GET", headers)
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
    // useEffect(() => {
    //     if(defaultQuery){
    //         setLoadingQuery(true);
    //         var passedQ = {
    //             category: "", sub_category: ""
    //         }
    //         const cleanQ = decodeURI(defaultQuery);
    //         // console.log(cleanQ);
    //         const category = cleanQ.split("?category=")[1].split("|");
    //         passedQ.category = category[0];
    //         const sub_category = category[1].split("sub_category=")[1];
    //         passedQ.sub_category = sub_category;
    //         if(category[0]){
    //             setValueQuery("category",category[0]);
    //         }
    //         if(sub_category){
    //             setValueQuery("sub_category",sub_category);
    //         }
    //         passedQ.active = true;
    //         const cleanedQ = cleanQuery(passedQ);
    //         console.log('To execute on this cleaned one:');
    //         console.log(cleanedQ);
    //         sendQuery(cleanedQ);
    //         setDefaultQuery(null);
    //     }
    // }, [defaultQuery]);
    //search jobs 
    // useEffect(() => {
    //     if(query){
    //         setLoadingQuery(true);
    //         var passedQ = {
    //             category: "", sub_category: ""
    //         }
    //         const cleanQ = decodeURI(query);
    //         // console.log(cleanQ);
    //         const category = cleanQ.split("?category=")[1].split("|");
    //         passedQ.category = category[0];
    //         const sub_category = category[1].split("sub_category=")[1];
    //         passedQ.sub_category = sub_category;
    //         if(category[0]){
    //             setValueQuery("category",category[0]);
    //         }
    //         if(sub_category){
    //             setValueQuery("sub_category",sub_category);
    //         }
    //         passedQ.active = true;
    //         const cleanedQ = cleanQuery(passedQ);
    //         console.log('To execute on this cleaned one:');
    //         console.log(cleanedQ);
    //         sendQuery(cleanedQ);
    //     }
    // },[query]);
    useEffect(() => {
        if(queryToExecute){ //as { job_type: '', active: true, category: '', sub_category: ''
            sendQuery(queryToExecute,limit ? limit : null, {});
        }
    },[queryToExecute]);

    //to load on init
    useEffect(() => {
        if(!query){
            setQueryToExecute(defaultQuery);
        }else{ //explore?category=Graphics%20&%20Design|sub_category=none
            const cleanQ = decodeURI(query);
            const category = cleanQ.split("?category=")[1].split("|");
            const sub_category = category[1] ? category[1].split("sub_category=")[1] : null;
            const tempQ = { active: true, category: category[0], sub_category: sub_category };
            const cleanedQ = cleanQuery(tempQ);
            setQueryToExecute(cleanedQ);
            if(devMode){
                console.log('Process:',{ cleanQ: cleanQ, category: category, sub_category: sub_category, tempQ: tempQ, cleanedQ: cleanedQ });
            }
        }
    }, []);
    //END to load on init

    //fecthing data
    async function dataRequest(url = '', requestType, headers) {
        const response = await fetch(url, { method: requestType, headers: headers });
        return response.json(); 
    };
    //end fetchin data

    function closeJOB(){
        setSelectedJOb(null);
    }

    // const executeQuery = () => {
    //     console.log('Executing query + filters selected');
    //     console.log(filterQuery,limit);
    //     if(filterQuery !== initialStateQ){
    //         setShowFilters(false);
    //         setLoadingQuery(true);
    //         console.log('Sending new query....');
    //         const newNode = cleanQuery(filterQuery);
    //         console.log(newNode);
    //         sendQuery(newNode);
    //     };
    // }

    const handleSelectedCat = (event) => {
        const cat = event.target.value;
        setValueQuery("category",cat);
        if(cat !== null && cat !== ""){
            const _subCats = data.categories.edges.filter(({node: category}) => category.name === cat)[0].node.sub_category;
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
                {/* testing filter component */}
                <Filtersquery clickCB={(item) => executeFromFilters(item)}
                    arrayFilter={data.categories.edges.map(({ node:cat }) => cat)}
                />
                {
                    loadingQuery &&
                        <div className="standardDivRowFlex100pX100pCentered miniMarginTB">
                            <Loader logginIn={true} />
                        </div>
                }
                {
                    selectedJob &&
                        <Absscreenwrapper>
                            {/* {
                                userdata.logged &&
                                <Menujobs />
                            } */}
                            <Previewjob job={selectedJob} cbClose={closeJOB} userdata={userdata} />
                        </Absscreenwrapper>
                }
                {
                    (resultQuery && resultQuery.length > 0)
                        &&
                        <div>
                            <h1>Results on {queryToExecute.category} > {queryToExecute.sub_category ? queryToExecute.sub_category : null }</h1>
                            <h4>Showing {resultQuery.length} Result{resultQuery.length === 1 ? '.':'s.'}</h4>
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
                    (resultQuery.length === 0 && !loadingQuery) &&
                        <div className="imgContCatHAuto relativeDiv justMargin0auto justHeightAuto">
                            {
                                data.append_menu.edges.filter(cat_menu => cat_menu.node.name === filterQuery.category).map(catFound => {
                                    console.log('NotFound on::::', catFound)
                                    return (
                                        <div key={catFound.node.id}>
                                            <img src={catFound.node.image} className="imgCat " alt={`${catFound.node.name}-${catFound.node.id}`} />
                                            <div className="justPosAbsTop20p standardDivColFullW justbackgroundblackalpha">
                                                <h2 className="specialH2H3">Sorry, Not results on {catFound.node.name} > {filterQuery.sub_category}</h2>
                                                <h3 className="specialH2H3">Please feel free to use the filters above. Or just surf the recommendations bellow.</h3>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                }
                <div className="justxxsmalltext">
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