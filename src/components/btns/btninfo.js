import React, { useEffect, useState } from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Display the msg prop when hover on it.
 * @param {String} msg - Message to display when clicked/Hoover.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} xclassMsg - Optional apply an extra class for the msg div.
 * @param {String} size - Optional The size of the image icon, by default 30px. Options: "mini"(18px)
 */

const Btninfo = (props) => {
    const { msg, xclassCSS, size, xclassMsg } = props;

    const data = useStaticQuery(graphql`
        query{
            closeIcon: file(relativePath: {eq: "info.png"}) {
                childImageSharp {
                    fixed(width: 30) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            closeIconMini: file(relativePath: {eq: "info.png"}) {
                childImageSharp {
                    fixed(width: 18) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries

    const [longMsg, setLongMsg] = useState(false);

    //to load on init
    useEffect(() => {
        if(String(msg).length >= 80){
            setLongMsg(true);
        }
    },[]);
    //END to load on init

    // const clicked = () => {
    //     if(btnAction){
    //         btnAction();
    //     }else{
    //         console.log('Info was shown.');
    //     }
    // };
    const sourceIcon = size ? data.closeIconMini.childImageSharp.fixed : data.closeIcon.childImageSharp.fixed;

    return (
        <div className={`${xclassCSS} marginTopRigthMin pointer relativeDiv topRight absInlineDisplay activeDisplay`}>
            <Img fixed={sourceIcon} />
            <div className={`${xclassMsg} justopacity1 ${longMsg ? 'smallAbsDivDisNoneWidth240pPlain' : 'smallAbsDivDisNone120pPlain'} normalTextSmall justRight120pTop0p justBorders justRounded miniPaddings whiteBack animFade justTopZindex`}>
                {msg}
            </div>
        </div>
    )
}

export default Btninfo;