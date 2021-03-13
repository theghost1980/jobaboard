import React, { useEffect, useState } from 'react';
import { useStaticQuery, graphql } from "gatsby"
import Img from 'gatsby-image';

//constants
const pingAPI = "https://api.coingecko.com/api/v3/ping"; //"accept: application/json"
const listCoins = "https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar%2Cethereum%2Csteem%2Cbtc%2Chive&vs_currencies=usd";

const Coinprices = () => {
    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            ethLogo: file(relativePath: {eq: "eth.png"}) {
                childImageSharp {
                    fixed(width: 16) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            hiveLogo: file(relativePath: {eq: "hive.png"}) {
                childImageSharp {
                    fixed(width: 16) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            steemLogo: file(relativePath: {eq: "steem.png"}) {
                childImageSharp {
                    fixed(width: 16) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhql queries

    const [coins, setCoins] = useState({
        ethereum: {usd: 0},
        hive: {usd: 0},
        hive_dollar: {usd: 0},
        steem: {usd: 0},
    });

    useEffect(()=> {
        //ping the server to see if it is working
        fetch(pingAPI)
        .then(response => {
            if(response.status === 200){
                response.json()
                .then(res => {
                    if (res.gecko_says === "(V3) To the Moon!"){
                        //api working, now ask for prices.
                        getCoins(listCoins)
                        .then(response => {
                            // console.log(response);
                            setCoins(response);
                        })
                        .catch(error => {
                            console.log('Error getting coin prices, listcoins!');
                            console.log(error);
                        })
                    }
                })
            }
        })
        .catch(err => {
            console.log('Error while trying to get coin prices');
            console.log(err);
        })
    },[]);

        ///////GET fetch = Update User data
        async function getCoins(url = '') {
            const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            //   credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            });
            return response.json(); 
        };
        ///////END GET fetch

        // TODO: instead of loading on each render, set the state one TimeRanges, then after sometime(settimeout) you aks for realtime data.

    return (
        <div className="newsCoinsContainer">
            <ul className="ulCoinList">
                {
                    (coins.ethereum.usd > 0) ?
                        <>
                           <li key="HIVE-1-price">
                               HIVE:${coins.hive.usd.toFixed(3).toString()} <Img fixed={data.hiveLogo.childImageSharp.fixed} />
                           </li>
                           <li key="ETH-2-price">
                               ETH:${coins.ethereum.usd.toFixed(3).toString()} <Img fixed={data.ethLogo.childImageSharp.fixed} />
                           </li>
                           <li key="hive_dollar-3-price">
                               HBD:${coins.hive_dollar.usd.toFixed(3).toString()} <Img fixed={data.hiveLogo.childImageSharp.fixed} />
                           </li>
                           <li key="STEEM-1-price">
                               STEEM:${coins.steem.usd.toFixed(3).toString()} <Img fixed={data.steemLogo.childImageSharp.fixed} />
                           </li>
                        </>
                        :
                        <p>Loading...</p>
                }
            </ul>
        </div>
    )
}

export default Coinprices;