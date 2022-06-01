import React from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";
import { dataToTable } from "../util";
import NodeProgressBar from "../progressbars/NodeProgressBar";

function JoinNode(props){

  const nodeData = props;
  const coverage = 100 * nodeData.data.coverage;

  /**
   * Displays the current bag of mappings using dataToTable
   * @returns A babel table containing the current bag of mappings of the node
   */
  const cleanAttributeDisplay = () => {
    return dataToTable(nodeData.data.mucMap, "joinNodeMucMap");
  } 

  const content = 
  <div className="QueryNode">
    <div className="Label">
      {props.data.label}
    </div>
    <div className="Handles">
      <Handle type='source' position="top"/>
      <Handle type='target' position="bottom"/>
    </div>
    <div className="MainData">
      {cleanAttributeDisplay()}
      <div id={"NodeProgressBarContainer" + nodeData.id} className="NodeProgressBarContainer">
          <NodeProgressBar backgroundColor={"#525252"} progressBarColor={"#80036d"} progressValue={coverage}/>
        </div>
    </div>
    <div className="DisplayData">
    </div>
    
  </div>

  return (
    <ContainerNode content={content} childProps={nodeData}></ContainerNode>  
  );
}

export default JoinNode;