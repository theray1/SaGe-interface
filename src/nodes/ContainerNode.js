import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import './ContainerNode.css';

const QueryNode = (props) => {
    return (
        <div>
            <div className="ContainerNode" tabIndex="0">
                <div className="Label">{props.childProps.data.label}</div>
                <div className="Content">{props.content}</div>
            </div>
        </div>
    );
}

export default QueryNode;