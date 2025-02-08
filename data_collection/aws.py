import boto3
import csv
from datetime import datetime, timedelta
import re

def sanitize_metric_id(metric_name):
    metric_id = re.sub(r'[^a-zA-Z0-9_]', '_', metric_name).lower()
    if not metric_id[0].isalpha():
        metric_id = 'm_' + metric_id  # Ensure it starts with a letter
    return metric_id

def get_cloudwatch_metrics(namespace, dimension_name, dimension_value, period, start_time, end_time):
    cloudwatch = boto3.client('cloudwatch')
    
    metrics = cloudwatch.list_metrics(Namespace=namespace, Dimensions=[{'Name': dimension_name}])
    
    metric_data = []
    for metric in metrics.get('Metrics', []):
        metric_name = metric['MetricName']
        metric_id = sanitize_metric_id(metric_name)
        response = cloudwatch.get_metric_data(
            MetricDataQueries=[
                {
                    'Id': metric_id,
                    'MetricStat': {
                        'Metric': {
                            'Namespace': namespace,
                            'MetricName': metric_name,
                            'Dimensions': [
                                {
                                    'Name': dimension_name,
                                    'Value': dimension_value
                                }
                            ]
                        },
                        'Period': period,
                        'Stat': 'Average'
                    },
                    'ReturnData': True
                }
            ],
            StartTime=start_time,
            EndTime=end_time
        )
        
        if response['MetricDataResults']:
            metric_data.append((metric_name, response['MetricDataResults'][0]))
    
    return metric_data

def get_xray_traces(start_time, end_time):
    xray = boto3.client('xray')
    response = xray.get_trace_summaries(StartTime=start_time, EndTime=end_time)
    
    trace_data = []
    for trace in response.get('TraceSummaries', []):
        trace_data.append([trace.get('Id'), trace.get('Duration'), trace.get('ResponseTime'), trace.get('Annotations')])
    
    return trace_data

def save_to_csv(metric_data, trace_data):
    filename = f"cloudwatch_xray_metrics_{datetime.now().strftime('%Y%m%d%H%M%S')}.csv"
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Metric Name", "Timestamp", "Value"])
        
        for metric_name, data in metric_data:
            for timestamp, value in zip(data['Timestamps'], data['Values']):
                writer.writerow([metric_name, timestamp, value])
        
        writer.writerow([])
        writer.writerow(["X-Ray Trace ID", "Duration", "Response Time", "Annotations"])
        
        for trace in trace_data:
            writer.writerow(trace)
    
    print(f"Metrics and X-Ray traces saved to {filename}")

def main():
    namespace = "AWS/EC2"
    dimension_name = "InstanceId"
    dimension_value = input("Enter EC2 Instance ID (e.g., i-1234567890abcdef0): ")
    period = 60  # 1-minute interval
    
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=1)  # Last 1 hour
    
    print("Fetching CloudWatch Metrics...")
    metric_data = get_cloudwatch_metrics(namespace, dimension_name, dimension_value, period, start_time, end_time)
    
    print("Fetching AWS X-Ray Traces...")
    trace_data = get_xray_traces(start_time, end_time)
    
    save_to_csv(metric_data, trace_data)
    
if __name__ == "__main__":
    main()
