import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Box,
  Button,
} from '@mui/material';
import { styled } from '@mui/system';
import FileUpload from './FileUpload';
import GraphVisualization from './GraphVisualization';
import RecommendationDisplay from './RecommendationDisplay';

const DashboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'black',
  color: 'white',
  minHeight: '100vh',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  borderRadius: '1rem',
  padding: theme.spacing(2),
  width: '90%',
  height: '1%',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
}));

const GraphContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  width: '90%',
  height: '70vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '1rem',
  overflow: 'hidden',
  marginTop: theme.spacing(2),
}));

const RecommendationsContainer = styled(Box)(({ theme }) => ({
  width: '90%',
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  borderRadius: '1rem',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
}));

const Home = () => {
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
    <DashboardContainer>
      <Typography variant="h4" gutterBottom>
          Docker Compose Graph Visualization
      </Typography>
      <FileUpload
        onGraphDataReceived={handleGraphDataReceived} 
        onRecommendationsReceived={handleRecommendationsReceived}
        uploadedFile={uploadedFile}
      />

      {graphData && (
        <GraphContainer>
          <GraphVisualization graphData={graphData} />
        </GraphContainer>
      )}
      
      {recommendations && (
          <RecommendationDisplay recommendations={recommendations} />
      )}
    </DashboardContainer>
  );
};

export default Home;
