import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import SlideBar from "./SlideBar";
import QueryNode from "./QueryNode";


const ProjectionNode = (props) => {
    const content = <div className="query-node">
                        <Handle type='source' position="top"/>
                        <Handle type='target' position="bottom"/>
                        Label: {props.data.label}<br/>
                        ValuesList: {props.data.valuesList}
                    </div>

    return (
        <QueryNode content={content}></QueryNode>
    );
}

export default ProjectionNode;