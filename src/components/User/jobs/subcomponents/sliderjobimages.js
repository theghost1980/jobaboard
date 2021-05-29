import React, { useEffect } from 'react';
import Slider from 'react-carousel-responsive';
import 'react-carousel-responsive/dist/styles.css';
import { useState } from 'react';

/**
 * Assign the project to an employee.
 * @param {String} xclassCSS - Optional, The extra css class.
 * @param {Object} job - the job selected data.
 * @param {String} size - mandatory. As "big", "small", "mini".
 * @param {Boolean} devMode - optional, console.logs.
 * @param {Boolean} hideDefault - optional to hide no image present.
 */

const Sliderjobimages = (props) => {
    const { job, xclassCSS, size, devMode, hideDefault } = props;
    const [imgClass, setImgClass] = useState({ mainCont: '', imgClass: ''});

    //load on init
    useEffect(() => {
        if(devMode){ console.log('My props:', {job, xclassCSS, size, devMode, hideDefault})}
        switch (size) {
            case ('big'):
                setImgClass({ mainCont: 'standardBlockMaxW80p', imgClass: 'coverImgJobs' });
                break;
            case ('small'):
                setImgClass({ mainCont: 'miniSlider', imgClass: 'miniImg' });
                break;
            case ('mini'):
                setImgClass({ mainCont: 'miniSlider2', imgClass: 'miniImg2' });
                break;
            default:
                break;
        }
    },[])
    //END load on init

    return (
        <div className={`${imgClass.mainCont} ${xclassCSS} ${job.images.length === 0 ? 'justDisplayNone' : null}`}>
            {
                job.images.length === 0 && !hideDefault &&
                    <img src={'https://res.cloudinary.com/dbcugb6j4/image/upload/v1615643565/noimage-JAB_geyicy.png'} 
                        className={`${imgClass.imgClass} boxShadowBottom`}
                    />
            }
            {
                job.images.length === 1 &&
                <img src={job.images[0]} 
                    className={`${imgClass.imgClass} boxShadowBottom`}
                /> 
            }
            {
                job.images.length > 1 &&
                <Slider autoplay={false} timingFunction={"ease-in-out"} showIndicators={true}>
                    {
                        job.images.map(image => {
                            return (
                                <div key={`${job._id}-miniImage-carousel`} className="slide">
                                    <img src={image} className={`${imgClass.imgClass} justRounded boxShadowBottom`} />
                                </div>
                            )
                        })
                    }
                </Slider>
            }
        </div>
    )
}

export default Sliderjobimages;