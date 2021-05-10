import React, { useEffect, useState } from 'react';
import { useStaticQuery, graphql } from "gatsby"
import Img from 'gatsby-image';

//constants
const pingAPI = "https://api.coingecko.com/api/v3/ping"; //"accept: application/json"
const listCoins = "https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar%2Cethereum%2Csteem%2Cbtc%2Chive&vs_currencies=usd";

/**
 * This component fetch data from coingecko API about important prices.
 * Allows you to decide where to render it or not.
 * @param {String} xtraClassCSS - optional for another extra CSS class on main div.
 * @param {String} xtraClassCSSUl - optional for the Ul that contains the prices.
 * @param {String} xtraClassCSSLogos - optional css class for logos. All at once.
 * @param {Boolean} devMode - optional to see console.logs
 * @param {Boolean} show - optional if you need to show the coins or just load the prices and store them on local storage.
*/

const Coinprices = (props) => {
    const { xtraClassCSS, devMode, show, xtraClassCSSUl, xtraClassCSSLogos } = props;
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

    const [active, setActive] = useState(false);
    const [coins, setCoins] = useState({
        ethereum: {usd: 0},
        hive: {usd: 0},
        hive_dollar: {usd: 0},
        steem: {usd: 0},
    });

    useEffect(()=> {
        if(devMode) { console.log('Pinging Coingecko API. If positive response, we ask for coins.')};
        //ping the server to see if it is working
        fetch(pingAPI)
        .then(response => {
            if(response.status === 200){
                response.json()
                .then(res => {
                    if (res.gecko_says === "(V3) To the Moon!"){ //"(V3) To the Moon!""
                        //api working, now ask for prices.
                        setActive(true);
                        if(devMode) { console.log('Coin Gecko active & working now, asking for prices...')};
                        getCoins(listCoins)
                        .then(response => {
                            if(devMode) { console.log(response)};
                            setCoins(response);
                            //save into ls as this is public info no need to encode
                            localStorage.setItem("coins",JSON.stringify(response));
                        })
                        .catch(error => {
                            if(devMode) { console.log('Error getting coin prices, listcoins!',error)};
                            setActive(false); //here deactivate and do not show.
                        })
                    }
                })
            }else{
                if(devMode) { console.log('Coin Gecko NOT active, deactivated component.')};
                setActive(false);
            }
        })
        .catch(err => {
            if(devMode) { console.log('Error while trying to get coin prices', err)};
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
        <div className={`${xtraClassCSS} ${show ? 'justDisplayFlex': 'justDisplayNone justHeightZero' } newsCoinsContainer`}>
            {
                active &&
                <ul className={`ulCoinList ${xtraClassCSSUl}`}>
                {
                    (coins.ethereum.usd > 0) ?
                        <>
                           <li key="HIVE-1-price">
                               HIVE:${coins.hive.usd.toFixed(3).toString()} <Img fixed={data.hiveLogo.childImageSharp.fixed} className={`${xtraClassCSSLogos}`} />
                           </li>
                           <li key="ETH-2-price">
                               ETH:${coins.ethereum.usd.toFixed(3).toString()} <Img fixed={data.ethLogo.childImageSharp.fixed} className={`${xtraClassCSSLogos}`}  />
                           </li>
                           <li key="hive_dollar-3-price">
                               HBD:${coins.hive_dollar.usd.toFixed(3).toString()} <Img fixed={data.hiveLogo.childImageSharp.fixed} className={`${xtraClassCSSLogos}`}  />
                           </li>
                           <li key="STEEM-1-price">
                               STEEM:${coins.steem.usd.toFixed(3).toString()} <Img fixed={data.steemLogo.childImageSharp.fixed} className={`${xtraClassCSSLogos}`}  />
                           </li>
                        </>
                        :
                        <p className="xtraSmall">Loading Live data...</p>
                }
                </ul>
            }
        </div>
    )
}

export default Coinprices;