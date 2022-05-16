import SlideBar from "./SlideBar";

function NodeProgressSlideBar(props){

  const backgroundColor = props.backgroundColor;
  const progressBarColor = props.progressBarColor;
  const height = "100%";
  const width = "100%";
  const fontSize = "170%";
  const fontColor = "white";
  const progressValue = props.progressValue;
  const labelPadding = 5;


  return (
    <div className="NodeProgressSlideBar">
      <SlideBar
          backgroundColor={backgroundColor} 
          progressBarColor={progressBarColor} 
          height={height} 
          width={width} 
          fontSize={fontSize} 
          fontColor={fontColor} 
          labelPadding={labelPadding} 
          progressValue={progressValue}/>
    </div>
  )

}

export default NodeProgressSlideBar;