import React, { useState, useEffect } from 'react';
import Btnswitch from '../../btns/btnswitch';
import Loader from '../../loader';
import { check } from '../../../utils/helpers';
import { useStaticQuery, graphql, Link, navigate } from "gatsby"
import Img from 'gatsby-image';
import Tablinator from '../../interactions/tablinator';
import Sortlist from './subcomponents/sortlist';
import Pagesmenu from './subcomponents/pagesmenu';
import Editjob from './subcomponents/editjob';
import Absscreenwrapper from '../../absscreenwrapper';
import Previewjob from './previewjob';

//constants
const jobEP = process.env.GATSBY_jobEP;
const devMode = true;
const resultsPerPage = 10;
const omitFields = ['__v','escrow_type', 'escrow_username', 'verifyed_profiles_only'];
//end constants

const Managejobs = () => {
    const userdata = check();
    const [orderBy, setOrderBy] = useState({ orderBy: '', asc: true, }); //by default as ASC //orderBy.asc ? 1 : -1.
    const [jobs, setJobs] = useState(null);
    const [fieldsArray, setFieldsArray] = useState([]);
    const [selectedJob, setSelectedJOb] = useState(null);
    const [showText, setShowText] = useState(true); //by default as List text. If switched show icons + pagination.
    const [loadingData, setLoadingData] = useState(true);
    const [pages, setPages] = useState(null);
    const [noJobs, setNoJobs] = useState(null);
    const [actualPage, setActualPage] = useState(0); //as default shows the first page.
    const [action, setAction] = useState("");
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
            employeeIcon: file(relativePath: {eq: "employee.png"}) {
                childImageSharp {
                    fixed(width: 30) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            employerIcon: file(relativePath: {eq: "employer.png"}) {
                childImageSharp {
                    fixed(width: 30) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `); //end grapqhql queries

    //to load on init
    useEffect(() => { //search jobs for this user on mongoDB
        loadMyJobs();
    },[]);
    //END to load on init

    //load on each state change
    useEffect(() => {
        if(fieldsArray && devMode){ console.log('Sort by arrayfields:', fieldsArray) };
    },[fieldsArray]);
    useEffect(() => {
        if(pages){
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
        if(orderBy.orderBy !== '' && fieldsArray){
            if(devMode){ console.log('Ordering actual page by:', orderBy)};
        }
    },[orderBy]);
    useEffect(() => {
        if(action === 'clear'){ 
            setSelectedJOb(null);
            setAction(""); 
            loadMyJobs();
        };
    },[action]);
    //END load on each state change

    //functions/CB
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
        setLoadingData(false);
        if(devMode){ console.log('pagination:', pages) };
        return pages;
    }
    function loadMyJobs(){
        setLoadingData(true);
        requestData(`${jobEP}${userdata.username}`, "GET", { 'x-access-token': userdata.token }, null)
        .then(response => {
            if(devMode){ console.log(response) };
            if(response.message === "No jobs for this user"){
                if(devMode){ console.log(response.message) };
                setNoJobs(true);
                setLoadingData(false);
            }else if(response.length > 0){
                setJobs(response);
                setPages(paginateResults(response));
            }
        })
        .catch(error => {
            console.log('Error fecthing Job Data from BE.',error);
            setLoadingData(false);
        });
    }
    const showSelectedJob = (job) => {
        setSelectedJOb(job);
        if(devMode){ console.log('Selected job:', job) };
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
    //fecthing data
    async function requestData(url = '', requestType, headers, formdata) {
        const response = formdata ? fetch(url, { method: requestType, headers: headers,}) : fetch(url, { method: requestType, headers: headers, body: formdata});
        return (await response).json(); 
    };
    //end fetching data
    //END functions/CB

    return (
        <div className={`manageJobsContainer displayFlex ${noJobs ? 'justiAlig' : null }`}>
            <div>
            {
                noJobs && 
                <div className="justMarginAuto">
                    <h2>You haven't created any Job/Gig yet.</h2>
                    <h3>Please feel free to go and create NFTs and Gigs.</h3>
                </div>
            }
            {
                (jobs && pages) &&
                <div> 
                        <h2>Managejobs you jobs.</h2>
                        <Btnswitch xtraClassCSS={"justAligned"}
                        sideText={"Show Jobs/Gigs list as text. (Default)"}
                        initialValue={showText} btnAction={(cen) => setShowText(cen)}
                    />
                    {
                        showText    
                            ?
                            <div key={loadingData}>
                                <Tablinator 
                                    clickedSubItemCB={(job) => showSelectedJob(job)}
                                    items={jobs}
                                    titleTable={'My Jobs/Gigs/Services'}
                                    toShow={['active','category','createdAt','updatedAt','job_type','nft_symbol','paying_price']}
                                    pagination={{ perPage: 10, controls: false }}
                                    xclassCSSRow={"relativeDiv"}
                                    toPop_id={selectedJob ? selectedJob._id : null}
                                    popMenu={selectedJob ? true : false} arrayMenu={[{ title: 'Edit', value: 'edit'}, { title: 'Delete', value: 'delete'}, { title: 'Cancel', value: 'clear'}]} cbOptionSelected={(option) => setAction(option)}
                                />
                            </div>
                            :
                            <div>
                                <Sortlist 
                                    fieldsArray={fieldsArray}
                                    cbSetOrderBy={(e) => setOrderBy({ orderBy: e.target.value, asc: true })}
                                    toogleValue={orderBy.asc}
                                    cbSetOrderByAsc={() => setOrderBy(prevState => { return {...prevState, asc: !prevState.asc }}) }
                                />
                                <Pagesmenu 
                                    items={pages}
                                    cbSetPageSelected={(index) => setActualPage(index)}
                                    actualPage={actualPage}
                                />
                                <ul className="standardUlHorMini wrapDiv coloredContrast3Soft justRounded pointer">
                                    {
                                    pages[actualPage].sort( compare ).map(job => {
                                        return (
                                            <li key={job._id} onClick={() => showSelectedJob(job)}>
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
                                                        <div className="alignJustCentered displayFlex">
                                                            <Img fixed={job.job_type === "employee" ? data.employeeIcon.childImageSharp.fixed:data.employerIcon.childImageSharp.fixed} 
                                                                title={job.job_type === "employee" ? "Published to get hired":"Published to Hire a professional"} 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    })
                                    }
                                </ul>
                                <Pagesmenu 
                                    items={pages}
                                    cbSetPageSelected={(index) => setActualPage(index)}
                                    actualPage={actualPage}
                                />
                            </div>
                    }
                </div>
            }
            </div>
            {
                (selectedJob && showText) &&
                <div>
                    {
                        (action !== '' && action !== 'clear') &&
                        <Editjob 
                            job={selectedJob}
                            job_id={selectedJob._id}
                            devMode={true}
                            cbClose={() => setAction("clear")}
                            action={action}
                        />
                    }
                </div>
            }
            {
                selectedJob && !showText &&
                <Absscreenwrapper>
                    <Previewjob hideJabBtn={true} job={selectedJob} cbClose={() => setAction("clear")} userdata={userdata} />
                </Absscreenwrapper>
            }
            {
                loadingData &&
                <div className="standardDivRowFlex100pX100pCentered">
                    <Loader logginIn={loadingData}/>
                </div>
            }
        </div>
    )
}

export default Managejobs;