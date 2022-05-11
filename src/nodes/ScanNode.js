import React, { useEffect, useState } from "react";
import { Handle } from "react-flow-renderer";
import NodeProgressSlideBar from "../slidebars/NodeProgressSlideBar";
import QueryProgressSlideBar from "../slidebars/QueryProgressSlideBar";
import SlideBar from "../slidebars/SlideBar";
import ContainerNode from "./ContainerNode";

function ScanNode(props){
    const nodeData = props;

    //This formula can be found in SaGe engine's source code (Hey Wang ! :D)
    //Update : it doesn't work 

    //const card = Math.max(nodeData.data.patternCardinality, nodeData.data.produced);        
    //const step = nodeData.data.patternCardinality / nodeData.data.cardinality;
    //const coverage = 100 * Math.max(0, 1-props.data.produced) * (step/card);

    //Functionning but partially inaccurate formula
    const coverage = 100 * props.data.produced / props.data.cardinality;

    const content = 
    <div className="QueryNode">
      <div className="Handles">
        <Handle type='source' position="top"/>
      </div>
      <div className="MainData">
        <NodeProgressSlideBar backgroundColor={"black"} progressBarColor={"#80036d"} progressValue={coverage}/>
        Triple pattern : <br/>
        subject: {nodeData.data.pattern.subject} <br/> predicate: {nodeData.data.pattern.predicate} <br/> object: {nodeData.data.pattern.object}<br/>

      </div>
    <div className="DisplayData">
    
    CumulativeCardinality: <br/>{nodeData.data.cumulativeCardinality}<br/>

    Cardinality: <br/>{nodeData.data.cardinality}<br/>
    PatternCardinality: <br/>{nodeData.data.patternCardinality}<br/>
    PatternProduced: <br/>{nodeData.data.patternProduced}<br/>
    Produced: <br/>{nodeData.data.produced}<br/>
    </div>

    
</div>

    return (
      <ContainerNode content={content} childProps={nodeData}></ContainerNode>  
    );
}

export default ScanNode;