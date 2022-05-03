import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";

function ScanNode(props){

    const content = <div className="query-node">
    <Handle type='source' position="top"/>
    Cardinality: <br/>{props.data.cardinality}<br/>
    CumulativeCardinality: <br/>{props.data.cumulativeCardinality}<br/>
    Object: <br/>{props.data.pattern.object}<br/>
    Predicate: <br/>{props.data.pattern.predicate}<br/>
    Subject: <br/>{props.data.pattern.subject}<br/>
    PatternCardinality: <br/>{props.data.patternCardinality}<br/>
    PatternProduced: <br/>{props.data.patternProduced}<br/>
    Produced: <br/>{props.data.produced}<br/>
</div>

    return (
      <ContainerNode content={content} childProps={props}></ContainerNode>  
    );
}

export default ScanNode;