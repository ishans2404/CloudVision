// import React, { useState } from 'react';
// import FileUpload from './FileUpload';
// import GraphVisualization from './GraphVisualization';

// const App = () => {
//   const [graphData, setGraphData] = useState(null);

//   const handleGraphDataReceived = (data) => {
//     setGraphData(data);
//     console.log(graphData);
//   };

//   return (
//     <div>
//       <h1>Docker Compose Graph Visualization</h1>
//       <FileUpload onGraphDataReceived={handleGraphDataReceived} />
//       {graphData && <GraphVisualization graphData={graphData} />}
//     </div>
//   );
// };

// export default App;

import React, { useState } from 'react';
import FileUpload from './FileUpload';
import GraphVisualization from './GraphVisualization';
import RecommendationDisplay from './RecommendationDisplay';
import ParticlesComponent from './particles';

const App = () => {
  const [graphData, setGraphData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleGraphDataReceived = (data, file) => {
    setGraphData(data);
    setUploadedFile(file);
  };

  const handleRecommendationsReceived = (recommendationText) => {
    setRecommendations(recommendationText);
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ParticlesComponent id="particles" />
      <h1>Docker Compose Graph Visualization</h1>
      <FileUpload 
        onGraphDataReceived={handleGraphDataReceived} 
        onRecommendationsReceived={handleRecommendationsReceived}
        uploadedFile={uploadedFile}
      />
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {graphData && <GraphVisualization graphData={graphData} />}
        {recommendations && <RecommendationDisplay recommendations={recommendations} />}
      </div>
    </div>
  );
};

export default App;
