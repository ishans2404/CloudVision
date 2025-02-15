# CloudVision

CloudVision is an advanced cloud application dependency analysis tool designed to enhance system reliability, performance, and scalability. It visualizes and analyzes complex dependency graphs of applications and cloud-based systems, detects critical bottlenecks, and provides actionable optimization recommendations. With integrated AWS features, CloudVision offers real-time monitoring and insights, empowering developers to proactively address performance issues, minimize downtimes, and streamline cloud application management.

## Table of Contents

1. [Features](#features)
2. [Directory Structure](#directory-structure)
3. [Installation](#installation)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
   - [Monitor Client Setup](#monitor-client-setup)
4. [Environment Configuration](#environment-configuration)
5. [API Endpoints](#api-endpoints)
6. [Usage](#usage)
7. [Contributing](#contributing)
8. [License](#license)

## Features

- **Dependency Visualization:** Generates comprehensive graphs depicting service interactions and dependencies within your cloud architecture.

- **Performance Optimization:** Analyzes configurations to identify bottlenecks and suggests improvements for enhanced system performance.

- **AWS Integration:** Fetches real-time metrics from AWS CloudWatch, including EC2 instances, to monitor resource utilization and application health.

- **Security Assessment:** Identifies potential vulnerabilities within your Docker containers and cloud infrastructure.

- **Real-Time Metrics:** Provides backend endpoints to retrieve live metrics from Docker containers and AWS services.
## Directory Structure

The project is organized as follows:

```
CloudVision/
├── README.md
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── test.py
│   └── test2.py
├── data_collection/
│   └── aws.py
├── frontend2/
│   ├── README.md
│   ├── package-lock.json
│   ├── package.json
│   ├── .gitignore
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   └── src/
│       ├── App.css
│       ├── App.js
│       ├── App.test.js
│       ├── FileUpload.js
│       ├── GraphVisualization.js
│       ├── Home.js
│       ├── LandingPage.js
│       ├── RecommendationDisplay.js
│       ├── index.css
│       ├── index.js
│       ├── lib.js
│       ├── particles.js
│       ├── reportWebVitals.js
│       └── setupTests.js
├── frontend3/
│   ├── README.md
│   ├── package-lock.json
│   ├── package.json
│   ├── .gitignore
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   └── src/
│       ├── App.css
│       ├── App.jsx
│       ├── App.test.js
│       ├── index.css
│       ├── index.js
│       ├── reportWebVitals.js
│       ├── setupTests.js
│       ├── components/
│       │   ├── GraphVisualization.js
│       │   ├── Layout.jsx
│       │   └── LoadingOverlay.jsx
│       ├── contexts/
│       │   └── AppContext.js
│       ├── pages/
│       │   ├── AwsPage.jsx
│       │   ├── Dashboard.jsx
│       │   ├── DockerPage.jsx
│       │   └── LandingPage.jsx
│       └── styles/
│           └── theme.js
└── monitor-client/
    ├── Dockerfile
    ├── app.py
    ├── docker-compose.yml
    ├── docker-wordpress.yml
    ├── index.html
    ├── requirements.txt
    └── vulscan.html
```

## Installation

### Backend Setup

1. **Navigate to the backend directory:**

   ```bash
   cd CloudVision/backend
   ```

2. **Install the required dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server:**

   ```bash
   uvicorn app:app --reload
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd CloudVision/frontend3
   ```

2. **Install the required dependencies:**

   ```bash
   npm install
   ```

3. **Start the frontend application:**

   ```bash
   npm start
   ```

### Monitor Client Setup

1. **Navigate to the monitor-client directory:**

   ```bash
   cd CloudVision/monitor-client
   ```

2. **Build and run the Docker container:**

   ```bash
   docker-compose up --build
   ```

   Ensure that Docker is installed and running on your system.

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
OPENROUTER_API_KEY=
DOCKER_FASTAPI_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

Replace the empty values with your actual credentials and URLs.

## API Endpoints

The backend provides the following RESTful API endpoints:

- `POST /upload-docker-compose/`: Upload and analyze a Docker Compose file to visualize service dependencies.

- `POST /get-recommendations/`: Receive optimization recommendations based on your Docker Compose configurations.

- `GET /vulnerabilities/`: Retrieve a list of identified vulnerabilities within your services.

- `GET /metrics/`: Access real-time metrics from Docker containers.

- `GET /get-ec2/`: Fetch metrics from AWS EC2 instances.

For detailed information on each endpoint, refer to the API documentation or inspect the `app.py` file in the `backend` directory.

To utilize CloudVision effectively, follow the steps below:

## Usage

1. **Start the Backend and Frontend:**

   Ensure both the backend server and frontend application are running.

2. **Access the Application:**

   Open your web browser and navigate to `http://localhost:3000` to access the CloudVision interface.

3. **Upload Docker Compose File:**

   Within the application, navigate to the upload section and submit your Docker Compose file. This will allow CloudVision to analyze your application's architecture.

4. **View Dependency Graph:**

   After uploading, the system will generate a visual representation of your application's dependencies, helping you understand the relationships and interactions between different services.

5. **Analyze Recommendations:**

   Based on the analysis, CloudVision will provide optimization recommendations. Review these suggestions to enhance system performance and reliability.

6. **Monitor Real-time Metrics:**

   Utilize the monitoring dashboard to observe real-time metrics from your Docker containers, enabling proactive performance management.

## Contributing

We welcome contributions to enhance CloudVision. To contribute:

1. **Fork the Repository:**

   Navigate to the [CloudVision GitHub repository](https://github.com/ishans2404/CloudVision) and click on "Fork" to create a personal copy of the repository.

2. **Clone the Forked Repository:**

   Use the following command to clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/CloudVision.git
   ```

3. **Create a New Branch:**

   Before making changes, create a new branch to keep your modifications organized:

   ```bash
   git checkout -b feature-name
   ```

4. **Make Changes and Commit:**

   Implement your changes and commit them with descriptive messages:

   ```bash
   git commit -m "Description of changes"
   ```

5. **Push Changes to GitHub:**

   Push your changes to your forked repository:

   ```bash
   git push origin feature-name
   ```

6. **Create a Pull Request:**

   Go to the original CloudVision repository and create a pull request, detailing the changes you've made and their purpose.

## License

CloudVision is licensed under the MIT License. For more details, refer to the [LICENSE](https://github.com/ishans2404/CloudVision/blob/main/LICENSE) file in the repository.

For further information and updates, visit the [CloudVision GitHub repository](https://github.com/ishans2404/CloudVision). 
   
