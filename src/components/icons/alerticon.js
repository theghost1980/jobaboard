import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Display the danger icon. 
 * Note: Must set the "relativeDiv" class always!
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} type - "filled" || "outline".
 * @param {String} typeDiv - optional "notAbsolute" if you need it this way.
 */

const Alerticon = (props) => {
    const { xclassCSS, type, typeDiv } = props;
    const data = useStaticQuery(graphql`
        query{
            alertIconOutline: file(relativePath: {eq: "danger_icon.png"}) {
                childImageSharp {
                    fixed(width: 20) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            alertIconFilled: file(relativePath: {eq: "danger_filled.png"}) {
                childImageSharp {
                    fixed(width: 20) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `); 
    const typeChoosenSource = type === "filled" ? data.alertIconFilled.childImageSharp.fixed
            : data.alertIconOutline.childImageSharp.fixed;
    return (
        <div className={`${typeDiv ? '': 'absDivRow10_5'} ${xclassCSS}`}>
            <Img fixed={typeChoosenSource} />
        </div>
    )
}

export default Alerticon;