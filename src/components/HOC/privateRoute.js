import React, { useContext } from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";
//context - HOC
// import { AuthContext } from '../HOC/authProvider';
//helpers
import { check } from '../../utils/helpers';

const PrivateRoute = ({ component: Component, location, ...rest }) => {
  const userdata = check();
  if (!userdata.logged) {
    navigate("/signup");
    return null
  }
  return <Component {...rest} />
}

PrivateRoute.propTypes = {
  component: PropTypes.any.isRequired,
}

export default PrivateRoute;