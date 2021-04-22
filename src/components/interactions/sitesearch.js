import React from 'react';
import { useStaticQuery, graphql } from "gatsby"
import Img from 'gatsby-image';

/**
 * Sets a Ul horizontal menu and pass active prop to parent to activate childs css classes on hovered.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} fixedBellowUM - The class to apply to appear bellow the fixed usermenu version.
 */

const Sitesearch = (props) => {
    //graphql queries
    const data = useStaticQuery(graphql`
    query {
        searchIcon: file(relativePath: {eq: "search.png"}) {
            childImageSharp {
                fixed(width: 30) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        } 
    }
    `);
    //end grapqhql queries

    const { xclassCSS, fixedBellowUM } = props;
    //functions/CB

    //END functions/CB
    return (
        <div className={`searchContainer ${fixedBellowUM}`}>
            <input type="text" className="searchInput" placeholder="find your next job" />
            <Img fixed={data.searchIcon.childImageSharp.fixed} className="imgSearch" />
        </div>
    )
}

export default Sitesearch;