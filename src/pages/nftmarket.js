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
import Transmiter from '../components/Marketplace/transmiter';
import Btnactionicon from '../components/btns/btnactionicon';

//constants
// TODO put in on .env
const jabFEE = { fee: "0.002", currency: "HIVE", costInstance: "0.001", costCurr: "HIVE", acceptedCur: "HIVE"};
//just the jabFEE.
const jobEP = process.env.GATSBY_jobEP;
const nftEP = process.env.GATSBY_nftEP;
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const publicEP = process.env.GATSBY_publicEP;
const orderEP = process.env.GATSBY_orderEP;
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
        { field:'account', type: 'String', link: true, typeLink: 'portfolio' },
    ],},
    { type: 'instance', toShow: [
        { field:'nft_instance_id', type: 'Number', link: false },
        { field:'ntf_id', type: 'Number', link: false },
        { field:'ntf_symbol', type: 'String', link: false },
        { field:'price', type: 'Number', link: false, },
        { field: 'priceSymbol', type: 'String', link: false },
        { field:'username', type: 'String', link: true, typeLink: 'portfolio' },
    ],},
];
const ssc_test_id = "ssc-testNettheghost1980";
const pagination = { perPage: 10, controls: false };
//end constants

//Important note here.
// To process public requests, we are setting the same routers as used in nftcontroller: /getNFTInstancesQuery & /getNFTquery
// later on to handle the rest of queries as: update or buy/sells then we need to be logged in.

