import React, { useState, useEffect } from 'react';
import { check } from '../../utils/helpers';
import Btnclosemin from '../btns/btncloseMin';
import Btnswitch from '../btns/btnswitch';
import Menuhover from '../interactions/menuhover';
import Loader from '../loader';
import Fullsizeimg from '../interactions/fullsizeimg';
import Tablinator from '../interactions/tablinator';

//constants
const buildHook = process.env.GATSBY_buildHook;
const adminEP = process.env.GATSBY_adminEP;
const itemsMenu = [
        {title: 'Manage Categories', cbProp: 'manageCat', subMenu: [ 'List Categories', 'Add New'],},
        {title: 'Manage Platform', cbProp: 'managePlat', subMenu: [ 'List Options TODO', 'Fire a Rebuild Hook']},
        {title: 'Logs', cbProp: 'manageLogs', subMenu: [ 'List Logs']},
]
const initialResponse = { status: '', message: '', result: '',};
{/* <li>List actual: Categories and sub cats.</li>
<li>Manage cats and sub-cats. Add new, Update.</li>
<li>Add, modify platform news(to load on especific sections of the page) and so on.</li>
<li>Log Web-Content activities of other admins.</li> */}

// as a guide from schema:
// name: {
//     type:String,
//     unique: true,
// }, 
// title: String,
// subtitle: String,
// query: {
//     type:String,
//     unique: true,
// },
// sub_category: [String],
// image: String, 
// hideOnLoggin: Boolean, 
// link: Boolean,
// active: Boolean,

