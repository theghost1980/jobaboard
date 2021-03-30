import React, { useState, useEffect } from 'react';
import { useStaticQuery, graphql } from "gatsby"
import Img from 'gatsby-image';
import Mesaggertop from '../../messages/mesaggertop';

const Listhandler = (props) => {
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState("");

    const [languages, setlanguages] = useState([]);
    const [language, setLanguage] = useState(null);

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
    }`);
    //end grapqhql queries

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

    //handling messages/errors to user
    function setUserMessage(msg){
        setMessage(msg);
        setShowMessage(true);
    }

    return (
        <div className="standardFlexColBordered miniMarginTB relativeDiv miniPaddingTB">
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
            </div>
        </div>
    )
}

export default Listhandler;