import React, { useState, useEffect } from 'react';
import Sliderjobimages from '../User/jobs/subcomponents/sliderjobimages';
import Loader from '../loader';

const adminEP = process.env.GATSBY_adminEP;

const Faqs_finder = (props) => {
    const { category, userdata } = props;
    const [faq, setFaq] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    //load on init
    useEffect(() => {
        if(category){ return loadFaq(category); };
        setLoadingData(false);
    }, []);
    //END load on init

    //functions/CB
    function loadFaq(category){
        console.log('About to query FAQs on:', category)
        const headers = {'x-access-token': userdata.token, 'query': JSON.stringify({ 'filter': { category: category, active: true }, 'limit': 1, 'sortby': {}}) };
        dataRequest(adminEP+"getFaq", "GET", headers, null).then(response => {
            console.log(response);
            if(response.status === 'sucess'){ setFaq(response.result[0]);}
            setLoadingData(false);
        }).catch(error => {
            console.log('Error getting faq.', error);
            setLoadingData(false);
        });
    }
    ///data fetching
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata   ? fetch(url, { method: requestType, contentType: 'application/json', headers: headers,})
                                        : fetch(url, { method: requestType, contentType: 'application/json', headers: headers, body: formdata});
        return (await response).json(); 
    };
    ///END data fetching
    //END functions/CB

    return (
        <div>
            {
                faq && !loadingData &&
                <div>
                    <h3 className="textAlignedCenter">{faq.title}</h3>
                    <ul>
                        {
                            faq.questions_list && faq.questions_list.map(qItem => {
                                return (
                                    <li key={qItem._id} className="justBordersRoundedGree miniMarginBottom justbackgroundWhitishBeige">
                                        <div className="contentMiniMargins">
                                            <p className="justBoldtext">{qItem.question}</p>
                                            <p className="textShadowBasicSoft">{qItem.answer}</p>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                    {
                        faq.images.length > 0 &&
                        <div>
                            <h3>Support images on this FAQs</h3>
                            <Sliderjobimages 
                                job={{ images: faq.images }}
                                size={"small"}
                                hideDefault={true}
                            />
                        </div>
                    }
                </div>
            }
            {
                loadingData && <div className="standardDivRowFlex100pX100pCentered"><Loader logginIn={loadingData}/></div>
            }
        </div>
    )
}

export default Faqs_finder;
