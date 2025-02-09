import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: 'background.default',
        p: 3,
      }}
    >
      <Typography variant="h2" gutterBottom>
        Welcome to Cloud Dashboard
      </Typography>
      <Typography variant="h6" sx={{ mb: 4 }}>
        Monitor your AWS and Docker metrics efficiently.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
        Get Started
      </Button>
    </Box>
  );
};

export default LandingPage;
