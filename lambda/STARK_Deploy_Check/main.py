#Tracks status of CF Deploy after it is successfully triggered by STARK_Deploy

#Python Standard Library
import base64
import json
import textwrap
from time import sleep

#Extra modules
import yaml
import boto3

#Private modules
import convert_friendly_to_system as converter

cfn = boto3.client('cloudformation')
s3  = boto3.client('s3')

def lambda_handler(event, context):

    isBase64Encoded = event.get('isBase64Encoded', False)
    raw_data_model = event.get('body', '')

    if isBase64Encoded:
        raw_data_model = base64.b64decode(raw_data_model).decode()

    jsonified_payload = json.loads(raw_data_model)
    data_model = yaml.safe_load(jsonified_payload["data_model"])

    CF_stack_name = converter.convert_to_system_name(data_model.get('__STARK_project_name__'), "cf-stack")

    
    print("Sleep for 10!")
    sleep(10)

    response = cfn.describe_stacks(
        StackName=CF_stack_name
    )

    stack_status = response['Stacks'][0]['StackStatus']


    url    = ''
    result = ''
    if stack_status in [ 'CREATE_COMPLETE', 'UPDATE_COMPLETE' ]:

        response = cfn.describe_stack_resource(
            StackName=CF_stack_name,
            LogicalResourceId='STARKSystemBucket'
        )

        result          = 'SUCCESS'
        retry           = False
        bucket_name     = response['StackResourceDetail']['PhysicalResourceId']
        response        = s3.get_bucket_location(Bucket=bucket_name)
        bucket_location = response['LocationConstraint']
        url             = f"http://{bucket_name}.s3-website-{bucket_location}.amazonaws.com/"

    elif stack_status == 'CREATE_FAILED':
        result = 'FAILED'
        retry = False

    elif stack_status == 'ROLLBACK_IN_PROGRESS':
        result = 'FAILED'
        retry = False

    elif stack_status == 'ROLLBACK_COMPLETE':
        result = 'FAILED'
        retry = False

    elif stack_status == 'DELETE_IN_PROGRESS':
        result = 'FAILED'
        retry = False

    elif stack_status == 'DELETE_COMPLETE':
        result = 'FAILED'
        retry = False
        
    else:
        result = ''
        retry = True


    payload = {
        'status': stack_status,
        'retry': retry,
        'result': result,
        'url': url
    }

    return {
        "isBase64Encoded": False,
        "statusCode": 200,
        "body": json.dumps(payload),
        "headers": {
            "Content-Type": "application/json",
        }
    }