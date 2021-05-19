import React from 'react'
import Sliderjobimages from './sliderjobimages';

const Imageeditor = (props) => {
    const { job, editmode } = props;
    return (
        <div>
            {
                (job && job.images && job.images.length > 0)
                ?
                    editmode 
                    
                    ?
                    
                    <div className="standardDivRowFullW">
                        <div className="justWidth50">
                            <Sliderjobimages size={"mini"} job={job} />
                        </div>
                        <div className="justWidth50">
                            <p>Actual Images:</p>
                            <ul>
                            {
                                job.images.map(image => {
                                    return (
                                        <li key={`${image}-img-JAB`}>
                                            <p>{image}</p>
                                        </li>
                                    )
                                })
                            }
                            </ul>
                        </div>
                    </div>
                    :
                    <Sliderjobimages size={"mini"} job={job} />

                :   <p>No images to show!.</p>
            }
        </div>
    )
}

export default Imageeditor;