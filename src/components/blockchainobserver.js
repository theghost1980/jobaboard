// y podemos usarlo como un componente en su proppia pagina en otra pagina aparte, como
// tutorial de blockchain + hive.....etc etc etc.
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';
//constants
const rpcServer = "https://api.hive-engine.com/rpc/";
const lastBlock = 
{
    "jsonrpc": "2.0",
    "method": "getLatestBlockInfo",
    "id": 1
};
// "block_api.get_block", "block_api.get_block_header",  "condenser_api.get_block", "condenser_api.get_block_header",
// 
//end constants


// TODO a way to detect internet failures so it won't proceed.

/**
 * This component allows user to:
 * -> Set if show info or just handles the info using the CB.
 * -> Set how to show the info received.
 * -> Set a time to get the lastest block or default each 4 seconds.
 * -> Choose to send the received info to a CB if set.
 * @param {String} xclassCSS - The css Extra class you want to assign to the main cont.
 * @param {Boolean} testingData - Optional if dev needs to see all the logs on console.
 * @param {Boolean} showBlocks - Optional if need to render each blocks when arrives. 
 * @param {Number} timeChecks - Optional if need to get new blocks. On milliseconds. Minimmun 3000.
 * @param {String} renderMode - Optional if need "fullMode" or "compactMode". Default "compactMode". Note: Compact mode set the link to view the block outside of JAB.
 * @param {Number} nBlocks - Optional to use when "fullMode" is activated as you must provide how many blocks will be stored in the state. Note: When the state reaches the n, it will behave as a stack.
 * @param {Number} nTrans - Optional to use in "fullMode" if activated. Sets the max number of transactions to store in the state of transactions.
 * @param {Function} CbOnClick - Only used for now on "fullMode" to pass to parent the (type,item) to process on the JABexplorer. 
 */

