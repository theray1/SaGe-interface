import {Buffer} from 'buffer';
import { MarkerType } from 'react-flow-renderer';

var proto = require('./iterators_pb');


const leaf = ['valuesSource', 'scanSource', 'insertSource', 'deleteSource', 'valuesLeft', 'valuesRight', 'scanLeft', 'scanRight', 'deleteLeft', 'deleteRight', 'insertLeft', 'insertRight'];
const is_leaf = (op) => {
  return leaf.includes(op);
}

const node = ['projSource', 'joinSource', 'unionSource', 'filterSource', 'projLeft', 'projRight', 'joinLeft', 'joinRight', 'unionLeft', 'unionRight', 'filterLeft', 'filterRight'];
const is_node = (op) => {
  return node.includes(op);
}

const node_factory = (obj, key, id) => {
  var node = {
    id: id.toString(),
    type: 'default',
    position: {x: 0, y: 0},
    data: {},
    deducedData: {}
  };

  //console.log(obj);

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



const plan_request_to_graph = (obj) => {
  var nodes = [];
  var edges = [];
  var queue = [[obj, null]];
  var id = 0;

  while (queue.length > 0){
    var [o, parentId] = queue.shift();
    
    
    for (var key in o){
    
      if (o[key] !== undefined && (is_node(key) || is_leaf(key))){

        nodes.push(node_factory(o, key, id));

        queue.push([o[key], id]);

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

export function protoplan_to_graph(plan) {
  //console.log("plan :", plan);
  var decodeplan = Buffer.from(plan, 'base64');
  //console.log("decodeplan :", decodeplan);
  var jsonplan = proto.RootTree.deserializeBinary(new Uint8Array(decodeplan)).toObject();
  
  const graph = plan_request_to_graph(jsonplan);
  //console.log("Generated Graph", graph);
  return graph;
}