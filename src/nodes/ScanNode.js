import React from "react";
import { Handle } from "react-flow-renderer";
import NodeProgressBar from "../progressbars/NodeProgressBar";
import ContainerNode from "./ContainerNode";
import { dataToTable } from "../util";

function ScanNode(props){

    const nodeData = props;
    const coverage = 100 * nodeData.data.coverage;

    /**
   * Displays the node's current values for each variable
   * @param data The data to be displayed, as a two-dimensional array
   * @returns A babel table containing the current value of each variable
   */
    const cleanAttributesDisplay = (data) => {
      return dataToTable(data, "ScanNodeMainData");
    }

    const content = 
      <div className="QueryNode">
        <div className="Handles">
          <Handle type='source' position="top"/>
        </div>
        <div className="MainData">
          {cleanAttributesDisplay([
            ["SUBJECT",nodeData.data.pattern.subject],
            ["PREDICATE", nodeData.data.pattern.predicate],
            ["OBJECT", nodeData.data.pattern.object],
            ["Cardinality (cumulative)", nodeData.data.cumulativeCardinality],
            ["Produced (cumulative)", nodeData.data.cumulativeProduced]
          ])}
          <br/>
          <div id={"NodeProgressBarContainer" + nodeData.id} className="NodeProgressBarContainer">
            <NodeProgressBar backgroundColor={"#525252"} progressBarColor={"#80036d"} progressValue={coverage}/>
          </div>
          
          
        </div>
        <div className="DisplayData">
          Cost: <br/>{nodeData.data.cost}<br/>
          Produced: <br/>{nodeData.data.produced}<br/>
        </div>
      </div>

    return (
      <ContainerNode content={content} childProps={nodeData}></ContainerNode>  
    );
}

export default ScanNode;