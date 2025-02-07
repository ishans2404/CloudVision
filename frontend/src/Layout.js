import ContainerLayout from "../elements/ContainerLayout";
import Navbar from "../navbar/Navbar";
import Img from "../image/Img";
import MainLayout from "../elements/MainLayout";
import React, { useState } from 'react';
import FileUpload from '../elements/FileUpload';
import GraphVisualizer from '../elements/GraphVisualizer';

export default function Layout() {
  const [graphData, setGraphData] = useState(null);

  const handleFileUpload = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    fetch('http://localhost:8000/upload-docker-compose/', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => setGraphData(data)) // Assuming the response contains the graph data
      .catch(error => console.error('Error uploading file:', error));
  };

  return (
    <ContainerLayout>
      <Navbar />
      <MainLayout>
        <MainLayout.Wrapper>
        <div>
          <h1>Graph Visualization</h1>
          <FileUpload onFileUpload={handleFileUpload} />
          {graphData && <GraphVisualizer graphData={graphData} />}
        </div>
          {/* <h1 className="title">Creando mi primer hook de React</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur
            quam perferendis minus recusandae odit ipsa amet itaque aut
            architecto enim praesentium quae, temporibus alias inventore
            incidunt est repellat exercitationem tempora.
          </p>

          <Img
            src="https://via.placeholder.com/600x300"
            title="Ejemplo de una imagen grande"
          />

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur
            quam perferendis minus recusandae odit ipsa amet itaque aut
            architecto enim praesentium quae, temporibus alias inventore
            incidunt est repellat exercitationem tempora.
          </p>

          <Img
            src="https://via.placeholder.com/600x300"
            title="Ejemplo de una imagen grande"
          />

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur
            quam perferendis minus recusandae odit ipsa amet itaque aut
            architecto enim praesentium quae, temporibus alias inventore
            incidunt est repellat exercitationem tempora.
          </p>

          <Img
            src="https://via.placeholder.com/600x300"
            title="Ejemplo de una imagen grande"
          />

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur
            quam perferendis minus recusandae odit ipsa amet itaque aut
            architecto enim praesentium quae, temporibus alias inventore
            incidunt est repellat exercitationem tempora.
          </p> */}
        </MainLayout.Wrapper>
      </MainLayout>
    </ContainerLayout>
  );
}
