import React from 'react';
import { useStaticQuery, graphql } from "gatsby";
import Img from 'gatsby-image';

/**
 * @logginIn true/false to show the component
 * @typegif spin,dots,blocks -> default Spin
 * @xtraClass Optional if need to apply an extra css class.
 * @xtraIcon  Optional an intended to show an extra icon image at the bottom of the loading gif. "chatIcon",
 */

const Loader = (props) => {
    const { logginIn, typegif, xtraClass, xtraIcon } = props;
    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            spin: file(relativePath: {eq: "loading.gif"}) {
                publicURL
            }
            dots: file(relativePath: {eq: "dots.gif"}) {
                publicURL
            }
            blocks: file(relativePath: {eq: "blocks.gif"}) {
                publicURL
            } 
            chatIcon: file(relativePath: {eq: "chat.png"}) {
                childImageSharp {
                    fixed(width: 20) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    var source = data.spin.publicURL; //as default
    //end grapqhql queries
    if(typegif === "spin"){
        source = data.spin.publicURL;
    }else if(typegif === "dots"){
        source = data.dots.publicURL;
    }else{
        source = data.blocks.publicURL;
    }

    return (
        <div className={`${xtraClass} zIndexTop`}>
        {
            logginIn &&
                <div className={`loaderImgCont`}>
                    <img 
                        src={source} 
                        className="loaderImgGif" 
                        alt="loading amazing info from jobaboard" 
                    />
                    {/* {
                        xtraIcon && 
                        <Img fixed={(xtraIcon === "chatIcon") ? data.chatIcon.childImageSharp.fixed : null } />
                    } */}
                </div>
        }
        </div>
    )
}

export default Loader;