const Managewebcontent = () => {
    const initialCat = {
        name: "", 
        title: "",
        subtitle: "",
        query: "",
        sub_category: [],
        file: File, 
        active: Boolean,
    };
    const userdata = check();
    const [categories, setCategories] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [errorImageIcon, setErrorImageIcon] = useState(false);
    const [response, setResponse] = useState(initialResponse);
    const [loadingData, setLoadingData] = useState(false);
    const [showImageFull, setShowImageFull] = useState(false);
    const [errorValidation, setErrorValidation] = useState({
        error: false, message: '',
    })
    const [category, setCategory] = useState(initialCat)
    const [option, setOption] = useState("");

    //functions/CB
    const clickedOnMenu = (menu) => {
        console.log('Clicked on', menu);
        if(menu === "Add New"){
            setShowEditor(true);
            setSelectedCategory(null);
            setCategory(initialCat);
        }else{
            setOption(menu);
        }
    }
    const editSelected = (cat) => {
        console.log(cat);
        setShowEditor(false);
        setSelectedCategory(cat);
        updateValue("cat","name", cat.name);
        updateValue("cat","query", cat.query);
        updateValue("cat","title", cat.title);
        updateValue("cat","subtitle", cat.subtitle);
        updateValue("cat","sub_category", cat.sub_category);
        updateValue("cat","active", cat.active);
    }
    const updateData = () => {
        event.preventDefault();
        setLoadingData(true);
        const formdata = new FormData();
        formdata.append("title", category.title); 
        formdata.append("subtitle", category.subtitle);
        formdata.append("sub_category", JSON.stringify(category.sub_category));
        formdata.append("active", category.active);
        if(category.file !== undefined ||  category.file.name ){
            formdata.append("file", category.file);
        }
        console.log('Sending for Update:', category); 
        const headers = { 'x-access-token': userdata.token, 'query':  JSON.stringify({ name: category.name, query: category.query })}
        postData(adminEP+"updateCat",formdata, headers)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setResponse({ status: response.status, result: response.result, message: 'Category Updated.' });
                setShowEditor(false);
                setSelectedCategory(null);
                getAllCats();
                setTimeout(() => setResponse(initialResponse),6000);
            }else if(response.status === 'failed'){
                setResponse({ status: response.status, message: response.message });
                setTimeout(() => setResponse({ status: '', message: ''}),6000);
            }
            setLoadingData(false);
        }).catch(error => {
            console.log('Error fecthing category data on BE.', error);
            setLoadingData(false);
        });
    }
    const processData = (event) => {
        //TODO handle validations of data.
        event.preventDefault(); 
        if(category.file === undefined ||  !category.file.name ){
            return setErrorValidation({ error: true, message: 'For each Category an Image must be set!'});
        }//else process it as a post request using a formdata.
        setLoadingData(true);
        const formdata = new FormData();
        formdata.append("name", category.name);
        formdata.append("title", category.title); 
        formdata.append("subtitle", category.subtitle);
        formdata.append("query", category.query);
        formdata.append("sub_category", JSON.stringify(category.sub_category));
        formdata.append("file", category.file);
        formdata.append("active", category.active);
        console.log('Sending:', category); 
        const headers = { 'x-access-token': userdata.token, 'query':  JSON.stringify({ name: category.name, query: category.query })}
        postData(adminEP+"addCat",formdata, headers)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setResponse({ status: response.status, result: response.result, message: 'New Category created.' });
                setShowEditor(false);
                getAllCats();
                setTimeout(() => setResponse(initialResponse),6000);
            }else if(response.status === 'failed'){
                setResponse({ status: response.status, message: response.message });
                setTimeout(() => setResponse({ status: '', message: ''}),6000);
            }
            setLoadingData(false);
        }).catch(error => {
            console.log('Error fecthing category data on BE.', error);
            setLoadingData(false);
        });
    }
    const toogleActive = (cen) => {
        // console.log('cen:',cen);
        updateValue('cat',"active",cen);
    }
    const setOptions = (opt) => {
        setOption("editCats")
        setOption("");
    }
    function updateValue(item,name,value){
        // console.log(`item:${item},name:${name},value:${value}`);
        if(item === 'cat'){
            // TODO handle the validations
            if(name === 'name'){
                const query = String(value).split(" ")[0].toLocaleLowerCase();
                setCategory(prevState => { return {...prevState, ['query']: query}});
            }
            const val = (name === "sub_category") ? String(value).split(",") : value;
            // if(name === "sub_category") { console.log(val)};
            // console.log(`setting name:${name},value:${val} - ${typeof val}`);
            setCategory(prevState => { return {...prevState, [name]: val}});
        }
    }
    const deleteCat = (catId) => {
        setLoadingData(true);
        const answer = window.confirm('Please proceed with caution as you will affect the website when showing categories.\nAre you sure to delete it?');
        if(answer){
            console.log(`Deleting Category ID:${catId} on BE!`);
            const headers =  { 'x-access-token': userdata.token, 'catid': catId };
            postData(adminEP+"deleteCat",{}, headers)
            .then(response => {
                console.log(response);
                if(response.status === 'sucess'){
                    setResponse({ status: 'Sucessfully Deleted.', message: `The Category was deleted.`});
                    setSelectedCategory(null);
                    getAllCats();
                    setTimeout(() => setResponse(initialResponse),6000);
                }
                setLoadingData(false);
            }).catch(error => {
                console.log('Error on deletion of category.',error);
                setLoadingData(false);
            });
        }
    }
    const fireBuild = () => {
        const answer = window.confirm('We are about to Fire a Build on CDN, this action will be recorded on BE.\nShall we proceed?');
        if(answer){
            // TODO send this info,time,admin_data to OPLogger
            setOption("");
            setLoadingData(true);
            postFire(buildHook)
            .then(response => {
                console.log(response);
                if(response.status === 200 && response.statusText === "OK"){
                    alert('Successfully sent/received the build by Netlify.\nJust wait for the email success notification.\nAfter confirming the mail check lives changes on JAB.');
                    setLoadingData(false);
                }
            })
            .catch(error => {
                setLoadingData(false);
                alert('Error when firing Build Hook.' + "\n" + error);
            });
        }
    }
    function getAllCats(){
        setLoadingData(true);
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ query: 'all'})};
        getData(adminEP+"getCats", headers)
        .then(response => {
            console.log(response);
            if(response.status = 'sucess'){ setCategories(response.result)};
            setLoadingData(false);
        }).catch(err => {
            console.log('Error while fetching data from Admins BE', err);
            setLoadingData(false);
        })
    }
    const uploadedImage = React.useRef(null);
    const selectedImgFile = (event) => {
        if(event.target.files === null){ return console.log('User cancelled uploading image!')}
        const imgFile = event.target.files[0];
        console.log(imgFile);
        if(imgFile.type === "image/jpeg" || imgFile.type === "image/png"){
            const { current } = uploadedImage;
            current.file = imgFile;
            const reader = new FileReader();
            reader.onload = e => {
                current.src = e.target.result;
                // now test if the aspect ratio is 1 so the image is square if not...not allowed as icon.
                const img = new Image();
                img.src = e.target.result;
                img.onload = function(){
                    const imgW = img.width;
                    const imgH = img.height;
                    const ar = imgW / imgH;
                    console.log(`W:${imgW},H:${imgH}. AR:${ar.toString()}`);
                    if(ar >= 1.4){
                        console.log(`Passed`);
                        setErrorImageIcon(false);
                    }else{
                        console.log('Not passed!');
                        setErrorImageIcon(true);
                    }
                };
            };
            reader.readAsDataURL(imgFile);
            //now we pass the file 
            updateValue('cat','file',event.target.files[0]);
            setErrorValidation( { error: false, message: 'Nothing for now :D'});
        }else{
            alert('File Must be Image type: jpeg/png.');
            return null
        }
    }
    /////////DATA fecthing////////////
    async function getData(url = '', headers) { 
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: headers,
        });
        return response.json(); 
    };
    async function postData(url = '', formdata, headers) { 
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: headers,
            body: formdata,
        });
        return response.json(); 
    };
    async function postFire(url = '') { 
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            body: {},
        });
        return response; 
    };
    ///////////////////////////////////////
    //END functions/CB

    //load on init
    useEffect(() => {
        getAllCats();
    }, []);
    //END load on init

    //load on every state change
    //for testing TO delete later on
    // useEffect(() => {
    //     if(category){
    //         console.log(category);
    //     }
    // }, [category]);
    //END load on every state change
    return (
        <div className="standardContentMargin">
            <ul>
                <li>TODO here</li>
                <li>As an option to handle the blog.</li>
                <li>Use the editor u did and the admin signs with his key to post blog posts under the desinged tags</li>
                <li>JAB-annoucements -> goes into all dashboards</li>
                <li>JAB-admins -> goes into admins and so on.</li>
                <li>JAB-promo -> index page and so on.</li>
            </ul>
            <Menuhover items={itemsMenu} clickedSubItemCB={clickedOnMenu} xtraclassCSS={"jusBordersRounWhiteBack"}/>
            {
                option === "List Categories" && categories &&
                <div>
                <Tablinator items={categories} toShow={['name','title','query','active']}
                    clickedSubItemCB={(item) => editSelected(item)}
                />
                {/* <table className="tablePortPublic smallText marginsTB relativeDiv">
                    <tbody>
                    <tr className="trTablePortP">
                        <th>Name</th>
                        <th>Title</th>
                        <th>Query</th>
                        <th>Sub categories count</th>
                        <th>Active</th>
                    </tr>
                {
                categories.map(cat => {
                return (
                        <tr key={cat._id} className="trTableWhite standardLiHovered" onClick={() => editSelected(cat)} >
                            <td>{cat.name}</td>
                            <td>{cat.title}</td>
                            <td>{cat.query}</td>
                            <td>{cat.sub_category.length}</td>
                            <td>{cat.active ? "YES":"NO"}</td>
                        </tr>
                        )
                    })
                }
                </tbody>
                </table> */}
                <button onClick={() => setOption("")}>close</button>
                </div>
            }
            {
                loadingData &&
                <div className="standardDiv30Percent justMargin0auto">
                    <Loader logginIn={loadingData} typegif={"blocks"}/>
                </div>
            }
            {
                (response.status !== '') &&
                <div>
                    <p>{response.status}</p>
                    <p>{response.message}</p>
                </div>
            }
            {
                !showEditor && selectedCategory &&
                <div className="marginsTB">
                    <p>Edit Category</p>
                    { errorValidation.error && <p className="errorValidation">{errorValidation.message}</p>}
                    <form onSubmit={updateData} className="marginsTB">
                        <div className="standardFormColHorFullWAutoH relativeDiv colorX marginBottom">
                            <label htmlFor="name">Category Name:</label>
                            <input name="name" type="text" value={selectedCategory.name} disabled />
                            <label htmlFor="title">Title:</label>
                            <input name="title" type="text"
                                required pattern="[&\w\s]{3,55}" title="Letters, numbers and & characters, are allowed. 3 to 55 max."
                                // defaultValue={selectedCategory.title}
                                value={category.title}
                                onChange={(e) => {updateValue("cat",e.target.name,e.target.value)}}
                            />
                            <label htmlFor="subtitle">Sub Title:</label>
                            <input name="subtitle" type="text" 
                                required pattern="[&\w\s]{3,25}" title="Letters, numbers and & characters, are allowed. 3 to 25 max."
                                // defaultValue={selectedCategory.subtitle}
                                value={category.subtitle}
                                onChange={(e) => {updateValue("cat",e.target.name,e.target.value)}}
                            />
                            <p>Query: {category.query}</p>
                            <label htmlFor="image"></label>
                            <img 
                                src={selectedCategory.thumb} 
                                className="smallImageMax120x120" 
                                ref={uploadedImage} 
                            />
                            <input type="file" 
                                    onChange={selectedImgFile} 
                                    accept="image/*"
                                    multiple={false} 
                            />
                            {
                                errorImageIcon && 
                                <p className="warningTextSmall">We do recommend using an image with different sizes for height/width, please choose an image as 500px by 250px//1000px by 768px//2000px by 1024px.</p>
                            }
                            <label htmlFor="sub_category">Sub Categories:</label>
                            <input name="sub_category" placeholder="Add them separate by commas please."
                                // defaultValue={selectedCategory.sub_category.join(",")}
                                value={category.sub_category.join(",")}
                                onChange={(e) => {updateValue("cat",e.target.name,e.target.value)}}
                            />
                            <div className="standardDivRowFullW">
                                <Btnswitch showValueDevMode={true} sideText={"Active to show(true by default)"} btnAction={toogleActive} initialValue={selectedCategory.active} />
                            </div>
                        </div>
                        <div className="standardDisplayJusSpaceAround ">
                            <button type="submit">Update Category</button>
                            <button type="button" onClick={() => deleteCat(selectedCategory._id)}>Delete</button>
                            <button type="button" onClick={() => setSelectedCategory(null)}>cancel</button>
                        </div>
                    </form>
                </div>
            }
            {
                showEditor && !selectedCategory &&
                <div className="marginsTB">
                    { errorValidation.error && <p className="errorValidation">{errorValidation.message}</p>}
                    <form onSubmit={processData} className="marginsTB">
                        <div className="standardFormColHorFullWAutoH relativeDiv colorX marginBottom">
                            <label htmlFor="name">Category Name:</label>
                            <input name="name" type="text" onChange={(e) => updateValue("cat",e.target.name,e.target.value)} 
                                required pattern="[&\w\s]{3,25}" title="Letters, numbers and & characters, are allowed. 3 to 25 max."
                            />
                            <label htmlFor="title">Title:</label>
                            <input name="title" type="text" onChange={(e) => updateValue("cat",e.target.name,e.target.value)}
                                required pattern="[&\w\s]{3,55}" title="Letters, numbers and & characters, are allowed. 3 to 55 max."
                            />
                            <label htmlFor="subtitle">Sub Title:</label>
                            <input name="subtitle" type="text" onChange={(e) => updateValue("cat",e.target.name,e.target.value)}
                                required pattern="[&\w\s]{3,25}" title="Letters, numbers and & characters, are allowed. 3 to 25 max."
                            />
                            <p>Query: {category.query}</p>
                            <label htmlFor="image"></label>
                            <img 
                                // src={nftMongo.thumb} 
                                className="smallImageMax120x120" 
                                ref={uploadedImage} 
                            />

                            <input type="file" 
                                    onChange={selectedImgFile} 
                                    accept="image/*"
                                    multiple={false} 
                            />
                            {
                                errorImageIcon && 
                                <p className="warningTextSmall">We do recommend using an image with different sizes for height/width, please choose an image as 500px by 250px//1000px by 768px//2000px by 1024px.</p>
                            }
                            <label htmlFor="sub_category">Sub Categories:</label>
                            <input name="sub_category" placeholder="Add them separate by commas please." onChange={(e) => updateValue('cat',e.target.name,e.target.value)} />
                            <div className="standardDivRowFullW">
                                <Btnswitch showValueDevMode={true} sideText={"Active to show(true by default)"} btnAction={toogleActive} initialValue={true} />
                            </div>
                        </div>
                        <div className="standardDisplayJusSpaceAround ">
                            <button type="submit">Submit</button>
                            <button type="button" onClick={() => setShowEditor(false)}>close</button>
                        </div>
                    </form>
                </div>
            }
            {
                (option === "Fire a Rebuild Hook") &&
                <div>
                    <h3>Important: This action means to fire a deploy action on the netlify CDN.</h3>
                    <p>As the site is being built, anytime we modify the categories or any other feature that affects the UI platform, we must fire a deploy in order to apply the changes.</p>
                    <h3>What will happen?</h3>
                    <p>After submitting the fire event, a special hook activates the deploy.</p>
                    <p>Under any possible error, the CDN will not proceed and an error log will be created and the dev or assigned person on the netflify CDN, will be notified automatically.</p>
                    <h3>After a Successfull Deployment</h3>
                    <p>A mail is sent to your account or the admin in charge.</p>
                    <p>A log will be created on JAB BE and you will be able to see the reflected changes live.</p>
                    <h3>How do I check?</h3>
                    <p>Go to the admin's email, the one in charge of the deploys to confirm the success.</p>
                    <div className="standardDisplayJusSpaceAround ">
                        <button onClick={fireBuild}>Proceed, I know what I am doing</button>
                        <button type="button" onClick={() => setOption("")}>cancel</button>
                    </div>
                </div>
            }
            {/* {
                showImageFull && selectedCategory &&
                <Fullsizeimg imgUrl={selectedCategory.image}/>
            } */}
        </div>
    )
}

export default Managewebcontent;
