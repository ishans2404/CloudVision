import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  borderRadius: '1rem',
  padding: theme.spacing(2),
  maxWidth: '50%',
  marginTop: theme.spacing(2),
}));

const RecommendationDisplay = ({ recommendations }) => {
  if (!recommendations) return null;

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recommendations
        </Typography>
        <Typography variant="body1">
          <ReactMarkdown>{recommendations}</ReactMarkdown>
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default RecommendationDisplay;
