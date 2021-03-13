import React from 'react';
import { useStaticQuery, graphql, Link, navigate } from "gatsby"
//components
import Img from 'gatsby-image';
//helpers
import { check } from '../utils/helpers';

const Footer = () => {
    const userdata = check();
    //graphql queries
    const data = useStaticQuery(graphql`
        query{
            logoColor: file(relativePath: {eq: "logoColor.png"}) {
                childImageSharp {
                    fluid {
                        ...GatsbyImageSharpFluid_withWebp
                    }
                }
            }
            main_menu: allMongodbGatsbyMainMenu {
                edges {
                    node {
                        id
                        inner_link
                        title
                        link
                        hideOnLoggin
                    }
                }
            }
            loveLove: file(relativePath: {eq: "love-saturno-mangieri.png"}) {
                childImageSharp {
                    fluid {
                        ...GatsbyImageSharpFluid_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries
    return (
        <footer>
            <Link to="/">
                <div className="logoSVGCont footerAddings">
                    {/* <img src={data.logoColor.publicURL} className="logoSVG" /> */}
                    <Img fluid={data.logoColor.childImageSharp.fluid} className="logoSVG" loading="eager" />
                </div>
            </Link>
            <ul className="ulFooterMenu">
                {
                    data.main_menu.edges.map(({ node:item }) => {
                        // console.log(item)
                        return (
                            <li key={item.id} className={`${item.hideOnLoggin && userdata.logged ? 'hideOnLoggin': null}`}>
                                <Link to={item.inner_link}>{item.title}</Link>
                            </li>
                        )
                    })
                }
            </ul>
            <div>
                <p className="textFooter">Powered By</p>
                <ul className="poweredByULFooter">
                    <li>Hive-Blockchain</li>
                    <li>BeeChat</li>
                    <li>ReactJS</li>
                    <li>GatsbyJS</li>
                    <li>MongoDB Atlas</li>
                    <li>more on credits</li>
                </ul>
            </div>
            <div className="devInfoFooter">
                <p>Made with</p>
                <Img fluid={data.loveLove.childImageSharp.fluid} className="loveIconSatmano" />
                <p>by Saturno Mangieri @theghost1980</p>
            </div>
        </footer>
    )
}

export default Footer;