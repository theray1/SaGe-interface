//TODO: Clean les imports
import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
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
import {
  protoplan_to_graph
} from './parser';
import PlanGraphWithMetrics from './PlanGraphWithMetrics';
import ProjectionNode from './ProjectionNode';
import JoinNode from './JoinNode';
import UnionNode from './UnionNode';
import FilterNode from './FilterNode';
import ScanNode from './ScanNode';
import ValuesNode from './ValuesNode';
import InsertNode from './InsertNode';
import DeleteNode from './DeleteNode';

const nodeTypes = { projectionNode: ProjectionNode,
                    joinNode: JoinNode,
                    unionNode: UnionNode,
                    filterNode: FilterNode,
                    scanNode: ScanNode,
                    valuesNode: ValuesNode,
                    insertNode: InsertNode,
                    deleteNode: DeleteNode};

function App(){

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [isQueryEditable, setIsQueryEditable] = useState(true);
  const [hasPlanBeenModified, setHasPlanBeenModified] = useState(false);

  const nodeWidth = 200;
  const nodeHeight = 150;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  //Lays out a graph composed of #nodes and #edges
  const layoutElements = (nodes, edges) => {
    dagreGraph.setGraph({ rankdir: 'BT', align: 'DR'});
  
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
  
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
  
    dagre.layout(dagreGraph);
  
    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition =  'top';
      node.sourcePosition =  'bottom';
  
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    });
    return { nodes, edges };
  };

  //Query management
  let sparqlRequest = {
    "query": "PREFIX p1: <http://www.w3.org/2000/01/rdf-schema#> PREFIX p2: <http://purl.org/dc/elements/1.1/> PREFIX p3: <http://www.w3.org/2001/XMLSchema#> SELECT ?label WHERE { ?s p2:date '2000-07-15'^^p3:date; p1:label ?label . FILTER regex(?label, 't', 'i') }",
    "defaultGraph": "http://example.org/bsbm"
  };

  let sparqlServer = "http://localhost:8000/sparql";
 

  //Takes an array of graph elements (nodes and edges) and sets it as the displayed graph, and updates nodes and edges arrays accordingly
  const elementsToNodesAndEdges = (graph) => {

  var newNodes = [];
  var newEdges = [];

    graph.forEach(element => {
      if(element.position !== undefined){

        newNodes.push(element);
      
      } else {

        newEdges.push(element);
      
      }
    })

    layoutElements(newNodes, newEdges);

    setNodes(newNodes);
    setEdges(newEdges);

  }

  //Very optimizable
  const updateNodesFromElements = (graph) => {
    var newNodes = [];

    graph.forEach(element => {
      if(element.position !== undefined){

        newNodes.push(element);
      
      }
    })

    newNodes.forEach((newNode) =>{
      var oldPosition = {x: 0, y: 0};

      nodes.forEach((oldNode) =>{
        if(oldNode.id == newNode.id){
          oldPosition = oldNode.position;
        }
      })

      newNode.position = oldPosition;
    });

    setNodes(newNodes);
  }

  //Starts the process of parsing the query and sending the query to the SaGe server 
  const commitQuery = (q) => {
    console.log("Running : ", q);
    setIsQueryEditable(false);

    let fetchData = {
      method: 'POST',
      body: q,
      headers: {
        "Content-type": "application/json",
        "accept": "application/json"
      }
    }
    
    fetch(sparqlServer, fetchData)
    .then(res => res.json())
    .then(data => {

      console.log("data: ", data);
      
      let graphElements = protoplan_to_graph(data["next"]);
      elementsToNodesAndEdges(graphElements);
      
      console.log(data["hasNext"]);

      console.log("Response's next link", data["next"]);

      setNextLink(data["next"]);

      updateStats(data["stats"]);
      
    })
    .catch(error => {console.log("CATCHPHRASE"); console.log(error)});
  }

  const commitNext = () => {

    //From the initial query
    const queryTemp = JSON.parse(queryInput);
    //We add the next link to the query object, so that once sent, the SaGe server knows where it last stopped
    queryTemp["next"] = nextLink;

    let fetchInstructions = {
      method: 'POST',
      body: JSON.stringify(queryTemp),
      headers: {
        "Content-type": "application/json",
        "accept": "application/json"
      }
    }

    console.log("Next fetch instructions: ", fetchInstructions);

    fetch(sparqlServer, fetchInstructions)
    .then(res => res.json())
    .then(data => {
      console.log("Response: ", data);
      setNextLink(data["next"]);

      if(data["next"] !== null){

        if(!hasPlanBeenModified){//The query isn't over and user hasn't modified the query execution plan since the last quantum
          
          let graphElements = protoplan_to_graph(data["next"]);
          updateNodesFromElements(graphElements);
        
        } else {//The query isn't over but user has modified the query execution plan since the last quantum
        
          console.log("How did you get there? Query exec plan modification isn't implemented yet...")
          let graphElements = protoplan_to_graph(data["next"]);
          elementsToNodesAndEdges(graphElements);
        }
        
      } else {//Query is over
        
        setIsQueryEditable(true);
      
      }

      updateStats(data["stats"]);
      setHasPlanBeenModified(false);
    })

    .catch((error) => {console.log(error)});
  }

  const [nextLink, setNextLink] = useState(null);
  const [queryInput, setQueryInput] = useState(JSON.stringify(sparqlRequest));
  const [exportMetric, setExportMetric] = useState("");
  const [importMetric, setImportMetric] = useState("");
  const [cardinalityMetric, setCardinalityMetric] = useState("");
  const [costMetric, setCostMetric] = useState("");
  const [coverageMetric, setCoverageMetric] = useState("");
  const [progressionMetric, setProgressionMetric] = useState("");

  const updateStats = (queryStats) => {
    setExportMetric(queryStats["export"]);
    setImportMetric(queryStats["import"]);
    setCardinalityMetric(queryStats["metrics"]["cardinality"]);
    setCostMetric(queryStats["metrics"]["cost"]);
    setCoverageMetric(queryStats["metrics"]["coverage"]);
    setProgressionMetric(queryStats["metrics"]["progression"]);
  }

  const stats={
   exportMetric: exportMetric,
   importMetric: importMetric,
   cardinalityMetric: cardinalityMetric,
   costMetric: costMetric,
   coverageMetric: coverageMetric,
   progressionMetric: progressionMetric, 
  }

  //TODO: Move this to a css file if possible
  const mainGraphStyle = { width: "100%", height: "100%", backgroundColor: '#B8CEFF' };
  const mainGraphWithMetricsStyle = { width: "100%", height: "66%" };
  const appStyle = { width: "100%", height: "100vh" }
  const headerStyle = { width: "100%", height: "23.7%" }
  const metricsStyle = {backgroundColor: "grey", textAlign: "left"};
  const queryInputStyle = { width: "30%", height: "25%" };

  return(
    <div className="App" style={appStyle}>
    <div className='Header' style={headerStyle}>
      <h1>Query Change Monitoring</h1>
      <h2>Prototype</h2>

      <textarea rows={4} style={queryInputStyle} placeholder='Query' type="text" name="QueryTextInput" value={queryInput} onChange={(e) => {if(isQueryEditable)setQueryInput(e.target.value)}}></textarea>

      <br></br>
      <br></br>

      <button onClick={() => {if(isQueryEditable)commitQuery(queryInput)}}>commit query</button>

      <button onClick={() => commitNext()}>debug button</button>
    </div>

    

    <div className="MainGraphWithMetrics" style={mainGraphWithMetricsStyle}>
        <div className="Metrics" style={metricsStyle}>
            export:{stats.exportMetric}<br/>
            import:{stats.importMetric}<br/>
            cardinality:{stats.cardinalityMetric}<br/>
            cost:{stats.costMetric}<br/>
            coverage:{stats.coverageMetric}<br/>
            progression:{stats.progressionMetric}<br/>
        </div>

        <div className='MainGraph' style={mainGraphStyle}>
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} fitView><Controls/></ReactFlow>
        </div>         
    </div>
  </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);  

//<ReactFlow className='MainGraph1' edges={edges} nodes={nodes} onNodesChange={onNodesChange} nodeTypes={nodeTypes} style={graphStyle} fitView><Controls/></ReactFlow>
//<PlanGraphWithMetrics props={stats} nodes={nodes} edges={edges} onNodesChange={onNodesChange}/>

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
