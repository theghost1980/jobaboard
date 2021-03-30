import React from 'react';
import Btnclose from '../../btns/btncloseMin';
import Btnclosemin from '../../btns/btncloseMin';
import { Link } from 'gatsby';
import Miniprofile from './subcomponents/miniprofile';


const Previewjob = (props) => {
    const { job, cbClose } = props;

    return (
        <div className="borderedFlexShadowMinContent relativeDiv coloredContrast1">
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
                            <div className="standardDivRowFullW justiAlig">
                                <Miniprofile username={job.username} />
                                <div>
                                    {/* TODO: logic if logged, negociate with user if not take to login & save in history this job, so after log in redirect to this action */}
                                    <button title="Means hire or work for this user. JAB jargon! TODO...">Jab It</button>
                                </div>
                            </div>
                            <h1>{job.title}</h1>
                            <p>Job Type: {job.job_type === "employee" ? "Looking to get Hired by this Job/Service":"Looking to Hire a professional"}</p>
                            <p>Desc: {job.description ? job.description : 'none'}</p>
                            <p>{job.job_type === "employer" ? 'I am willing to pay you: ': 'I ask for this service: '}{job.paying_price} of my {job.nft_symbol} tokens.</p>
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