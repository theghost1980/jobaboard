import React from 'react';
import PropTypes from "prop-types";

const SubmenuRender = ({ component: Component, location, ...rest }) => {
    return <Component {...rest} />
}

SubmenuRender.propTypes = {
    component: PropTypes.any.isRequired,
  }
  

export default SubmenuRender;