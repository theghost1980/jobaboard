import React, { useEffect, useState } from 'react';
import Loader from '../loader';
import ImageUploader from "react-images-upload";
import { check } from '../../utils/helpers';
import Jabcha from '../interactions/jabcha';

//constants
const notiEP = process.env.GATSBY_notiEP;
const ticket_types = [
    {id: 't-1', title: 'Bug/Error', value: 'bug'},
    {id: 't-2', title: 'Suggestion', value: 'suggestion'},
    {id: 't-3', title: 'Idea/Improvements', value: 'idea-improvement'},
    {id: 't-4', title: 'General Support', value: 'general-support'},
    {id: 't-5', title: 'Specific Support Area', value: 'specific-support'},
];
const support_specifics = ['Log In-Auth Related','Log Out Related','NFTs operations','Money/Tokens Transactions','How to buy/sell NFTs','How to use JAB','Jobs/Gigs Related','Other Specified on notes.'];
//END constants

const Supporthandler = (props) => {
    const { closeCB, devMode } = props;
    const userdata = check();
    const initialResultOp = { status: '',};
    const [resultOP, setResultOP] = useState(initialResultOp);
    const [loadingData, setLoadingData] = useState(false);
    const [haveImages, setHaveImages] = useState(false);
    const [support_ticket, setSupport_ticket] = useState({
        username: userdata.username,
        usertype: userdata.usertype,
        ticket_type: '', //as general-support, specific-support, bug, suggestion, idea-improvement.
        category_support: '',
        ref_id: '', //if needed the user may fill as tx_id or transaction id.
        issue_description: '',
        issue_note: '', 
    });
    const [images, setImages] = useState([]);
    const [challengeSolved, setChallengeSolved] = useState(false);

    //functions/CB
    const sendSupport = (event) => {
        event.preventDefault();
        setLoadingData(true);
        const formdata = new FormData();
        const testData = {};
        console.log(images);
        if(images.length > 0){
            Object.entries(support_ticket).forEach(([key,value]) => {
                formdata.append(key,value);
                testData[key]= value;
            });
            for (const file of images) {
                formdata.append('file', file);
                testData['file']= file;
            };
        }else{
            formdata.append("data", JSON.stringify(support_ticket));
        }
        const operation = { operation: 'create',}; //on BE { operation: 'create,update,delete', sup_id: '' }
        if(devMode) console.log('About to send', { support_ticket: support_ticket, testData: testData, pTicket: JSON.stringify(support_ticket)});
        const headers = {'x-access-token': userdata.token, 'operation': JSON.stringify(operation),};
        dataRequest(notiEP+"handleSupport", "POST", headers, formdata).then(response => {
            if(devMode) console.log(response);
            setResultOP(response);
            setLoadingData(false);
        }).catch(error => {
            if(devMode){ 
                console.log('Error fetching support.', error);
                setLoadingData(false);
            };
        })
    }
    function updateState(name,value){ setSupport_ticket(prevState => { return {...prevState, [name]: value }});};
    const onDrop = picture => { setImages(picture); };
    ///data fetching
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata   ? fetch(url, { method: requestType, contentType: 'application/json', headers: headers,})
                                        : fetch(url, { method: requestType, contentType: 'application/json', headers: headers, body: formdata});
        return (await response).json(); 
    };
    ///END data fetching
    //END functions/CB

    //load on each state change
    useEffect(() => {
        if(!haveImages){ setImages([]);};
    }, [haveImages]);
    //END load on each state change

    return (
        <div>
            {
                loadingData && <div className="standardDivRowFlex100pX100pCentered"><Loader logginIn={loadingData} /></div>
            }
            {
                resultOP.status !== '' && !loadingData &&
                <div className="standardDivFlexPlain2 justWidth90 justMarginAuto">
                    <h2>Result: {resultOP.status}</h2>
                    <p>JAB robots say:</p>
                    <p>{resultOP.message && resultOP.message !== {} ? resultOP.message : null}</p>
                    <button className="justWidth100" onClick={() => closeCB()}>Ok</button>
                </div>
            }
            {
                !loadingData && resultOP.status === '' &&
                <div className="standardDivColFullW100 justRounded justBorders justiAlig">
                    {
                        !challengeSolved && <Jabcha title={"Piece of Cake!"} devMode={true} cbResult={(cen) => setChallengeSolved(cen)}/>
                    }
                    {   challengeSolved &&
                        <form className="formVertFlex justWidth98" onSubmit={sendSupport}>
                            <label htmlFor="ticket_type">Ticket type</label>
                            <select name="ticket_type" onChange={(e) => updateState(e.target.name, e.target.value)} required>
                                <option defaultValue=""></option>
                                {
                                    ticket_types.map(ticket => {
                                        return (
                                            <option key={ticket.id} value={ticket.value}>{ticket.title}</option>
                                        )
                                    })
                                }
                            </select>
                            {
                                (support_ticket.ticket_type === 'specific-support') &&
                                <div>
                                    <label htmlFor="category_support">Category support</label>
                                    <select name="category_support" onChange={(e) => updateState(e.target.name, e.target.value)} required>
                                        <option defaultValue=""></option>
                                        {
                                            support_specifics.map(specs => {
                                                return (
                                                    <option key={`${specs}-support-JAB`} value={specs}>{specs}</option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                            }
                            <label htmlFor="ref_id">Ref Id(tx/order/job)</label>
                            <input name="ref_id" onChange={(e) => updateState(e.target.name, e.target.value)} required />
                            <label htmlFor="issue_description">Issue Description</label>
                            <textarea name="issue_description" onChange={(e) => updateState(e.target.name, e.target.value)} required />
                            <label htmlFor="issue_note">Issue Note(extra information)</label>
                            <textarea name="issue_note" onChange={(e) => updateState(e.target.name, e.target.value)} required />
                            <label htmlFor="need_images">I need to upload images</label>
                            <input type="checkbox" name="need_images" onChange={(e) => setHaveImages(e.target.checked)} 
                                defaultChecked={false} 
                            />
                            {
                                haveImages &&
                                <ImageUploader
                                    {...props}
                                    // key={resetImgUp}
                                    withIcon={true}
                                    buttonText="Choose images"
                                    onChange={onDrop}
                                    imgExtension={[".jpg", ".gif", ".png", ".gif", ".jpeg"]}
                                    maxFileSize={5242880}
                                    withPreview={true}
                                    name="imagesUploader-third-party"
                                />
                            }

                            <div className="standardDivRowFullW justSpaceEvenly">
                                <button onClick={() => closeCB()}>cancel</button>
                                <button type="submit">Submit</button>
                            </div>
                        </form>
                    }
                </div>
            }
        </div>
    )
}

export default Supporthandler;
