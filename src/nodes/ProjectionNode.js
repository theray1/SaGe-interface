import React, { useState } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";
import { getTableFromArray } from "../util";

const ProjectionNode = (props) => {

	const nodeData = props;

  const cleanAttributeDisplay = () => {
    return (
      nodeData.data.valuesList.map((value) => {
        const str = JSON.stringify(value);
        return (
          <div key={str}>
            {"- " + str.substring(2, str.length - 1)}<br/>
          </div>
        );
      })
    )
  }

  const content = 
    <div className="QueryNode">
      <div className="Label">
        {props.data.label}
      </div>
      <div className="Handles">
        <Handle type='source' position="top"/>
        <Handle type='target' position="bottom"/>
      </div>
      <div className="DisplayData">
        Projection sur les attributs: <br/>{cleanAttributeDisplay()}
      </div>
    </div>

  return (
    <ContainerNode content={content} childProps={nodeData}></ContainerNode>  
  );
}

export default ProjectionNode;