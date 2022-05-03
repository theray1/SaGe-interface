import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";


function InsertNode(props){

    const content = <div className="query-node">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
    nbInserted: {props.data.nbInserted}<br/>
</div>

return (
    <ContainerNode content={content} childProps={props}></ContainerNode>  
  );
}

export default InsertNode;