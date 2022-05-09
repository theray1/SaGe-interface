import React, { useState } from "react";
import { Handle } from "react-flow-renderer";
import NodeProgressSlideBar from "../slidebars/NodeProgressSlideBar";
import QueryProgressSlideBar from "../slidebars/QueryProgressSlideBar";
import SlideBar from "../slidebars/SlideBar";
import ContainerNode from "./ContainerNode";

function ScanNode(props){

    const [nodeData, setNodeData] = useState(props);

    //This formula can be found in SaGe engine's source code (Hey Wang ! :D)
    const card = Math.max(nodeData.data.patternCardinality, nodeData.data.produced);        
    const step = nodeData.data.patternCardinality / nodeData.data.cardinality;

    const coverage = Math.max(0, 1-props.data.produced) * (step/card);


    const content = <div className="QueryNode">
    <div className="Handles">
    <Handle type='source' position="top"/>
    </div>
    <div className="MainData">
      <NodeProgressSlideBar backgroundColor={"black"} progressBarColor={"#80036d"} progressValue={coverage*100}/>
    </div>
    <div className="DisplayData">
    
    CumulativeCardinality: <br/>{nodeData.data.cumulativeCardinality}<br/>

    Object - Predicate - Subject: <br/>
    {nodeData.data.pattern.object} - {nodeData.data.pattern.predicate} - {nodeData.data.pattern.subject}<br/>

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