import React, { useState, useEffect } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { useStaticQuery, graphql } from 'gatsby';
import Btninfo from '../../btns/btninfo';
import Loader from '../../loader';
import Btnswitch from '../../btns/btnswitch';
import Switchlist from '../../interactions/subcompfilters/switchlist';
import Userwallet from '../../User/userwallet';
import Btncollapse from '../../btns/btncollapse';
import Tablinator from '../../interactions/tablinator';
import Menuhover from '../../interactions/menuhover';
import Menuside from '../../interactions/menuside';
import Transmiter from '../../Marketplace/transmiter';

//constants
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
//end constants

/**
 * This component present the creations + holdings in 2 separate tabs
 * - It returns to a CB the selected item.
 * @param {Object} cbSendItem - The item where user has clicked.
 * @param {Object} userdata as the object holding the user logged data
 * @param {Object} tradeCointBalance - the coin the platform has set to create/cast nfts. For now passed from parent as HIVE balnce as { coin: 'none', balance: 0, }.
 * @param {Boolean} fireAnUpdateNfts - optional if you need this component to fire a GET request on current NFts. I.e: use it when doing changes to refresh the current list.
 * @param {Boolean} fireAnUpdateInstances - optional if you need this component to fire a GET request on current instances. I.e: idem.
 * @param {String} ssc_id node to trasmit.
 * @param {Boolean} devMode - optional to see console.logs
*/

