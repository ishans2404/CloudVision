import boto3
import logging
import os
from botocore.exceptions import ClientError
from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# class CloudWatchWrapper:
#     """Encapsulates Amazon CloudWatch functions."""

#     def __init__(self, region_name='us-east-1'):
#         """
#         :param region_name: AWS region.
#         """
#         self.cloudwatch_client = boto3.client(
#             'cloudwatch',
#             region_name=region_name
#         )

#     def get_metric_statistics(self, namespace, name, start, end, period, stat_types):
#         """
#         Gets statistics for a metric within a specified time span.

#         :param namespace: The namespace of the metric.
#         :param name: The name of the metric.
#         :param start: The UTC start time of the time span to retrieve.
#         :param end: The UTC end time of the time span to retrieve.
#         :param period: The period, in seconds, in which to group metrics.
#         :param stat_types: The type of statistics to retrieve.
#         :return: The retrieved statistics for the metric.
#         """
#         try:
#             response = self.cloudwatch_client.get_metric_statistics(
#                 Namespace=namespace,
#                 MetricName=name,
#                 StartTime=start,
#                 EndTime=end,
#                 Period=period,
#                 Statistics=stat_types
#             )
#             logger.info("Got %s statistics for %s.", len(response["Datapoints"]), response["Label"])
#             return response
#         except ClientError as e:
#             logger.exception("Couldn't get statistics for %s.%s. Error: %s", namespace, name, str(e))
#             return None

# if __name__ == "__main__":
#     from datetime import datetime, timedelta

#     # AWS region
#     REGION = "us-east-1"

#     # Define metric parameters
#     METRICS = [
#         {"namespace": "AWS/EC2", "name": "CPUUtilization"},
#         {"namespace": "AWS/EC2", "name": "NetworkIn"},
#         {"namespace": "AWS/EC2", "name": "NetworkOut"},
#         {"namespace": "CWAgent", "name": "mem_used_percent"},  # CloudWatch Agent memory metric
#         {"namespace": "CWAgent", "name": "cpu_usage_active"}   # CloudWatch Agent CPU metric
#     ]
    
#     START_TIME = datetime.utcnow() - timedelta(hours=1)
#     END_TIME = datetime.utcnow()
#     PERIOD = 60
#     STATISTICS = ["Average", "Maximum", "Minimum"]
    
#     cloudwatch = CloudWatchWrapper(REGION)
    
#     for metric in METRICS:
#         metrics_data = cloudwatch.get_metric_statistics(
#             metric["namespace"], metric["name"], START_TIME, END_TIME, PERIOD, STATISTICS
#         )
#         if metrics_data:
#             print(f"Metric: {metric['name']}")
#             print(metrics_data)
#             print("-" * 50)


class CloudWatchWrapper:
    """Encapsulates Amazon CloudWatch functions."""

    def __init__(self, region_name='us-east-1'):
        """
        :param region_name: AWS region.
        """
        self.cloudwatch_client = boto3.client(
            'cloudwatch',
            region_name=region_name
        )

    def get_metric_statistics(self, namespace, name, start, end, period, stat_types):
        """
        Gets statistics for a metric within a specified time span.
        """
        try:
            response = self.cloudwatch_client.get_metric_statistics(
                Namespace=namespace,
                MetricName=name,
                StartTime=start,
                EndTime=end,
                Period=period,
                Statistics=stat_types
            )
            logger.info("Got %s statistics for %s.", len(response["Datapoints"]), response["Label"])
            
            # Structure the datapoints
            structured_data = []
            for datapoint in response["Datapoints"]:
                structured_data.append({
                    "Timestamp": datapoint.get("Timestamp"),
                    "Average": datapoint.get("Average"),
                    "Maximum": datapoint.get("Maximum"),
                    "Minimum": datapoint.get("Minimum"),
                    "Period": period
                })
            
            return {name: structured_data}
        
        except ClientError as e:
            logger.exception("Couldn't get statistics for %s.%s. Error: %s", namespace, name, str(e))
            return None

def main():
    from datetime import datetime, timedelta

    REGION = "us-east-1"
    
    METRICS = [
        {"namespace": "AWS/EC2", "name": "CPUUtilization"},
        {"namespace": "AWS/EC2", "name": "NetworkIn"},
        {"namespace": "AWS/EC2", "name": "NetworkOut"},
        {"namespace": "CWAgent", "name": "mem_used_percent"},
        {"namespace": "CWAgent", "name": "cpu_usage_active"}
    ]
    
    START_TIME = datetime.utcnow() - timedelta(hours=1)
    END_TIME = datetime.utcnow()
    PERIOD = 60
    STATISTICS = ["Average", "Maximum", "Minimum"]
    
    cloudwatch = CloudWatchWrapper(REGION)
    
    results = {}

    for metric in METRICS:
        metrics_data = cloudwatch.get_metric_statistics(
            metric["namespace"], metric["name"], START_TIME, END_TIME, PERIOD, STATISTICS
        )
        if metrics_data:
            print(f"Metric: {metric['name']}")
            results[metric["namespace"]] = results.get(metric["namespace"], {})
            results[metric["namespace"]][metric["name"]] = metrics_data.get(metric["name"])

    return results

