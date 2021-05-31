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
    const [questions_list, setQuestions_list] = useState([]);
    const initialStateQA = { question: '', answer: '' };
    const [questionAnswer, setQuestionAnswer] = useState(initialStateQA);
    const [haveImages, setHaveImages] = useState(false);
    const [images, setImages] = useState([]);
    const [selected, setSelected] = useState(null);

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
        const headers = {'query': JSON.stringify({ 'filter': {}, 'limit': 0, 'sortby': {}}) }; // removed 'x-access-token': userdata.token, as it is public for now.
        setFaqs(null);
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
    function updateState(state,name,value,item){
        if(state === 'faq'){
            setFaq(prevState => { return {...prevState, [name]: value }});
        }else if(state === 'question'){
            setQuestionAnswer(prevState => { return {...prevState, [name]: value }});
        }else if(state === 'question_list'){
            setQuestions_list(prevState => [...prevState, item ]);
        }
    }
    const sendFaq = (event) => {
        event.preventDefault();
        if(haveImages && images.length === 0){
            const answer = window.confirm('We see you have requested to upload images on this FAQ, but you havent add any.\nDo we proceed anyway?');
            if(!answer){ return null};
        }
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ operation : 'create'})};
        const formdata = new FormData();
        for (const file of images) { formdata.append('file', file); // testData["file"]= file;
        };
        formdata.append("active", faq.active);
        formdata.append("category", faq.category);
        formdata.append("title", faq.title);
        formdata.append("questions_list", JSON.stringify(questions_list));
        formdata.append("createdAt", new Date());
        dataRequest(adminEP+"handleFaq", "POST", headers, formdata).then(response => {
            console.log(response);
            setResultOP({ status: response.status, message: response.message });
        }).catch(error => console.log('Error sendding post FAQ.', error ));
    }
    const onDrop = (pictures) => {
        setImages(pictures);
    }
    const addQuestion = (event) => {
        event.preventDefault();
        const item = { question: questionAnswer.question, answer: questionAnswer.answer};
        updateState("question_list",null,null, item);
    }
    const removeQuestion = (questionItem) => {
        const filtered = questions_list.filter(qItem => qItem.question !== questionItem.question);
        setQuestions_list(filtered);
    }
    const ActionFaq = (option) => {
        if(option === 'cancel'){ return setSelected(null) };
        if(option === 'delete'){
            const answer = window.confirm('About to delete one FAQ.\nProceed?');
            if(!answer){ return null };
            const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ operation : 'delete', faq_id: selected._id })};
            dataRequest(adminEP+"handleFaq", "POST", headers, null).then(response => {
                console.log(response);
                setResultOP({ status: response.status, message: response.message });
            }).catch(error => console.log('Error sendding post FAQ.', error ));
        }
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

    //load on each change of state
    useEffect(() => {
        if(resultOP.status === 'sucess'){
            setFaq(initialState);
            setQuestionAnswer(initialStateQA);
            setImages([]);
            setQuestions_list([]);
            setHaveImages(false);
            loadFaqs();
        }
    }, [resultOP]);
    //END load on each change of state

    return (
        <div className="standardContentMargin">
            <p>Each explore category will show, if exists, a FAQ section bellow. Here you can edit and add, each FAQ section.</p>
            {
                faqs &&
                <Tablinator 
                    clickedSubItemCB={(item) => setSelected(item)}
                    items={faqs}
                    toShow={['active','category','title']}
                    pagination={{ perPage: 10, controls: false }}
                    popMenu={selected !== null ? true : false }
                    arrayMenu={[{ title: 'Delete', value: 'delete'},{ title: 'Cancel', value: 'cancel'}]}
                    toPop_id={selected ? selected._id : null}
                    cbOptionSelected={(option) => ActionFaq(option)}
                />
            }
            <button onClick={() => toogleOption('add')}>Add Faq</button>
            {
                option !== '' && resultOP.status === '' &&
                <form className="formVertFlex justWidth98 marginsTB" onSubmit={sendFaq}>
                    <label htmlFor="active">Active</label>
                    <input type="checkbox" onChange={(e) => updateState("faq", "active", e.target.checked)} defaultChecked={faq.active} required />
                    <label htmlFor="category">Category</label>
                    <select name="category" onChange={(e) => updateState("faq", e.target.name, e.target.value)} required>
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
                    <input name="title" onChange={(e) => updateState("faq", e.target.name, e.target.value)} required />
                    <ul>
                        {
                            questions_list.map(questionItem => {
                                return (
                                    <li key={questionItem.question}>
                                        <div className="standardDivRowFullWAuto justAligned">
                                            <p>Q: {questionItem.question}</p>
                                            <p>A: {questionItem.answer}</p>
                                            <button type='button' className="minibtnSmallText justiAlig" onClick={() => removeQuestion(questionItem)}>rem</button>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                    <label htmlFor="question">Question:</label>
                    <input name="question" onChange={(e) => updateState("question", e.target.name, e.target.value)} required />
                    <label htmlFor="answer">Answer:</label>
                    <input name="answer" onChange={(e) => updateState("question", e.target.name, e.target.value)} required />
                    <div className="marginsTB standardDivRowFullW justAlignedSpaceAround">
                        <button type='button'>cancel</button>
                        <button type='button' onClick={addQuestion}>Add</button>
                    </div>

                    
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
                    </div>
                </form>
            }
            {
                resultOP.status !== '' &&
                <div className="marginsTB">
                    <h2>JAB says, operation: {resultOP.status}</h2>
                    <p>{resultOP.message}</p>
                    <button onClick={() => setResultOP(initialResultOp)}>Ok</button>
                </div>
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