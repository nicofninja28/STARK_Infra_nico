import os
import stark_core.data_abstraction as data
import stark_core.security as sec
import stark_core.logging as log
from pymongo import MongoClient
region_name = os.environ['AWS_REGION']

##DynamoDB related config
ddb_table   = "[[STARK_DDB_TABLE_NAME]]"
test_region = 'eu-west-2'
page_limit  = 100

client            = MongoClient("mongodb://stark-cosmos-mdb:m9nsqjPy2vAu7IKBaNUV55PWT9VZDWO9ldTXR0pFgPXKaJUvz42N9lSFLNW1yPYUPO2Vkf6f7f0CACDbtRxlDg==@stark-cosmos-mdb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@stark-cosmos-mdb@")
mdb_database      = client["tf-database-test"]

TTL_for_deleted_records_in_days = 120

##Bucket Related Config
bucket_name = "[[STARK_WEB_BUCKET]]"
bucket_url  = f"{bucket_name}.s3.{region_name}.amazonaws.com/"
bucket_tmp  = f"{bucket_url}tmp/"
upload_dir  = f"uploaded_files/"

analytics_raw_bucket_name       = "[[STARK_RAW_BUCKET]]"
analytics_processed_bucket_name = "[[STARK_PROCESSED_BUCKET]]"
analytics_athena_bucket_name    = "[[STARK_ATHENA_BUCKET]]"

##Sequence config
separator = '-'