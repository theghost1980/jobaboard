import React, { useState, useEffect } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Btnoutlink from '../btns/btnoutlink';

/**
 * This component present the definitions & holdings ON SALE in 2 separate tabs.
 * - It returns to a CB the selected item.
 * @param {Object} cbSendItem - The item where user has clicked.
 * @param {[Object]} nft_definitions - Nft definitions on Sale on JAB.
 * @param {[Object]} nft_instances - Nft tokens on Sale on JAB.
 * @param {Boolean} devMode - optional to see console.logs
*/

const Maintabulator = (props) => {
    const { cbSendItem, nft_definitions, nft_instances} = props;

    //functions/CB
    function getThumb(nftId){
        const found = nft_definitions.filter(item => item.nft_id === nftId);
        // NOTE: Removed from devMode for now. if(devMode) { console.log(found) };
        return found ? found[0].thumb : null;
    }
    //END functions/CB

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
                        <ul className="standardUlRowFlexPlain overflowXscroll">
                            {
                                nft_definitions.filter(item => item.for_sale ).map(token => {
                                    return (
                                        <li key={token._id} className="pointer hoveredBordered miniMarginLeft" >
                                            <div className="standardDivFlexPlain textAlignedCenter">
                                                <div onClick={() => cbSendItem("definition",token)}>
                                                    <div>
                                                        <img src={token.thumb} className="mediumImage" />
                                                    </div>
                                                    <p className="normalTextSmall">Symbol: {token.symbol}</p>
                                                    <p className="normalTextSmall">Price: {token.price} HIVE</p>
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
                    }
                </TabPanel>
                <TabPanel>
                {
                        nft_instances && nft_definitions &&
                        <ul className="standardUlRowFlexPlain overflowXscroll">
                            {
                                nft_instances.map(token => {
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