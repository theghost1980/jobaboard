import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Display the danger icon. 
 * Note: Must set the "relativeDiv" class always!
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} type - "notification" as default.
 * @param {String} typeDiv - optional "notAbsolute" if you need it this way.
 */

const Notificationicon = (props) => {
    const { xclassCSS, type, typeDiv } = props;
    const data = useStaticQuery(graphql`
        query{
            notiIcon: file(relativePath: {eq: "bell.png"}) {
                childImageSharp {
                    fixed(width: 20) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `); 
    return (
        <div className={`${typeDiv ? '': 'absDivRow10_5'} ${xclassCSS}`}>
            <Img fixed={data.notiIcon.childImageSharp.fixed} />
        </div>
    )
}

export default Notificationicon;