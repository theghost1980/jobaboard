import React, { useState, useEffect } from 'react'; //jabCHA.png
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * This is a component to prevent non human interactions by solving simple maths problems.
 * @param {String} xtraClassCss optional an entra class.
 * @param {Function} cbResult mandatory to send back to parent the results.
 * @param {String} title - optional.
 * @param {Boolean} devMode - optional to debug on console.
 */

const Jabcha = (props) => {
    const { devMode, xtraClassCss, cbResult, title } = props;
    const [solution, setSolution] = useState({ machine: 0, user: 0});
    const [numbers, setNumbers] = useState({ one: 0, two: 0 });

    const data = useStaticQuery(graphql` query { jabpchatIcon: file(relativePath: {eq: "jabCHA.png"}) { childImageSharp { fixed(width: 150) {...GatsbyImageSharpFixed_withWebp} } }} `);
    //end grapqhl queries

    //functions/CB
    function updateState(name,value){
        setSolution(prevState => { return {...prevState, [name]: value }});
    }
    function randomThinking(n){ return Number((Math.random() * n).toFixed(0)); }
    const solveChallenge = (event) => {
        event.preventDefault();
        const solving = solution.machine === solution.user;
        if(solving){
            if(cbResult){ cbResult(solving) };
        }else{
            setNumbers({ one: randomThinking(10), two: randomThinking(68) });
        }
    }
    //END functions/CB

    //load on init
    useEffect(() => {
        setNumbers({ one: randomThinking(10), two: randomThinking(68) });
    },[]);
    //END load on init

    //load on state changes
    useEffect(() => {
        const solution_machine = numbers.one + numbers.two;
        if(devMode){ console.log('Settings, solution ', { numbers, solution_machine})};
        updateState("machine", solution_machine);
    },[numbers]);
    //END load on state changes

    return (
        <div className={`${xtraClassCss}`}>
            { title && <h2 className="textAlignedCenter">{title}</h2>}
            <div className="standardDivRowFullW">
                <div>
                    <Img fixed={data.jabpchatIcon.childImageSharp.fixed} />
                </div>
                <form onSubmit={solveChallenge} className="formVertFlex justRounded textAlignedCenter boxShadowBottom">
                    <p>Solve: {numbers.one} + {numbers.two}</p>
                    <label htmlFor="inp_solution">You Answer:</label>
                    <input type="text" className="standardContentMarginLR" name="inp_solution" required pattern="[0-9]{1,4}" title='Just Numbers 0 - 9. 4 characters max.' 
                        onChange={(e) => updateState("user", Number(e.target.value))}
                    />
                    <button className="btnMini3 justMargin0auto miniMarginTB" type="submit">Try</button>
                </form>
            </div>
        </div>
    )
}

export default Jabcha;
