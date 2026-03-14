import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
function AuthLayout({ children, authentication = true }) {
  const [loader, setLoader] = useState(true);
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.status);
  useEffect(() => {
    if (authentication && authStatus !== authentication) {
      setLoader(true);
      navigate("/login");
    } else if (!authentication && authStatus !== authentication) {
      setLoader(true);
      navigate("/message");
    }
    setTimeout(() => {
      setLoader(false);
    }, 300);
  }, [authStatus, authentication]);
  return loader ? <h1>Loading...</h1> : <>{children}</>;
}

export default AuthLayout;
