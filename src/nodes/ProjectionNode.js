import React from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";
import NodeProgressBar from "../progressbars/NodeProgressBar";

const ProjectionNode = (props) => {

	const nodeData = props;
  const coverage = 100 * nodeData.data.coverage;

  /**
   * Displays the node's projected variables
   * @returns A babel table containing the projected variables
   */
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
      <div className="MainData">
        <div id={"NodeProgressBarContainer" + nodeData.id} className="NodeProgressBarContainer">
          <NodeProgressBar backgroundColor={"#525252"} progressBarColor={"#80036d"} progressValue={coverage}/>
        </div>
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