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

  return (
      <div className="layoutContainer">
            <Navbar devMode={true} />
            <main> 
                {props.children}
            </main>
            <Footer />
      </div>
  )
}

export default Layout;
