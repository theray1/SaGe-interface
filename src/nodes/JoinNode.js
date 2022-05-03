import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";


function JoinNode(props){

    const content = <div className="query-node">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
    mucMap: <br/>{props.data.mucMap}
</div>

return (
    <ContainerNode content={content} childProps={props}></ContainerNode>  
  );
}

export default JoinNode;