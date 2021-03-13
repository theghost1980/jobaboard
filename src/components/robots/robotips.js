import React, { useState, useEffect, useRef } from 'react';
import { useStaticQuery, graphql } from "gatsby"
import {Typewriter} from 'react-typewriting-effect';
import 'react-typewriting-effect/dist/index.css'

var timer;

const Robotips = (props) => {
    //timing milliseconds i.e 2500ms
    const { timming, dialogsProp } = props;
    const [counter, setCounter] = useState(0);
    const [dialogs, setDialogs] = useState(dialogsProp);

    useEffect(() => {
        if(counter === dialogs.length){
            setCounter(0);
        }
    },[counter]);

    useEffect(() => {
        //on load we create a timer to move the counter
        function clockIt(){
            timer = setInterval(function increase(){
                    setCounter(prevState => prevState + 1);
            },timming);
        }
        //calling clock
        clockIt();
        return () => {
            console.log("unmount");
            clearInterval(timer);
        }
    },[])
    // useEffect(() => () => {
    //     console.log("unmount");
    //     clearInterval(timer);
    // }, []);
    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            testWebpAnim: file(relativePath: {eq: "robot_smiling.webp"}) {
                publicURL
            }
        }
    `);
    //end grapqhql queries
    return (
        <div>
            <img src={data.testWebpAnim.publicURL} className="miniGifABS" />
            <span className="shadowBottom" />
            <div className="dialogCont">
                <div className="standardContentMarginMini animFade">
                    {/* <Typewriter
                        string={dialogs[counter]}
                        delay={50}
                    /> */}
                    <p className="xSmalltext">{dialogs[counter]}</p>
                </div>
            </div>
        </div>
    )
}

export default Robotips;