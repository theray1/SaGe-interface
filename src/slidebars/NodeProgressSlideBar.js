import SlideBar from "./SlideBar";

function NodeProgressSlideBar(props){

  const backgroundColor = props.backgroundColor;
  const progressBarColor = props.progressBarColor;
  const height = 28;
  const width = "100%";
  const fontSize = "170%";
  const fontColor = "white";
  const progressValue = props.progressValue;
  const labelPadding = 5;


  return (
      <SlideBar backgroundColor={backgroundColor} 
          progressBarColor={progressBarColor} 
          height={height} 
          width={width} 
          fontSize={fontSize} 
          fontColor={fontColor} 
          labelPadding={labelPadding} 
          progressValue={progressValue}/>
  )

}

export default NodeProgressSlideBar;