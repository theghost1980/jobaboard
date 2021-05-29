import React from 'react';
import Slider from 'react-carousel-responsive';
import 'react-carousel-responsive/dist/styles.css';
import { useStaticQuery, graphql, Link } from "gatsby";
import Img from 'gatsby-image';

const MainCarousel = (props) => {
    const { logged } = props;
    //graphql queries
    const data = useStaticQuery(graphql`
    query {
        bgImgOne: file(relativePath: {eq: "man-desk.jpg"}) {
            childImageSharp {
                fluid {
                    ...GatsbyImageSharpFluid_withWebp
                }
            }
        }
        bgImgtwo: file(relativePath: {eq: "steel-forge.jpg"}) {
            childImageSharp {
                fluid {
                    ...GatsbyImageSharpFluid_withWebp
                }
            }
        }
        bgImgthree: file(relativePath: {eq: "get-on-board.jpg"}) {
            childImageSharp {
                fluid {
                    ...GatsbyImageSharpFluid_withWebp
                }
            }
        }
    }
    `);
    //end grapqhql queries

    return (
        <Slider
            autoplay={true}
            autoplaySpeed={5000}
            timingFunction={"ease-in-out"}
            speed={800}
        >
            <div className="slide">
                <div className="slideContBgMainCar">
                    <Img fluid={data.bgImgOne.childImageSharp.fluid} className="imgBGMainCarousel" />
                    <div className="divBGContentMainCarousel">
                        <h1 className="HeadingMainCarousel">What is your job? Do not worry. We have you covered.</h1>
                    </div>
                </div>
            </div>
            <div className="slide">
                <div className="slideContBgMainCar">
                    <Img fluid={data.bgImgtwo.childImageSharp.fluid} className="imgBGMainCarousel" />
                    <div className="divBGContentMainCarousel">
                        <h1 className="HeadingMainCarousel">Job A Board. Where the true hero is Forged.</h1>
                    </div>
                </div>
            </div>
            <div className="slide">
                <div className="slideContBgMainCar">
                    <Img fluid={data.bgImgthree.childImageSharp.fluid} className="imgBGMainCarousel" />
                    <div className="divBGContentMainCarousel">
                        <h1 className="HeadingMainCarousel">Get on Board. {logged ? null: <Link to="/signup" className="textShadowWhite">Sign Up</Link> }</h1>
                    </div>
                </div>
            </div>
        </Slider>
    )
}

export default MainCarousel;