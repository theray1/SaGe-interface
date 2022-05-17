import React, { useState } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";


function FilterNode(props){

  const nodeData = props;

  const content = 
    <div className="QueryNode">
      <div className="Label">{props.data.label}</div>
      <div className="Handles">
        <Handle type='source' position="top"/>
        <Handle type='target' position="bottom"/>
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