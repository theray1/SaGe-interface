import React, { useState, useEffect } from 'react';


const ProgressBar = (props) => {
  const backgroundColor = props.backgroundColor;
  const progressBarColor = props.progressBarColor;
  const progressValue = props.progressValue;
  const height = props.height;
  const width = props.width;
  const fontColor = props.fontColor;
  const fontSize = props.fontSize;
  const labelPadding = props.labelPadding;

  const containerStyles = {
    height: height,
    width: width,
    backgroundColor: backgroundColor,
    borderRadius: 50,
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
    padding: labelPadding,
    color: fontColor,
    fontWeight: "bold",
    fontSize: fontSize,
  };

  return (
    <div className="ProgressBarContainer" style={containerStyles}>
      <div className="ProgressBarFiller" style={fillerStyles}>
        <span className="ProgressBarSpan" style={labelStyles}>{Math.floor(progressValue)}%</span>
      </div>
    </div>
  );
};

function SlideBar(props) {
  return (
    <div className="SlideBar">
      <ProgressBar 
        backgroundColor={props.backgroundColor}  
        progressBarColor={props.progressBarColor} 
        height={props.height}
        width={props.width}
        fontSize={props.fontSize}
        fontColor={props.fontColor}
        labelPadding={props.labelPadding}
        progressValue={props.progressValue} />
    </div>
  );
}

export default SlideBar;