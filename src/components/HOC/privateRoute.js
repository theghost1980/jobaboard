import React, { useContext } from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";
//context - HOC
// import { AuthContext } from '../HOC/authProvider';
//helpers
import { check } from '../../utils/helpers';

const PrivateRoute = ({ component: Component, location, ...rest }) => {
  //data comming from context.
  // const { state: userdata } = useContext(AuthContext);
  // console.log(`Data on state:${userdata.logged}`);
  // if (!userdata.logged && location.pathname !== `/app/userlogin`) {
  const userdata = check();
  if (!userdata.logged) {
    navigate("/app/userlogin")
    return null
  }
  return <Component {...rest} />
}

PrivateRoute.propTypes = {
  component: PropTypes.any.isRequired,
}

export default PrivateRoute;