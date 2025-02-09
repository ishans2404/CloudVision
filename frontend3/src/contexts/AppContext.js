import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [file, setFile] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dockerMetrics, setDockerMetrics] = useState(null);
  const [dockerVulnerabilities, setDockerVulnerabilities] = useState(null);
  const [awsMetrics, setAwsMetrics] = useState(null);

  const value = {
    file,
    setFile,
    graphData,
    setGraphData,
    recommendations,
    setRecommendations,
    isLoading,
    setIsLoading,
    error,
    setError,
    dockerMetrics,
    setDockerMetrics,
    dockerVulnerabilities,
    setDockerVulnerabilities,
    awsMetrics,
    setAwsMetrics,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};