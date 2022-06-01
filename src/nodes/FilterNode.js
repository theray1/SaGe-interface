import React from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";
import NodeProgressBar from "../progressbars/NodeProgressBar";


function FilterNode(props){

  const nodeData = props;
  const coverage = 100 * nodeData.data.coverage;
  
  const content = 
    <div className="QueryNode">
      <div className="Label">{props.data.label}</div>
      <div className="Handles">
        <Handle type='source' position="top"/>
        <Handle type='target' position="bottom"/>
      </div>
      <div className="MainData">
        <div id={"NodeProgressBarContainer" + nodeData.id} className="NodeProgressBarContainer">
          <NodeProgressBar backgroundColor={"#525252"} progressBarColor={"#80036d"} progressValue={coverage}/>
        </div>
      </div>
      <div className="DisplayData">
        Expression:<br/> {nodeData.data.expression}<br/>
        Consumed: {nodeData.data.consumed}<br/>
        Produced: {nodeData.data.produced}<br/>
      </div>
  </div>

  return (
    <ContainerNode content={content} childProps={nodeData}></ContainerNode>  
  );
}

export default FilterNode;