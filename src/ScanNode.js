import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import QueryNode from "./QueryNode";
import SlideBar from "./SlideBar";


function ScanNode(props){

    const content = <div className="query-node">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
    Label: {props.data.label}<br/>
    Cardinality: {props.data.cardinality}<br/>
    CumulativeCardinality: {props.data.cumulativeCardinality}<br/>
    Lastread: {props.data.lastRead}<br/>
    muMap: {props.data.muMap}<br/>
    mucMap: {props.data.mucMap}<br/>
    Graph: {props.data.pattern.graph}<br/>
    Object: {props.data.pattern.object}<br/>
    Predicate: {props.data.pattern.predicate}<br/>
    Subject: {props.data.pattern.subject}<br/>
    PatternCardinality: {props.data.patternCardinality}<br/>
    PatternProduced: {props.data.patternProduced}<br/>
    Produced: {props.data.produced}<br/>
    Stages: {props.data.stages}<br/>
</div>

    return (
      <QueryNode content={content}></QueryNode>  
    );
}

export default ScanNode;