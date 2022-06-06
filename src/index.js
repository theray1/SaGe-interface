import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import ReactFlow, {
  Controls,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import dagre from 'dagre';
import {
  nextLink_to_graph,
  nextLink_to_jsonPlan,
  jsonPlan_to_nextLink
} from './parser';
import ProjectionNode from './nodes/ProjectionNode';
import JoinNode from './nodes/JoinNode';
import UnionNode from './nodes/UnionNode';
import FilterNode from './nodes/FilterNode';
import ScanNode from './nodes/ScanNode';
import ValuesNode from './nodes/ValuesNode';
import InsertNode from './nodes/InsertNode';
import DeleteNode from './nodes/DeleteNode';
import { roundDownFiveDecimals, displayResults, displayResult } from './util';
import QueryProgressBar from './progressbars/QueryProgressBar';
import YASQE from 'yasgui-yasqe';
import "./yasqe.css";
import StateManager from './stateManager';
import { ResizableBox } from 'react-resizable';
import "../node_modules/react-resizable/css/styles.css"

//All the node types used by ReactFlow. Each one represents an operator used by SaGe 
const nodeTypes = { projectionNode: ProjectionNode,
                    joinNode: JoinNode,
                    unionNode: UnionNode,
                    filterNode: FilterNode,
                    scanNode: ScanNode,
                    valuesNode: ValuesNode,
                    insertNode: InsertNode,
                    deleteNode: DeleteNode};

let sparqlRequest = {
  query: "SELECT ?s ?p ?o WHERE { ?s ?p ?o }",
  defaultGraph: "http://example.org/bsbm"
};

let sparqlServer = "http://localhost:8000/sparql";

const nodeWidth = 600;
const nodeHeight = 250;

const areRowsEqual = (prevRow, nextRow) => {
  for(var variable in prevRow){
    if(prevRow[variable] !== nextRow[variable]){
      return false;
    }
  }

  return true;
}

/**
 * Memoized Row for result rendering optimization
 */
const ResultRow = React.memo(({result}) => {
  return displayResult(result, JSON.stringify(result));
}, areRowsEqual);

/**
 * Memoized List for results rendering optimization
 */
const ResultList = React.memo(({resultList}) => {
  if(resultList !== undefined){
    return (
        <tbody>
          {resultList.slice(0, Math.min(resultList.length, 200)).map((result) => {
            return <ResultRow key={JSON.stringify(result)} result={result}/>
          })}
        </tbody>
    )
  }
})

function App(){
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const [yasqe, setYasqe] = useState();
  
  const [query, setQuery] = useState(null);

  const [stateManager, setStateManager] = useState(new StateManager());

  const [nextLink, setNextLink] = useState(null);

  const [results, setResults] = useState([]);
  const [variables, setVariables] = useState(<></>);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]); 
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [leaves, setLeaves] = useState([]);

  const [exportMetric, setExportMetric] = useState("");
  const [importMetric, setImportMetric] = useState("");
  const [costMetric, setCostMetric] = useState("");
  const [coverageMetric, setCoverageMetric] = useState("");

  //componentDidMount equivalent. It is used to create the yasqe editor and the state manager once and only once, when the page is loaded
  useEffect(() => {
      const newYasqe = YASQE(document.getElementById("YasqeEditor"));
      newYasqe.setValue(sparqlRequest["query"]);
      setYasqe(newYasqe);
  }, []);

  //Auto Run watcher. Whenever the nextLink is updated, if auto run is enabled, calls the fetchNext() function
  useEffect(() => {
    if(stateManager.isAutoRunOn() && nextLink !== null){
      fetchNext();
    }
  }, [nextLink]);

  /**
   * Update the rendering of the main stats of the query execution
   * @param {*} queryStats The new stats to be displayed
   */
  const updateStats = (queryStats) => {
    setExportMetric(queryStats["export"]);
    setImportMetric(queryStats["import"]);
    setCostMetric(queryStats["metrics"]["cost"]);
    setCoverageMetric(queryStats["metrics"]["coverage"]);
  }

  /**
   * Reset stats to their default value, 0
   */
  const resetStats = () => {
    setExportMetric(0);
    setImportMetric(0);
    setCostMetric(0);
    setCoverageMetric(0);
  }

  const stats={
   exportMetric: exportMetric,
   importMetric: importMetric,
   costMetric: costMetric,
   coverageMetric: coverageMetric,
  }

  //-----------------------------------------------------------------------------------GRAPH MANAGEMENT-------------------------------------------------------------------------------------------------------

  /**
   * Lays out a graph to have a readable shape
   * @param {*} nodes The array of nodes from the graph to be layed out
   * @param {*} edges The array of edges from the graph to be layed out
   * @returns An object composed of the array of nodes with updated positions and the array of edges
   */
  const layoutElements = (nodes, edges) => {
    
    //Sets the direction of the graph to bottom-to-top
    dagreGraph.setGraph({ rankdir: 'BT', align: ''});
  
    //Provides dagre with each node, and the space between them
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
  
    //Provides dagre with the relation between each node
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
  
    //Computes the position of each node on the graph
    dagre.layout(dagreGraph);
  
    //Sets each node's position to the position computed by dagre
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

    //We do not need to use the returned value, as the node passed as arguments are direcly modified
    return { nodes, edges };
  };

  /**
   * Checks if a JSON object is a node 
   * @param {*} element The JSON representation of a node, as used by React Flow
   * @returns True if the element has a position attribute, false otherwise
   */
  const isNode = (element) => {
    //This condition verifies that element is a node, since all nodes always have a position but edges never do
    return element.position !== undefined;
  }
 
  /**
   * Takes a graph and updates the nodes and edges arrays accordingly, and lays out the graph
   * @param {*} newGraph The array of elements (nodes and edges) from which the graph is going to be created
   */
  const createGraph = (newGraph) => {

    var newNodes = [];
    var newEdges = [];

    //Iterates over every element of newGraph to separate nodes and edges
    newGraph.forEach(element => {
      if(isNode(element)){

        newNodes.push(element);
      
      } else {

        newEdges.push(element);
      
      }
    })

    //Computes the position of the elements of the graph
    layoutElements(newNodes, newEdges);


    //Sets the current graph to the one created from newGraph 

    //Sets the edges of newGraph as the edges of the current graph 
    setEdges(newEdges);

    //Sets the nodes of newGraph as the nodes of the current graph
    setNodes(newNodes);
  }

  /**
   * Updates data dislayed inside the nodes of the current graph based on the data of a new graph, without changing its current layout
   * This is meant to be used when graph has the same nodes and edges as the current graph, but the data inside each node is different
   * @param {*} newGraph The graph to be updated
   */
  const updateGraph = (newGraph) => {
    var newNodes = [];

    //Iterates over every element of graph to keep only the nodes in newNodes
    newGraph.forEach(element => {
      if(isNode(element)){

        newNodes.push(element);
        
      }
    })

    
    newNodes.forEach((newNode) => {
      nodes.forEach((oldNode) => {
        if(oldNode.id === newNode.id){
          //The following code is executed only when we find a node from newGraph with same id as a node from the current graph. 
          //This means they represent the same node, and the data of the node from the current graph needs to be replaced with 
          //the data from the node from newGraph


          
          if(document.activeElement === document.getElementById(newNode.id)){
            //The following code is executed only when the node currently being updated corresponds to a node being dragged by the user at the same time
            //We cannot simply set the new position to the one at the beginning of the last quantum, since it probably isn't currently the actual position of the node
            //Instead, we can use xPos and yPos which are not tied to the JSON representation of the node
            //This fix is a bit of a workaround, as it required the position to be included in the HTML attributes of the node and there is probably an easier way to do it
            //But at least, it works

            var newX = parseInt(document.getElementById(newNode.id).getAttribute("xposition"), 10);
            var newY = parseInt(document.getElementById(newNode.id).getAttribute("yposition"), 10);
            
            var newPosition = { x: newX, y: newY };
            
            newNode.position = newPosition;
          
          }else {
          
            newNode.position = oldNode.position;
          
          }
        
        }
      })
    })

    setNodes(newNodes);
   
  }


  //-----------------------------------------------------------------------------------QUERY MANAGEMENT-------------------------------------------------------------------------------------------------------

  const createFirstResults = (res) => {
    
    var variables = [];

    for(var variable in res[0]){
      variables.push(<th key={variable}>{variable}</th>);
    }

    var header= (
        <tr key={"header"}>
          {variables}  
        </tr>
    )

    setVariables(header);
    setResults(res);
  }

  const createResults = (res) => {

    setResults(results.concat(res));
  } 

  /**
   * Auxiliary function used by commitQuery(). Creates a HTML request with a query as its body and sends it to the SaGe server.
   * @param {*} query The query to be commited
   * @returns The promise generated from sending a query to the SaGe server
   */
  const __commitQuery = (query) => {
    let fetchData = {
      method: 'POST',
      body: query,
      headers: {
        "Content-type": "application/json",
        "accept": "application/json"
      }
    }

    let promise = fetch(sparqlServer, fetchData)

    return promise;
  }

  /**
   * Auxiliary function used by commitQuery(). Deals with the response generated from sending a query to the SaGe server
   * @param {*} promise 
   * @returns The promise generated from sending a query to the SaGe server and then updating the interface accordingly
   */
  const __responseCommitQuery = (promise) => {

    let returnPromise = promise
    .then(res => res.json())
    .then(data => {

      if(data["hasNext"]){

        let graphElements = nextLink_to_graph(data["next"]);
        createGraph(graphElements["graphElements"]);
        setLeaves(graphElements["leaves"]);
        createFirstResults(data["bindings"]);


      } else {

        alert("All the elements were found in one quantum! If you would like to have the data, and a more detailed execution plan, please reduce the max_results attribute or the quota attribute in your config file");
        stateManager.setState("postQueryEnd");
        createFirstResults(data["bindings"]);
        

      }

      updateStats(data["stats"]);

      setNextLink(data["next"]);

      return data;
    })
    .catch(error => {console.log("Error caught"); console.log(error)});

    return returnPromise;
  }

  /**
   * Starts the processing of a query by sending it to SaGe server and creating a graph according to the response's nextLink
   * @returns The promise generated from sending a query to the SaGe server and then updating the interface accordingly
   */
  const commitQuery = (query) => {

    var promise = __commitQuery(query);
    return __responseCommitQuery(promise);

  }

  /**
   * Sets the current sparqlRequest's query to the rawQuery parameter, while removing useless spaces and line breaks
   * @param {*} rawQuery The unprocessed query to be set as the current sparqlRequest query
   * @returns The stringified sparqlRequest with the new query
   */
  const createRequest = (rawQuery) => {
    const queryWithoutUselessCharacters = rawQuery.replace(/\r?\n|\r/g, "");
    sparqlRequest["query"] = queryWithoutUselessCharacters;

    return JSON.stringify(sparqlRequest);
  }

  /**
   * QueryInput getter
   * @returns The current value of the yasqe query editor
   */
  const getQueryInput = () => {
    return yasqe.getValue();
  }

  /**
   * Creates a request and sends it to the server
   * @returns The promise generated from sending a query to the SaGe server and then updating the interface accordingly
   */
  const commitFirstQuantum = () => {
    var q = createRequest(getQueryInput());
    setQuery(q);
    var promise = commitQuery(q);
    return promise;
  }

  //Sending next links

  /**
   * Auxiliary function used by fetchNext(). Deals with the response generated from sending a next link to the server
   * @param {*} promise The promise generated from sending a next link to the SaGe server
   * @returns The promise generated from sending a query with a next link to the SaGe server and then updating the interface accordingly
   */
  const __responseFetchNext = (promise) => {

    let returnPromise = promise
    .then(res => res.json())
    .then(data => {

      if(data["hasNext"]) {//query isn't over
      
        let graphElements = nextLink_to_graph(data["next"]);
        updateGraph(graphElements["graphElements"]);
        setLeaves(graphElements["leaves"]);
        createResults(data["bindings"]);

      }else {//query is over
        stateManager.setState("postQueryEnd");

      }

      updateStats(data["stats"]);
      setNextLink(data["next"]);

      return data;
    })
    .catch((error) => {console.log(error)});

    return returnPromise;

  }

  /**
   * Auxiliary function used by fethNext(). Creates a HTML request with an updated next link and sends it to the SaGe server
   * @returns The promise generated from sending a query with a next link to the SaGe server
   */
  const __fetchNext = () => {
    
    const parsedQuery = JSON.parse(query);
    parsedQuery["next"] = nextLink;
  
    let fetchInstructions = {
      method: 'POST',
      body: JSON.stringify(parsedQuery),
      headers: {
        "Content-type": "application/json",
        "accept": "application/json"
      }
    }
  
    let promise = fetch(sparqlServer, fetchInstructions)

    return promise;
  }
  

  /**
   * Sends the next part of the ongoing query to the SaGe server
   * @returns The promise generated from sending a query with a next link to the SaGe server and then updating the interface accordingly
   */
  const fetchNext = () => {

    var promise = __fetchNext()
    return __responseFetchNext(promise);

  }

  //Auto-run

  /**
   * Sends the next part of the ongoing query as long as the last response had a non null nextLink
   */
  const resumeAutoRun = () => {
    stateManager.setState("autoRun");
    fetchNext();
  }

  
  //-----------------------------------------------------------------------------QUERY MODIFICATION-----------------------------------------------------------------------------------------------------------

  /**
   * Finds the path required to go from the root of the execution plan to a node
   * @param {*} id The id of the destination node 
   * @returns An array of operator names, in the order they are met when going from the root of the execution plan to the destionation node 
   */
  const findCorrespondingPath = (id) => {
    for(var leafIndex in leaves){
      if(leaves[leafIndex].id.toString() === id){
        return leaves[leafIndex].path;
      }
    }

    //No leaf was found for the given id.
    return [];
  }

  /**
   * Auxiliary function used by offSetNode(). Modifies the lastRead attribute of a scan node and resets currents mappings of the join operators on the path between the root of the execution plan and the scan node
   * @param {*} id The id of the node to be modified
   * @param {*} value The new value to be given to the lastRead attribute
   */
  const __offSetNode = (id, value) => {
    var plan = nextLink_to_jsonPlan(nextLink);
    var current = plan;

    var path = findCorrespondingPath(id);

    for(var ite in path){
      current = current[path[ite]];

      if(path[ite] === "joinSource" || path[ite] === "joinRight" || path[ite] === "joinLeft"){
        current["mucMap"] = [];
      }
    }

    current["lastRead"] = value;

    var newLink = jsonPlan_to_nextLink(plan)
    setNextLink(newLink);
  }

    /**
   * Checks if an element is an HTML element representing a Scan Operator Node
   * @param {*} element The element to be checked
   * @returns True if the id attribute of the element isn't null and the id attribute of the element belongs to the leaves, false otherwise
   */
     const isScanNode = (element) => {
      for(var leaf in leaves){
        var id = element.getAttribute("id");
        if(id !== null && leaves[leaf].id.toString() === id.toString()){
          return true;
        }
      }
      return false;
    }

  /**
   * Allows the user to modify the lastRead attribute of one the scan operators of the plan 
   * @param {*} targetNode The node representing the scan operator to modify
   */
  const offSetNode = (targetNode, newValue) => {
    var plan = nextLink_to_jsonPlan(nextLink);
    var current = plan;

    var path = findCorrespondingPath(targetNode.getAttribute("id"));

    for(var ite in path){
      current = current[path[ite]];
    }
    
    var currentLastRead = current["lastRead"];
    var maxRead = current["cardinality"];

    var parsedValue = parseInt(newValue);

    if(Number.isInteger(parsedValue)/*value is a number*/ && parsedValue > 0 /*value is not incoherent (greater than 0 and lesser than there are triple patter to scan)*/){
      __offSetNode(targetNode.getAttribute("id"), newValue);
    }
  }


  //-----------------------------------------------------------------------------BUTTON INPUT HANDLING--------------------------------------------------------------------------------------------------------

  const handleCommitQueryClick = () => { 
    if(stateManager.canCommit()){
      commitFirstQuantum().then(() => {
        stateManager.setState("betweenSteps");
      });
    }
    
  }

  const handleResumeClick = () => {
    if(stateManager.canNext()){
      stateManager.setState("betweenSteps");
      fetchNext();
    }
    
  }

  const handleAutoRunClick = () => {
    if(stateManager.canAutoRun()){
      stateManager.setState("autoRun");
      resumeAutoRun();
    }
    
  }

  const handleStopAutoRunClick= () => {
    if(stateManager.canStopAutoRun()){
      stateManager.setState("betweenSteps");
    } 
  }

  const handleLayoutClick = () => {
    createGraph(nodes.concat(edges));
  }

  const handleGraphClick = (e) => {

    var target = e.target;
    var newValue = target.getAttribute("aria-valuenow");
    var contNode = target.parentNode.parentNode.parentNode.parentNode;

    if(isScanNode(contNode) && stateManager.canOffSet()){
      offSetNode(contNode, newValue);
    };
  }

  const toggleOffSetMode = () => {

    var allNodes = document.getElementsByClassName("ContainerNode");

    if(stateManager.canEnterOffSetMode()){
    
      stateManager.setState("offSet");

      document.getElementById("root").classList.add("ShadowedApp");

      for(var i = 0; i < allNodes.length; i++){

        if(!isScanNode(allNodes[i])) {
          allNodes[i].classList.add("ShadowedNode");
        } else {
          allNodes[i].classList.add("HighlightedNode");
        }
      }
    
    } else {

      if(stateManager.canLeaveOffSetMode()){
    
        stateManager.setState("betweenSteps");
    
        document.getElementById("root").classList.remove("ShadowedApp");

        for(var j = 0; j < allNodes.length; j++){

          allNodes[j].classList.remove("ShadowedNode");
          allNodes[j].classList.remove("HighlightedNode");
          
        }
      } 
    
    }
  }

  return( 
    <div className="App">
      <div className="Header">
        <div className="CreditsAndUsefulLinks">
          <ul>
            <li>
              <a href="https://github.com/theray1/SaGe-interface">Project Github</a>
            </li>
            <li>
              <a href="http://sage.univ-nantes.fr/">SaGe</a>
            </li>
          </ul>
          <div className="About">
            Thanks to: LS2N, Hala Skaf-Molli, Pascal Molli, Julien, Hoang, Vincent, and the googley eyed plant I watered during my stay. 
            <br/>Author : Erwan Boisteau-Desdevises
          </div>
        </div>

        <div className="Inputs">
          <div className="YasqeWrapper">
            <div id="YasqeEditor">
            </div>
          </div>
         
          <br/>

          <table className="Buttons">
            <tbody>
              <tr className="ButtonsTable1">
                <th><button id="commitQueryButton" onClick={() => handleCommitQueryClick()}>Commit Query</button></th>
                <th><button id="commitQueryAndStartAutoRunButton" onClick={() => handleAutoRunClick()}>Auto-Run Query</button></th>
                <th><button id='layoutButton' onClick={() => handleLayoutClick()}>Re-Layout Graph</button></th>
              </tr>
              <tr className="ButtonsTables2">
              <th><button id="resumeQueryButton" onClick={() => handleResumeClick()}>Next Quantum</button></th>
                <th><button id='stopAutoRun' onClick={() => handleStopAutoRunClick()}>Stop Auto-Run</button></th>
                <th><button id='modeButton' onClick={() => toggleOffSetMode()}>Toggle Offset Mode</button></th>
              </tr>
            </tbody>
          </table>

  
        </div>
      </div>

    

      <div className="MainGraphWithMetrics">
        <div className="Metrics">
          <div className="MetricsContent">
          

            Results:<br/>{results.length}<br/> <br/>
            Export:<br/>{roundDownFiveDecimals(stats.exportMetric)}<br/><br/>
            Import:<br/>{roundDownFiveDecimals(stats.importMetric)}<br/><br/>
            Cost:<br/>{roundDownFiveDecimals(stats.costMetric)}<br/><br/>
            Coverage:<br/>{roundDownFiveDecimals(stats.coverageMetric)}<br/>
            
            <div id="QueryProgressBarContainer" className="QueryProgressBarContainer">
              <QueryProgressBar backgroundColor={"#eb7ce1"} progressBarColor={"#80036d"} progressValue={stats.coverageMetric*100}/>
            </div>
            <br/>

            
          </div>
        </div>   
        <div className="MainGraph">
          <ReactFlow
            nodes={nodes} 
            edges={edges} 
            nodeTypes={nodeTypes} 
            onNodesChange={onNodesChange} 
            fitView
            minZoom={0.1} 
            maxZoom={5}
            onMouseUp={(e) => {handleGraphClick(e)}}>
              <Controls/>
          </ReactFlow>
        </div>
      </div>
      <ResizableBox resizeHandles={['n']} height={100} width={1920} minConstraints={[100, 100]}>
      <div className="Results">
        <div className="ResultsContainer">
          <table className="ResultsContent">
            <thead>
              {variables}
            </thead>
            <ResultList resultList={results}/>
          </table>
        </div>
      </div>
      </ResizableBox>
      
    </div>
  )
}

/**
 * 
 */

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
