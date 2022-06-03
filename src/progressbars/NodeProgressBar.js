import ProgressBar from "./ProgressBar";

function NodeProgressSlideBar(props){

  const backgroundColor = props.backgroundColor;
  const progressBarColor = props.progressBarColor;
  const fontColor = "white";
  const progressValue = props.progressValue;


  return (
    <ProgressBar
        backgroundColor={backgroundColor}
        progressBarColor={progressBarColor}
        fontColor={fontColor}
        progressValue={progressValue}/>
  )

}

export default NodeProgressSlideBar;