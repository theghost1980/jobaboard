import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Display A clickeable external link, defined by you and shows a external icon when hovered.
 * @param {String} link - path to navigate to
 * @param {String} textLink - Text/Message to display on link.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} toolTip - Optional as the tool tip text you may need to show.
 */

const Btnoutlink = (props) => {
    const { link, textLink, xclassCSS, toolTip } = props;

    const data = useStaticQuery(graphql`
        query{
            externalIcon: file(relativePath: {eq: "external_red.png"}) {
                childImageSharp {
                    fixed(width: 20) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries

    // const clicked = () => {
    //     if(btnAction){
    //         btnAction();
    //     }else{
    //         console.log('Info was shown.');
    //     }
    // };

    return (
        <a href={link} className={`aInlineFlexPlain activeDisplay pointer relativeDiv ${xclassCSS}`} target="_blank" rel="noopener noreferrer"
            title={toolTip}
        >
            &nbsp;{textLink}
            <div className="smallAbsDivDisNone120pPlain justRight120pTop0p animFade">
                <Img fixed={data.externalIcon.childImageSharp.fixed} />
            </div>
        </a>
    )
}

export default Btnoutlink;