const Blockchainobserver = (props) => {

    const { testingData, showBlocks, timeChecks, xclassCSS, renderMode, nBlocks, nTrans, CbOnClick } = props;
    // TODO important TODO
    // instead if using this, use SSCjs
    // add into the mount section -> stream, each result of the response, set the block and so on...
    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            blockIcon: file(relativePath: {eq: "blocks.png"}) {
                childImageSharp {
                    fixed(width: 50) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhql queries

    // const { showBlocks } = props || false;
    // const { timeChecks } = props || 4000; //default value to check each 4 seconds.
    // const { xclassCSS } = props;
    // const { renderMode } = props || "compactMode";
    // const { nBlocks } = props || 0;
    // const { nTrans } = props || 0;

    const [timeToCheck, setIimeToCheck] = useState(timeChecks);
    const [block, setBlock] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [lastNBlocks, setLastNBlocks] = useState([]);
    const lastNBlocksTemp = [];
    const [transactionsInBlock, setTransactionsInBlock] = useState([]);
    var timer;
    // make first call to see if the API is responding, to set the timer.
    useEffect(() => { 
        if(testingData){
            console.log('Received as props::::');
            console.log(`testingData:${testingData}`);
            console.log(`showBlocks:${showBlocks}`);
            console.log(`timeChecks:${timeChecks}`);
            console.log(`xclassCSS:${xclassCSS}`);
            console.log(`renderMode:${renderMode}`);
            console.log(`nBlocks:${nBlocks}`);
            console.log(`nTrans:${nTrans}`);
            console.log('CbOnClick:');
            console.log(CbOnClick);
        }

        if(timeChecks){
            clock(timeChecks);
        }else{
            clock(4000);
        }
        // getBlocks();
        // setInterval(getBlocks,timeToCheck);
        //unmount
        return () => {
            // clearInterval(getBlocks);
            clearInterval(timer);
        };
    },[]);
    //end first call
    //test to see content inside blocks
    useEffect(() => { 
        if(blocks.length >= 4){ 
            //reset to keep memory in good fit.
            setBlocks([]);
            if(testingData){
                console.log('Blocks Cleared.');
            }
        };
    },[blocks]);
    //end test

    //functions/cb
    const clickedItem = (type,item) => {
        CbOnClick(type,item);
    }
    function clock(timeToCheck){
        timer = setInterval(getBlocks,timeToCheck);
    }
    function getBlocks(){
        postRPCrequest(rpcServer,"blockchain",lastBlock);
    };
    function secondsRounded(milliseconds){
        const secRounded = String(Number(milliseconds/1000).toFixed(2)).toString();
        return secRounded;
    }
    function getUntilNow(ts){
        const s2 = new Date(ts).toLocaleTimeString();
        // console.log(s2)
        return `Was mined at ${s2}`;
    }
    function addBlockLastNBlocks(block){
        if(block){
            // console.log(`Arriving ${block._id}`);
            // console.log('Array has:');
            // console.log(lastNBlocks);
            const founded = lastNBlocksTemp.filter(storedB => storedB._id === block._id);
            // console.log(founded);
            if(founded.length == 0){
                setTransactionsInBlock(block.transactions);
                if(lastNBlocksTemp.length === nBlocks){
                    lastNBlocksTemp.pop();
                }
                lastNBlocksTemp.unshift(block);
                setLastNBlocks(lastNBlocksTemp);
            }
            // setLastNBlocks(prevState => [ ...prevState, block]);
        }
    }
    //end functions/cb

    //JSON rpc request
    async function postRPCrequest(RPC, routeRPC, command){
        await axios.post(RPC + routeRPC, command)
        .then(result => {
            if(testingData){
                console.log(result);
            }
            if(result.data.result){
                //add to the array of objects.
                if(result.data.result.blockNumber){
                    setBlock(result.data.result);
                    addBlockLastNBlocks(result.data.result);
                    if(showBlocks){
                        setBlocks(previousState => [...previousState, result.data.result ]);
                    }
                    if(testingData){
                        console.log('New block added to the observer.',result.data.result.blockNumber);
                    }
                }
            }
        })
        .catch(error => {
            console.log('Error on jsonRPC request.', error);
            return null;
        });
    }
    //emd JSON rcp request
    return (
        <div className={`${xclassCSS}`}>
            {
                testingData &&  
                <div>
                    <p>Testing Sections Activated</p>
                    <p>Rendering Mode as: {renderMode}</p>
                    {
                        renderMode === "fullMode" &&
                        <p>Acting as a stack showing always the last {nBlocks}</p>
                    }
                    <p>Checking Blocks. Each {secondsRounded(timeToCheck)} seconds.</p>
                    <button onClick={() => getBlocks()}>Get new block</button>
                </div>
            }
            {
                (blocks.length > 0) &&
                    <p>{blocks.length.toString() + " Blocks added."}</p>
            }
            {
                block && (renderMode === "compactMode") &&
                    <div style={{ textAlign: 'center'}}>
                        <Img fixed={data.blockIcon.childImageSharp.fixed} className="animBlocksIcon" />
                        <p>
                            New Block:<a href={`https://hiveblocks.com/b/${block.blockNumber}`} rel="noreferrer" target="_blank">#{block.blockNumber.toString()}</a> with {block.transactions.length.toString()} transactions. 
                        </p>
                    </div>
            }
            {
                lastNBlocks && (renderMode === "fullMode") &&
                <div className="justHeight400p">
                    <div className="standardDivRowNWNH justWidth90 justMargin0auto justBorders justRounded marginsTB">
                        <div className="justWidth50">
                            <div className="contentMiniMargins">
                                <p className="justbackgroundOrange">Latest Blocks</p>
                            {
                                lastNBlocks.map(block => {
                                    return (
                                        
                                            <div key={block._id} onClick={() => clickedItem('block',block)} className="pointer standardLiHovered" >
                                                <p className="miniMarginTB">{block.blockNumber}</p>
                                                <p className="textSmallGray noMarginsTB">{getUntilNow(block.timestamp)}</p>
                                            </div>
                                    )
                                })
                            }
                            </div>
                        </div>
                        <div className="justWidth50">
                            { transactionsInBlock && transactionsInBlock.length > 0 &&
                            <div className="contentMiniMargins">
                                <p className="justbackgroundOrange">Latest Transactions</p>
                                <p>Transactions in Block: {transactionsInBlock[0].refHiveBlockNumber} Total: {transactionsInBlock.length}</p>
                                <ul className="standardUlVerSmallPlain justHeight300pOverY">
                                {
                                    transactionsInBlock.map(trans => {
                                        return (
                                            <li key={trans.transactionId}>
                                                <p>TxId:{trans.transactionId}</p>
                                                <p className="textXSmallGray">Operation/Action: <span className="textColorBlack"><strong>{trans.action}</strong></span></p>
                                            </li>
                                        )
                                    })
                                }
                                </ul>
                            </div>
                            }
                            {
                                transactionsInBlock && transactionsInBlock.length === 0 && <p>No transactions on this Block.</p>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default Blockchainobserver;