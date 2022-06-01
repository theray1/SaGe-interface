import React from 'react';


const ProgressBar = (props) => {
  const backgroundColor = props.backgroundColor;
  const progressBarColor = props.progressBarColor;
  const progressValue = props.progressValue;
  const fontColor = props.fontColor;

  //ProgressBar does not have a dedicated css file, and its style attributes are declared here directly. That is because
  //most of a progress bar's style attributes depend on its props. As such, it is more convenient to have them declared here.

  const backgroundStyles = {
    width: "94%",
    marginLeft: "3%",
    backgroundColor: backgroundColor,
    borderRadius: 50,
    overflow: "hidden",
  };

  const fillerStyles = {
    height: "100%",
    width: `${progressValue}%`,
    backgroundColor: progressBarColor,
    borderRadius: "inherit",
    textAlign: "right",
    transition: 'width 0.2s ease-in-out',
  };

  const labelStyles = {
    padding: 5,
    color: fontColor,
    fontWeight: "bold",
  };

  return (
    <div className="ProgressBarBackground" style={backgroundStyles}>
      <div className="ProgressBarFiller" style={fillerStyles}>
        <span className="ProgressBarSpan" style={labelStyles}>{Math.floor(progressValue)}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;