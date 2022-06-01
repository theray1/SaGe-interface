import {Buffer} from 'buffer';
import { MarkerType } from 'react-flow-renderer';
import { jsonToArray } from './util';

var proto = require('./iterators_pb');


const node = ['projSource', 'joinSource', 'unionSource', 'filterSource', 'projLeft', 'projRight', 'joinLeft', 'joinRight', 'unionLeft', 'unionRight', 'filterLeft', 'filterRight','valuesSource', 'scanSource', 'insertSource', 'deleteSource', 'valuesLeft', 'valuesRight', 'scanLeft', 'scanRight', 'deleteLeft', 'deleteRight', 'insertLeft', 'insertRight'];
/**
 * Checks if a key is a query operator
 * @param {*} key The key to be checked 
 * @returns true if key is an operator, false otherwise 
 */
const is_node = (key) => {
  return node.includes(key);
}

const leaf = ['scanLeft', 'scanRight', 'scanSource'];
/**
 * Checks if a key is a query operator
 * @param {*} key The key to be checked 
 * @returns true if key is an operator, false otherwise 
 */
 const is_leaf = (key) => {
  return leaf.includes(key);
}


/**
 * Creates a node according to the key present in the JSON object
 * @param {*} obj The JSON object representing a subtree of a the execution plan tree
 * @param {*} key A child of the object
 * @param {*} id The id of the created node 
 * @returns A JSON object representing a node for a react flow graph
 */
const node_factory = (obj, key, id, path) => {
  var node = {
    id: id.toString(),
    type: 'default',
    position: {x: 0, y: 0},
    path: path,
    data: {},
  };

  if(key === 'projSource' || key === 'projLeft' || key === 'projRight'){//Projection
    node.type = 'projectionNode';
    node.data = {
      label: 'Projection',
      valuesList: obj[key].valuesList,
      coverage: obj[key].coverage,
      cost: obj[key].cost,
    };
  }
  else if(key === 'joinSource' || key === 'joinLeft' || key === 'joinRight'){//Join
    node.type = 'joinNode';
    node.data = {
      label: 'Join',
      mucMap: obj[key].mucMap,
      coverage: obj[key].coverage,
      cost: obj[key].cost,
    };  
  }
  else if(key === 'unionSource' || key === 'unionLeft' || key === 'unionRight'){//Union
    node.type = 'unionNode';
    node.data = {
      label: 'Union',
      coverage: obj[key].coverage,
      cost: obj[key].cost,
    };
  }
  else if(key === 'filterSource' || key === 'filterLeft' || key === 'filterRight'){//Filter
    node.type = 'filterNode';
    node.data = {
      label: 'Filter',
      consumed: obj[key].consumed,
      cost: obj[key].cost,
      coverage: obj[key].coverage,
      expression: obj[key].expression,
      muMap: obj[key].muMap,
      produced: obj[key].produced,
      variablesList: obj[key].variablesList,
    };
  }
  else if(key === 'scanSource' || key === 'scanLeft' || key === 'scanRight'){//Scan
    node.type = 'scanNode';
    node.data = {
      label: 'Scan',
      cost: obj[key].cost,
      coverage: obj[key].coverage,
      cumulativeCardinality: obj[key].cumulativeCardinality,
      cumulativeProduced: obj[key].cumulativeProduced,
      lastRead: obj[key].lastRead,
      muMap: obj[key].muMap,
      mucMap: obj[key].mucMap,
      pattern: obj[key].pattern,
      produced: obj[key].produced,
      stages: obj[key].stages,
    };
  }
  else if(key === 'valuesSource' || key === 'valuesLeft' || key === 'valuesRight'){//Values
    node.type = 'valuesNode';
    node.data = {
      label: 'Values',
      cost: obj[key].cost,
      coverage: obj[key].coverage,
      mucMap: obj[key].mucMap,
      produced: obj[key].produced,
    }
  }
  else if(key === 'insertSource' || key === 'insertLeft' || key === 'insertRight'){//Insert
    node.type = 'insertNode';
    node.data = {
      label: 'Insertion',
      nbInserted: obj[key].nbInserted
    };
  }
  else if(key === 'deleteSource' || key === 'deleteLeft' || key === 'deleteRight'){//Delete
    node.type = 'deleteNode';
    node.data = {
      label: 'Deletion',
      nbInserted: obj[key].nbInserted
    };
  }

  return node;
}


/**
 * Translates a JSON object representing a query execution plan into an array representing a react flow graph
 * @param {*} obj The JSON object representing a query execution plan
 * @returns An array of nodes and edges
 */
const plan_request_to_graph = (obj) => {
  var nodes = [];
  var edges = [];
  var queue = [[obj, null, []]];
  var leaves = [];
  var id = 0;

  while (queue.length > 0){
    var [currentNode, parentId, path] = queue.shift();
    
    for (var key in currentNode){

      if (currentNode[key] !== undefined && (is_node(key))){

        var currentPath = path.slice();
        currentPath.push(key);

        if(is_leaf(key)){
          leaves.push({
            path: currentPath,
            id: id
          })
        }

        queue.push([currentNode[key], id, currentPath]);

        var newNode = node_factory(currentNode, key, id, currentPath);
        nodes.push(newNode);

        if(parentId !== null){
          edges.push({
            id: 'e'+parentId+'-'+id,
            target: parentId.toString(),
            source: id.toString(),
            animate: 'false',
            type: 'smoothstep',
            style: { 
              stroke: 'red',
              strokeWidth: 4,
             },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 50,
              color: "blue"
            },
          })
        }
        id++;
      }
    }
  }


  return {
    graphElements: nodes.concat(edges),
    leaves: leaves
  }
    
}

/**
 * Translates a nextLink into array representing a react flow graph
 * @param {*} nextLink The nextLink to be translated
 * @returns An array of nodes and edges
 */
export function nextLink_to_graph(nextLink) {
  var jsonPlan = nextLink_to_jsonPlan(nextLink);
  
  const graph = plan_request_to_graph(jsonPlan);

  return graph;
} 

/**
 * Transates a next link into a JSON object representing the execution plan contained in the next link
 * @param {*} nextLink The net link to be decoded
 * @returns The JSON object representing the execution plan corresponding to the next link
 */
export function nextLink_to_jsonPlan(nextLink) {
  var bufferedPlan = Buffer.from(nextLink, 'base64');

  var jsonPlan = proto.RootTree.deserializeBinary(new Uint8Array(bufferedPlan)).toObject();

  return jsonPlan;
}

/**
 * Encodes a JSON object representing an execution plan into a usable next link
 * @param {*} jsonPlan The JSON object to be encoded
 * @returns The next link corresponding to the execution plan
 */
export function jsonPlan_to_nextLink(jsonPlan) {

  var content = jsonToArray(jsonPlan);

  var message = new proto.RootTree(content);

  var serializedMessage = message.serializeBinary();

  var bufferedMessage = Buffer.from(serializedMessage, 'base64');

  var nextLink = bufferedMessage.toString('base64');

  return nextLink;

}