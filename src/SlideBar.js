import React, { useState, useEffect } from 'react';


const ProgressBar = (props) => {
  const { bgcolor, progress } = props;

  const containerStyles = {
    height: 23,
    width: "100%",
    backgroundColor: "black",
    borderRadius: 50,
  };

  const fillerStyles = {
    height: "100%",
    width: `${progress}%`,
    backgroundColor: bgcolor,
    borderRadius: "inherit",
    textAlign: "right",
    transition: 'width 0.2s ease-in-out',
  };

  const labelStyles = {
    padding: 5,
    color: "white",
    fontWeight: "bold",
    fontSize: "170%",
  };

  return (
    <div className="Container" style={containerStyles}>
      <div className="Filler" style={fillerStyles}>
        <span className="Progress" style={labelStyles}>{Math.floor(progress)}%</span>
      </div>
    </div>
  );
};

function SlideBar(props) {
  return (
    <div className="SlideBar">
      <ProgressBar bgcolor={"#80036d"} progress={props.progress} />
    </div>
  );
}

export default SlideBar;