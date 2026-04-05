import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
function AuthLayout({ children }) {
  const [loader, setLoader] = useState(true);
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.status);
  useEffect(() => {
    if (!authStatus) {
      setLoader(true);
      navigate("/login");
    } else if (authStatus) {
      setLoader(true);
      navigate("/message");
    }
    setLoader(false);
  }, [authStatus]);
  return loader ? <h1>Loading...</h1> : <>{children}</>;
}

export default AuthLayout;
