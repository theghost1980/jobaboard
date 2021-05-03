import React, { useState, useEffect } from 'react';
import { useStaticQuery, graphql } from "gatsby"
import Img from 'gatsby-image';

//components
import Layout from '../components/layout';
import Loader from '../components/loader';
import Absscreenwrapper from '../components/absscreenwrapper';
import Menujobs from '../components/User/jobs/menujobs';
import Previewjob from '../components/User/jobs/previewjob';
import { check, formatDateTime } from '../utils/helpers';
import Jobresult from '../components/User/jobs/subcomponents/jobresult';
import Btnswitch from '../components/btns/btnswitch';
import hive from '@hiveio/hive-js';
import Blockchainobserver from '../components/blockchainobserver';
import Btncollapse from '../components/btns/btncollapse';
import Charter from '../components/interactions/charter';
hive.config.set('alternative_api_endpoints',[ "https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network","https://hived.privex.io/"]);

//constants
const jobEP = process.env.GATSBY_jobEP;
const nftEP = process.env.GATSBY_nftEP;
const pingAPI = "https://api.coingecko.com/api/v3/ping"; //"accept: application/json"
const dataHive = "https://api.coingecko.com/api/v3/coins/hive?tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";
const apiEPChart = "https://api.coingecko.com/api/v3/coins/hive/market_chart?vs_currency=usd&days=30&interval=daily";
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

