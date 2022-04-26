import {Buffer} from 'buffer';

var proto = require('./iterators_pb');


const leaf = ['scanSource', 'insertSource', 'deleteSource', 'valueLeft', 'valuesRight', 'scanLeft', 'scanRight', 'deleteLeft', 'deleteRight', 'insertLeft', 'insertRight'];
const is_leaf = (op) => {
  return leaf.includes(op);
}

const node = ['projSource', 'joinSource', 'unionSource', 'filterSource', 'projLeft', 'projRight', 'joinLeft', 'joinRight', 'unionLeft', 'unionRight', 'filterLeft', 'filterRight'];
const is_node = (op) => {
  return node.includes(op);
}

const plan_request_to_graph = (obj) => {
  var nodes = [];
  var edges = [];
  var queue = [[obj, null]];
  var id = 0;

  while (queue.length > 0){
    var [o, parentId] = queue.shift();


    console.log("o: ", o);
    console.log("parentId: ", parentId);
    
    
    for (var key in o){
    
      if (o[key] !== undefined && (is_node(key) || is_leaf(key))){
  
        
        if(is_node(key)){
          nodes.push({
            id: id.toString(),
            type: 'queryNode',
            position: {x: 200, y: 200},
            data: {
              label: key,
            }
          });
        }
        
        if(is_leaf(key)){
          nodes.push({
            id: id.toString(),
            type: 'queryLeaf',
            position: {x: 200, y: 200},
            data: {
              label: key,
              cardinality: o[key]["cardinality"], 
              cumulativeCardinality: o[key]["cumulativeCardinality"],
              lastRead: o[key]["lastRead"],
              MediaKeyStatusMapmucMap: o[key]["MediaKeyStatusMapmucMap"],
              pattern: o[key]["pattern"],
              patternCardinality: o[key]["patternCardinality"],
              patternProduced: o[key]["patternProduced"],
              produced: o[key]["produced"],
              stages: o[key]["stages"],
              timestamp: o[key]["timestamp"]
            }
          });
        }

        queue.push([o[key], id]);
        console.log("queue: ", queue);

        if(parentId !== null){
          edges.push({
            id: 'e'+parentId+id,
            target: parentId.toString(),
            source: id.toString(),
            animate: 'false'
          })
        }
        id++;
      }
    }
  }
  return nodes.concat(edges);
}

export function protoplan_to_graph(plan) {
  console.log("plan :", plan);
  var decodeplan = Buffer.from(plan, 'base64');
  console.log("decodeplan :", decodeplan);
  var jsonplan = proto.RootTree.deserializeBinary(new Uint8Array(decodeplan)).toObject();
  console.log("jsonplan :", jsonplan);
  const graph = plan_request_to_graph(jsonplan);
  console.log("Generated Graph", graph);
  return graph;
}