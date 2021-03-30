import React from 'react';
import { useStaticQuery, graphql } from "gatsby";

/**
 * @logginIn true/false to show the component
 * @typegif spin,dots,blocks -> default Spin
 */

const Loader = (props) => {
    const { logginIn, typegif } = props;
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
        <div>
        {
            logginIn &&
                <div className="loaderImgCont">
                    <img 
                        src={source} 
                        className="loaderImgGif" 
                        alt="loading amazing info from jobaboard" 
                    />
                </div>
        }
        </div>
    )
}

export default Loader;