import React, { useState, useEffect } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Btnoutlink from '../btns/btnoutlink';
import Btnswitch from '../btns/btnswitch';
import Tablinator from '../interactions/tablinator';
import Recordnator from '../interactions/recordnator';
import Transmiter from './transmiter';

//constants
const ssc_test_id = "ssc-testNettheghost1980";
const orderEP = process.env.GATSBY_orderEP;
//END contansts

/**
 * This component present the definitions & holdings ON SALE in 2 separate tabs.
 * - It returns to a CB the selected item.
 * @param {Object} cbSendItem - The item where user has clicked.
 * @param {[Object]} nft_definitions - Nft definitions on Sale on JAB.
 * @param {[Object]} nft_instances - Nft tokens on Sale on JAB.
 * @param {[Object]} market_orders - the market order of this user.
 * @param {Object}  jabFEE - defines fees & accepted currency, to be set later on from .env files.
 * @param {Object} pagination - optional to render lists paginated. AS { perPage: 10, controls: Boolean }.
 * @param {Object} userdata - userdata.
 * @param {String} nftEP the EP of hive to check for txs.
 * @param {Function} updateOrders call back to update the orders after an operation as update/buy/sell/cancelled.
 * @param {String} refreshList - optional use it to refresh a particular list. I.e: 'wishlist'.
 * @param {Boolean} devMode - optional to see console.logs
*/

