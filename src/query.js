const { SageClient, Spy } = require('sage-client')

// Create a spy to collect stats during query execution
const spy = new Spy()

// The URL of the SaGe server
const serverURL = 'http://sage.univ-nantes.fr/sparql'
// The IRI of the default graph
const defaultGraph = 'http://sage.univ-nantes.fr/sparql/dbpedia-2016-04'
// The SPARQL query to execute
const query = `
prefix dbo: <http://dbpedia.org/ontology/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?movie ?title ?name WHERE {
  ?movie dbo:starring [ rdfs:label 'Brad Pitt'@en ];
  rdfs:label ?title;
  dbo:director [ rdfs:label ?name ].
  FILTER LANGMATCHES(LANG(?title), 'EN')
  FILTER LANGMATCHES(LANG(?name),  'EN')
}`

// Create a new SaGe client
const client = new SageClient(serverURL, defaultGraph, spy)

// Execute the SPARQL query
client.execute(query).subscribe(b => {
  // Print solutions bindings (in simple JSON format)
  console.log(b.toObject())
}, (error) => {
  // Report errors
  console.error('ERROR: An error occurred during query execution.')
  console.error(error.stack)
}, () => {
  // Print some starts after the end of query execution
  console.log('Query execution completed!')
  console.log(`SPARQL query evaluated with ${spy.nbHTTPCalls} HTTP request(s)`)
})