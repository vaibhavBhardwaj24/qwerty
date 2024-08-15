import React from "react";
import "./loading.css"
const LoadingPage = () => {
  return (
    <div className="h-full w-full backdrop-blur-lg back flex justify-center items-center">
      <div className="loader">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </div>
  );
};

export default LoadingPage;