const Maintabulator = (props) => {
    const { cbSendItem, nft_definitions, nft_instances, devMode, jabFEE, userdata, market_orders, nftEP, updateOrders, refreshList, pagination} = props;
    const [definitionsSortBy, setDefinitionsSortBy] = useState([]); //maping the fields from incomming item on useeffect.
    const [instancesSortBy, setInstancesSortBy] = useState([]);
    const [keyOrderBy, setKeyOrderBy] = useState("");
    const [orderAsc, setOrderAsc] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const initialAction = { 
        action: '', 
        items_count: 0,
        items: [],
        item_type: '', 
        json_data: {
            contractName: '',
            contractAction: '',
            contractPayload: {},
        },
    }
    const [action, setAction] = useState(initialAction);
    const [wishlist, setWishlist] = useState(null);
    const [wishListedSelected, setWishListedSelected] = useState(null);

    //functions/CB
    /////////fecthing data
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata ? fetch(url, { method: requestType, headers: headers,})
                            : fetch(url, { method: requestType, headers: headers, body: formdata});
        return (await response).json(); 
    };
    //////////end fetchin data
    function compare(a, b,) {
        if ( a[keyOrderBy] < b[keyOrderBy] ){ return !orderAsc ? 1 : -1 };
        if ( a[keyOrderBy] > b[keyOrderBy] ){ return !orderAsc ? -1 : 1 };
        return 0;
    }
    function getThumb(nftId){
        const found = nft_definitions.filter(item => item.nft_id === nftId);
        // NOTE: Removed from devMode for now. if(devMode) { console.log(found) };
        return found ? found[0].thumb : null;
    }
    function scanObjectFields(object){
        const arrayFields = [];
        Object.entries(object[0]).forEach(([key,value]) => { 
            if(key !== "__v" && key !== "burned" && key !== "for_sale" && key !== "on_sale" && key !== "image" && key !== "thumb"){ arrayFields.push(key) } 
        });
        if(devMode){ console.log( {arrayFields: arrayFields} )}
        return arrayFields;
    }
    function paginateIt(array){
            function paginate (arr, size) {
                return arr.reduce((acc, val, i) => {
                  let idx = Math.floor(i / size);
                  let page = acc[idx] || (acc[idx] = []);
                  page.push(val);
                  return acc;
                }, [])
            }
            let page_size = pagination.perPage;
            let pages = paginate(array, page_size);
            if(devMode){ console.log('pagination results on maintabulator:', pages); };
            return  pages;
    }
    const editMarketOrder = (option) => {
        if(devMode){ console.log('Option Menu:', option) };
        if(option === 'close'){ setSelectedOrder(null) };
        if(option === 'cancel'){
            const answer = window.confirm('Are you sure to cancel the order?');
            if(answer){
                const item_type = selectedOrder.item_type;
                // const test = selectedOrder[`nft_${item_type}s`];
                // console.log('to read:', { item_type, test });
                setAction({
                    action: 'cancel',
                    item_type: item_type,
                    items: [selectedOrder],
                    json_data: {
                        contractName: 'nftmarket',
                        contractAction: 'cancel',
                        contractPayload: {
                            symbol: selectedOrder.nft_symbol,
                            nfts: [ String(selectedOrder.nft_instance_id) ],
                        }
                    }
                });
            }
        }
        if(option === 'edit'){
            setAction({
                action: 'update',
                item_type: selectedOrder.item_type,
                items: [selectedOrder],
                json_data: {
                    contractName: 'nftmarket',
                    contractAction: 'changePrice',
                    contractPayload: {
                        symbol: selectedOrder.nft_symbol,
                        nfts: [ String(selectedOrder.nft_instance_id) ],
                    }
                }
            });
        }
    }
    const closeNUpdate = () => {
        setAction(initialAction);
        updateOrders();
    }
    function loadWishList(){
        if(userdata.logged){
            const headers = { 'x-access-token': userdata.token, 'operation': 'find', 'query': JSON.stringify({ username: userdata.username, record_active: true }) };
            dataRequest(orderEP+"handleRequestWishlist", "POST", headers, {}).then(response => {
                console.log(response);
                setWishlist(response.result);
            }).catch(error => console.log('Error adding to wishlist.', error ));
        }else{
            if(devMode){ console.log('No wishlist to load as user not logged yet!') };
        }
    }
    const wishListing = (option) => {
        console.log('Option Wish List:', option);
        // if(option === 'remove'){ setWishListedSelected(null)};
    }
    //END functions/CB

    //to load on init
    useEffect(() => {
        //TODO pagination
        if(nft_definitions && nft_definitions.length > 0){ setDefinitionsSortBy(scanObjectFields(nft_definitions)) };
        if(nft_instances && nft_instances.length > 0){ setInstancesSortBy(scanObjectFields(nft_instances)) };
        loadWishList();
        if(devMode){ console.log('Received on props:', { cbSendItem, nft_definitions, nft_instances, jabFEE, market_orders, pagination})}
    },[]);
    //END to load on init

    //load on state changes
    useEffect(() => {
        if(selectedOrder){ console.log('Selected order:', selectedOrder )};
    },[selectedOrder]);
    useEffect(() => {
        if(action.action !== ''){ console.log('Action changes:', action) };
    },[action]);
    useEffect(() => {
        if(refreshList && refreshList === 'wishlist'){
            loadWishList();
            console.log('updating wishlist');
        }
    },[refreshList]);
    useEffect(() => {
        console.log(wishListedSelected);
    },[wishListedSelected]);
    //END load on state changes

    return (
        <div>
            <Tabs>
                <TabList>
                    <Tab>
                        <h3>Definitions on Sale</h3>
                    </Tab>
                    <Tab>
                        <h3>Tokens on Sale</h3>
                    </Tab>
                    {
                        userdata.logged &&
                        <Tab>
                            <h3>My Buy/Sells</h3>
                        </Tab>
                    }
                </TabList>
                <TabPanel>
                    {
                        nft_definitions && nft_definitions.length === 0 &&
                        <h2>No definitions on sale to show.</h2>
                    }
                    {
                        nft_definitions && nft_definitions.length > 0 && definitionsSortBy &&
                        <div>
                            <div className="standardUlRowFlexPlain">
                                <label className="normalTextSmall miniMarginRight" htmlFor="sorting_definitions">Sort By: </label>
                                <select className="normalTextSmall" name="sorting_definitions" onChange={(e) => setKeyOrderBy(e.target.value)}>
                                    <option defaultValue="select option"></option>
                                    {
                                        definitionsSortBy.map(orderByfield => {
                                            return (
                                                <option key={`${orderByfield}-sorting-JAB`} value={orderByfield}>
                                                    {String(orderByfield).split("_").join(" ")}
                                                </option>
                                            )
                                        })
                                    }
                                </select>
                                <Btnswitch xtraClassCSS={"justDisplayFlexRow justiAlig normalTextSmall justWidth100"} miniSizes={true}  btnAction={(cen) => setOrderAsc(cen)} sideText={`${orderAsc ? 'Desc': 'Asc'}`}/>
                            </div>
                            <ul className="standardUlRowFlexPlain justFlexWrap spaceEvenly">
                                {
                                    nft_definitions.sort( compare ).filter(item => item.for_sale ).map(token => {
                                        return (
                                            <li key={token._id} className="marginTop marginRight">
                                                <div className="standardDivFlexPlain textAlignedCenter">
                                                    <div onClick={() => cbSendItem("definition",token)} className="pointer hoveredBordered">
                                                        <div>
                                                            <img src={token.image} className="mediumImage" />
                                                        </div>
                                                        <p className="normalTextSmall">Symbol: {token.symbol}</p>
                                                        <p className="normalTextSmall">Price: {token.price_definition} On {jabFEE.currency}</p>
                                                    </div>
                                                    <div className="standardUlRowFlexPlain pointer justiAlig">
                                                        <p className="normalTextSmall">Owner:</p>
                                                        <Btnoutlink xclassCSS={"justiAlig"} textLink={token.account} link={`/portfoliouser?query=${token.account}`} /> 
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    }
                </TabPanel>
                <TabPanel>
                {
                    nft_instances && nft_instances.length === 0 &&
                    <h2>No definitions on sale to show.</h2>
                }
                {
                        nft_instances && nft_definitions && instancesSortBy && nft_instances.length > 0 &&
                        <div>
                            <div className="standardUlRowFlexPlain">
                                <label className="normalTextSmall miniMarginRight" htmlFor="sorting_instances">Sort By: </label>
                                <select className="normalTextSmall" name="sorting_instances" onChange={(e) => setKeyOrderBy(e.target.value)}>
                                    <option defaultValue="select option"></option>
                                    {
                                        instancesSortBy.map(orderByfield => {
                                            return (
                                                <option key={`${orderByfield}-sorting-JAB`} value={orderByfield}>
                                                    {String(orderByfield).split("_").join(" ")}
                                                </option>
                                            )
                                        })
                                    }
                                </select>
                                <Btnswitch xtraClassCSS={"justDisplayFlexRow justiAlig normalTextSmall justWidth100"} miniSizes={true}  btnAction={(cen) => setOrderAsc(cen)} sideText={`${orderAsc ? 'Desc': 'Asc'}`}/>
                            </div>
                            <ul className="standardUlRowFlexPlain justFlexWrap spaceEvenly">
                                {
                                    nft_instances.sort( compare ).map(token => {
                                        return (
                                            <li key={token._id} className="marginTop marginRight" >
                                                <div className="standardDivFlexPlain textAlignedCenter">
                                                    <div onClick={() => cbSendItem("instance",token)} className="pointer hoveredBordered">
                                                        <div>
                                                            <img src={getThumb(token.ntf_id)} className="mediumImage" />
                                                        </div>
                                                        <p className="normalTextSmall">Symbol: {token.ntf_symbol}</p>
                                                        <p className="normalTextSmall">Price: {token.price} on {token.priceSymbol}</p>
                                                    </div>
                                                    <div className="standardUlRowFlexPlain justiAlig pointer">
                                                        <p className="normalTextSmall">Owner:</p>
                                                        <Btnoutlink xclassCSS={"justiAlig"} textLink={token.username} link={`/portfoliouser?query=${token.username}`} /> 
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    }
                </TabPanel>
                {
                        userdata.logged && market_orders &&
                        <div>
                        <TabPanel>
                                <Tabs>
                                    <TabList>
                                        <Tab>
                                            <h5 className="extraMiniMarginsTB">My Current Orders</h5>
                                        </Tab>
                                        <Tab>
                                            <h5 className="extraMiniMarginsTB">History</h5>
                                        </Tab>
                                        <Tab>
                                            <h5 className="extraMiniMarginsTB">Wishlist</h5>
                                        </Tab>
                                    </TabList>
                                    <TabPanel>
                                        {   market_orders &&
                                            <Tablinator 
                                                xclassCSS={"justMaxHeight400p justOverflowAuto"}
                                                devMode={true}
                                                items={market_orders.filter(order => order.status === 'notFilled')}
                                                titleTable={`Current Orders of ${userdata.username}`}
                                                toShow={['status','order_type','nft_symbol','tx_id','createdAt','orderId','item_type','price','priceSymbol']}
                                                clickedSubItemCB={(order) => setSelectedOrder(order)}
                                                arraySpecs={[ {field: 'tx_id', limitTo: 5, link: true, typeLink: 'hiveExplorer' },]}
                                                pagination={{ perPage: 10, controls: false }}
                                                popMenu={(selectedOrder !== null)}
                                                arrayMenu={[{ title: 'Change Details', value: 'edit'}, { title: 'Cancel Order', value: 'cancel'},{ title: 'close', value: 'close'}]}
                                                toPop_id={selectedOrder ? selectedOrder._id : null }
                                                cbOptionSelected={(option) => editMarketOrder(option)}
                                            />
                                        }
                                    </TabPanel>
                                    <TabPanel>
                                        {   market_orders &&
                                            <Tablinator 
                                                    xclassCSS={"justMaxHeight400p justOverflowAuto"}
                                                    devMode={false}
                                                    items={market_orders.filter(order => (order.status !== 'notFilled'))}
                                                    titleTable={`Past Orders of ${userdata.username}`}
                                                    toShow={['status','order_type','nft_symbol','tx_id','createdAt','orderId','item_type','price','priceSymbol']}
                                                    clickedSubItemCB={(order) => setSelectedOrder(order)}
                                                    arraySpecs={[ {field: 'tx_id', limitTo: 5, link: true, typeLink: 'hiveExplorer' },]}
                                                    pagination={{ perPage: 10, controls: false }}
                                                    // popMenu={(selectedOrder !== null)}
                                                    // arrayMenu={[{ title: 'Change Details', value: 'edit'}, { title: 'Cancel Order', value: 'cancel'},{ title: 'close', value: 'close'}]}
                                                    // toPop_id={selectedOrder ? selectedOrder._id : null }
                                                    cbOptionSelected={(option) => editMarketOrder(option)}
                                            />
                                        }
                                    </TabPanel>
                                    <TabPanel>
                                        {
                                            (wishlist && wishlist.length > 0) ?
                                            <Tablinator 
                                                items={wishlist}
                                                toShow={['createdAt','nft_symbol','item_type','price','priceSymbol']}
                                                clickedSubItemCB={(item) => setWishListedSelected(item)}
                                                popMenu={wishListedSelected ? true : false}
                                                arrayMenu={[{ title: 'Buy Item', value: 'buy'}, { title: 'Remove from list', value: 'remove'}]}
                                                toPop_id={wishListedSelected ? wishListedSelected._id : null }
                                                cbOptionSelected={(option) => wishListing(option)}
                                                pagination={{ perPage: 10, controls: false }}
                                            />
                                            :
                                            <p>Looks like you don't have any wishes on your list.</p>
                                        }
                                    </TabPanel>
                                </Tabs>
                        </TabPanel>
                        </div>
                }
                {
                    selectedOrder &&
                    <Recordnator 
                        closeCB={() => setSelectedOrder(null)}
                        titleRecord={`View or Order: ${selectedOrder.order_type} ${selectedOrder.item_type ? `of ${selectedOrder.item_type }` : '' }`}
                        item={selectedOrder}
                        toShow={[
                            { field:'createdAt', type: 'Date', link: false, },
                            { field:'updatedAt', type: 'Date', link: false, },
                            { field:'item_type', type: 'String', link: false, },
                            { field:'nft_symbol', type: 'String', link: false, },
                            { field:'nft_id', type: 'Number', link: false, }, 
                            { field:'nft_instance_id', type: 'Number', link: false, },
                            { field:'orderId', type: 'Number', link: false, xtraData: ' Order N, from Hive-chain.' },
                            { field:'order_type', type: 'String', link: false, },
                            { field:'status', type: 'String', link: false, },
                            { field:'tx_id', type: 'String', link: true, txLink: true, typeLink: 'hiveExplorer' },
                            { field:'price', type: 'Number', link: false, },
                            { field:'priceSymbol', type: 'String', link: false, },
                        ]}
                    />
                }
            </Tabs>
            {   action.action !== '' &&
                <Transmiter 
                    action={action}
                    userdata={userdata}
                    devMode={true}
                    ssc_id={ssc_test_id}
                    order={selectedOrder}
                    closeCB={() => closeNUpdate()}
                />
            }
        </div>
    )
}

export default Maintabulator;