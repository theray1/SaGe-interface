import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";


function FilterNode(props){

    const content = <div className="QueryNode">
    <div className="Handles">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
    </div>
    <div className="DisplayData">
    Expression:<br/> {props.data.expression}<br/>
    Consumed: {props.data.consumed}<br/>
    Produced: {props.data.produced}<br/>
    </div>
</div>

return (
    <ContainerNode content={content} childProps={props}></ContainerNode>  
  );
}

export default FilterNode;