const Nftmarket = (props) => {
    const userdata = check();
  
    const [filters, setFilters] = useState({ limit: 0, sortby: {}, query: {} }); //as the initial filter to query all nfts. To modify later when needed fields
    const [nft_definitions, setNft_definitions] = useState(null); //Nft definitions On sale on JAB.
    const [nft_instances, setNft_instances] = useState(null);
    const [myorders, setMyorders] = useState(null); //user marketorders.
    const [loadingData, setLoadingData] = useState(true);
    const [selected, setSelected] = useState(null); //can be instance or definition
    const [selected_order, setSelected_order] = useState(null);
    const [toShow, setToShow] = useState([]); //depending on selected we switch on which fields we send to recornatorabs.
    const initialAction = { 
        action: '', 
        items_count: 0,
        order: {},
        items: [],
        item_type: '', 
        json_data: {
            contractName: '',
            contractAction: '',
            contractPayload: {},
        },
        priceSymbol: '',
    }
    const [action, setAction] = useState(initialAction);
    const [sameUser, setSameUser] = useState(false);
    const [refresh, setRefresh] = useState('');
    const [indexPage, setIndexPage] = useState(0);
    
    //to load on each change of state
    useEffect(() => {
        if(selected && userdata.logged){
            const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ username: selected.item.username, nft_instance_id: selected.item.nft_instance_id, nft_symbol: selected.item.nft_symbol }), 'limit': 1, 'sortby': JSON.stringify({ createdAt: 1 }),};
            dataRequest(orderEP+"getMarketOrder","GET",headers,null)
            .then(response => { setSelected_order(response.result[0]) })
            .catch(error => { console.log('Error on GET request to BE.',error) });
        }
    },[selected]);
    //END to load on each change of state
    

    //to load on init
    useEffect(() => {
        //to handle queries later on. For now just the basics, get On sale: definitions + tokens.
        setLoadingData(true);
        loadAll();
    }, []);
    //END to load on init

    //functions/CB
    function loadAll(){
        loadNfts();
        loadInstances();
        if(userdata.logged){
            loadOrders();
        }
    }
    const setSelectedItem = (type,item) => {
        if(devMode){ console.log('Clicked on', { type: type, item: item}) };
        if(type === 'definition'){
            item.price_definition_Symbol = jabFEE.currency;
            setSameUser(userdata.username === item.account ? true : false);
        }else{
            item.image = nft_definitions.find(definition => definition.nft_id === item.ntf_id).image;
            setSameUser(userdata.username === item.username ? true : false);
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
    function loadOrders(){
        setLoadingData(true);
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ username: userdata.username, }), 'limit': 0, 'sortby': JSON.stringify({ createdAt: 1 }),};
        dataRequest(orderEP+"getMarketOrder","GET",headers,null)
        .then(response => {
            if(devMode) { console.log(response) };
            setMyorders(response.result);
            setLoadingData(false);
        })
        .catch(error => {
            console.log('Error on GET request to BE.',error);
            setLoadingData(false);
        });
    }
    const re_loadOrders = () => {
        loadAll();
    }
    const setAndUpdate = () => {
        setSelected(null);
        setSelected_order(null);
        setAction(initialAction);
        re_loadOrders();
    }
    const buyItem = () => {
        if(selected.type === 'instance'){
            setAction({
                action: 'buy',
                items: [selected.item],
                order: selected_order,
                item_type: selected.type,
                json_data: {
                    contractName: 'nftmarket',
                    contractAction: 'buy',
                    contractPayload: {
                        symbol: selected.item.ntf_symbol,
                        nfts: [ String(selected.item.nft_instance_id) ],
                        marketAccount: "jobaboard",
                    }
                },
                priceSymbol: selected.item.priceSymbol,
            });
        }else if(selected.type === 'definition'){
            alert('This function will be enabled soon.\nThe idea is: The user placed the definition as selling. It will transfer the ownership to JAB, this will lock the token. Later on another user wants to buy it. We wait for the transfer, take the selling fee and transfer the ownership to the buyer. Done.')
            // setAction({
            //     action: 'buy',
            //     items: [selected.item],
            //     order: selected_order,
            //     item_type: 'definition',
            //     transfer_json: { //window.hive_keychain.requestTransfer(userdata.username, "jobaboard", nft.totalAmountPay.toString(), JSON.stringify(memo), jabFEE.acceptedCur, function(result){
            //         from: '', to: '', amount: '0.000', currency: 'HIVE',
            //     },
            //     transfer_Ownership_json: {
            //         "contractName": "nft",
            //         "contractAction": "transferOwnership",
            //         "contractPayload": {
            //             "symbol": selectedNftDefinition.symbol,
            //             "to": transfer.to,
            //         }
            //     },
            //     priceSymbol: selected.item.price_definition_Symbol,
            // });
        }
    }
    const addWishList = (addedBySystem) => { //TODO wish list for definitions.
        console.log('Adding to wishlist', selected);
        const query = { username: userdata.username, item_type: selected.type, record_active: true, }
        const formdata = new FormData();
        formdata.append("username", userdata.username);
        formdata.append("image", selected.item.image);
        formdata.append("item_type", selected.type);
        if(addedBySystem){ formdata.append("added_by_system", addedBySystem);}
        if(selected.type === 'instance'){ 
            query.nft_instance_id = selected.item.nft_instance_id;
            query.nft_symbol = selected.item.ntf_symbol;
            formdata.append("nft_symbol", selected.item.ntf_symbol);
            formdata.append("owner", selected.item.username);
            formdata.append("nft_instance_id", selected.item.nft_instance_id); 
            formdata.append("price", selected.item.price);
            formdata.append("priceSymbol", selected.item.priceSymbol);
            formdata.append("nft_definition_id", selected.item.ntf_id);
        }else if(selected.type === 'definition'){
            query.nft_symbol = selected.symbol;
            query.nft_definition_id = selected.item.nft_id;
            formdata.append("nft_symbol", selected.item.symbol);
            formdata.append("owner", selected.item.account);
            formdata.append("nft_definition_id", selected.item.nft_id);
            formdata.append("price", selected.item.price_definition);
            formdata.append("priceSymbol", selected.item.price_definition_Symbol);
        }
        formdata.append("createdAt", new Date());
        const headers = { 'x-access-token': userdata.token, 'operation': 'create', 'query': JSON.stringify(query) };
        dataRequest(orderEP+"handleRequestWishlist", "POST", headers, formdata).then(response => {
            console.log(response);
            if(response.status === 'sucess'){ 
                alert('Added to your wishlist.') ;
                setRefresh('wishlist');
            }else{
                console.log('Not added!');
            }
        }).catch(error => console.log('Error adding to wishlist.', error ));
    }
    /////////fecthing data
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata ? fetch(url, { method: requestType, headers: headers,})
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
                    !loadingData && nft_definitions && nft_instances &&
                    <div>
                        <Maintabulator 
                            pagination={pagination}
                            nft_definitions={nft_definitions}
                            nft_instances={nft_instances}
                            market_orders={myorders || []}
                            cbSendItem={setSelectedItem}
                            devMode={true}
                            jabFEE={jabFEE}
                            userdata={userdata}
                            nftEP={nftEP}
                            updateOrders={re_loadOrders}
                            refreshList={refresh}
                        />
                    </div>
                }
                {
                    selected &&
                    <Absscreenwrapper xtraClass={"justifyFlexStart"}>
                        <div className="whiteBack justBordersRounded justMarginAuto standardDiv60Percent">
                            <div className="standardContentMargin relativeDiv">
                                <Recordnator 
                                    imgClassCSS={"imageMedium justMarginAuto"}
                                    closeCB={() => setSelected(null)}
                                    item={selected.item}
                                    imageMainField={ {imgField: 'image'} }
                                    toShow={toShow}
                                    titleRecord={`I Like this ${selected.type}.`}
                                />
                                {
                                    (userdata.logged && userdata.username && !sameUser) &&
                                    <div className="marginsTB justSpaceAround standardDivRowFullW">
                                        <Btnactionicon xclassCSS={"scaleOnHover"} title={"add to my wishlist"} btnAction={() => addWishList(false)} typeIcon={"wishlist"}/>
                                        <button className="justWidth100" onClick={buyItem}>Buy</button>
                                    </div>
                                }
                                {
                                    !userdata.logged && <button onClick={() => navigate("/signup")} className="marginsTB">Log In/Signup for Buying/Selling on JAB</button>
                                }
                            </div>
                        </div>
                    </Absscreenwrapper>
                }
            </div>
            {
                action.action !== '' &&
                <Transmiter 
                    action={action}
                    userdata={userdata}
                    ssc_id={ssc_test_id}
                    closeCB={setAndUpdate}
                    devMode={true}
                />
            }
        </Layout>
    )
}

export default Nftmarket;