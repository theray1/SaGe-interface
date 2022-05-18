import SlideBar from "./SlideBar";

function NodeProgressSlideBar(props){

  const backgroundColor = props.backgroundColor;
  const progressBarColor = props.progressBarColor;
  const fontColor = "white";
  const progressValue = props.progressValue;


  return (
    <SlideBar
        backgroundColor={backgroundColor}
        progressBarColor={progressBarColor}
        fontColor={fontColor}
        progressValue={progressValue}/>
  )

}

export default NodeProgressSlideBar;