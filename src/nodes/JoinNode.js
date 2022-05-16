import React, { useState } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";
import { getTableFrom2DArray } from "../util";

function JoinNode(props){

  const focus = () => {};
  const unfocus = () => {};

  const nodeData = props;

  const cleanAttributeDisplay = () => {
    return getTableFrom2DArray(nodeData.data.mucMap, "joinNodeMucMap");
  } 

    const content = <div className="QueryNode">
      <div className="Label">{props.data.label}</div>
    <div className="Handles">
      <Handle type='source' position="top"/>
      <Handle type='target' position="bottom"/>
    </div>
    <div className="MainData">
      {cleanAttributeDisplay()}
    </div>
    <div className="DisplayData">
    </div>
    
</div>

return (
    <ContainerNode content={content} childProps={nodeData}></ContainerNode>  
  );
}

export default JoinNode;