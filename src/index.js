//TODO: Clean les imports
import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
/*import App from './App';*/
import reportWebVitals from './reportWebVitals';
import ReactFlow, {
  addEdge,
  Controls,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import dagre from 'dagre';
import {nodesInit, edgesInit} from './initial-elements';
import QueryStepNode from './QueryStepNode.js';


const nodeTypes = { queryStepNode: QueryStepNode };

//TODO: Mettre dans un css
const graphStyle = { backgroundColor: '#B8CEFF' };
const pageStyle = { width: "100%", height: "800px" };

function App(){
  const [idCount, setIdCount] = useState(4);

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesInit);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesInit);
  const [text, changeText] = useState("");

  const nodeWidth = 200;
  const nodeHeight = 150;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  function addNode(nodeName){
    const nodesCopy = nodes.slice();
    nodesCopy.push({
      id: idCount,
      type: "queryStepNode",
      data: {
        label: nodeName
      },
      position: { x: 0, y: 0}
    })

    console.log(nodesCopy);

    setNodes(nodesCopy);
    setIdCount(idCount+1)
  }

  const getLayoutedElements = (nodes, edges, direction = 'BT') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction, align: 'DL'});
  
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
  
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
  
    dagre.layout(dagreGraph);
  
    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? 'left' : 'top';
      node.sourcePosition = isHorizontal ? 'right' : 'bottom';
  
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
  
      return node;
    });
  
    return { nodes, edges };
  };

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodesInit,
    edgesInit
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)),
    []
  );

  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );



  //Query management
  let sparqlRequest = {
    "query": "SELECT * { ?s ?p ?o }",
    "defaultGraph": "http://example.org/test"
  };

  let sparqlServer = "http://localhost:8000/sparql";

  const [initialQuery, setInitialQuery] = useState(null);
  const [queryInput, setQueryInput] = useState("");

  const changeQuery = (event) => {
    setQueryInput(event.target.value);
  }

  const commitQuery = (query) => {
    //Starts the process of parsing the query and sending the query to the SaGe server 
    console.log(query);
    alert("Not implemented yet!");
  }

  return(
      <div className="App" style={pageStyle}>
        <h1>Query Change Monitoring</h1>
        <h2>Prototype and bidouillage</h2>

        <input placeholder='Query' type="text" name="QueryTextInput" value={queryInput} onChange={(e) => changeQuery(e)}></input>

        <br></br>
        <br></br>

        <button onClick={() => commitQuery(queryInput)}>commit query</button>

        <br></br>
        <br></br>

        <input placeholder='Node Name' type="text" name="NodeNameTextInput" value={text} onSubmit onChange={(e) => changeText(e.target.value)}></input>

        <br></br>
        <br></br>
        
        <button onClick={() => addNode(text)}>add a node</button>

        <br></br>
        <br></br>

        <ReactFlow edges={edges} nodes={nodes} onNodesChange={onNodesChange} nodeTypes={nodeTypes} style={graphStyle} fitView><Controls></Controls></ReactFlow>
      </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);  

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
