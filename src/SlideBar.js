import React, { useState, useEffect } from 'react';


const ProgressBar = (props) => {
  const { bgcolor, progress } = props;

  const containerStyles = {
    height: 20,
    width: "80%",
    /*backgroundColor: "#e0e0de",*/
    /*borderRadius: 50,*/
    margin: 20,
  };

  const fillerStyles = {
    height: "100%",
    width: `${progress}%`,
    backgroundColor: bgcolor,
    borderRadius: "inherit",
    textAlign: "right",
    /*transition: 'width 1s ease-in-out',*/
  };

  const labelStyles = {
    padding: 5,
    color: "black",
    fontWeight: "bold",
  };

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
        <span style={labelStyles}>{`${progress}%`}</span>
      </div>
    </div>
  );
};

function SlideBar(props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => { setProgress(Math.floor(Math.random() * 100) + 1) }, []);


  return (
    <div className="SlideBar">
      <ProgressBar bgcolor={/*"#6a1b9a"*/"red"} progress={props.progress} />
    </div>
  );
}

export default SlideBar;