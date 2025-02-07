// import React, { useState } from 'react';
// import axios from 'axios';

// const FileUpload = ({ onGraphDataReceived }) => {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!file) {
//       setError('Please select a file');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await axios.post('http://localhost:8000/upload-docker-compose', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       const graphData = response.data;
//       onGraphDataReceived(graphData);
//     } catch (err) {
//       setError('Failed to upload file. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2>Upload Docker Compose File</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="file" onChange={handleFileChange} />
//         <button type="submit" disabled={loading}>Upload</button>
//       </form>

//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//     </div>
//   );
// };

// export default FileUpload;


import React, { useState } from 'react';
import axios from 'axios';

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

      console.log('Graph Data Response:', response.data); // Debugging
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

      console.log('Recommendations Response:', response.data); // Debugging
      onRecommendationsReceived(response.data); // Ensure correct response is passed
    } catch (err) {
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Docker Compose File</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>Upload</button>
      </form>

      <button 
        onClick={handleGenerateRecommendations} 
        disabled={loading || !uploadedFile}
        style={{ marginTop: '10px' }}
      >
        Generate Recommendations
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FileUpload;
