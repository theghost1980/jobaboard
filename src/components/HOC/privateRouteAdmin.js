import React from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";
//helpers
import { check } from '../../utils/helpers';

const PrivateRouteAdmin = ({ component: Component, location, ...rest }) => {
  const userdata = check();
  if (!userdata.logged || userdata.usertype === "user") {
    navigate("/app/userlogin")
    return null
  }
  return <Component {...rest} />
}

PrivateRouteAdmin.propTypes = {
  component: PropTypes.any.isRequired,
}

export default PrivateRouteAdmin;