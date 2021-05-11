import React, { useState, useEffect } from 'react';
import { useStaticQuery, graphql, navigate } from "gatsby"
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
import Maintabulator from '../components/Marketplace/maintabulator';
import Recordnator from '../components/interactions/recordnator';
import Btninfo from '../components/btns/btninfo';

//constants
// TODO put in on .env
const jabFEE = { fee: "0.002", currency: "HIVE", costInstance: "0.001", costCurr: "HIVE", acceptedCur: "HIVE"};
//just the jabFEE.
const jobEP = process.env.GATSBY_jobEP;
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const publicEP = process.env.GATSBY_publicEP;
const devMode = true;
const fieldsByItem = [
    { type: 'definition', toShow: [
        { field:'nft_id', type: 'Number', link: false },
        { field:'symbol', type: 'String', link: false },
        { field:'issued_On', type: 'String', link: false },
        { field:'maxSupply', type: 'Number', link: false },
        { field:'price_definition', type: 'Number', link: false, },
        { field: 'price_definition_Symbol', type: 'Number', link: false },
        { field:'market_enabled', type: 'Boolean', link: false },
    ],},
    { type: 'instance', toShow: [
        { field:'nft_instance_id', type: 'Number', link: false },
        { field:'ntf_id', type: 'Number', link: false },
        { field:'ntf_symbol', type: 'String', link: false },
        { field:'price', type: 'Number', link: false, },
        { field: 'priceSymbol', type: 'String', link: false },
        { field:'username', type: 'String', link: false },
    ],},
]
//end constants

//Important note here.
// To process public requests, we are setting the same routers as used in nftcontroller: /getNFTInstancesQuery & /getNFTquery
// later on to handle the rest of queries as: update or buy/sells then we need to be logged in.

const Nftmarket = (props) => {
    const userdata = check();
  
    const [filters, setFilters] = useState({ limit: 0, sortby: {}, query: {} }); //as the initial filter to query all nfts. To modify later when needed fields
    const [nft_definitions, setNft_definitions] = useState(null); //Nft definitions On sale on JAB.
    const [nft_instances, setNft_instances] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [selected, setSelected] = useState(null); //can be instance or definition
    const [toShow, setToShow] = useState([]); //depending on selected we switch on which fields we send to recornatorabs.
    //to load on each change of state
    //END to load on each change of state
    

    //to load on init
    useEffect(() => {
        //to handle queries later on. For now just the basics, get On sale: definitions + tokens.
        setLoadingData(true);
        loadNfts();
        loadInstances();
    }, []);
    //END to load on init

    //functions/CB
    const setSelectedItem = (type,item) => {
        if(devMode){ console.log('Clicked on', { type: type, item: item}) };
        if(type === 'definition'){
            item.price_definition_Symbol = jabFEE.currency;
        }else{
            item.image = nft_definitions.find(definition => definition.nft_id === item.ntf_id).image;
        }
        setSelected({ type: type, item: item });
        const arraySelected = fieldsByItem.find(item => item.type === type).toShow;
        setToShow(arraySelected);
    }
    function loadNfts(){
        const headers = {'query': JSON.stringify({}), 'limit': filters.limit, 'sortby': JSON.stringify({ symbol: 1 }),};
        dataRequest(publicEP+"getNFTquery","GET",headers,null)
        .then(response => {
            setNft_definitions(response.result);
        })
        .catch(error => {
            console.log('Error on GET request to BE.',error);
        });
    }
    function loadInstances(){
        const headers = { 'query': JSON.stringify({ on_sale: true }), 'limit': filters.limit, 'sortby': JSON.stringify({ ntf_id: 1 }),};
        dataRequest(publicEP+"getNFTInstancesQuery","GET",headers,null)
        .then(response => {
            setNft_instances(response.result);
            setLoadingData(false);
        })
        .catch(error => {
            console.log('Error on GET request to BE.',error);
            setLoadingData(false);
        });
    }
    /////////fecthing data
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    formdata ? fetch(url, { method: requestType, headers: headers,})
                            : fetch(url, { method: requestType, headers: headers, body: formdata});
        return (await response).json(); 
    };
    //////////end fetchin data
    //END functions/CB

    

    return (
        <Layout>
            <div className="exploreContainer">
                <div className="standardDivRowFullW justAligned">
                    <h1>Nft Marketplace</h1>
                    <Btninfo msg={"In case you wonder. Why 2 tabs on NFTs?. On JAB we allow you to sell not just the NFTs you hold, but also the definitions itself. Find more about this on FAQ section."} />
                </div>
                {
                    loadingData &&
                    <div className="standardDivRowFlex100pX100pCentered">
                        <Loader  logginIn={loadingData}/>
                    </div>
                }
                {
                    !loadingData && nft_definitions && nft_definitions &&
                    <div>
                        <Maintabulator 
                            nft_definitions={nft_definitions}
                            nft_instances={nft_instances}
                            cbSendItem={setSelectedItem}
                            devMode={true}
                            jabFEE={jabFEE}
                            userdata={userdata}
                        />
                    </div>
                }
                {
                    selected &&
                    <Absscreenwrapper xtraClass={"justifyFlexStart"}>
                        <div className="whiteBack justBordersRounded justMarginAuto standardDiv60Percent">
                            <div className="standardContentMargin">
                                <Recordnator 
                                    imgClassCSS={"imageMedium justMarginAuto"}
                                    closeCB={() => setSelected(null)}
                                    item={selected.item}
                                    imageMainField={ {imgField: 'image'} }
                                    toShow={toShow}
                                    titleRecord={`I Like this ${selected.type}.`}
                                />
                                {
                                    userdata.logged ?
                                    <div className="marginsTB justSpaceAround standardDivRowFullW">
                                        <button>Buy</button>
                                        <button>Wishlist</button>
                                    </div>
                                    : <button onClick={() => navigate("/signup")} className="marginsTB">Log In/Signup for Buying/Selling on JAB</button>
                                }
                            </div>
                        </div>
                    </Absscreenwrapper>
                }
            </div>
        </Layout>
    )
}

export default Nftmarket;