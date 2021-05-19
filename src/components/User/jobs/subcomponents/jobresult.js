import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from "gatsby"
//mini-slider
// TODO as another component later ON
import Slider from 'react-carousel-responsive';
import 'react-carousel-responsive/dist/styles.css';
import Miniprofile from './miniprofile';
import Sliderjobimages from './sliderjobimages';
import { formatDateTime } from '../../../../utils/helpers';

const Jobresult = (props) => {
     //graphql queries
     const data = useStaticQuery(graphql`
     query {
         statusIcon: file(relativePath: {eq: "status.png"}) {
             childImageSharp {
                 fixed(width: 30) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
         tokenIcon: file(relativePath: {eq: "tokens.png"}) {
             childImageSharp {
                 fixed(width: 30) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
     }
     `);
     //end grapqhql queries

    //  IMportant TODO
    // check if these jobs belong to this user logged
    // if not remove the edit menu or decide if you want to handle jobs edition just in one place
    // inside of managejobs maybe????

    // TODO add the params to read them anytime we use this component
    const { job, logged, openCb, sourceQuery, sizeSlider } = props; //if loggedIn we show the status icon, otherwise noup.

    return (
        <div className="miniDiv2 fontSmall coloredContrast1 relativeDiv scaleHovered justRounded">
            <div className="standardDivRowFullW justAligned miniMarginLeft">
                <h3 className="minimumMarginTB">{job.category}</h3>
                <h3 className="minimumMarginTB"> > </h3> 
                <h3 className="lowerOpacity minimumMarginTB">{job.sub_category}</h3>
            </div>
            <Sliderjobimages size={sizeSlider} job={job} />
            <div className="standardContentMargin pointer" onClick={openCb}>
                <h3 className="noMargintop bolder">{job.title}</h3>
                <div className="whiteBack standardDivRowFullW spaceEvenly justAligned">
                    <Img fixed={data.tokenIcon.childImageSharp.fixed} />
                    <p className="bolder biggerText noMargins">{job.paying_price}</p>
                    <p className="bolder">{job.nft_symbol} NFT{job.paying_price === 1 ? null : 's'}</p>
                </div>
                {
                    logged && (sourceQuery !== "explore") &&
                    <div className="absDivRow whiteBack hoveredOpaacity justRounded">
                        <Img fixed={data.statusIcon.childImageSharp.fixed} />
                        <p>{job.active ? 'Active - Published':'Not Active'}</p>
                    </div>       
                }
                <p className="noMargins textAlignedCenter">Created: {formatDateTime(job.createdAt)}</p>
                <Miniprofile textClass={"textShadowBasic fontSmall"} username={job.username} />
            </div>
        </div>
    )
}

export default Jobresult;