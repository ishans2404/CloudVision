import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppContext } from '../contexts/AppContext';
import LoadingOverlay from '../components/LoadingOverlay';

const MetricChart = ({ title, data, metrics }) => (
  <Card sx={{ height: '100%' }}>
    <CardHeader title={title} />
    <CardContent>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            {metrics.map((metric, index) => (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={`hsl(${index * 45}, 70%, 50%)`}
                fill={`hsl(${index * 45}, 70%, 85%)`}
                stackId="1"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

const AwsPage = () => {
  const { setIsLoading, setError } = useAppContext();
  const [currentTab, setCurrentTab] = useState(0);
  const [metricsData, setMetricsData] = useState({
    'AWS/EC2': {
      CPUUtilization: [],
      NetworkIn: [],
      NetworkOut: [],
    },
    CWAgent: {
      mem_used_percent: [],
      cpu_usage_active: [],
    },
  });

  const fetchAwsMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/get-ec2/`);
      if (!response.ok) throw new Error('Failed to fetch AWS metrics');
      const data = await response.json();
      setMetricsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAwsMetrics();
    const interval = setInterval(fetchAwsMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    {
      label: 'EC2 Metrics',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MetricChart
              title="CPU Utilization"
              data={metricsData['AWS/EC2'].CPUUtilization}
              metrics={['Average', 'Maximum', 'Minimum']}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MetricChart
              title="Network In"
              data={metricsData['AWS/EC2'].NetworkIn}
              metrics={['Average', 'Maximum', 'Minimum']}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MetricChart
              title="Network Out"
              data={metricsData['AWS/EC2'].NetworkOut}
              metrics={['Average', 'Maximum', 'Minimum']}
            />
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'CWAgent Metrics',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MetricChart
              title="Memory Usage"
              data={metricsData['CWAgent'].mem_used_percent}
              metrics={['Average']}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MetricChart
              title="CPU Active Usage"
              data={metricsData['CWAgent'].cpu_usage_active}
              metrics={['Average']}
            />
          </Grid>
        </Grid>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      {tabs[currentTab].content}
    </Box>
  );
};

export default AwsPage;
