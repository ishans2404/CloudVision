import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Link,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import LoadingOverlay from '../components/LoadingOverlay';

const ContainerMetricsCard = ({ container }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (state) => {
    switch (state.toLowerCase()) {
      case 'running':
        return 'success';
      case 'exited':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div">
              {container.container_name}
            </Typography>
            <Chip
              size="small"
              label={container.state}
              color={getStatusColor(container.state)}
              icon={container.state === 'running' ? <CheckCircleIcon /> : <ErrorIcon />}
            />
          </Box>
        }
        subheader={container.image_name}
        action={
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              CPU Usage
            </Typography>
            <Typography variant="h6">
              {container.resource_usage.cpu_percent}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Memory Usage
            </Typography>
            <Typography variant="h6">
              {container.resource_usage.memory_usage}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Memory %
            </Typography>
            <Typography variant="h6">
              {container.resource_usage.memory_percent}
            </Typography>
          </Grid>
        </Grid>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Detailed Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  Network I/O: {container.resource_usage.network_io}
                </Typography>
                <Typography variant="body2">
                  Block I/O: {container.resource_usage.block_io}
                </Typography>
                <Typography variant="body2">
                  PIDs: {container.resource_usage.pids}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  Uptime: {Math.floor(container.uptime / 60)} minutes
                </Typography>
                <Typography variant="body2">
                  Restart Count: {container.restart_count}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const VulnerabilitiesCard = ({ vulnerabilities, imageName }) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  const severityCounts = vulnerabilities.reduce((acc, vuln) => {
    acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Vulnerabilities - {imageName}</Typography>
          </Box>
        }
        action={
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        }
      />
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {Object.entries(severityCounts).map(([severity, count]) => (
            <Chip
              key={severity}
              label={`${severity}: ${count}`}
              color={getSeverityColor(severity)}
              variant="outlined"
            />
          ))}
        </Box>

        <Collapse in={expanded}>
          <Paper sx={{ overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>CVE</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Installed</TableCell>
                  <TableCell>Fixed Version</TableCell>
                  <TableCell>Solution</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vulnerabilities.map((vuln) => (
                  <TableRow key={vuln.cve}>
                    <TableCell>
                      <Link href={vuln['nvd link']} target="_blank">
                        {vuln.cve}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={vuln.severity}
                        color={getSeverityColor(vuln.severity)}
                      />
                    </TableCell>
                    <TableCell>{vuln.package}</TableCell>
                    <TableCell>{vuln.installed}</TableCell>
                    <TableCell>{vuln.fixed}</TableCell>
                    <TableCell>{vuln.solution}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const DockerPage = () => {
  const { setIsLoading, setError } = useAppContext();
  const [metrics, setMetrics] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState({ results: [] });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [metricsResponse, vulnerabilitiesResponse] = await Promise.all([
        fetch('http://localhost:8000/metrics/'),
        fetch('http://localhost:8000/vulnerabilities/')
      ]);

      if (!metricsResponse.ok || !vulnerabilitiesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const metricsData = await metricsResponse.json();
      const vulnerabilitiesData = await vulnerabilitiesResponse.json();

      setMetrics(metricsData);
      setVulnerabilities(vulnerabilitiesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Container Metrics */}
        {metrics.map((container) => (
          <Grid item xs={12} key={container.container_name}>
            <ContainerMetricsCard container={container} />
          </Grid>
        ))}

        {/* Vulnerabilities */}
        {vulnerabilities.results.map((result) => (
          <Grid item xs={12} key={result.image}>
            <VulnerabilitiesCard
              vulnerabilities={result.vulnerabilities}
              imageName={result.image}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DockerPage;