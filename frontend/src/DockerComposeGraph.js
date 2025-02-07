import React, { useState } from 'react';
import { LineChart, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

const DockerComposeGraph = () => {
  const [graphData, setGraphData] = useState(null);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:8000/upload-docker-compose/', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      console.log(data)
      setGraphData(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const GraphSection = ({ title, data, renderContent }) => (
    <div className="mb-4 p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderContent(data)}
        </ResponsiveContainer>
      </div>
    </div>
  );

  const ServiceDependencies = ({ nodes, edges }) => {
    const dependencyData = nodes.map(node => ({
      name: node.id,
      dependencies: edges.filter(edge => 
        edge.source === node.id && edge.type === 'dependency'
      ).length
    }));

    return (
      <BarChart data={dependencyData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="dependencies" stroke="#8884d8" />
      </BarChart>
    );
  };

  const NetworkConnections = ({ nodes, edges }) => {
    const networkData = nodes.map(node => ({
      name: node.id,
      networks: edges.filter(edge => 
        edge.source === node.id && edge.type === 'network'
      ).length
    }));

    return (
      <LineChart data={networkData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="networks" stroke="#82ca9d" />
      </LineChart>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4 p-4 border rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Docker Compose Visualization</h1>
        <input
          type="file"
          accept=".yml,.yaml"
          onChange={(e) => uploadFile(e.target.files[0])}
          className="w-full p-2 border rounded"
        />
      </div>

      {graphData && (
        <>
          <GraphSection
            title="Service Dependencies"
            data={graphData}
            renderContent={(data) => <ServiceDependencies nodes={data.nodes} edges={data.edges} />}
          />
          <GraphSection
            title="Network Connections"
            data={graphData}
            renderContent={(data) => <NetworkConnections nodes={data.nodes} edges={data.edges} />}
          />
        </>
      )}
    </div>
  );
};

export default DockerComposeGraph;