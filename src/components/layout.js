import React from 'react';
// import PropTypes from "prop-types"
// import { useStaticQuery, graphql, Link } from "gatsby"
// import Img from 'gatsby-image';
//components
import Navbar from "./navbar";
import ChatInstance from './beeChatInstance';
import Footer from './footer';
//HOC components
// import AuthProvider from './HOC/authProvider';

const Layout = ({ children }) => {
  return (
      <div className="layoutContainer">
            <Navbar />
            <main>
                {children}
            </main>
            <ChatInstance />
            <Footer />
            {/* after the menu add registered users + published gigs. It will be a lookup on BE asking for total users + total gigs. */}
      </div>
  )
}

// Layout.propTypes = {
//   children: PropTypes.node.isRequired,
// }

export default Layout
