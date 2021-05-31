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
import Browseby from '../components/Categories/browseby';
import Collapsablelist from '../components/interactions/subcompfilters/collapsablelist';
import Btncollapse from '../components/btns/btncollapse';
import Faqs_finder from '../components/FAQs/faqs_finder';

//constants
const jobEP = process.env.GATSBY_jobEP;
const pubEP = process.env.GATSBY_publicEP;
const devMode = true;
const defaultQuery = { 
    category: "Graphics & Design", 
    active: true, 
}
const resultsPerPage = 10;
const omitFields = ['_id', '__v', 'active', 'images', 'escrow_type', 'escrow_username', 'verifyed_profiles_only'];
//end constants

//////////////////////////////////////////
// NOTE IMPORTANT: We are using pagination from now on.
// We keep the original results without pagination on resultQuery
// But we show and filter the second array named as pages
// Pages as: [{ page: n, result: [{}] }];
//////////////////////////////////////////

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
    const [loadingQuery, setLoadingQuery] = useState(true);
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
    const [orderBy, setOrderBy] = useState({ orderBy: '', asc: true, }); //by default as ASC //orderBy.asc ? 1 : -1.
    const [orderNow, setOrderNow] = useState(false); //kinf of trick to fire re-render after the orderby has been set on click.
    const [fieldsArray, setFieldsArray] = useState([]);
    const [limit, setLimit] = useState(0);
    // const [subCats, setSubCats] = useState(null);
    // const [selectedSubCat, setSelectedSubCat] = useState("");
    const [pages, setPages] = useState(null);
    const [actualPage, setActualPage] = useState(0); //initiallly as 0 to show the first element in array.
    const [searchCatNSub, setSearchCatNSub] = useState(false);
    const [querySelectedCatSub, setQuerySelectedCatSub] = useState({ category: '', sub_category: '' });
    const [arrayCats, setArrayCats] = useState([]);
    const [arraySubCats, setArraySubCats] = useState([]);
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

    function updateQueryCatSub(name, value){ 
        console.log('Received:', { name: name, value: value });
        setQuerySelectedCatSub(prevState => { return {...prevState, [name]: value }});
    }

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
        }else if(item.from === "switchs_filtersQ"){ //for now just will work "category_n_sub_cat"
            if(item.switch === "category_n_sub_cat" ){
                setSearchCatNSub(item.cen);
            }
        }
    }
    function setValueQuery(name,value){
        setFilterQuery(prevState => {
            return { ...prevState, [name]: value }
        })
    }
    function paginateResults(array){
        function paginate (arr, size) {
            return arr.reduce((acc, val, i) => {
                let idx = Math.floor(i / size)
                let page = acc[idx] || (acc[idx] = [])
                page.push(val);
                return acc
            }, [])
        }
        let pages = paginate(array, resultsPerPage);
        setPages(pages);
        if(devMode){ console.log('pagination:', pages) };
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
            if(response.result.length > 0){
                paginateResults(response.result);
            }else{
                paginateResults([]);
            }
            setLoadingQuery(false);
        })
        .catch(error => {
            console.log('Error asking for a filtered query on BE',error);
            setLoadingQuery(false);
        });
    }

    useEffect(() => {
        if(queryToExecute){ //as { job_type: '', active: true, category: '', sub_category: ''
            sendQuery(queryToExecute,limit ? limit : null, {});
        }
    },[queryToExecute]);

    useEffect(() => {
        if(fieldsArray && devMode){ console.log('Sort by arrayfields:', fieldsArray) };
    },[fieldsArray]);

    useEffect(() => {
        if(orderBy.orderBy !== '' && fieldsArray){
            if(devMode){ console.log('Ordering actual page by:', orderBy)};
            // const _actualPageAr = pages[actualPage].sort( compare );
            // const oldStateTo = page
            setOrderNow(!orderNow);
        }
    },[orderBy]);

    useEffect(() => {
        if(pages && pages.length > 0){
            const _arrayField = [];
            if(devMode){ console.log('pages::::', pages)} ;
            Object.entries(pages[0][0]).forEach(([key,value]) => {
                if(!omitFields.find(field => field === key)){
                    _arrayField.push({ field: key, id: `${key}-field-sortBy-Jab`});
                }
            });
            setFieldsArray(_arrayField);
        }
    },[pages]);

    useEffect(() => {
        if(querySelectedCatSub.category !== ''){
            const cats = data.categories.edges.map(({ node:cat }) => cat).filter(cat => cat.active === true );
            const subs = cats.find(cat => cat.name === querySelectedCatSub.category).sub_category.map((subcat, index) => {return { id: `subCat-JAB-${index}`, name: subcat, from: 'sub_category'}});
            // {return { id: item.id, name: item.name, from: 'sub_category'}}
            if(devMode){ console.log(subs) };
            setArraySubCats(subs);
        }
    },[querySelectedCatSub]);

    const clearSubNCats = () => {
        setSearchCatNSub(false);
        setQuerySelectedCatSub({ category: '', sub_category: '' });
        setArraySubCats([]);
    }

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
        //setting arrays for cats & subCats
        setArrayCats(data.categories.edges.map(({ node:cat }) => cat));
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

    function showMeName(queryObj){
        const fieldsAr = [];
        Object.entries(queryObj).forEach(([key,value]) => {
            if(key !== 'active'){
                fieldsAr.push(`"` + String(key).split("_").join(" ") + `"`);
            }
        });
        if(devMode) { console.log('fieldsAr:', fieldsAr) };
        return fieldsAr.length === 0 ? 'All - No filters' : fieldsAr.join(", ");
    }

    function setQuery(item){
        setLoadingQuery(true);
        setQueryToExecute({
            active: true, category: item.name
        });
        global.window ? window.scroll({ top: 150, left: 0, behavior: 'smooth'}) : null; //scroll to top.
    }

    const loadQuery = () => {
        if(querySelectedCatSub.category !== '' && querySelectedCatSub.sub_category !== ''){
            setQueryToExecute({ active: true, category: querySelectedCatSub.category, sub_category: querySelectedCatSub.sub_category });
            clearSubNCats();
        }else{
            alert('Please fill Category and Subcategory to apply the search!');
        }
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

    // const handleSelectedCat = (event) => {
    //     const cat = event.target.value;
    //     setValueQuery("category",cat);
    //     if(cat !== null && cat !== ""){
    //         const _subCats = data.categories.edges.filter(({node: category}) => category.name === cat)[0].node.sub_category;
    //         setSubCats(_subCats);
    //     }else{
    //         setSubCats(null);
    //     }
    // }

    const clearQuery = () => {
        setLoadingQuery(false);
        setFilterQuery(initialStateQ);
        setShowFilters(false);
    }

    const prepareQuery = () => {
        setFilterQuery(initialStateQ);
        setShowFilters(!showFilters);
    }

    function fixFieldToShow(field){
        const _field = String(field).split("_").join(" ");
        return _field.substring(0,1).toUpperCase() + _field.substring(1);
    }

    function compare(a, b) {
        if( !isNaN(a[orderBy.orderBy]) && !isNaN(b[orderBy.orderBy]) ){
            if(devMode) console.log('Comparing as Numbers Detected.');
            const asNumbers = { a: Number(a[orderBy.orderBy]), b: Number(b[orderBy.orderBy])};
            if ( asNumbers.a < asNumbers.b ){ return  orderBy.asc ? 1 : -1 }; //orderBy.asc ? -1 : 1
            if ( asNumbers.a > asNumbers.b ){ return  orderBy.asc ? -1 : 1 }; //orderBy.asc ? 1 : -1 
        }else{
            if(devMode) console.log('Comparing as Others(Strings, Booleans, etc.) Detected.');
            if ( a[orderBy.orderBy] < b[orderBy.orderBy] ){ return orderBy.asc ? 1 : -1 }; //orderBy.asc ? -1 : 1 
            if ( a[orderBy.orderBy] > b[orderBy.orderBy] ){ return orderBy.asc ? -1 : 1 }; //orderBy.asc ? 1 : -1
        };
        return 0;
    }

    return (
        <Layout>
            <div className="exploreContainer spaceEvenly justAligned">
                {/* testing filter component */}
                <div className="relativeDiv">
                    <Filtersquery 
                        clickCB={(item) => executeFromFilters(item)}
                        arrayFilter={data.categories.edges.map(({ node:cat }) => cat)}
                        switchList={[
                            { id: 'switch-4', iniValue: searchCatNSub, sideText: 'Search By Sub Category', name: 'category_n_sub_cat', btnInfo: true, infoMsg: 'Make a search selecting available category and subcategories.'},
                            { id: 'switch-3', iniValue: false, sideText: 'Local Users', name: 'query_local_users', btnInfo: true, infoMsg: 'Depending on your location, the system will try to filter people near by.'},
                            { id: 'switch-1', iniValue: false, sideText: 'Users with completed Gig/Services', name: 'query_exp_jab'},
                            { id: 'switch-2', iniValue: false, sideText: 'Top Users', name: 'query_top_users'},
        
                        ]}
                    />
                    {
                        searchCatNSub &&
                        <div className="standardDivFlexPlain2 normalTextSmall jutsMinHeight200px justBordersRoundedMarginB justAbsolutePos zIndexTop whiteBack">
                            <div className="standardContentMarginLR">
                                <Collapsablelist 
                                    arrayList={[ { title: 'Available Categories', collapsable: true, list: arrayCats.map((item) => {return { id: item.id, name: item.name, from: 'category'}})},]}
                                    clickCB={(item) => updateQueryCatSub(item.from, item.name)}
                                    xclassCSS={"whiteBack justHeight300pOverY"}
                                />
                                {
                                    arraySubCats.length > 0 &&
                                    <Collapsablelist 
                                        arrayList={[ { title: `Sub categories for ${querySelectedCatSub.category}`, collapsable: true, list: arraySubCats.map((item) => {return { id: item.id, name: item.name, from: 'sub_category'}})},]}
                                        clickCB={(item) => updateQueryCatSub(item.from, item.name)}
                                        xclassCSS={"whiteBack"}
                                        xtraClassUl={"justHeight300pOverY"}
                                    />
                                }
                                <p>Selected Category: {querySelectedCatSub.category}</p>
                                <p>Selected Sub Category: {querySelectedCatSub.sub_category}</p>
                                <div className="standardDivRowFullW justSpaceAround justMarginBottom">
                                    <button onClick={clearSubNCats} className="normalTextXSmall">Cancel</button>
                                    <button onClick={loadQuery} className="normalTextXSmall">Apply</button>
                                </div>
                            </div>
                        </div>
                    }
                </div>
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
                    (pages && pages.length > 0)
                        &&
                        <div className="justWidth100per">
                            <hr></hr>
                            {
                                pages &&
                                <div className="standardDivRowFullW justiAlig">
                                    <ul className="standardUlRow2 justiAlig">
                                        {
                                            pages.map((page,index) => {
                                                // console.log(page)
                                                return (
                                                    <li key={`${index}-page-Job-JAB`} className={`marginRight pointer scaleHovered ${index === actualPage ? 'activePage' : null }`}
                                                        onClick={() => setActualPage(index)}
                                                    >
                                                        {index + 1}
                                                    </li>
                                                ) 
                                            })
                                        }
                                    </ul>
                                    <div className="displayFlex normalTextSmall justAligned">
                                        <label htmlFor="order_by" className="miniMarginRight">Sort Results By:</label>
                                        <select name="order_by" onChange={(e) => setOrderBy({ orderBy: e.target.value, asc: true })}>
                                            <option defaultValue="">order options</option>
                                            {
                                                fieldsArray.map(field => {
                                                    return (
                                                        <option key={field.id} value={field.field}>{fixFieldToShow(field.field)}</option>
                                                    )
                                                })
                                            }
                                        </select>
                                        <Btncollapse xclassCSS={"miniMarginLeft"} miniSizes={true} title={`Ordered result ${orderBy.asc ? 'Ascendent' : 'Descendent'}`}
                                            toogleValue={orderBy.asc} btnAction={() => setOrderBy(prevState => { return {...prevState, asc: !prevState.asc}})}
                                        />
                                    </div>
                                </div>
                            }
                            <div className="standardDivRowFullW justAligned justSpaceAround">
                                <h3>Results on {queryToExecute.category || queryToExecute.job_type} > {queryToExecute.sub_category ? queryToExecute.sub_category : null }</h3>
                                <h4>Showing {resultQuery.length} Result{resultQuery.length === 1 ? '.':'s.'} Actual page:{actualPage + 1}</h4>
                            </div>
                            <ul className="standardUlHorMini wrapDiv justRounded" key={orderNow}>
                                    {
                                        pages[actualPage].sort( compare ).map(job => {
                                            // console.log(job)
                                            return (
                                                // to test carousel removed: onClick={() => setSelectedJOb(job)}
                                                <li key={job._id}>
                                                    <Jobresult sizeSlider={"small"} job={job} logged={userdata.logged} openCb={() => setSelectedJOb(job)} sourceQuery={"explore"} />
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                        </div>
                }
                {
                    (resultQuery.length === 0 && !loadingQuery && queryToExecute) &&
                        <div className="imgContCatHAuto relativeDiv marginsTBX2 justMargin0auto justHeightAuto">
                            {
                                data.append_menu.edges.filter(cat_menu => cat_menu.node.name === queryToExecute.category).map(catFound => {
                                    if(devMode){ console.log('NotFound on::::', catFound) }
                                    return (
                                        <div key={catFound.node.id}>
                                            <img src={catFound.node.image} className="imgCat " alt={`${catFound.node.name}-${catFound.node.id}`} />
                                            <div className="justPosAbsTop20p standardDivColFullW justbackgroundblackalpha">
                                                <h2 className="specialH2H3">Sorry, Not results on {catFound.node.name}  {queryToExecute.sub_category ? `> ${queryToExecute.sub_category}` : null }</h2>
                                                <h3 className="specialH2H3">Please feel free to use the filters above. Or just surf the recommendations bellow.</h3>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                }
                {
                    resultQuery.length === 0 && !loadingQuery && queryToExecute && (queryToExecute.job_type || queryToExecute.job_type || queryToExecute.days_to_complete ) &&
                        <div className="imgContCatHAuto jusBordersRounBlackBack  relativeDiv justMargin0auto justHeightAuto">
                            <h2 className="specialH2H3">Sorry, Not results on {showMeName(queryToExecute)}</h2>
                            <h3 className="specialH2H3">Please feel free to use the filters above. Or just surf the recommendations bellow.</h3>
                        </div>
                }
            </div>
            {devMode && console.log('query executed:', queryToExecute)}
            <hr></hr>
            {
                !loadingQuery && queryToExecute &&
                <Faqs_finder category={queryToExecute.category} userdata={userdata}/>
            }
            <hr></hr>
            <div>
                <Browseby pagination={{ pagination: true, perSlide: 3 }} 
                    cbSeleted={(item) => setQuery(item)}
                />
            </div>
            <hr></hr>
        </Layout>
    )
}

export default Explore;