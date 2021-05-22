import React, { useEffect, useState } from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Assign the project to an employee.
 * @param {String} xclassCSS - Optional, The extra css class.
 * @param {function} btnAction - optional Call back to assign a value on each switch action
 * @param {String} typeIcon - Type of icon, "refresh", "wishlist", "bugs".
 * @param {String} title - Tip tool text
 * @param {String} size - Optional to define a smaller version of the icons. "" = default = 35px. "mini" = 15px.
 */

const Btnactionicon = (props) => {
    const { xclassCSS, btnAction, typeIcon, animation, title, size } = props;
    const [selectedIcon, setSelectedIcon] = useState(null);

    const data = useStaticQuery(graphql`
        query{
            refresh_orange: file(relativePath: {eq: "refresh_orange.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            wishlist_iconLarge: file(relativePath: {eq: "love-saturno-mangieri.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            refresh_orangeMini: file(relativePath: {eq: "refresh_orange.png"}) {
                childImageSharp {
                    fixed(width: 15) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            bug_mini: file(relativePath: {eq: "bug_black.png"}) {
                childImageSharp {
                    fixed(width: 15) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            bug_Large: file(relativePath: {eq: "bug_black.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries

    //load on init
    useEffect(() => {
        if(typeIcon){
            switch (typeIcon) {
                case 'refresh':
                    setSelectedIcon(data.refresh_orange.childImageSharp.fixed);
                    break;
                case 'wishlist':
                    setSelectedIcon(data.wishlist_iconLarge.childImageSharp.fixed);
                    break;
                case 'bug':
                    setSelectedIcon(data.bug_Large.childImageSharp.fixed);
                    break;
                default:
                    break;
            }
        }
    },[]);
    //END load on init

    const clicked = () => {
        if(btnAction){ btnAction() };
    };

    return (
        <div title={title ? title : null } className={`${xclassCSS}`} onClick={clicked}>
            {
                selectedIcon && <Img fixed={selectedIcon} />
            }
        </div>
    )
}

export default Btnactionicon;