import React from 'react';
//components
import Layout from '../components/layout';
import { Link } from 'gatsby';
// import { Link, useStaticQuery, graphql } from 'gatsby';
// import Img from 'gatsby-image';

const faq_list = [
    { id: 1, question: 'What is JAB?', answer: 'Job A Board is a job platform that offers employees and employers to find professional talent to meet their employment needs.'},
    {id: 2, question: 'What makes us different from the rest?', answer: "Our focus is by the people and for the people. Ordinary people who don't have to deal with complicated banking and international bank account management. We are different because we make use of non fungible tokens or NFTs."},
    { id: 3, question: 'Does this mean I will work for free at JAB?', answer: 'Not at all. Your time is highly valued at JAB. By making use of NFTs, you create your own currency and give it a price. No banks, no middlemen and best of all, at the speed of the Blockchain.'},
    {id: 4, question: 'If I do not have a bank account due to my country, can I post jobs?', answer: 'Of course you can. You will act as your own bank. Your tokens = your money = economic freedom.'},
    { id: 5, question: 'What types of jobs can I post?', answer: 'Virtually everything you are able to offer to the public and to companies. From web design to online product quotations. Take a look at the categories we have created for you.'},
    {id: 6, question: 'If I want to start publishing today, what should I do?', answer: 'You must have an account on our blockchain, called HIVE. This account can be opened for free if you navigate to the signup section. After that, you can start creating your own NFT and start publishing.'},
    {id: 7, question: 'Do you have online support?', answer: "We have staff ready to help you during any possible error in the platform. Our response times vary between 2 - 12 hours, depending on the ticket queue. But don't worry, we keep records of important transactions so we will always solve the problem."},

];

const Faq = () => {
    //graphql queries
    // const data = useStaticQuery(graphql`
    //     query {
    //         signInImg: file(relativePath: {eq: "edited-jobaboard.svg"}) {
    //             publicURL
    //         }
    //     }
    // `);
    //end grapqhql queries

    return (
        <Layout>
            <div>
                <h1 className="textAlignedCenter">Frequently asked questions</h1>
                <ul>
                {
                    faq_list.map(item => {
                        return (
                            <li key={`${item.id}-FAQ-JAB`} className="boxShadowBasicSoftBottom">
                                <h2>{item.question}</h2>
                                <p className="textShadowBasicSoft">{item.answer}</p>
                            </li>
                        )
                    })
                }
                </ul>
                <div className="marginsTB justDisplayFlexRow justiAlig">
                    <h3 className="textAlignedCenter">Have any suggestion? Please log in and go <Link to="/support">Support Page</Link> </h3>
                </div>
            </div>
        </Layout>
    )
}

export default Faq;