import React, { useEffect, useState } from 'react';
import { check } from '../../utils/helpers';
import Tablinator from '../interactions/tablinator';
import ImageUploader from "react-images-upload";
import { graphql, useStaticQuery, Link } from "gatsby"

const adminEP = process.env.GATSBY_adminEP;

const Managefaqs = (props) => {
    const userdata = check();
    const [faqs, setFaqs] = useState(null);
    const initialResultOp = { status: '',};
    const [resultOP, setResultOP] = useState(initialResultOp);
    const [option, setOption] = useState('');
    const [loadingData, setLoadingData] = useState(true);
    const initialState = { active: true, category: '', title: '', };
    const [faq, setFaq] = useState(initialState);
    const [questions_list, setQuestions_list] = useState(null);
    const [haveImages, setHaveImages] = useState(false);
    const [images, setImages] = useState([]);

     //graphql queries
     const data = useStaticQuery(graphql`
        query { cats: allMongodbGatsbyCategories(sort: {fields: name}) {
            edges {
                node { active id thumb image name query sub_category subtitle title}
            }
        }
    }`);
    //END graphql queries

    //functions/CB
    function loadFaqs(){
        const headers = {'x-access-token': userdata.token, 'query': JSON.stringify({ 'filter': {}, 'limit': 0, 'sortby': {}}) }; //
        dataRequest(adminEP+"getFaq", "GET", headers, null).then(response => {
            console.log(response);
            if(response.status === 'sucess'){ setFaqs(response.result);}
            setLoadingData(false);
        }).catch(error => {
            console.log('Error getting faqs.', error);
            setLoadingData(false);
        });
    }
    const toogleOption = (_option) => {
        if(option === _option){
            setOption('');
        }else{
            setOption(_option);
        }
    }
    function updateState(name,value){
        setFaq(prevState => { return {...prevState, [name]: value }});
    }
    const sendFaq = (event) => {
        event.preventDefault();
    }
    const onDrop = (pictures) => {
        setImages(pictures);
    }
    ///data fetching
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata   ? fetch(url, { method: requestType, contentType: 'application/json', headers: headers,})
                                        : fetch(url, { method: requestType, contentType: 'application/json', headers: headers, body: formdata});
        return (await response).json(); 
    };
    ///END data fetching
    //END functions/CB

    //load on init
    useEffect(() => {
        loadFaqs();
    },[]);
    //END load on init

    return (
        <div className="standardContentMargin">
            <p>Each explore category will show, if exists, a FAQ section bellow. Here you can edit and add, each FAQ section.</p>
            {
                faqs &&
                <Tablinator 
                    clickedSubItemCB={(item) => console.log('Clicked on', item)}
                    items={faqs}
                    toShow={['active','category','sub_category','title']}
                />
            }
            <button onClick={() => toogleOption('add')}>Add Faq</button>
            {
                option !== '' &&
                <form className="formVertFlex justWidth98 marginsTB" onSubmit={sendFaq}>
                    <label htmlFor="active">Active</label>
                    <input type="checkbox" onChange={(e) => updateState("active", e.target.checked)} defaultChecked={faq.active} />
                    <label htmlFor="category">Category</label>
                    <select name="category" onChange={(e) => updateState(e.target.name, e.target.value)} required>
                        <option defaultValue=""></option>
                        {
                            data.cats.edges.map(({ node: cat}) => {
                                return (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                )
                            })
                        }
                    </select>
                    <label htmlFor="title">Title</label>
                    <input name="title" onChange={(e) => updateState(e.target.name, e.target.value)} required />
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
                    {/* {
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
                        <button onClick={() => setOption('')}>cancel</button>
                        <button type="submit">Submit</button>
                    </div> */}
                </form>
            }
        </div>
    )
}

export default Managefaqs;

// help code
// active: {
//     type: Boolean,
//     default: true,
// },
// category: String,
// sub_category: String,
// title: String,
// questions_list:[{
//     question: String,
//     answer: String,
//     action_link_url: String, //as optional i.e "/support".
// }],
// images: [String], //as optional, if needed maybe to point an action or teach something.
// createdAt: Date,
// updatedAt: Date,