const Tokentabulator = (props) => {
    const { cbSendItem, userdata, tradeCointBalance = { coin: 'none', balance: 0, }, fireAnUpdateNfts, fireAnUpdateInstances, devMode, ssc_id } = props;

    const [allNfts, setAllNfts] = useState([]); //all NFTs definitions on JAB.
    const [nfts, setNfts] = useState([]);
    const [myHoldings, setMyHoldings] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loadingNfts, setLoadingNfts] = useState(false);
    const [loadingInstances, setLoadingInstances] = useState(false);
    const [smallerIcons, setSmallerIcons] = useState(false);
    const [showIcons, setShowIcons] = useState(true);
    const [showBurned, setShowBurned] = useState(true);
    const [enableSelection, setEnableSelection] = useState(false);
    const [arraySelected, setArraySelected] = useState([]);
    const [showSelection, setShowSelection] = useState(false);
    const [showJustSelling, setShowJustSelling] = useState(false);
    const initialAction = { 
        action: '', 
        items_count: 0,
        item_type: '', 
        items: [],
        json_data: { //if not present this will tell transmitter this is a sell order, so it will show input options.
            contractName: '',
            contractAction: '',
            contractPayload: {},
        },
    }
    const [action, setAction] = useState(initialAction);

    //grapqhl queries
    const data = useStaticQuery(graphql`
        query{ desert_weed: file(relativePath: {eq: "nothing_to_see_here_jab.gif"}) { publicURL } }
    `);//end grapqhl queries
 
    //to load on init
    useEffect(() => {
        updateAllNftList();
        updateMyCreations();
    }, []);
    //END to load on init

    //to load on each change of state
    useEffect(() => {
            if(devMode) {console.log('fireAnUpdateNfts',fireAnUpdateNfts)};
            updateMyCreations();
    },[fireAnUpdateNfts]);
    useEffect(() => {
        if(devMode) {console.log('fireAnUpdateInstances',fireAnUpdateInstances)};
        updateAllNftList();
    },[fireAnUpdateInstances]);
    useEffect(() => {
        console.log(arraySelected);
    },[arraySelected]);
    //END just for testing
    //END to load on each change of state

    //functions/CB
    const setNClear = (cen) => {
        setEnableSelection(cen);
        if(!cen) { setArraySelected([])};
    }
    function updateArrayState(action,item){
        if(action === 'add'){
            setArraySelected(prevState => [...prevState, {...item} ] );
        }else{
            const removedItem = arraySelected.filter(_item => _item.id !== item.id);
            setArraySelected(removedItem);
        }
    }
    const selectionMultiple = (event,item) => {
        console.log('Selected: ', item);
        console.log('Checked: ', event.target.checked);
        if(event.target.checked){
            updateArrayState("add", item);
        }else{
            updateArrayState("remove", item);
        }
    }
    function updateAllNftList(){ //get all instances on mongoDB
        setLoadingInstances(true);
        const query = {};
        sendGETBEJustH(nfthandlermongoEP+"getNFTquery",query,0, { symbol: 1 })
        .then(response => {
            if(devMode) {console.log(response)};
            setAllNfts(response.result);
            updateInstances();
        })
        .catch(error => {
            console.log('Error getting data BE.',error);
            setLoadingInstances(false);
        });
    }
    function updateInstances(){ //get all instances on mongoDB
        setMyHoldings([]); //test to force the update on this state
        const query = { username: userdata.username };
        sendGETBEJustH(nfthandlermongoEP+"getNFTInstancesQuery",query,0, { symbol: 1 })
        .then(response => {
            if(devMode) {console.log(response)};
            setMyHoldings(response.result);
            setLoadingInstances(false);
        })
        .catch(error => {
            console.log('Error getting data BE.',error);
            setLoadingInstances(false);
        });
    }
    function updateMyCreations(){
        setLoadingNfts(true);
        getNftMongoQuery({ account: userdata.username },0,{ "symbol": 1 });
    }
    function getNftMongoQuery(query = {},limit = Number,sortby = {}){
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify(query), 'limit': limit, 'sortby': JSON.stringify(sortby),}
        sendRequest(nfthandlermongoEP + "getNFTquery", "GET",headers)
        .then(response => {
            if(devMode) {console.log(response)};
            if(response.status === 'sucess'){
                setNfts(response.result);
            }
            setLoadingNfts(false);
        }).catch(error => {
            console.log('Error asking for NFTs on this user from DB, mongo.',error);
            setLoadingNfts(false);
        });
    }
    function getThumb(nftId){
        const found = allNfts.filter(item => item.nft_id === nftId);
        // NOTE: Removed from devMode for now. if(devMode) { console.log(found) };
        return found ? found[0].thumb : null;
    }
    function getNftDefinition(nft_id){
        const found = allNfts.filter(nft => nft.nft_id === nft_id);
        if(devMode) { console.log(found) };
        return found[0];
    }
    const setSwitchs = (item) => {
        if(devMode) { console.log('Clicked on:',item) };
        if(item.switch === "show_icons"){
            setShowIcons(item.cen);
        }else if(item.switch === "smaller_icons"){
            setSmallerIcons(item.cen);
        }else if(item.switch === "show_burned"){
            setShowBurned(item.cen);
        }else if(item.switch === "enable_multiple"){
            setNClear(item.cen);
        }else if(item.switch === "just_selling"){
            setShowJustSelling(item.cen);
        }
    }
    const multipleAction = (action) => {
        console.log('Clicked on:', action);
        if(arraySelected.length > 0){
            if(action === 'Sell All'){
                //we must check if any is on_sale
                const on_sale_count = arraySelected.filter(nft => nft.on_sale);
                if(on_sale_count.length > 0){
                    const place_s = on_sale_count.length !== 1 ? 's' : '';
                    return alert(`There is ${on_sale_count.length} Token${place_s} with sell order${place_s} already.\nIf you want to sell tokens, select the one${place_s} available to do so.\nOr go to Marketplace > My Orders and cancel the orders on those NFTs.`);
                }
                setAction({
                    action: 'sell',
                    item_type: 'instance',
                    items_count: arraySelected.length,
                    items: arraySelected,
                    json_data: {
                        contractName: 'nftmarket',
                        contractAction: 'sell',
                        contractPayload: {
                            symbol: arraySelected[0].ntf_symbol,
                            nfts: [...arraySelected.map(item => String(item.nft_instance_id))],
                            price: '',
                            priceSymbol: '',
                            fee: 0,
                        }
                    }
                })
            }
        }
    }
    const closeNUpdate = () => {
        setAction(initialAction);
        setArraySelected([]);
        updateInstances();
    }

    //data fecthing
    async function sendRequest(url = '', requestType, headers) {
        const response = await fetch(url, {
            method: requestType, 
            mode: 'cors', 
            headers: headers,
        });
        return response.json(); 
    };
    async function sendGETBEJustH(url = '', query = {},limit = Number,sortby = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {  'x-access-token': userdata.token, 'query': JSON.stringify(query), 'limit': limit, 'sortby': JSON.stringify(sortby),},
        });
        return response.json(); 
    };
    //END data fecthing
    //END functions/CB

    return (
        <div>
            <Tabs>
                <TabList>
                    <Tab>
                        <h3 className="shadowsTitlesSoft">My NFTs <Btninfo size={"mini"} msg={'These are all the NFTs definitions you own. For each one you can: edit info, sell as premium and more. Select one to see the options bellow.'} /></h3>
                    </Tab>
                    <Tab>
                        <h3 className="shadowsTitlesSoft">My Holdings <Btninfo size={"mini"} msg={'These are all the NFTs you posess.'} /></h3>
                    </Tab>
                    <Tab>
                        {
                            (tradeCointBalance && (tradeCointBalance.balance === 0))
                            ?
                            <div className="standardDivMini">
                                <Loader logginIn={true} typegif={"spin"}/>
                            </div>
                            :
                            <h3 className="shadowsTitlesSoft">My Balance: {tradeCointBalance.balance} {tradeCointBalance.coin}<Btninfo size={"mini"} msg={'The actual balance you have on JAB accepted coin to create/cast NFTs.'} /></h3>
                        }
                    </Tab>
                </TabList>
                <TabPanel>
                    <div className="standardDivRowPlain jutsMinHeight200px">
                    {
                        (nfts.length > 0) && !loadingNfts &&
                        <div>
                            <ul className="standardUlRowFlexPlain justMaxHeight300p justOverflowY wrapDiv">
                                {
                                    nfts.map(token => {
                                        return (
                                                <li key={token._id} className={`pointer goldeBorderRound hoveredBordered miniMarginLeft`} onClick={() => cbSendItem(token,"nft_definition")}>
                                                    <div className="textAlignedCenter">
                                                        <div className="shinning">
                                                            <img src={token.thumb} className="imageSquaredSmall" />
                                                        </div>
                                                        <p className="xSmalltext">Symbol: {token.symbol}</p>
                                                        <p className="xSmalltext">Price Def: {token.price_definition} HIVE</p>
                                                    </div>
                                                </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    }
                    {
                        !loadingNfts && nfts.length === 0 &&
                        <img src={data.desert_weed.publicURL} className="textAlignedCenter justMarginAuto" />
                    }
                    {
                        loadingNfts && 
                        <div className="standardDivRowFlex100pX100pCentered">
                            <Loader logginIn={loadingNfts} />
                        </div>
                    }
                    </div>
                </TabPanel>
                <TabPanel>
                    <div className="jutsMinHeight320px">
                        <ul className={`${!showIcons ? 'standardDivColFullW standardUlColPlain' : 'standardUlRowFlexPlain'} overflowXscroll justOverflowY justMaxHeight300p`}>
                            {   !loadingInstances &&
                                myHoldings.map(token => {
                                    if(!showBurned && token.burned) return null;
                                    if(showJustSelling && !token.on_sale) return null;
                                    return (
                                        <div key={`${token._id}-${token.ntf_symbol}`}>
                                        {
                                            enableSelection &&
                                            <div>
                                                <input type="checkbox" className="pointer" title="Click just in the checkbox to select" onChange={(e) => selectionMultiple(e, token)}
                                                />
                                            </div>
                                        }
                                            <li key={token._id} className={`${token.burned ? 'justBlackedDiv' : null } pointer hoveredBordered miniMarginLeft`} onClick={() => cbSendItem({...token, image: getThumb(token.ntf_id), nft_definition: getNftDefinition(token.ntf_id)},"nft_instance")}>
                                                <div className={`textAlignedCenter ${!showIcons ? 'standardUlRowFlexPlain standardLiHovered justSpaceEvenly' : null}`}>
                                                    {   showIcons &&
                                                        <div>
                                                            <img src={getThumb(token.ntf_id)} className={`${smallerIcons ? 'imageSquaredXSmall': 'imageSquaredSmall '}`} />
                                                        </div>
                                                    }
                                                    <p className="xSmalltext">Symbol: {token.ntf_symbol}</p>
                                                    <p className="xSmalltext">Id: {token.nft_instance_id}</p>
                                                    {
                                                        showJustSelling && <p className="xSmalltext">Selling on Price:{token.price}/{token.priceSymbol}</p>
                                                    }
                                                    {
                                                        !showIcons &&
                                                        <div className="standardUlRowFlexPlain justSpaceEvenly justWidth70">
                                                            <p className="xSmalltext">Price: {token.price}</p>
                                                            <p className="xSmalltext">Price Symbol: {token.priceSymbol}</p>
                                                            <p className="xSmalltext">On Sale {token.on_sale.toString()}</p>
                                                            <p className="xSmalltext">Burned: {token.burned.toString()}</p>
                                                        </div>
                                                    }
                                                </div>
                                            </li>
                                        </div>
                                    )
                                })
                            }
                            {
                                loadingInstances && 
                                <div className="standardDivRowFlex100pX100pCentered">
                                    <Loader logginIn={loadingNfts} />
                                </div>
                            }
                        </ul>
                        {
                            !loadingNfts && myHoldings.length === 0 &&
                            <img src={data.desert_weed.publicURL} className="textAlignedCenter justMargin0auto" />
                        }
                         {
                            !loadingInstances && myHoldings.length > 0 &&
                                <div>
                                    <Switchlist xclassCSSUl={"standardUlRowFlexPlain justFlexWrap justSpaceAround normalTextSmall"}
                                        miniSizes={"true"} clickCB={(item) => setSwitchs(item)}
                                        switchList={[
                                            { id: 'switch-1a', iniValue: smallerIcons, sideText: 'Smaller icons', name: 'smaller_icons',},
                                            { id: 'switch-2a', iniValue: showIcons, sideText: 'Show Icons', name: 'show_icons'},
                                            { id: 'switch-3a', iniValue: showBurned, sideText: 'Show Burned', name: 'show_burned'},
                                            { id: 'switch-4a', iniValue: enableSelection, sideText: 'Select Multiple', name: 'enable_multiple'},
                                            { id: 'switch-5a', iniValue: showJustSelling, sideText: 'On Sell Only', name: 'just_selling'},
                                        ]}
                                    />
                                    { 
                                        arraySelected && enableSelection &&
                                        <div className="standardDivRowFullW justAligned">
                                            <div className="justWidth20">
                                                <Menuhover xclassCSS={"marginLeft justBordersRounded"}
                                                    clickedSubItemCB={(item) => multipleAction(item)}
                                                    items={[
                                                        {title: 'Batch Actions', cbProp: 'bacthActions', subMenu: [ 'Sell All', 'Transfer All','Burn All'],},
                                                    ]}
                                                />
                                            </div>
                                            <div className="justWidth80">
                                                <div className="standardDivRowFullW justAligned">
                                                    <p className="normalTextSmall">Selected(s): {arraySelected.length}</p>
                                                    <Btncollapse xclassCSS={"marginLeft"} miniSizes={true} toogleValue={showSelection} btnAction={() => setShowSelection(!showSelection)}  />
                                                </div>
                                                {
                                                    showSelection &&
                                                    <Tablinator xclassCSS={"justMaxHeight300p overflowXscroll"}
                                                        items={arraySelected} titleTable={'My Selection'}
                                                        toShow={['nft_instance_id','ntf_id','ntf_symbol','on_sale','createdAt','burned',]}
                                                    />
                                                }
                                            </div>
                                        </div>
                                    }
                                </div>
                        }
                    </div>
                </TabPanel>
                <TabPanel>
                    <div className="jutsMinHeight320px">
                        <Userwallet />
                    </div>
                </TabPanel>
            </Tabs>
            {
                action.action !== '' &&
                <Transmiter 
                    action={action}
                    ssc_id={ssc_id}
                    userdata={userdata}
                    closeCB={closeNUpdate}
                    devMode={true}
                />
            }
        </div>
    )
}

export default Tokentabulator;