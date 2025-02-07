import React, { useState } from 'react';
import FileUpload from './FileUpload';
import GraphVisualization from './GraphVisualization';

const App = () => {
  const [graphData, setGraphData] = useState(null);

  const handleGraphDataReceived = (data) => {
    setGraphData(data);
    console.log(graphData);
  };

  return (
    <div>
      <h1>Docker Compose Graph Visualization</h1>
      <FileUpload onGraphDataReceived={handleGraphDataReceived} />
      {graphData && <GraphVisualization graphData={graphData} />}
    </div>
  );
};

export default App;
