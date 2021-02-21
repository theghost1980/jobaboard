import React from 'react';
import { useStaticQuery, graphql } from "gatsby";

const Loader = (props) => {
    const { logginIn, typegif } = props;

    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            loader: file(relativePath: {eq: "loading.gif"}) {
                publicURL
            }
            dots: file(relativePath: {eq: "dots.gif"}) {
                publicURL
            }
        }
    `);
    //end grapqhql queries

    return (
        <div>
        {
            logginIn &&
                <div className="loaderImgCont">
                    <img 
                        src={(typegif === 'dots') ? data.dots.publicURL : data.loader.publicURL} 
                        className="loaderImgGif" 
                        alt="loading amazing info from jobaboard" 
                    />
                </div>
        }
        </div>
    )
}

export default Loader;