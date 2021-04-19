import React, { useState } from 'react';
// import PropTypes from "prop-types"
// import { useStaticQuery, graphql, Link } from "gatsby"
// import Img from 'gatsby-image';
//components
import Navbar from "./navbar";
import ChatInstance from './beeChatInstance';
import Footer from './footer';
//HOC components
// import AuthProvider from './HOC/authProvider';

// // testing redux
// import store from '../store/store';
// import { Provider } from 'react-redux';
// import Socketbee from './BeeChat/socketBee';
// end testing

// export const setStatus = (status) => {
//   console.log('Exported Socketbee status:',status);
// }

const Layout = (props) => {

  // const [fireReading, setFireReading] = useState(false);

  // // //functions/CB
  // const setStatus = (status) => {
  //   console.log('Socketbee status:',status);
  // }
  // // // END functions/CB
  return (
    // <Provider store={store}>
        <div className="layoutContainer">
              <Navbar/>
              {/* testing with the socket here */}
              {/* results: it gives error and sometimes do not load on beefixedchat but only here */}
              {/* <Navbar fireReadLS={fireReadLS} /> */}
              {/* <Socketbee sendChatS={setStatus} readLS={fireReading}> */}
              <main> 
                  {props.children}
              </main>
              {/* <ChatInstance /> */}
              <Footer />
              {/* after the menu add registered users + published gigs. It will be a lookup on BE asking for total users + total gigs. */}
        </div>
    // </Provider>
  )
}

// Layout.propTypes = {
//   children: PropTypes.node.isRequired,
// }

export default Layout;
