import React, { useState, useEffect } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Btnoutlink from '../btns/btnoutlink';
import Btnswitch from '../btns/btnswitch';

/**
 * This component present the definitions & holdings ON SALE in 2 separate tabs.
 * - It returns to a CB the selected item.
 * @param {Object} cbSendItem - The item where user has clicked.
 * @param {[Object]} nft_definitions - Nft definitions on Sale on JAB.
 * @param {[Object]} nft_instances - Nft tokens on Sale on JAB.
 * @param {Object}  jabFEE - defines fees & accepted currency, to be set later on from .env files.
 * @param {Boolean} devMode - optional to see console.logs
*/

const Maintabulator = (props) => {
    const { cbSendItem, nft_definitions, nft_instances, devMode, jabFEE} = props;
    const [definitionsSortBy, setDefinitionsSortBy] = useState([]); //maping the fields from incomming item on useeffect.
    const [instancesSortBy, setInstancesSortBy] = useState([]);
    const [keyOrderBy, setKeyOrderBy] = useState("");
    const [orderAsc, setOrderAsc] = useState(false);

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
            if(key !== "_id" && key !== "__v"){ arrayFields.push(key) } 
        });
        return arrayFields;
    }
    //END functions/CB

    //to load on init
    useEffect(() => {
        if(nft_definitions){ setDefinitionsSortBy(scanObjectFields(nft_definitions)) };
        if(nft_instances){ setInstancesSortBy(scanObjectFields(nft_instances)) };
        if(devMode){ console.log('Received on props:', { cbSendItem, nft_definitions, nft_instances, jabFEE})}
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
                    <Tab>
                        <h3>My Buy/Sells</h3>
                    </Tab>
                </TabList>
                <TabPanel>
                    {
                        nft_definitions &&
                        <div>
                            <div className="standardUlRowFlexPlain">
                                <label className="normalTextSmall miniMarginRight" htmlFor="sorting_definitions">Sort By: </label>
                                <select className="normalTextSmall" name="sorting_definitions" onChange={(e) => setKeyOrderBy(e.target.value)}>
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
                                            <li key={token._id} className="pointer hoveredBordered miniMarginLeft" >
                                                <div className="standardDivFlexPlain textAlignedCenter">
                                                    <div onClick={() => cbSendItem("definition",token)}>
                                                        <div>
                                                            <img src={token.thumb} className="mediumImage" />
                                                        </div>
                                                        <p className="normalTextSmall">Symbol: {token.symbol}</p>
                                                        <p className="normalTextSmall">Price: {token.price_definition} On {jabFEE.currency}</p>
                                                    </div>
                                                    <div className="standardUlRowFlexPlain justiAlig">
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
                                            <li key={token._id} className="pointer hoveredBordered miniMarginLeft" >
                                                <div className="standardDivFlexPlain textAlignedCenter">
                                                    <div onClick={() => cbSendItem("instance",token)}>
                                                        <div>
                                                            <img src={getThumb(token.ntf_id)} className="mediumImage" />
                                                        </div>
                                                        <p className="normalTextSmall">Symbol: {token.ntf_symbol}</p>
                                                        <p className="normalTextSmall">Price: {token.price} on {token.priceSymbol}</p>
                                                    </div>
                                                    <div className="standardUlRowFlexPlain justiAlig">
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
                <TabPanel>
                    <p>My orders Data</p>
                    <p>Buy/Sells. Ongoing orders. Link to history.</p>
                </TabPanel>
            </Tabs>
        </div>
    )
}

export default Maintabulator;