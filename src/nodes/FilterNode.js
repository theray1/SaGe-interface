import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";


function FilterNode(props){

    const content = <div className="query-node">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
    Expression:<br/> {props.data.expression}<br/>
    Consumed: {props.data.consumed}<br/>
    Produced: {props.data.produced}<br/>
</div>

return (
    <ContainerNode content={content} childProps={props}></ContainerNode>  
  );
}

export default FilterNode;