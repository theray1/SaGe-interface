import React, { useCallback, useState } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";


function DeleteNode(props){

  const nodeData = props;

    const content = <div className="QueryNode">
      <div className="Handles">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
    </div>
    <div className="DataDisPlay">
    nbInserted: <br/>{nodeData.data.nbInserted}<br/>
    </div>
</div>

  return (
    <ContainerNode content={content} childProps={nodeData}></ContainerNode>  
  );
}

export default DeleteNode;