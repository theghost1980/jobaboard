import React, { useState, useEffect } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Btnoutlink from '../btns/btnoutlink';
import Btnswitch from '../btns/btnswitch';
import Tablinator from '../interactions/tablinator';
import Recordnator from '../interactions/recordnator';

/**
 * This component present the definitions & holdings ON SALE in 2 separate tabs.
 * - It returns to a CB the selected item.
 * @param {Object} cbSendItem - The item where user has clicked.
 * @param {[Object]} nft_definitions - Nft definitions on Sale on JAB.
 * @param {[Object]} nft_instances - Nft tokens on Sale on JAB.
 * @param {[Object]} market_orders - the market order of this user.
 * @param {Object}  jabFEE - defines fees & accepted currency, to be set later on from .env files.
 * @param {Object} userdata - userdata.
 * @param {Boolean} devMode - optional to see console.logs
*/

const Maintabulator = (props) => {
    const { cbSendItem, nft_definitions, nft_instances, devMode, jabFEE, userdata, market_orders} = props;
    const [definitionsSortBy, setDefinitionsSortBy] = useState([]); //maping the fields from incomming item on useeffect.
    const [instancesSortBy, setInstancesSortBy] = useState([]);
    const [keyOrderBy, setKeyOrderBy] = useState("");
    const [orderAsc, setOrderAsc] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    //functions/CB
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
            if(key !== "_id" && key !== "__v" && key !== "burned" && key !== "for_sale" && key !== "on_sale" && key !== "image" && key !== "thumb"){ arrayFields.push(key) } 
        });
        if(devMode){ console.log( {arrayFields: arrayFields} )}
        return arrayFields;
    }
    //END functions/CB

    //to load on init
    useEffect(() => {
        if(nft_definitions){ setDefinitionsSortBy(scanObjectFields(nft_definitions)) };
        if(nft_instances){ setInstancesSortBy(scanObjectFields(nft_instances)) };
        if(devMode){ console.log('Received on props:', { cbSendItem, nft_definitions, nft_instances, jabFEE, market_orders})}
    },[]);
    //END to load on init

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
                        nft_definitions &&
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
                            <ul className="standardUlRowFlexPlain justFlexWrap">
                                {
                                    nft_definitions.sort( compare ).filter(item => item.for_sale ).map(token => {
                                        return (
                                            <li key={token._id} className="marginTop marginRight">
                                                <div className="standardDivFlexPlain textAlignedCenter">
                                                    <div onClick={() => cbSendItem("definition",token)} className="pointer hoveredBordered">
                                                        <div>
                                                            <img src={token.thumb} className="mediumImage" />
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
                        nft_instances && nft_definitions &&
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
                            <ul className="standardUlRowFlexPlain justFlexWrap">
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
                    {
                        nft_definitions && nft_instances && nft_instances.length === 0 && <p>No Tokens on Sale yet!</p>
                    }
                </TabPanel>
                {
                        userdata.logged && market_orders &&
                        <TabPanel>
                            <Tablinator 
                                xclassCSS={"justMaxHeight400p justOverflowAuto"}
                                devMode={true}
                                items={market_orders}
                                titleTable={`Current Orders of ${userdata.username}`}
                                toShow={['status','order_type','tx_id','createdAt','orderId','item_type','price_total','price_symbol']}
                                clickedSubItemCB={(order) => setSelectedOrder(order)}
                                arraySpecs={[
                                    {field: 'tx_id', limitTo: 5, link: true, typeLink: 'jabExplorer' },
                                ]}
                            />
                        </TabPanel>
                }
                {
                    selectedOrder &&
                    <Recordnator 
                        closeCB={() => setSelectedOrder(null)}
                        titleRecord={`View or Order: ${selectedOrder.order_type} ${selectedOrder.item_type ? `of ${selectedOrder.item_type }` : '' }`}
                        item={selectedOrder}
                        toShow={[
                            { field:'createdAt', type: 'Date', link: false, },
                            { field:'item_type', type: 'String', link: false, },
                            { field:'orderId', type: 'Number', link: false, xtraData: ' Order N, from Hive-chain.' },
                            { field:'order_type', type: 'String', link: false, },
                            { field:'status', type: 'String', link: false, },
                            { field:'tx_id', type: 'String', link: false, },
                            { field:'price_total', type: 'Number', link: false, },
                            { field:'price_symbol', type: 'String', link: false, },
                        ]}
                    />
                }
            </Tabs>
        </div>
    )
}

export default Maintabulator;