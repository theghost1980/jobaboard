// y podemos usarlo como un componente en su proppia pagina en otra pagina aparte, como
// tutorial de blockchain + hive.....etc etc etc.
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';
//constants
const lastBlock = 
{
    "jsonrpc": "2.0",
    "method": "getLatestBlockInfo",
    "id": 1
};
//end constants

const Blockchainobserver = (props) => {

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

    const { testingData } = props || false;
    const { showBlocks } = props || false;

    const [timeToCheck, setIimeToCheck] = useState(4000);
    const [block, setBlock] = useState(null);
    const [blocks, setBlocks] = useState([]);

    // make first call to see if the API is responding, to set the timer.
    useEffect(() => { 
        // getBlocks();
        setInterval(getBlocks,timeToCheck);

        //unmount
        return () => {
            clearInterval(getBlocks);
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
    function getBlocks(){
        postRPCrequest("https://api.hive-engine.com/rpc/","blockchain",lastBlock);
    };
    function secondsRounded(milliseconds){
        const secRounded = String(Number(milliseconds/60).toFixed(2)).toString();
        return secRounded;
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
        <div>
            {
                testingData &&  <p>Checking Blocks. Each {secondsRounded(timeToCheck)} seconds.</p>
            }
            {
                block && 
                    <div style={{ textAlign: 'center'}}>
                        <Img fixed={data.blockIcon.childImageSharp.fixed} className="animBlocksIcon" />
                        <p>
                            New Block:<a href={`https://hiveblocks.com/b/${block.blockNumber}`} rel="noreferrer" target="_blank">#{block.blockNumber.toString()}</a> with {block.transactions.length.toString()} transactions. 
                        </p>
                    </div>
            }
            {
                (blocks.length > 0) &&
                    <p>{blocks.length.toString() + " Blocks added."}</p>
            }
            {
                testingData && <button onClick={() => getBlocks()}>Get new block</button>
            }
        </div>
    )
}

export default Blockchainobserver;