import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Box, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  borderRadius: '1rem',
  padding: theme.spacing(2),
  width: '80%',
  textAlign: 'center',
  marginTop: theme.spacing(2),
}));

const FileUpload = ({ onGraphDataReceived, onRecommendationsReceived, uploadedFile }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload-docker-compose/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Graph Data Response:', response.data);
      onGraphDataReceived(response.data, file);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!uploadedFile) {
      setError('Please upload a file first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await axios.post('http://localhost:8000/get-recommendations/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Recommendations Response:', response.data);
      onRecommendationsReceived(response.data);
    } catch (err) {
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledCard>
      <CardContent>
        
        <Box component="form" onSubmit={handleUpload} display="flex" flexDirection="row" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Upload Docker Compose File
        </Typography>
          <TextField type="file" onChange={handleFileChange} variant="outlined" margin="normal" inputProps={{ style: { color: 'white' } }} />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            Upload
          </Button>
        </Box>
        <Button 
          onClick={handleGenerateRecommendations} 
          variant="contained" 
          color="secondary" 
          disabled={loading || !uploadedFile}
        >
          Generate Recommendations
        </Button>
        {loading && <CircularProgress sx={{ marginTop: 2 }} />}
        {error && <Alert severity="error" sx={{ marginTop: 2 }}>{error}</Alert>}
      </CardContent>
    </StyledCard>
  );
};

export default FileUpload;