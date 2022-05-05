import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import SlideBar from "../SlideBar";
import ContainerNode from "./ContainerNode";

function ScanNode(props){

    //This formula can be found in SaGe engine's source code (Hey Wang ! :D)
    const card = Math.max(props.data.patternCardinality, props.data.produced);        
    const step = props.data.patternCardinality / props.data.cardinality;

    const coverage = Math.max(0, 1-props.data.produced) * (step/card);


    const content = <div className="QueryNode">
    <div className="Handles">
    <Handle type='source' position="top"/>
    </div>
    <div className="MainData">
      <SlideBar progress={coverage*100}/>
    </div>
    <div className="DisplayData">
    
    CumulativeCardinality: <br/>{props.data.cumulativeCardinality}<br/>

    Object - Predicate - Subject: <br/>
    {props.data.pattern.object} - {props.data.pattern.predicate} - {props.data.pattern.subject}<br/>

    Cardinality: <br/>{props.data.cardinality}<br/>
    PatternCardinality: <br/>{props.data.patternCardinality}<br/>
    PatternProduced: <br/>{props.data.patternProduced}<br/>
    Produced: <br/>{props.data.produced}<br/>
    </div>

    
</div>

    return (
      <ContainerNode content={content} childProps={props}></ContainerNode>  
    );
}

export default ScanNode;