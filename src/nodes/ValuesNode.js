import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";

function ValuesNode(props){

    const content = <div className="query-node">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
</div>

    return (
      <ContainerNode content={content} childProps={props}></ContainerNode>  
    );
}

export default ValuesNode;