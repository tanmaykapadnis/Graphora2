// script.js — simple front-end that shows nodes as cards
// For now we use a SAMPLE JSON graph (no backend, no OpenAI)
// Later we will replace the sampleGraph with a fetch() to /api/generate

const generateBtn = document.getElementById('generateBtn');
const nodesContainer = document.getElementById('nodesContainer');


const sampleGraph = {
  nodes: [
    { id: 'n0', label: 'Neuroscience', summary: 'The study of the nervous system, its structure, function, and disorders.', keywords: ['brain','neuron'] },
    { id: 'n1', label: 'Neurons', summary: 'Nerve cells that transmit electrical and chemical signals.', keywords: ['axon','synapse'] },
    { id: 'n2', label: 'Brain Structure', summary: 'Regions like cortex, cerebellum; different functions.', keywords: ['cortex','cerebellum'] },
    { id: 'n3', label: 'Synaptic Plasticity', summary: 'Synapses change strength over time; basis for learning.', keywords: ['LTP','learning'] }
  ],
  edges: [
    { from: 'n0', to: 'n1', relation: 'composed-of' },
    { from: 'n1', to: 'n3', relation: 'enables' }
  ]
};




function showDetails(node) {
  const panel = document.getElementById('detailsPanel');
  panel.innerHTML = `
    <h3>${node.label}</h3>
    <p>${node.summary}</p>
    <div class="chips">
      ${node.keywords.map(k => `<span class="chip">${k}</span>`).join('')}
    </div>
  `;
  panel.classList.remove('hidden');
}





function renderNodes(graph) {
  nodesContainer.innerHTML = '';
  graph.nodes.forEach(node => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = node.id;
    card.innerHTML = `<h3>${node.label}</h3><p>${node.summary}</p>`;
    card.addEventListener('click', () => {
      // When node clicked: show details in panel / console
      console.log('Node clicked', node);
      showDetails(node);

    });
    nodesContainer.appendChild(card);
  });
}
function renderGraph(graph) {
  const container = document.getElementById('graphContainer');

  const nodes = new vis.DataSet(graph.nodes.map(n => ({
    id: n.id,
    label: n.label
  })));

  const edges = new vis.DataSet(graph.edges.map(e => ({
    from: e.from,
    to: e.to,
    label: e.relation
  })));

  const data = { nodes, edges };
  const options = { physics: true }; // auto layout

  
  const network = new vis.Network(container, data, options);
  container.network = network; // ✅ store it for later
  // save for later

  network.on("selectNode", function (params) {
    const nodeId = params.nodes[0];
    const node = graph.nodes.find(n => n.id === nodeId); // ✅ find node object
    if (node) showDetails(node);
    const card = document.querySelector(`.card[data-id="${nodeId}"]`);
    if (card) {
      document.querySelectorAll(".card").forEach(c => c.classList.remove("highlight"));
      card.classList.add("highlight");
      card.addEventListener('click', () => {
        console.log('Node clicked', node);
        showDetails(node);

        document.querySelectorAll(".card").forEach(c=>c.classList.remove("highlight"));
        card.classList.add("highlight");

    
        // 👇 highlight graph node
        const container = document.getElementById('graphContainer');
        if (container.network) {
          container.network.selectNodes([node.id]);
        }
      });
      
    }
  });
}


// initial render so you see something
renderNodes(sampleGraph);

// For later: hooking to a backend
generateBtn.addEventListener('click',  () => {
  const text = document.getElementById('inputText').value.trim();
  
  if (!text) {
    alert('Paste article text or URL first.');
    return;
  }

  const items=text.split(',').map(t=>t.trim()).filter(t=>t);
  
  
  
  const userGraph={
    nodes: items.map((item, i) => ({
      id: "u" + i, 
      label: item,
      summary: "You entered: " + item,
      keywords: ["custom"]
    })),
    edges: items.map((item, i) => {
      if (i === 0) return null; 
      return { from: "u" + (i - 1), to: "u" + i, relation: "related-to" };
    }).filter(Boolean)
    
  };
  
  renderNodes(userGraph);
  renderGraph(userGraph);
});


