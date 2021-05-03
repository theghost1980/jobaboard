import React, { useState, useEffect } from 'react';
import { check } from '../../../utils/helpers';
import Loader from '../../loader';
import { useForm } from 'react-hook-form';
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from 'gatsby-image';
import Mesaggertop from '../../messages/mesaggertop';
import Btnoutlink from '../../btns/btnoutlink';

// constants
const portfolio_EP = process.env.GATSBY_portfolioEP;
const startYear = 1950;

const Manageportfolio = () => {
    const userdata = check();
    const { register, handleSubmit, errors } = useForm(); // initialize the hook

    const [noPortSet, setNoPortSet] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [languages, setlanguages] = useState([]);
    const [language, setLanguage] = useState(null);
    const [level, setLevel] = useState(null);
    const [skill, setSkill] = useState(null);
    const [skillLevel, setSkillLevel] = useState(null);
    const [skills, setskills] = useState([]);
    const [educationItem, setEducationItem] = useState([]);
    const [certificationItem, setCertificationItem] = useState([]);
    //as object complete down bellow
    const [education, setEducation] = useState(null);
    const [certification, setCertification] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState("");
    const time = new Date();
    const [portfolio, setPortfolio] = useState({
        username: userdata.username,
        story_line: "",
        description: "",
        languages:[],
        skills:[],
        education: [],
        certifications: [],
        updatedAt: time.toString(),
    });

    //graphql queries
    const data = useStaticQuery(graphql`
    query {
        closeIcon: file(relativePath: {eq: "decline.png"}) {
            childImageSharp {
                fixed(width: 20) {
                    ...GatsbyImageSharpFixed_withWebp
                }
            }
        }
        countries_Languages:  allMongodbGatsbyLangs(sort: {fields: name}) {
            edges {
                node {
                    id
                    name
                    nativeName
                    code
                }
            }
        }
        countries_List: allMongodbGatsbyCountries(sort: {fields: name}) {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
    `);
    //end grapqhql queries

     //fecthing data
     async function getData(url = '') {
        const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-access-token': userdata.token,
        },
        });
        return response.json(); 
    };
     //now update data with put + file, using the same as the uploadimage
     async function updateDataPortfolio(url = '', data = {}) {
        //  TODO: after talking to aggroed
        // if we may need support images as well
        // for now only the fields
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token,
                'data': JSON.stringify(data),
            },
            // body: formData,
        });
        return response.json(); 
    };
    ///////END post fetch
    //end fetching data

    //set a field on profile:
    function setValueOnPortfolio(name,value){
        setPortfolio(prevState => { return {...prevState, [name]: value}})
    }
    function addlanguages(value){
        setlanguages(prevState => [ ...prevState, value]);
    }
    function addskills(value){
        setskills(prevState => [ ...prevState, value]);
    }
    function addEducationItem(value){
        setEducationItem(prevState => [ ...prevState, value]);
    }
    function setEducationObject(name,value){
        setEducation(prevState => { return {...prevState, [name]: value}})
    }
    function addCertificationItem(value){
        setCertificationItem(prevState => [ ...prevState, value]);
    }
    function setCertificationObject(name,value){
        setCertification(prevState => { return {...prevState, [name]: value}})
    }

    //to test
    // useEffect(() => {
    //     console.log(portfolio);
    // },[portfolio])
    // end to test

    useEffect(()=> {
        setValueOnPortfolio("languages",languages);
    },[languages]);

    useEffect(()=> {
        setValueOnPortfolio("skills",skills);
    },[skills]);

    useEffect(()=> {
        setValueOnPortfolio("education",educationItem);
    },[educationItem]);

    useEffect(()=> {
        setValueOnPortfolio("certifications",certificationItem);
    },[certificationItem]);

    useEffect(() => {
        setLoadingData(true);
        getData(portfolio_EP+"getMyPort")
        .then(response => {
            console.log(response);
            if(response.message && response.message === "No portolio for this user"){
                setNoPortSet(true);
            }else{
                console.log(response);
                // console.log(response[0]);
                setTheProfile(response);
            }
            setLoadingData(false);
        })
        .catch(error => {
            console.log('Error fetching portfolio info from BE', error);
            setLoadingData(false);
        });
    },[]);

    // useEffect(()=> {
    //     console.log(portfolio);
    // },[portfolio]);

    // set initial value of profile when found
    function setTheProfile(response){
        setlanguages(response.languages);
        setskills(response.skills);
        setEducationItem(response.education);
        setCertificationItem(response.certifications);
        setValueOnPortfolio("story_line",response.story_line);
        setValueOnPortfolio("description",response.description);
    }

    //handling messages/errors to user
    function setUserMessage(msg){
        setMessage(msg);
        setShowMessage(true);
    }

    // /handleLanguage
    const addLanguage = () => {
        const langItem = { language: language, level: level};
        if(langItem.language !== "" && langItem.level !== "" && langItem.language !== null && langItem.level !== null){
            if(languages.length < 4){
                //search if repeated lang
                const founded = languages.filter(lang => lang.language === langItem.language);
                if(!founded.length > 0){
                    addlanguages(langItem);
                }else{
                    // console.log("Language already added. Choose another!");
                    setUserMessage("Language already added. Choose another!");
                }
            }else{
                // console.log("Just 4 languages please.");
                setUserMessage("Just 4 languages please.");
            }
        }else{
            setUserMessage("Please Select a Language, then add level.");
        }
    }

    // /handle Skills
    const addSkill = () => {
        const skillToAdd = { skill: skill, experience: skillLevel};
        // console.log(skillToAdd)
        if(skillToAdd.skill !== "" && skillToAdd.experience !== "" && skillToAdd.skill !== null && skillToAdd.experience !== null){
            if(skills.length < 10){
                //search if repeated lang
                const founded = skills.filter(skill => skill.skill === skillToAdd.skill);
                if(!founded.length > 0){
                    addskills(skillToAdd);
                }else{
                    // console.log("Skill already added. Choose another!");
                    setUserMessage("Skill already added. Choose another!");
                }
            }else{
                // console.log("Just 10 Skills please.");
                setUserMessage("Just 10 Skills please.");
            }
        }else{
            setUserMessage("Please write a Skill, then add level.");
        }
    }
    // /handle Education
    const addEducation = () => {
        //education have fields. c/y/d
        // educationItem is the array
        //  console.log(education)
        if(education.country !== "" && education.degree !== "" && education.year !== "" && education.country !== null && education.degree !== null && education.year !== null){
            if(educationItem.length < 3){
                //search if repeated lang
                const founded = educationItem.filter(educ => educ.degree === education.degree);
                if(founded.length === 0){
                    addEducationItem(education);
                }else{
                    // console.log("Degree already added. Choose another!");
                    setUserMessage("Degree already added. Choose another!");
                }
            }else{
                // console.log("Just 3 education details please.");
                setUserMessage("Just 3 education details please.");
            }
        }else{
            setUserMessage("Please Select/write all fields.");
        }
    }
    // /handle certification
    const addCertification = () => {
        //certification have fields. c/y/d
        // certificationItem is the array
        //  console.log(certification)
        if(certification.award !== "" && certification.certified_on !== "" && certification.year !== "" && certification.award !== null && certification.certified_on !== null && certification.year !== null){
            if(certificationItem.length < 3){
                //search if repeated lang
                const founded = certificationItem.filter(cert => cert.award === certification.award);
                if(founded.length === 0){
                    addCertificationItem(certification);
                }else{
                    // console.log("Certification already added. Choose another!");
                    setUserMessage("Certification already added. Choose another!");
                }
            }else{
                // console.log("Just 3 Certifications please.");
                setUserMessage("Just 3 Certifications please.");
            }
        }else{
            setUserMessage("Please Select/write all certification fields.");
        }
    }

    // onSubmit
    const onSubmit = (data) => {
        if(portfolio.description === null || portfolio.description === "") { return setMessage("Please fill Description.")}
        console.log('Data to send');
        console.log(portfolio);
        //send the data to BE
        updateDataPortfolio(portfolio_EP+"createUpdate",portfolio)
        .then(response => {
            //({ status:'updated',result: found}); { status:'created',result: portfolio}
            if(response.status === "updated" || response.status === "created"){
                console.log(`Profile:${response.status}`);
                console.log(response);
                setTheProfile(response.result);
            }
        })
        .catch(error => {
            console.log('Error sending data portfolio to BE',error);
        });
    }

    // remove lang
    const removeLang = (lang) => {
        const newArrray = languages.filter(item => item.language !== lang.language);
        setlanguages(newArrray);
    }
    // remove skill
    const removeSkill = (skill) => {
        const newArrray = skills.filter(item => item.skill !== skill.skill);
        setskills(newArrray);
    }
    // remove education
    const removeEducation = (education) => {
        const newArrray = educationItem.filter(item => item.degree !== education.degree);
        setEducationItem(newArrray);
    }

    const removeCertification = (cert) => {
        const newArrray = certificationItem.filter(certif => certif.award !== cert.award);
        setCertificationItem(newArrray);
    }

    //create years array
    function years(){
        const thisYear = new Date().getUTCFullYear();
        var _years = [];
        for(let i=startYear; i <=thisYear; i++){
            _years.unshift(i.toString());
        }
        return _years;
    }

    const yearsArray = years();

    return (
        <div className="managePortfolioContainer justBottomMargin">
            <h2>My portfolio</h2>
            <div className="marginsTB">
                <Btnoutlink link={`/portfoliouser?query=${userdata.username}`} textLink={"Check Live/New tab."} toolTip={"It will open your portfolio on a new window tab"}/>
            </div>
            {
                loadingData &&
                    <div className="standardDivRowFlex100pX100pCentered">
                        <Loader logginIn={true} />
                    </div>
            }
            {
                showMessage && <Mesaggertop message={message} enableTime={true} timeToHide={2000} callBack={() => setShowMessage(false)}  />
            }
            {
                noPortSet &&
                <div>
                    <p>Looks like you have not set your portolfio yet.</p>
                    <p>Please feel free to update it bellow anytime.</p>
                </div>
            }
            {
                !loadingData &&
                    <div className="standardFlex100AutoH">
                         <form onSubmit={handleSubmit(onSubmit)} className="formColFlex90p">
                            <label htmlFor="story_line">Story line</label>
                            <input name="story_line"  onChange={(e)=>setValueOnPortfolio(e.target.name,e.target.value)} 
                                value={portfolio.story_line}
                            />
                            <label htmlFor="description">Description</label>
                            <textarea name="description" onChange={(e)=>setValueOnPortfolio(e.target.name,e.target.value)} 
                                value={portfolio.description}
                            />
                            <div className="standardFlexColBordered miniMarginTB relativeDiv miniPaddingTB">
                                {/* <div className="standardSmallDivAbs">
                                    <button>Add New</button>
                                </div> */}
                                {
                                    (languages && languages.length > 0) &&
                                        <ul className="standardUlHorMini">
                                            {
                                                languages.map(lang => {
                                                    return (
                                                        <li key={`${lang.language}-lang`} className="liMiniRow marginLeft">
                                                            <p className="noMargins">{lang.language}/{lang.level}</p>
                                                            <div onClick={() => removeLang(lang)}>
                                                                <Img fixed={data.closeIcon.childImageSharp.fixed} className="pointer"/>
                                                            </div>
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                }
                                <label htmlFor="language">Language</label>
                                <select name="language" onChange={(e)=>setLanguage(e.target.value)}>
                                    <option defaultValue="Add Language"></option>
                                    {
                                        data.countries_Languages.edges.map(({ node:lang }) => {
                                            return (
                                                <option key={lang.id} value={lang.name}>{lang.name}</option>
                                            )
                                        })
                                    }
                                </select>
                                <label htmlFor="level">Language Level</label>
                                <select name="level" onChange={(e)=>setLevel(e.target.value)}>
                                    <option defaultValue="Language Level"></option>
                                    <option value="Basic">Basic</option>
                                    <option value="Conversational">Conversational</option>
                                    <option value="Fluent">Fluent</option>
                                    <option value="Native-Bilingual">Native-Bilingual</option>
                                </select>
                                <div>
                                    <button type="button" onClick={addLanguage}>Add</button>
                                    {/* <button>Cancel</button> */}
                                </div>
                                
                            </div>
                            <div className="standardFlexColBordered miniMarginTB relativeDiv miniPaddingTB">
                                {
                                    (skills && skills.length > 0) &&
                                        <ul className="standardUlHorMini">
                                        {
                                            skills.map(_skill => {
                                                return (
                                                    <li key={`${_skill.skill}-skills`} className="liMiniRow marginLeft">
                                                        <p className="noMargins">{_skill.skill}/{_skill.experience}</p>
                                                        <div onClick={() => removeSkill(_skill)}>
                                                            <Img fixed={data.closeIcon.childImageSharp.fixed} className="pointer"/>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                        </ul>
                                }
                                <label htmlFor="skill">Skill</label>
                                <input type="text" name="skill" onChange={(e)=>setSkill(e.target.value)} />
                                <label htmlFor="skillLevel">Skill Level</label>
                                <select name="skillLevel" onChange={(e)=>setSkillLevel(e.target.value)}>
                                    <option defaultValue="Skill Level"></option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Expert">Expert</option>
                                </select>
                                <div>
                                    <button type="button"  onClick={addSkill}>Add</button>
                                </div>
                                
                            </div>
                            <div className="standardFlexColBordered miniMarginTB relativeDiv miniPaddingTB">
                                {
                                    (educationItem && educationItem.length > 0) &&
                                        <ul className="standardUlHorMini">
                                        {
                                            educationItem.map(educ => {
                                                return (
                                                    <li key={`${educ.degree}-educ-degree`} className="liMiniRow marginLeft">
                                                        <p className="noMargins">{educ.degree}/{educ.year}</p>
                                                        <div onClick={() => removeEducation(educ)}>
                                                            <Img fixed={data.closeIcon.childImageSharp.fixed} className="pointer"/>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                        </ul>
                                }
                                <label htmlFor="country">Education Country</label>
                                <select name="country" onChange={(e)=>setEducationObject(e.target.name,e.target.value)}>
                                    <option defaultValue="Choose Country"></option>
                                    {
                                        data.countries_List.edges.map(({ node:country}) => {
                                            return (
                                                <option key={country.id} value={country.name}>{country.name}</option>
                                            )
                                        })
                                    }
                                </select>
                                <label htmlFor="degree">Degree</label>
                                <input type="text" name="degree" onChange={(e)=>setEducationObject(e.target.name,e.target.value)} />
                                <label htmlFor="year">Year</label>
                                <select name="year" onChange={(e)=>setEducationObject(e.target.name,e.target.value)}>
                                    <option defaultValue="Select Year"></option>
                                    {
                                        yearsArray.map(year => {
                                            return (
                                                <option key={`${year}-years-JAB`} value={year}>{year}</option>
                                            )
                                        })
                                    }
                                </select>
                                <div>
                                    <button type="button" onClick={addEducation}>Add</button>
                                </div>
                                
                            </div>
                            <div className="standardFlexColBordered miniMarginTB relativeDiv miniPaddingTB">
                                {
                                    (certificationItem && certificationItem.length > 0) &&
                                        <ul className="standardUlHorMini">
                                        {
                                            certificationItem.map(cert => {
                                                return (
                                                    <li key={`${cert.award}-cert-award`} className="liMiniRow marginLeft">
                                                        <p className="noMargins">{cert.award}/{cert.year}</p>
                                                        <div onClick={() => removeCertification(cert)}>
                                                            <Img fixed={data.closeIcon.childImageSharp.fixed} className="pointer"/>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                        </ul>
                                }
                                <label htmlFor="award">Certification Award</label>
                                <input type="text" name="award" onChange={(e)=>setCertificationObject(e.target.name,e.target.value)} />
                                <label htmlFor="certified_on">Certified On</label>
                                <input type="text" name="certified_on" onChange={(e)=>setCertificationObject(e.target.name,e.target.value)} />
                                <label htmlFor="award_year">Year</label>
                                <select name="award_year" onChange={(e)=>setCertificationObject("year",e.target.value)}>
                                    <option defaultValue="Select Year"></option>
                                    {
                                        yearsArray.map(year => {
                                            return (
                                                <option key={`${year}-years-cert-JAB`} value={year}>{year}</option>
                                            )
                                        })
                                    }
                                </select>
                                <div>
                                    <button type="button" onClick={addCertification}>Add</button>
                                </div>
                                
                            </div>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
            }
        </div>
    )
}

export default Manageportfolio;