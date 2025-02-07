import React from 'react';
import ReactMarkdown from 'react-markdown';

const RecommendationDisplay = ({ recommendations }) => {
  if (!recommendations) return null;

  return (
    <div style={{
      maxWidth: '50%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      marginTop: '20px',
      background: '#f9f9f9'
    }}>
      <h3>Recommendations</h3>
      <ReactMarkdown>{recommendations}</ReactMarkdown>
    </div>
  );
};

export default RecommendationDisplay;
