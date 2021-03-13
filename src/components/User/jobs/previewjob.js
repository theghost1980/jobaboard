import React from 'react';
import Btnclose from '../../btns/btncloseMin';
import Btnclosemin from '../../btns/btncloseMin';
import { Link } from 'gatsby';


const Previewjob = (props) => {
    const { job, cbClose } = props;

    return (
        <div className="borderedFlexShadowFullW relativeDiv coloredContrast1">
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
                            <h1>{job.title}</h1>
                            <p>Desc: {job.description ? job.description : 'none'}</p>
                            <p>Cat: {job.category}
                                - Sub Cat: <Link to={`/explore?subcat=${job.sub_category}`}>{job.sub_category}</Link>
                            </p>
                            <p>I am willing to pay you:{job.paying_price} of my {job.nft_symbol} tokens.</p>
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
                                    <p>Rest of support images:</p>
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
                        </div>
                    </div>
            }
        </div>
    )
}

export default Previewjob;