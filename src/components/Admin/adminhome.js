import React from 'react';
import Visualizator from '../Blog/visualizator';

const blogtags = [
    {id: 'tagJAB-1', tag: 'test-general', description: 'Use this tag to post a test general related post', willAppearOn: 'None on JAB, hive-chain.'},
    {id: 'tagJAB-2', tag: 'announcement-admins', description: 'Use this tag to post an Annoucement only to admins of JAB.', willAppearOn: 'Admins Dashboard, hive-chain.'},
    {id: 'tagJAB-3', tag: 'general-annouces', description: 'Use this tag to post a General Annoucement on JAB.', willAppearOn: 'Index Page, Blog page, hive-chain.'},
    {id: 'tagJAB-4', tag: 'promotions', description: 'Use this tag to post a Promotion Annoucement on JAB.', willAppearOn: 'Blog page, hive-chain.'},
    {id: 'tagJAB-5', tag: 'jabers-dashboard', description: 'Use this tag to post Annoucements, promotions, etc related to JOBs/GIGs on JAB.', willAppearOn: 'Blog page, hive-chain, Each User Job Dashboard.'},
];
const arTags = [];
blogtags.forEach(tag => {
    arTags.push(tag.tag);
});
const Adminhome = () => {
    return (
        <div className="standardContentMargin">
            <h2>Admin Dashboard</h2>
            <h3>JAB Blog - Last Posts</h3>
            <Visualizator noFilter={false} hiveUser={"jobaboard"} limit={20} openMode={"onTopOfAll"} filter_tags={arTags}/>
        </div>
    )
}

export default Adminhome;
