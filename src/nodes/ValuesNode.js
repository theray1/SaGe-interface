import React, { useState } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";

function ValuesNode(props){

  const [nodeData, setNodeData] = useState(props);

    const content = <div className="QueryNode">
    <div className="Handles">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
    </div>
</div>

    return (
      <ContainerNode content={content} childProps={nodeData}></ContainerNode>  
    );
}

export default ValuesNode;