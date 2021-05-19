import React, { useState, useEffect } from 'react';
import { graphql, useStaticQuery, Link } from "gatsby"
import Img from 'gatsby-image';
import Slider from 'react-carousel-responsive';
import 'react-carousel-responsive/dist/styles.css';

/**
 * Assign the project to an employee.
 * @param {String} xclassCSS - Optional, The extra css class.
 * @param {String} xclassCSSUl - optional apply a css extra class to Ul.
 * @param {String} size - Optional to define a "big" or "small".
 * @param {Function} cbSeleted - optional if you need to send the clicked item back.
 * @param {Object} pagination - if you need to divide the cats and paginate as 2 per slide. As { pagination : true, perSlide: 2 }
 * @param {Boolean} devMode - optional to console logs. 
 */

const Browseby = (props) => {
    const { xclassCSS, size, pagination, devMode, cbSeleted, xclassCSSUl } = props;
    const [slides, setSlides] = useState(null);

    //graphql queries
    const data = useStaticQuery(graphql`
        query {
        append_menu: allMongodbGatsbyCategories(sort: {fields: name}) {
            edges {
                node {
                    active
                    id
                    thumb
                    image
                    name
                    query
                    sub_category
                    subtitle
                    title
                }
            }
        }
    }`);
    //END graphql queries

    //load in init
    useEffect(() => {
        if(pagination && pagination.pagination && data.append_menu && data.append_menu.edges){
            function paginate (arr, size) {
                return arr.reduce((acc, val, i) => {
                  let idx = Math.floor(i / size)
                  let page = acc[idx] || (acc[idx] = [])
                  page.push(val)
              
                  return acc
                }, [])
            }
            let pages = paginate(data.append_menu.edges.map(item => item.node), pagination.perSlide);
            setSlides(pages);
            if(devMode){ console.log('pagination:', pages) };
        }
    },[]);
    //END load on init

    //functions/CB
    const sendItem = (item) => {
        if(cbSeleted){
            cbSeleted(item);
        }
    }
    //END functions/CB

    return (
        <div className={`${xclassCSS}`}>
            <h3 className="textAlignedCenter">Browse More Categories</h3>
            <div className="standardDivRowFlexPlain">
                {
                    slides &&
                    <Slider autoplay={false} timingFunction={"ease-in-out"} showIndicators={true}>
                        {
                            slides.map(pageSlide => {
                                return (
                                    <ul key={`${pageSlide[0].id}-slide-pagination-JAB`} className={`${xclassCSSUl} justSpaceBewteen justFlexWrap standardUlRowFlexPlain`}>
                                        {
                                            pageSlide.map(_slide => {
                                                if(!_slide.active) return null;
                                                return (
                                                    <div key={`${_slide.id}-div-cont-Cats-JAB`}  className="scaleHovered pointer" onClick={() => sendItem(_slide)}>
                                                        <li key={_slide.id} className="miniLi boxShadowBottomStrong">
                                                            <img src={_slide.image} className="justMiniRounded" />
                                                        </li>
                                                        <p className="normalTextSmall textAlignedCenter hoverUnderline">More on {_slide.name}</p>
                                                        <p className="textXSmallOrange textAlignedCenter hoverUnderline">More on {_slide.title}</p>
                                                    </div>
                                                )
                                            })
                                        }
                                    </ul>
                                )
                            })
                        }
                    </Slider>
                }
                {/* <ul className="catBigUl marginsTB">
                {
                data.append_menu.edges.map(({ node: item}) => {
                    if(!item.active) return null;
                    return (
                    <li key={item.id}>
                        <Link onClick={() => navigateToApp("explore")} to={`/explore?category=${item.name}|sub_category=none`}>
                        <div className="imgContCat relativeDiv">
                            <img src={item.image} className="imgCat" alt={`${item.name}-${item.id}`} />
                            <h2 className="justAbsolutePos">{item.name}</h2>
                        </div>
                        </Link>
                    </li>
                    )
                })
                }
                </ul> */}
            </div>
        </div>
    )
}

export default Browseby;
