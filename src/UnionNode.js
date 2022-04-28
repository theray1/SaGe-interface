import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import QueryNode from "./QueryNode";
import SlideBar from "./SlideBar";


function UnionNode(props){

    const content = <div className="query-node">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
    Label: {props.data.label}<br/>
</div>

    return (
      <QueryNode content={content}></QueryNode>  
    );
}

export default UnionNode;