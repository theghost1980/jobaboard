import React, { useEffect, useState } from 'react';
import Btnclose from '../../btns/btncloseMin';
import Btnclosemin from '../../btns/btncloseMin';
import { Link, navigate } from 'gatsby';
import Miniprofile from './subcomponents/miniprofile';

//contants
const publicEP = process.env.GATSBY_publicEP;

const Previewjob = (props) => {
    const { job, cbClose, userdata } = props;
    const [nftToUse, setNftToUse] = useState(null);

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
    }, []);
    // END to load on init

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
        <div className="borderedFlexShadowMinContent relativeDiv coloredContrast1 marginTop3x">
            <Btnclosemin btnAction={cbClose} />
            {/* {JSON.stringify(job)} */}
            {
                job &&
                    <div>
                        {    
                            (job.images.length > 0) &&
                            <div className="standardBlockMaxW80p">
                                {/* TODO - loading image */}
                                <img src={job.images[0]} className="coverImgJobs justRounded" />
                            </div>
                        }
                        <div className="standardBlockMaxW80p">
                            <div className="standardDivRowFullW justSpaceAround justAligned">
                                <Miniprofile username={job.username} />
                                <div className="justWidth20">
                                    {/* TODO: logic if logged, negociate with user if not take to login & save in history this job, so after log in redirect to this action */}
                                    <button className="justWidth100per" onClick={() => makeDeal(job)} title="Make this deal!">Jab It</button>
                                </div>
                            </div>
                            <h1>{job.title}</h1>
                            {
                                job.days_to_complete &&
                                <p>Estimated days to complete: {job.days_to_complete}</p>
                            }
                            <p>Job Type: {job.job_type === "employee" ? "Looking to get Hired by this Job/Service":"Looking to Hire a professional"}</p>
                            <p>Desc: {job.description ? job.description : 'none'}</p>
                            {/* <p>{job.job_type === "employer" ? 'I am willing to pay you: ': 'I ask for this service: '}{job.paying_price} of my {job.nft_symbol} tokens.</p> */}
                            {
                                nftToUse &&
                                <ul className="standardUlHorSpaceAround justAligned">
                                    <li><p>{job.job_type === "employer" ? 'I am willing to pay you: ': 'I ask for this service: '}</p></li>
                                    <li><h2>{job.paying_price}</h2></li>
                                    <li><img src={nftToUse.thumb} className="miniImageJobs2 justRoundedFull justBorders" /></li>
                                    <li>Todo: link to market</li>
                                </ul>
                            }
                            <p>Escrow Type:{job.escrow_type}</p>
                            {
                                (job.escrow_type === "select_from_lists") &&
                                    <p>Escrow Selected:{job.escrow_username}</p>
                            }
                            <p>Promoted: {job.promoted ? 'Yes':'No'}</p>
                            <p>Current Status:{job.active ? "Active & Published":"Not activated yet"} - (Management Link - TODO)</p>
                            <p>It will be seen by:{job.verifyed_profiles_only ? "Only verifyed profiles": "Everyone"} - (Management Link - TODO)</p>
                            <p>Created on:{job.createdAt}</p>
                            {
                                (job.images.length > 1) && 
                                <div>
                                    <p>All the images on this publication:</p>
                                    <ul className="standardULImagesRow overflowXscroll coloredContrast2 bordersRounded centeredDiv marginBottom">
                                    {
                                        job.images.map(image => {
                                            return (
                                                <li key={`${image.split("//")[1]}`} className="allMargins">
                                                    <img src={image} className="blockImgMini boxShadowContrast1" />
                                                </li>
                                            )
                                        })
                                    }
                                    </ul>
                                </div>
                            }
                            <p>Explore more on this Cat: <Link to={`/explore?category=${job.category}|sub_category=none`}>{job.category}</Link> </p>
                            <p>Or explore this Sub Cat: <Link to={`/explore?category=${job.category}|sub_category=${job.sub_category}`}>{job.sub_category}</Link></p>
                        </div>
                    </div>
            }
        </div>
    )
}

export default Previewjob;