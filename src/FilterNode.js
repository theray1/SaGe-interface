import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import QueryNode from "./QueryNode";
import SlideBar from "./SlideBar";


function FilterNode(props){

    const content = <div className="query-node">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
    Label: {props.data.label}<br/>
    Expression: {props.data.expression}<br/>
    muMap: {props.data.muMap}<br/>
    Consumed: {props.data.consumed}<br/>
    Produced: {props.data.produced}<br/>
</div>

    return (
        <QueryNode content={content}></QueryNode>
    );
}

export default FilterNode;