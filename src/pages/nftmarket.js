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
import Maintabulator from '../components/Marketplace/maintabulator';

//constants
const jobEP = process.env.GATSBY_jobEP;
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const publicEP = process.env.GATSBY_publicEP;
//end constants

const Nftmarket = (props) => {
    const userdata = check();
  
    const [filters, setFilters] = useState({ limit: 0, sortby: {}, query: {} }); //as the initial filter to query all nfts. To modify later when needed fields
    const [nft_definitions, setNft_definitions] = useState(null); //Nft definitions On sale on JAB.
    const [nft_instances, setNft_instances] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
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
    function loadNfts(){
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({}), 'limit': filters.limit, 'sortby': JSON.stringify({ symbol: 1 }),};
        dataRequest(nfthandlermongoEP+"getNFTquery","GET",headers,null)
        .then(response => {
            setNft_definitions(response.result);
            setLoadingData(false);
        })
        .catch(error => {
            console.log('Error on GET request to BE.',error);
            setLoadingData(false);
        });
    }
    function loadInstances(){
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ on_sale: true }), 'limit': filters.limit, 'sortby': JSON.stringify({ ntf_id: 1 }),};
        dataRequest(nfthandlermongoEP+"getNFTInstancesQuery","GET",headers,null)
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
                <h1>Nft Marketplace</h1>
                {
                    loadingData &&
                    <div className="standardDivRowFlex100pX100pCentered">
                        <Loader  logginIn={loadingData}/>
                    </div>
                }
                {
                    !loadingData &&
                    <div>
                        <Maintabulator 
                            nft_definitions={nft_definitions}
                            nft_instances={nft_instances}
                            cbSendItem={(type,item) => console.log('Clicked on', { type: type, item: item})}
                        />
                    </div>
                }
            </div>
        </Layout>
    )
}

export default Nftmarket;