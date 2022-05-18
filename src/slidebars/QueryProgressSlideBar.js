import SlideBar from "./SlideBar";

function QueryProgressSlideBar(props){

    const backgroundColor = props.backgroundColor;
    const progressBarColor = props.progressBarColor;
    const height = "100%";
    const width = "100%";
    const fontSize = "140%";
    const fontColor = "white";
    const progressValue = props.progressValue;
    const labelPadding = 5;


    return (
        <SlideBar backgroundColor={backgroundColor} 
            progressBarColor={progressBarColor}
            fontColor={fontColor} 
            progressValue={progressValue}/>
    )

}

export default QueryProgressSlideBar;