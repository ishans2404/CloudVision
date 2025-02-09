import React, { useEffect, useRef, useState } from "react";
import { DataSet, Network } from "vis-network/standalone";

const GraphVisualization = ({ graphData }) => {
  const graphRef = useRef(null);
  const networkInstance = useRef(null);
  const [selectedInfo, setSelectedInfo] = useState(null); // Store clicked node/edge info

  useEffect(() => {
    if (graphData && graphRef.current) {
      const nodes = new DataSet();
      const edges = new DataSet();

      // Add main nodes (services)
      graphData.nodes.forEach((node) => {
        nodes.add({
          id: node.id,
          label: node.label,
          shape: "circle",
          color: "#62b6cb",
        });

        // Create intermediate nodes for Volumes, Ports, and Networks
        node.volumes.forEach((vol) => {
          const volumeId = `volume-${vol}`;
          if (!nodes.get(volumeId)) {
            nodes.add({
              id: volumeId,
              label: `Volume`,
              shape: "database",
              color: "#bee9e8",
            });
          }
          edges.add({ from: node.id, to: volumeId, color: "green" });
        });

        node.ports.forEach((port) => {
          const portId = `port-${port}`;
          if (!nodes.get(portId)) {
            nodes.add({
              id: portId,
              label: `Port: ${port}`,
              shape: "diamond",
              color: "#1b4965",
            });
          }
          edges.add({ from: node.id, to: portId, color: "purple" });
        });

        node.networks.forEach((network) => {
          const networkId = `network-${network}`;
          if (!nodes.get(networkId)) {
            nodes.add({
              id: networkId,
              label: `Network: ${network}`,
              shape: "ellipse",
              color: "#cae9ff",
            });
          }
          edges.add({ from: node.id, to: networkId, color: "blue" });
        });
      });

      // Add dependency edges
      graphData.edges.forEach((edge) => {
        edges.add({
          id: `edge-${edge.source}-${edge.target}`,
          from: edge.source,
          to: edge.target,
          color: edge.type === "dependency" ? "red" :
                 edge.type === "network" ? "blue" :
                 edge.type === "volume" ? "green" :
                 edge.type === "port" ? "purple" : "gray",
          arrows: "to",
        });
      });

      const data = { nodes, edges };
      const options = {
        nodes: {
          shape: "dot",
          size: 20,
          font: { size: 14 }
        },
        edges: {
          arrows: "to",
          font: { align: "middle" },
          smooth: { type: "continuous" }
        },
        physics: {
          enabled: true,
          solver: "forceAtlas2Based",
          stabilization: { iterations: 200 }
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          navigationButtons: true,
          zoomView: true
        }
      };

      if (networkInstance.current) {
        networkInstance.current.destroy();
      }

      networkInstance.current = new Network(graphRef.current, data, options);

      // Click event listener
      networkInstance.current.on("click", function (params) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = nodes.get(nodeId);
          setSelectedInfo({ type: "node", data: node });
        } else if (params.edges.length > 0) {
          const edgeId = params.edges[0];
          const edge = edges.get(edgeId);
          setSelectedInfo({ type: "edge", data: edge });
        } else {
          setSelectedInfo(null);
        }
      });
    }
  }, [graphData]);

  useEffect(() => {
  const handleResize = () => {
    if (networkInstance.current) {
      networkInstance.current.redraw();
    }
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);


  return (
    <div>
      <div ref={graphRef} style={{ height: "55vh", width: "100%" }} />
      {selectedInfo && (
        <div style={{ marginTop: "10px", padding: "10px", border: "1px solid black" }}>
          <h4>Selected {selectedInfo.type === "node" ? selectedInfo.data.label + ": " + selectedInfo.data.id : "Edge: " + selectedInfo.data.from + " → " + selectedInfo.data.to} </h4>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;
