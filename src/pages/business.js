import React from 'react';
//components
import Layout from '../components/layout';

const Business = () => {
    return (
        <Layout>
            <div className="businessPageCont">
                <h1>Business Page</h1>
                <h1>TODO</h1>
                <p>The idea I have in mind is this one:</p>
                <p>Create a model page. I.e: headers, image, paragraphs.</p>
                <p>Each one of this models can de edited and ordered with a "page name", "page link", etc. Almost same logic as the blogs</p>
                <p>But we can use those pages to add content, so the admins can edit that info as they want.</p>
                <p>The faster way would be just TELL ME what content you want, i.e: FAQ page, ABOUT page, etc, give me some ideas about the content or let me know if I must copy same model/content from anywhere.</p>
            </div>
        </Layout>
    )
}

export default Business;