const Jabexplorer = (props) => {
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
         searchIcon: file(relativePath: {eq: "search.png"}) {
             childImageSharp {
                 fixed(width: 28) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
    }
    `);
    //end grapqhql queries

    // new ones to organize later on
    const query  = props.location.search;
    //TODO find out why the typying is so slow!!!

    const [txToLookUp, setTxToLookUp] = useState(null);
    const [blockToTookUp, setBlockToTookUp] = useState(null);
    const [showBlockTrans, setShowBlockTrans] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [queryType, setQueryTyoe] = useState({
        type:'default', //options: default as empty not assigned, or tx_id,block,username.
        query: '',
    })
    const [showBObs, setShowBObs] = useState(false);
    const [showInfoHive, setShowInfoHive] = useState(false);
    const [hiveDataCG, setHiveDataCG] = useState(null);
    const [charData, setCharData] = useState(null);
    // END new ones to organize later on

    const [resultQuery, setResultQuery] = useState([]);
    const [loadingQuery, setLoadingQuery] = useState(false);
    const [defaultQuery, setDefaultQuery] = useState(null);
    const [loadingBlock, setLoadingBlock] = useState(false);
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
    // curl -s --data '{"jsonrpc":"2.0", "method":"condenser_api.get_transaction", "params":["10b455097513eb767756b421330fc6a5b8f311af"], "id":1}' https://api.hive.blog
    // function getBlocks(){
    //     postRPCrequest("https://api.hive-engine.com/rpc/","blockchain",lastBlock);
    //     const commandRPC = {"jsonrpc":"2.0", "method":"condenser_api.get_transaction", "params":["10b455097513eb767756b421330fc6a5b8f311af"], "id":1 };
    //     postRPCrequest("https://api.hive.blog/","rpc/",commandRPC);
    // };

    function setValueQuery(name,value){
        setFilterQuery(prevState => {
            return { ...prevState, [name]: value }
        })
    }

    //JSON rpc request
    // async function postRPCrequest(RPC, routeRPC, command){
    //     await axios.post(RPC + routeRPC, command)
    //     .then(result => {
    //        console.log(result);
    //     }).catch(error => { console.log('Error on jsonRPC request.', error)});
    // }
    //emd JSON rcp request

    async function sendQuery(q){
        getTx(q);
    }

    function loadDataCG(){
        fetch(pingAPI) //ping the server to see if it is online
        .then(response => {
            // console.log(response);
            if(response.status === 200){
                fetch(dataHive) //ask market Data
                .then(response => {
                    const data = response.json()
                    data.then(response => {
                        console.log(response);
                        setHiveDataCG(response);
                    }).catch(error => console.log('Error getting data coins from CoingGecko',error));
                }).catch(error => console.log('Error getting Coins data from CoingGecko.',error));
                fetch(apiEPChart) //ask for Chart Data.
                .then(response => {
                    const data = response.json()
                    data.then(response => {
                        console.log(response);
                        setCharData(response);
                    }).catch(error => console.log('Error getting data charts from CoingGecko',error));
                }).catch(error => console.log('Error getting charts data from CoingGecko.',error));
            }
        }).catch(error => console.log('Error getting CoingGecko Data.',error));
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
            var passedQ = {
                tx_id: "",
            }
            const cleanQ = decodeURI(query);
            console.log(cleanQ);
            const tx_id = cleanQ.split("?tx_id=")[1];
            console.log('To find tx_id:',tx_id);
            if(tx_id === "default" || tx_id === null){
                //load default explorer
                console.log('Load the default explorer!');
                setShowBObs(true);
                setQueryTyoe({ type: 'default', query: 'none'});
                //testing to get all latest transactions
                // hive.api.callAsync('condenser_api.get_accounts', [['mahdiyari']])
                //     .then((res) => console.log(res))

            }else{
                setLoadingQuery(true);
                sendQuery(tx_id);
            }
        }
    },[query]);

    //to load on init
    useEffect(() => {
        // if(!query){ //so it can show the lastest blocks live. On my case on the test node, later on on main hive.
        //     setDefaultQuery('jabexplorer?tx_id=null');
        // }
        loadDataCG();
    }, []);
    //END to load on init

    //functions/CB
    function getTx(tx){
        hive.api.getTransaction(tx, function(err, result) {
            console.log(err, result);
            if(result){
                setTxToLookUp(result);
                getBlock(result.block_num);
                setLoadingQuery(false);
                setLoadingBlock(true);
            }
        });
    }
    function getBlock(blockNum){
        hive.api.getBlock(blockNum, function(err, result) {
            console.log(err, result);
            if(result){
                setBlockToTookUp(result);
                setLoadingBlock(false);
            }
        });  
    }
    const checkInput = (event) => {
        // console.log(event);
        // console.log('event.key',event.key);
        // console.log('event.keyCode', event.keyCode);
        if(searchInput && (event.key === 'Enter' || event.keyCode === 13 || event === "searchBtn")){
            // TODO fix all this to make it pair with what you did for defaults
            // also validate to make the search if a valid input.
            //first detect tx as numbers - chars - no @ an not #
            const firstChar = String(searchInput).substring(0,1);
            if(firstChar === "#"){
                //block
            }else if(firstChar === "@"){
                //username
            }else{
                //tx
                getTx(searchInput);
            }
        }
    }
    const itemClickedToquery = (type,item) => {
        console.log(`Clicked from BCH Ob: ${type},${item}`);
        if(type === "block"){
            getBlock(item.blockNumber)
        }else if(type === "txId"){ //not using for now as we must make user wait for 2 minutes trans.
            getTx(String(item.transactionId));
        }
    }
    //END funtcions/CB

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
    async function getDataQ(url = '', headers = {}) {
        const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: headers,
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
            <div className="exploreContainer marginBottom">
                <div className="standardDivRowFullWNH justAligned bgBlocksBlue justSpaceEvenly justHeight200p">
                    <div className="justBorders justRounded coloredContrastBlue justWidth60 justHeight70per">
                        <div className="contentMiniMargins">
                            <h2 className="textColorWhite miniMarginBottom">JAB block explorer</h2>
                            <div className="standardDivRowFullWNH justWidth90 justbackgroundOrange justRounded justHeight50p justAligned">
                                <select className="justHeight50p justpadding10p justWidth120px">
                                    <option value="All">All Filters</option>
                                    <option value="tx_id">TxId</option>
                                    <option value="block">Block</option>
                                    <option value="username">Username</option>
                                </select>
                                {/* onChange={(e) => setSearchInput(e.target.value)}  */}
                                <input type="text"  
                                    onKeyDown={(e) => checkInput(e.target.value)} placeholder="  Search Tx/#Block/@Username (+Enter)"
                                    className="justHeight45p justWidth70"
                                />
                                <div onClick={() => checkInput("searchBtn")} className="pointer justHeight50p justiAlig standardDivRowNWNH">
                                    <Img fixed={data.searchIcon.childImageSharp.fixed} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="standardDiv30Percent justiAlig">
                        <p className="textColorWhite">Space for ads</p>
                    </div>
                </div>
                {
                    (queryType.type === 'default') &&
                    <div>
                        <Btncollapse title={"Show/Hide Market CAP & Chart"} toogleValue={showInfoHive} btnAction={() => setShowInfoHive(!showInfoHive)}/>
                        {
                            showInfoHive && hiveDataCG &&
                            <div className="standardDivRowNWNH justMargin0auto minimumMarginTB justWidth90 justHeight200p justRounded justBorders">
                                <ul className="standardUlRowFlexPlain justWidth90">
                                    <li className="standardDivColW50perc normalTextSmall contentMiniMargins">
                                        <p className="noMarginsTB">HIVE/USD: {hiveDataCG.market_data.current_price.usd.toFixed(2)}</p>
                                        <p className="noMarginsTB">High 24h: {hiveDataCG.market_data.high_24h.usd.toFixed(2)}</p>
                                        <p className="noMarginsTB">Low 24h: {hiveDataCG.market_data.low_24h.usd.toFixed(2)}</p>
                                        <p className="noMarginsTB">Market CAP[USD]: {hiveDataCG.market_data.market_cap.usd}</p>
                                    </li>
                                    <li className="standardDivColW50perc">
                                        {
                                            charData && <Charter arrayData={charData} daysToHandle={8}/>
                                        }
                                    </li>
                                </ul>
                            </div>
                        }
                        <div>
                            <Btncollapse title={"Show/Hide Live Blocks on Hive"} toogleValue={showBObs} btnAction={() => setShowBObs(!showBObs)}/>
                            {
                                showBObs && 
                                <Blockchainobserver renderMode={"fullMode"} nBlocks={5}
                                    testingData={false} showBlocks={false} timeChecks={2000} 
                                    CbOnClick={itemClickedToquery}
                                />
                            }
                        </div>
                    </div>
                }
                {
                    txToLookUp && !loadingQuery &&
                    <div>
                        <h2>TX:{txToLookUp.transaction_id}@{txToLookUp.block_num}</h2>
                        <h3>Included in Block:#{txToLookUp.block_num}</h3>
                        <h4>{txToLookUp.operations[0][1].from} {txToLookUp.operations[0][0]} {txToLookUp.operations[0][1].amount} to {txToLookUp.operations[0][1].to}</h4>
                        <p>{txToLookUp.operations[0][1].memo ? `Memo: ${txToLookUp.operations[0][1].memo}` : null}</p>
                        <p>Transaction Num: {txToLookUp.transaction_num}</p>
                        <hr></hr>
                    </div>
                }
                <h2>Info / Block / Tx / Username</h2>
                {
                    loadingBlock && <div className="standardDivRowFlex100pX100pCentered miniMarginTB"><Loader logginIn={true} typegif={"blocks"}/></div>
                }
                {
                    blockToTookUp && !loadingBlock &&
                    <div>
                        <h2>Block ID: {blockToTookUp.block_id}</h2>
                        <h3>Transactions on this block: {blockToTookUp.transactions.length} block produced at: {formatDateTime(blockToTookUp.timestamp)}</h3>
                        <button onClick={() => setShowBlockTrans(!showBlockTrans)}>
                            {showBlockTrans ? 'Hide' : 'Show'}
                        </button>
                        {
                            showBlockTrans &&
                            <div className="smallText">
                                <table className="tablePortPublic">
                                    <tbody>
                                    <tr className="trTablePortP">
                                        <th>Operation</th>
                                        <th>Transaction ID</th>
                                    </tr>
                                {
                                blockToTookUp.transactions.map(trans => {
                                return (
                                        <tr key={trans.transaction_id} className="trTableWhite">
                                            <td>{trans.operations[0][0]}</td>
                                            <td>{trans.transaction_id}</td>
                                        </tr>
                                        )
                                    })
                                }
                                </tbody>
                                </table>
                            </div>
                        }
                    </div>
                }
                {
                    loadingQuery &&
                        <div className="standardDivRowFlex100pX100pCentered miniMarginTB">
                            <Loader logginIn={true} />
                        </div>
                }
            </div>
        </Layout>
    )
}

export default Jabexplorer;