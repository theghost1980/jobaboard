import React, { useEffect, useState } from 'react';
import Btnclose from '../../btns/btncloseMin';
import Btnclosemin from '../../btns/btncloseMin';
import { Link, navigate } from 'gatsby';
import Miniprofile from './subcomponents/miniprofile';
import Sliderjobimages from './subcomponents/sliderjobimages';
import { formatDateTime } from '../../../utils/helpers';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

//contants
const publicEP = process.env.GATSBY_publicEP;

const Previewjob = (props) => {
    //graphQL queries
    const data = useStaticQuery(graphql`
        query{
            starOrange: file(relativePath: {eq: "star_orange.png"}) {
                childImageSharp {
                    fixed(width: 30) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `); 
    //END graphQL queries
    const { job, cbClose, userdata, hideJabBtn } = props;
    const [nftToUse, setNftToUse] = useState(null);
    const [miniProfileLoading, setMiniProfileLoading] = useState(true);
    const [reviewUser, setReviewUser] = useState(null);
    const initialLimitReviews = 1;
    const [limitReviews, setLimitReviews] = useState(initialLimitReviews); //by default as 3 and showMore btn.
    const [showMoreReviews, setShowMoreReviews] = useState(false);

    // to load on init
    useEffect(() => {
        const query = { symbol: String(job.nft_symbol).trim(), account: null,};
        // console.log(query);
        sendGETBEJustH(publicEP + "getNFTquery",query,0, { "null": null })
        .then(response => {
            // console.log(response);
            if(response.status === 'sucess' && response.result.length === 1){
                setNftToUse(response.result[0]);
            }
        }).catch(error => console.log('Error asking for NFTs on this user from DB, mongo.',error));
        //search any review from this user.
        sendGETBEJustH(publicEP + "queryReview", { username_reviewed: job.username }, 0, { "createdAt": 1 })
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setReviewUser(response.result);
            }
        }).catch(error => console.log('Error asking for Reviews on this user from DB, mongo.', error));

    }, []);
    // END to load on init

    //to load on each state changes
    useEffect(() => {
        if(showMoreReviews){ 
            setLimitReviews(20) 
        }else{
            setLimitReviews(initialLimitReviews);
        }
    },[showMoreReviews]);
    //END to load on each state changes

    //functions/CB
    const makeDeal = (job) => {
        if(userdata.logged && userdata.username){
            //process the order using the job object.
            if(userdata.username !== job.username){
                navigate("/checkout",{
                    state : job
                });
            }
        }else{
            navigate("/signup/");
        }
    }
    ////data fecthing
    async function sendGETBEJustH(url = '', query = {},limit=Number,sortby = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'query': JSON.stringify(query),
                'limit': limit,
                'sortby': JSON.stringify(sortby),
            },
        });
        return response.json(); 
    };
    ////END data fetching
    //END functions/CB

    return (
        <div className="borderedFlexShadowMinContent relativeDiv coloredContrast1 marginTop3x"
            onMouseLeave={() => cbClose()}
        >
            <Btnclosemin btnAction={cbClose} />
            {
                job &&
                    <div>
                        <Sliderjobimages 
                            job={job}
                            size={"big"}
                        />
                        <div className="standardBlockMaxW80p">
                            <div className="justBordersRounded standardDivRowFullWAuto justiAlig justbackground">
                                <div className={`allMiniMargins standardDivRowFullWAuto spaceEvenly ${miniProfileLoading ? null : 'justiAlig' }`}>
                                    <Miniprofile cbLoaded={() => setMiniProfileLoading(false)} textClass={"textShadowBasic normalTextSmall"} username={job.username} />
                                    {
                                        !miniProfileLoading && !hideJabBtn && (userdata.username !== job.username) &&
                                        <div className="justWidth20">
                                            <button className="justWidth100 btnScaled" onClick={() => makeDeal(job)} title="Make this deal!">Jab It</button>
                                        </div>
                                    }
                                </div>
                            </div>
                            <h1 className="textAlignedCenter">{job.title}</h1>
                            <div className="standardDivRowFullW">
                                <div className="standardDiv60Percent">
                                    <div className="marginRight">
                                    {
                                        job.days_to_complete &&
                                        <p className="justBoldtext">Estimated days to complete: {job.days_to_complete}</p>
                                    }
                                    <p>Job Type: {job.job_type === "employee" ? "Looking to get Hired by this Job/Service":"Looking to Hire a professional"}</p>
                                    <p>Desc: {job.description ? job.description : 'none'}</p>
                                    </div>
                                </div>
                                <div className="standardDiv40PercentH100p justBorders justRounded justshadows justbackground justMarginAuto">
                                    <div className="standardContentMarginMini">
                                        {
                                            nftToUse &&
                                            <div className="justAligned justDisplayFlex justFlexDirection normalTextSmall">
                                                <img src={nftToUse.thumb} className="miniImageJobs3 justRoundedFull justBorders" />
                                                <p className="xtraMiniMarginTB4p">NFT: {nftToUse.symbol}</p>
                                                <p className="xtraMiniMarginTB4p">{job.job_type === "employer" ? 'I am willing to pay you: ': 'I ask for this service: '} {job.paying_price} {job.paying_price === 1 ? 'Token.' : 'Tokens.'}</p>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                            <p>Promoted: {job.promoted ? 'Yes':'No'}</p>
                            <p>Current Status: {job.active ? "Active & Published":"Not activated yet"}</p>
                            <p>It will be seen by: {job.verifyed_profiles_only ? "Only verifyed profiles": "Everyone"}</p>
                            <p>Created on: {formatDateTime(job.createdAt)}</p>
                            {
                                reviewUser &&
                                <div>
                                    <ul className="standardUlColPlain">
                                        {
                                            reviewUser.slice(0, limitReviews).map(review => {
                                                return (
                                                    <li key={review._id}>
                                                        <div className="whiteBack justRounded standardDivColFullW miniMarginBottom boxShadowBottomStrong">
                                                            <div className="standardContentMargin relativeDiv">
                                                                <div className="standardDivRowFullWAuto justAligned justSpaceBewteen">
                                                                    <h4 className="textColorContrast2">{review.username_reviewer} reviewed this user on {review.category_job} Category.</h4>
                                                                    <div className="standardDivRowFullWAuto justiAlig">
                                                                        <p className="shadowsTitlesSoft biggerText">
                                                                            {review.stars_rated ? review.stars_rated.star : '5'}
                                                                        </p>
                                                                        <Img fixed={data.starOrange.childImageSharp.fixed} className="miniMarginLeft boxShadowBottom justRoundedFull" />
                                                                    </div>
                                                                </div>
                                                                <div className="contrastTextBorders justiAlig textAlignedCenter">
                                                                    <p className="textColorContrast2">"{review.comments}"</p>
                                                                </div>
                                                                <h6>Published on {formatDateTime(review.createdAt)}</h6>
                                                                <div className="justAbsolutePos justPosAbs0Bmright">
                                                                    <p className="shadowsTitlesSoft">
                                                                        Rated as: {review.stars_rated ? review.stars_rated.rated : 'Good Job!'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                    <p className="textAlignedCenter pointer normalTextSmall justUnderlineText" onClick={() => setShowMoreReviews(!showMoreReviews)}>
                                        {
                                            showMoreReviews ? 'collapse' : 'show more'
                                        }
                                    </p>
                                </div>
                            }
                            <div className="justBordersRoundedMarginB justMarginAuto">
                                <div className="standardContentMarginLR normalTextXSmall standardDivRowFullW justiAlig">
                                    <p>Explore more on this Cat: <Link to={`/explore?category=${job.category}|sub_category=none`}>{job.category}{" "}</Link> </p>
                                    <p className="miniMarginLeft">| Or Sub Cat: <Link to={`/explore?category=${job.category}|sub_category=${job.sub_category}`}>{job.sub_category}</Link></p>
                                </div>
                            </div>
                        </div>
                    </div>
            }
        </div>
    )
}

export default Previewjob;