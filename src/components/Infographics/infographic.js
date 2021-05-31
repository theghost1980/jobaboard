import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql, Link } from 'gatsby';

/**
 * Assign the project to an employee.
 * @param {String} xclassCSS - Optional, The extra css class.
 * @param {String} typeIcon - Type of icon, "refresh", "wishlist", "bugs".
 * @param {String} title - Tip tool text
 * @param {String} size - Optional to define a smaller version of the icons. "" = default = 35px. "mini" = 15px.
 */

const Infographic = (props) => {
    const data = useStaticQuery(graphql`
    query{
        createIcon: file(relativePath: {eq: "infographic_create.png"}) {
            childImageSharp {
                fixed(width: 100) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        }
        clickIcon: file(relativePath: {eq: "infographic_click.png"}) {
            childImageSharp {
                fixed(width: 100) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        }
        publishIcon: file(relativePath: {eq: "infographic_publish.png"}) {
            childImageSharp {
                fixed(width: 100) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        }
    }
    `); //end grapqhl queries
    const { xclassCSS } = props;
    const items = [
        { id: '1-infographic-Jobaboard', link: '/signup', title: 'OPEN', iconImgData: data.createIcon.childImageSharp.fixed, list: [
            {listId: '1', content: 'Open an account on the HIVE chain.'},
            {listId: '2', content: 'Absolutely free.'},
        ]},
        { id: '2-infographic-Jobaboard', title: 'LOG IN', iconImgData: data.clickIcon.childImageSharp.fixed, list: [
            {listId: '1', content: 'Customize your profile & portfolio.'},
            {listId: '2', content: 'Create your own NFT.'},
        ]},
        { id: '3-infographic-Jobaboard', link: '/explore', title: 'PUBLISH', iconImgData: data.publishIcon.childImageSharp.fixed, list: [
            {listId: '1', content: 'Post a new Gig/Job/Service.'},
            {listId: '2', content: 'Seat, relax & earn.'},
        ]},
    ];

    return (
        <div className={`${xclassCSS}`}>
            <div className="justDisplayFlexColumn backGroundColorGreen justMarginBottom justWidth100per justRounded">
                <h1 className="textAlignedCenter textColorWhite">Get Started</h1>
                <hr className="textColorWhite justWidth80"></hr>
                <h3 className="textAlignedCenter textColorWhite">In about 3 steps. Yep, that easy.</h3>
            </div>
            <ul className="justWidth80 justiAlig justDisplayFlexColumn justMarginAuto" id="ulInfographic">
                {
                    items.map(item => {
                        return (
                            <li key={item.id} className="standardDivRowFullW marginBottom" id="liInfographic">
                                <div className={`justBorders justRoundedFull paddings justWiderBorders relativeDiv justLeft70 whiteBack ${item.link ? 'scaleHovered' : null}`} id="divImgInfographic">
                                    {
                                        item.link ? <Link to={item.link}><Img fixed={item.iconImgData} /></Link> : <Img fixed={item.iconImgData} />
                                    }
                                </div>
                                <div className="justDisplayFlexColumn  justBorders justWiderBorders justWidth60 justRounded" id="divContentInfographic">
                                    <div className="justbackgroundOrange"><h2 className="miniMarginTB marginLeftX5 textColorWhite textShadowBasic">{item.title}</h2></div>
                                    <ul className="marginLeftX5 miniMarginTop">
                                        {
                                            item.list.map(listItem => {
                                                return (
                                                    <li key={`${listItem.listId}-${item.id}`}>{listItem.content}</li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

export default Infographic;