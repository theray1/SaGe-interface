import React, { useState } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";


function InsertNode(props){

  const focus = () => {};
  const unfocus = () => {};

  const nodeData = props;

    const content = <div className="QueryNode">
      <div className="Label">{props.data.label}</div>
    <div className="Handles">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
    </div>
    <div className="DisplayData">
    nbInserted: {nodeData.data.nbInserted}<br/>
    </div>
</div>

return (
    <ContainerNode content={content} childProps={nodeData}></ContainerNode>  
  );
}

export default InsertNode;