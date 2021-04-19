import React, { useEffect, useState } from 'react';
import { useStaticQuery, graphql } from "gatsby"
import Img from 'gatsby-image';

/**
 * Behaviuor: If the coinprices getter component has worked, the data should be stored on local data.
 * So this component loads if, if present and allows you to click on it, to change bewteen all the currencies stored.
 * @param {String} xclassCSS - Optional, an extra css class you may need to apply to the span.
 * @param {String} title - String to show when user hover on component.
 * @param {String} sideText - If you need to add a side text to show on the left side.
 * @param {Number} amount - The amount to compare against. I.e: price, so it will be showing the price in the selected currency by clicking on it.
 */

const Btndisplayhiveusd = (props) => {
    // for white spaces &nbsp; || &nbsp;&nbsp;&nbsp;&nbsp;
    const { amount, xclassCSS, title, sideText } = props;

     //graphql queries
     const data = useStaticQuery(graphql`
     query {
         ethLogo: file(relativePath: {eq: "eth.png"}) {
             childImageSharp {
                 fixed(width: 20) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
         hiveLogo: file(relativePath: {eq: "hive.png"}) {
             childImageSharp {
                 fixed(width: 20) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
         steemLogo: file(relativePath: {eq: "steem.png"}) {
             childImageSharp {
                 fixed(width: 20) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
         usdLogo: file(relativePath: {eq: "usd_Icon.png"}) {
             childImageSharp {
                 fixed(width: 20) {
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
    // loading once
    useEffect(() => {
        // localStorage.setItem("coins",JSON.stringify(response));
        const coins = localStorage.getItem("coins");
        if(coins){
            const coinsParsed = JSON.parse(coins);
            setCoins(coinsParsed);
        }
    },[]); 
    // end loading once
    return (
        coins ?  
            <div className={`${xclassCSS} standardRowDivAutoWHPlain`} title={title}>
                <p>
                    &nbsp;&nbsp;&nbsp;{sideText}&nbsp;{(coins.hive.usd * amount).toFixed(3)}   
                </p>
                <div className="standardRowDivAutoWHPlain justAligned">
                    <Img fixed={data.usdLogo.childImageSharp.fixed} />
                    <p>/</p>
                    <Img fixed={data.hiveLogo.childImageSharp.fixed} /> 
                </div>
            </div>
            : null
    )
}

export default Btndisplayhiveusd;
