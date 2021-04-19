import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Display the danger icon. 
 * Note: Must set the "relativeDiv" class always!
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} logo - Choose the logo to show, from available. "beechat"
 * @param {String} typeDiv - optional "notAbsolute" if you need it this way.
 * @param {String} text - Text to show on the left side of the logo.
 */

const Logotext = (props) => {
    const { xclassCSS, logo, typeDiv, text } = props;
    const data = useStaticQuery(graphql`
        query{
            beechat: file(relativePath: {eq: "beeHiveLogo-mini.png"}) {
                childImageSharp {
                    fixed(width: 30) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `); 
    const logoFrom = data.beechat.childImageSharp.fixed;

    return (
        <div className={`${typeDiv ? '': 'absDivRow10_5'} ${xclassCSS}`}>
            <p className="allMiniMargins">{text}</p>
            <Img fixed={logoFrom} />
        </div>
    )
}

export default Logotext;