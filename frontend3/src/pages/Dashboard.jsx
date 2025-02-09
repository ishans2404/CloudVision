import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../contexts/AppContext';
import GraphVisualization from '../components/GraphVisualization';
import LoadingOverlay from '../components/LoadingOverlay';

const Dashboard = () => {
  const theme = useTheme();
  const {
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
  } = useAppContext();

  const [isGraphMaximized, setIsGraphMaximized] = useState(false);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      await generateGraph(uploadedFile);
    }
  };

  const generateGraph = async (uploadedFile) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('http://localhost:8000/upload-docker-compose/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate graph');
      }

      const data = await response.json();
      setGraphData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/get-recommendations/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay open={isLoading} />
      
      <Grid container spacing={3}>
        {/* File Upload Section */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
              >
                Upload Docker Compose
                <input
                  type="file"
                  hidden
                  accept=".yml,.yaml"
                  onChange={handleFileUpload}
                />
              </Button>
              {file && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={generateRecommendations}
                  startIcon={<RefreshIcon />}
                >
                  Generate Recommendations
                </Button>
              )}
            </Box>
            {file && (
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Uploaded: {file.name}
              </Typography>
            )}
            {error && (
              <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>
                Error: {error}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Graph Visualization */}
        {graphData && (
          <Grid item xs={12}>
            <Card>
              <CardHeader
                action={
                  <IconButton onClick={() => setIsGraphMaximized(!isGraphMaximized)}>
                    {isGraphMaximized ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                }
                title="Docker Compose Visualization"
              />
              <CardContent>
                <Box
                  sx={{
                    height: isGraphMaximized ? '100%' : '600px',
                    transition: theme.transitions.create('height'),
                  }}
                >
                  <GraphVisualization graphData={graphData} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recommendations Section */}
        {recommendations && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Recommendations" />
              <CardContent>
                <Paper
                  elevation={0}
                  sx={{
                    backgroundColor: 'grey.50',
                    p: 2,
                    maxHeight: '400px',
                    overflow: 'auto',
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    <ReactMarkdown>{recommendations}</ReactMarkdown>
                  </pre>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Fullscreen Graph Dialog */}
      <Dialog
        fullScreen
        open={isGraphMaximized}
        onClose={() => setIsGraphMaximized(false)}
      >
        <Box sx={{ height: '100vh', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setIsGraphMaximized(false)}
              aria-label="close"
            >
              <FullscreenExitIcon />
            </IconButton>
          </Box>
          <GraphVisualization graphData={graphData} />
        </Box>
      </Dialog>
    </Box>
  );
};

export default Dashboard;