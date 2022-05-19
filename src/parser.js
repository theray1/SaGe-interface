import {Buffer} from 'buffer';
import { MarkerType } from 'react-flow-renderer';

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


/**
 * Creates a node according to the key present in the JSON object
 * @param {*} obj The JSON object representing a subtree of a the execution plan tree
 * @param {*} key A child of the object
 * @param {*} id The id of the created node 
 * @returns A JSON object representing a node for a react flow graph
 */
const node_factory = (obj, key, id) => {
  var node = {
    id: id.toString(),
    type: 'default',
    position: {x: 0, y: 0},
    data: {},
  };

  if(key === 'projSource' || key === 'projLeft' || key === 'projRight'){//Projection
    node.type = 'projectionNode';
    node.data = {
      label: 'Projection',
      valuesList: obj[key].valuesList
    };
  }
  else if(key === 'joinSource' || key === 'joinLeft' || key === 'joinRight'){//Join
    node.type = 'joinNode';
    node.data = {
      label: 'Join',
      mucMap: obj[key].mucMap
    };  
  }
  else if(key === 'unionSource' || key === 'unionLeft' || key === 'unionRight'){//Union
    node.type = 'unionNode';
    node.data = {
      label: 'Union',
    };
  }
  else if(key === 'filterSource' || key === 'filterLeft' || key === 'filterRight'){//Filter
    node.type = 'filterNode';
    node.data = {
      label: 'Filter',
      expression: obj[key].expression,
      muMap: obj[key].muMap,
      consumed: obj[key].consumed,
      produced: obj[key].produced
    };
  }
  else if(key === 'scanSource' || key === 'scanLeft' || key === 'scanRight'){//Scan
    node.type = 'scanNode';
    node.data = {
      label: 'Scan',
      cardinality: obj[key].cardinality, //le nombre de patternes pour une instance
      cumulativeCardinality: obj[key].cumulativeCardinality,
      patternCardinality: obj[key].patternCardinality, //le nombre de patternes pour toutes les instances cumulées
      lastRead: obj[key].lastRead,
      muMap: obj[key].muMap,
      mucMap: obj[key].mucMap,
      pattern: obj[key].pattern,
      patternProduced: obj[key].patternProduced, //le nombre de patternes produits lors d'une recherche pour toutes les instances
      produced: obj[key].produced, //le nombres patternes produits lors d'une recherche pour une instance
      stages: obj[key].stages
    };
  }
  else if(key === 'valuesSource' || key === 'valuesLeft' || key === 'valuesRight'){//Values
    node.type = 'valuesNode';
    node.data = {
      label: 'Values',
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
  var queue = [[obj, null]];
  var id = 0;

  while (queue.length > 0){
    var [currentNode, parentId] = queue.shift();
    
    
    for (var key in currentNode){
      if (currentNode[key] !== undefined && (is_node(key))){

        nodes.push(node_factory(currentNode, key, id));

        queue.push([currentNode[key], id]);

        if(parentId !== null){
          edges.push({
            id: 'e'+parentId+id,
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
  return nodes.concat(edges);
}

/**
 * Translates a nextLink into array representing a react flow graph
 * @param {*} nextLink The nextLink to be translated
 * @returns An array of nodes and edges
 */
export function nextLink_to_graph(nextLink) {
  var bufferedPlan = Buffer.from(nextLink, 'base64');

  var jsonPlan = proto.RootTree.deserializeBinary(new Uint8Array(bufferedPlan)).toObject();

  console.log(jsonPlan);
  
  const graph = plan_request_to_graph(jsonPlan);

  return graph;
}