import React from 'react';

//components
import Layout from '../components/layout';

// TODO: pass the current category/sub category as context so the page
// will display the required category

const Explore = (props) => {
    const query  = props.location.search || null;
    // console.log(props);

    return (
        <Layout>
            <div>
                <h1>Explore Page - query={query}</h1>
                <h2>TODO</h2>
            </div>
        </Layout>
    )
}

export default Explore;