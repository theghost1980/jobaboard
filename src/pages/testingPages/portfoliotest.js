import React from 'react';
// import { check } from '../../utils/helpers';
// import { useForm } from 'react-hook-form';
// import { useStaticQuery, graphql } from "gatsby"
// import Img from 'gatsby-image';

// constants
// const portfolio_EP = process.env.GATSBY_portfolioEP;
// const startYear = 1950;

const Portfoliotest = () => {
    // const userdata = check();

    // const [portfolio, setPortfolio] = useState({
    //     username: userdata.username,
    //     story_line: "",
    //     description: "",
    //     languages:[],
    //     skills:[],
    //     education: [],
    //     certifications: [],
    //     createdAt: "",
    //     updatedAt: "",
    //     _id: "",
    // });

    //  //fecthing data
    //  async function getData(url = '') {
    //     const response = await fetch(url, {
    //     method: 'GET', // *GET, POST, PUT, DELETE, etc.
    //     mode: 'cors', // no-cors, *cors, same-origin
    //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json',
    //         'x-access-token': userdata.token,
    //     },
    //     });
    //     return response.json(); 
    // };
    //  //now update data with put + file, using the same as the uploadimage
    //  async function updateDataPortfolio(url = '', data = {}) {
    //     //  TODO: after talking to aggroed
    //     // if we may need support images as well
    //     // for now only the fields
    //     const response = await fetch(url, {
    //         method: 'POST', // *GET, POST, PUT, DELETE, etc.
    //         mode: 'cors', // no-cors, *cors, same-origin
    //         headers: {
    //             'x-access-token': userdata.token,
    //             'data': JSON.stringify(data),
    //         },
    //         // body: formData,
    //     });
    //     return response.json(); 
    // };
    // ///////END post fetch
    // //end fetching data

    // const updatePortfolio = (event) => {
    //     const name = event.target.name;
    //     const value = event.target.value;
    //     setPortfolio(prevState => {
    //         return {...prevState, [name]: value}
    //     });
    // };

    // useEffect(() => {
    //     getData(portfolio_EP+"getMyPort")
    //     .then(response => {
    //         console.log(response[0]);
    //         setPortfolio(response[0]);
    //     })
    //     .catch(error => {
    //         console.log('Error fetching portfolio info from BE', error);
    //     });
    // },[]);

    // //testing functions/cbs
    // useEffect(() => {
    //     console.log(portfolio);
    // },[portfolio])
    // //end testing

    // // onSubmit
    // const onSubmit = () => {
        
    //     console.log('Data to send');
    //     console.log(portfolio);
    //     //send the data to BE
    //     // updateDataPortfolio(portfolio_EP+"createUpdate",portfolio)
    //     // .then(response => {
    //     //     console.log(response);
    //     // })
    //     // .catch(error => console.log('Error sending data portfolio to BE',error));
    // }

    // //create years array
    // function years(){
    //     const thisYear = new Date().getUTCFullYear();
    //     var _years = [];
    //     for(let i=startYear; i <=thisYear; i++){
    //         _years.unshift(i.toString());
    //     }
    //     return _years;
    // }

    // const yearsArray = years();

    return (
        <div className="managePortfolioContainer justBottomMargin">
            {/* <h2>My portfolio</h2>
            <label htmlFor="story_line">Story line</label>
            <input name="story_line"  onChange={updatePortfolio} 
                value={portfolio.story_line}
            />
            <label htmlFor="description">Description</label>
            <textarea name="description" onChange={updatePortfolio}  
                value={portfolio.description}
            />
            <div style={{
                width: '200px', margin: '0 auto'
            }}>
                <button onClick={onSubmit}>Test Submit</button>
            </div> */}
        </div>
    )
}

export default Portfoliotest;