import React, { useEffect, useState } from 'react';
//components
import Layout from '../components/layout';
import Visualizator from '../components/Blog/visualizator';
import Btnoutlink from '../components/btns/btnoutlink';

//constants
const blogtags = [
    {id: 'tagJAB-1', tag: 'test-general', description: 'Use this tag to post a test general related post', willAppearOn: 'None on JAB, hive-chain.'},
    {id: 'tagJAB-2', tag: 'announcement-admins', description: 'Use this tag to post an Annoucement only to admins of JAB.', willAppearOn: 'Admins Dashboard, hive-chain.'},
    {id: 'tagJAB-3', tag: 'general-accounces', description: 'Use this tag to post a General Annoucement on JAB.', willAppearOn: 'Index Page, Blog page, hive-chain.'},
    {id: 'tagJAB-4', tag: 'promotions', description: 'Use this tag to post a Promotion Annoucement on JAB.', willAppearOn: 'Blog page, hive-chain.'},
    {id: 'tagJAB-5', tag: 'jabers-dashboard', description: 'Use this tag to post Annoucements, promotions, etc related to JOBs/GIGs on JAB.', willAppearOn: 'Blog page, hive-chain, Each User Job Dashboard.'},
];
//END constants

const Blog = (props) => {
    const query  = props.location.search;
    const [loadFilter, setLoadFilter] = useState(null);

    //to load on Init
    useEffect(() => {
        if(query){
            console.log('Received prop to work with:');
            console.log(query);
        }
    },[]);
    //END to load on Init

    return (
        <Layout>
            <div className="businessPageCont jutsMinHeight420px bgBlocksBlueSofter justiAlig justRounded">
                <h1 className="textAlignedCenter">Blog Page</h1>
                <Visualizator 
                    xclassCSS={"addUtlBlog justiAlig justDisplayFlex"}
                    xclassCSSUL={"addUtlBlog justFlexWrap justiAlig"}
                    xclassCSSLi={"activeSelected marginRightX2 justMarginBottomX2"}
                    hiveUser={'jobaboard'}
                    limit={100}
                    filter_tags={blogtags.map(({ tag }) => tag)}
                    openMode={"onTopOfAll"}
                    hideRefreshBtn={false}
                />
            </div>
            <div className="standardDivRowFullW justiAlig">
                <p className="normalTextSmall">Blog Powered By Hive Blockchain - </p>
                <Btnoutlink xtraIcon={true} xclassCSS={"normalTextSmall justWidth200"} textLink={"Check it out"} link={"https://hive.blog/"}/>
            </div>
        </Layout>
    )
}

export default Blog;