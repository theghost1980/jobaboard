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
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const publicEP = process.env.GATSBY_publicEP;
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

const Nftmarket = (props) => {
    const userdata = check();
    // IF logged show the buy/sell panels
    // IF not just show create account button
    // maybe a guided tour
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
    const [allNFTMongo, setAllNFTMongo] = useState(null);
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
    // useEffect(() => {
    //     if(!query){
    //         setDefaultQuery('explore?category=Graphics%20&%20Design|sub_category=none');
    //     }
    // }, []);
    useEffect(() => {
        const query = { nft_id: "", account: "",};
        getDataPublic(publicEP + "getNFTquery",query, 0, { "null": null })
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setAllNFTMongo(response.result);
            }
        }).catch(error => console.log('Error asking for NFTs from DB, mongo.',error));
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
    async function getDataPublic(url = '',query = {}, limit = Number, sortBy) {
        const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'query': JSON.stringify(query),
            'limit': limit,
            'sortby': JSON.stringify(sortBy),
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
                <h1>Nft Marketplace</h1>
                <ul>
                    <li>Visualize all nft for sale</li>
                    <li>being able to buy/sell tokens</li>
                    <li>List system's onsale tokens</li>
                </ul>
                {
                    allNFTMongo &&
                    <ul className="standardUlRowFlexPlain overflowXscroll">
                        {
                            allNFTMongo.map(token => {
                                return (
                                    <li key={token._id} className="pointer hoveredBordered miniMarginLeft" >
                                        <div className="textAlignedCenter">
                                            <div>
                                                <img src={token.thumb} className="smallImage" />
                                            </div>
                                            <p className="xSmalltext">Symbol: {token.symbol}</p>
                                            <p className="xSmalltext">Price: {token.price} HIVE</p>
                                            <p className="xSmalltext">On sale: {token.for_sale ? 'YES': 'NO'}</p>
                                            <p className="xSmalltext">Owner: {token.account}</p>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                }
            </div>
        </Layout>
    )
}

export default Nftmarket;