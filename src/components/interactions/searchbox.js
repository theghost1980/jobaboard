import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';
import Btnclosemin from '../btns/btncloseMin';
import Loader from '../loader';
import Abswrapper from '../absscreenwrapper';

/**
 * Display the danger icon. 
 * Note: Must set the "relativeDiv" class always!
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} type - "filled" || "outline".
 */

const Searchbox = (props) => {
    const { xclassCSS, type } = props;
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
        <Abswrapper xtraClass={"justiAlig"}>
            <div className="standardDivColHalfW relativeDiv whiteBack justRounded">
                <Btnclosemin btnAction={() => setShowSearch(false)} classCSS={"justTopRightPos absCloseCont"} />
                {/* {
                    working && 
                    <div className="standardDivRowFlex100pX100pCentered">
                        <Loader logginIn={true} typegif={"dots"} />
                    </div>
                }
                <form onSubmit={handleSearch} className="justiAlig justDisplayFlex justpaddingTB">
                    <label htmlFor="input_search_name">User Name:</label>
                    <input type="text" name="input_search_name" onChange={(e) => setUserNameSearch(e.target.value)} />
                    <button type="submit">Search</button>
                </form> */}
            </div>
        </Abswrapper>
    )
}

export default Searchbox;