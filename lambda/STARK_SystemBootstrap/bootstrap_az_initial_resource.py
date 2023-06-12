#STARK Code Generator component.
#Produces the customized dynamic content for a STARK system

#Python Standard Library
import base64
import textwrap

#Private modules
import convert_friendly_to_system as converter

def tf_writer_azure_config(data):

    ##FIXME: must find a way to make sure azurerm is using the latest version
    source_code = f"""
    # Configure the Azure provider
    terraform {{
        required_providers {{
            azurerm = {{
            source  = "hashicorp/azurerm"
            version = "~> 3.45"
            }}
        }}

        required_version = ">= 1.1.0"
    }}

    provider "azurerm" {{
        features {{}}
    }}

    
    """
    return textwrap.dedent(source_code)

def tf_writer_cosmosdb_account(data):
    project_name = converter.convert_to_system_name(data["project_name"], "az-cosmos-db") 
    source_code = f"""

    resource "azurerm_cosmosdb_account" "stark_storage_account" {{
        name                 = "{project_name}"
        location             = var.rglocation
        resource_group_name  = var.rgname
        offer_type           = "Standard"
        kind                 = "MongoDB"
        mongo_server_version = 4.2
        consistency_policy {{
            consistency_level = "Session"
        }}

        geo_location {{
            location          = var.rglocation
            failover_priority = 0
        }}

        capabilities {{
            name = "EnableServerless"
        }}

        tags = {{
            environment = "dev"
        }}
    }}

    resource "azurerm_cosmosdb_mongo_database" "db_name" {{
        name                = "{project_name}-mongodb"
        resource_group_name = var.rgname
        account_name        = azurerm_cosmosdb_account.stark_storage_account.name
    }}
    
    variable "rgname" {{
        type = string
        default = "resource_group_test2"
    }}

    variable "rglocation" {{
        type = string 
        default = "Southeast Asia"
    }}

    output "mongodb_database_name" {{
        description = "Database name of the MongoDB instance"
        value       = azurerm_cosmosdb_account.stark_storage_account.name
    }}

    output "mongodb_connection_string" {{
        sensitive = true
        description = "Connection string for the MongoDB instance"
        value       = azurerm_cosmosdb_account.stark_storage_account.connection_strings[0]
    }}


    """
    
    return textwrap.dedent(source_code)

def create_store_terraform_files_to_bucket(data):

    source_code = f"""\
    import subprocess
    import json
    import boto3
    import os
    import chardet

    s3  = boto3.client('s3')
    codegen_bucket_name  = os.environ['CODEGEN_BUCKET_NAME']
    project_varname      = {converter.convert_to_system_name(data["project_name"])}

    def get_terraform_output():
        output_dict = {{}}
        # Run the `terraform output` command and capture the output
        output = subprocess.check_output(["terraform", "output", "mongodb_connection_string"])
        # Decode the output from bytes to string
        output_str = output.decode("utf-8").strip()
        output_dict['connection_string'] = output_str
        
        output = subprocess.check_output(["terraform", "output", "mongodb_database_name"])
        # Decode the output from bytes to string
        output_str = output.decode("utf-8").strip()
        output_dict['database_name'] = output_str

        return output_dict

    # Call the function to get the Terraform output
    tf_output = get_terraform_output()
    mongodb_database_name     = tf_output['database_name']
    mongodb_connection_string = tf_output['connection_string']

    # Open the JSON file
    with open('../cgdynamic_payload.json', 'r') as file:
        data = json.load(file)

    # Modify the content by adding a new attribute
    data['ResourceProperties']['DBConnection'] = mongodb_connection_string.strip('"')
    data['ResourceProperties']['DDBTable'] = mongodb_database_name.strip('"')

    repo_name = data['ResourceProperties']["RepoName"]
    
    # Save the modified data back to the same file
    with open('../cgdynamic_payload.json', 'w') as file:
        json.dump(data, file)

    files_to_commit = []
    directory_path = "."
    # Traverse the directory and collect file paths
    file_paths = []
    for root, dirs, files in os.walk(directory_path):
        for file in files:
            file_path = os.path.join(root, file)
            file_paths.append(file_path)

    # Collect files to commit
    for file_path in file_paths:
        filename = os.path.basename(file_path)
        tf_script_and_state_files = [
                                'main.tf', 'database.tf', 'terraform.tfstate', '.terraform.lock.hcl', 'terraform.tfstate.backup',
                                'api_management.tf', 'stark_modules_collection.tf', 'business_modules_collection.tf', 'functions.tf',
                                'static_site_hosting.tf'
        ]
        if filename in tf_script_and_state_files:
            with open(file_path, 'r') as file:
                file_content = file.read()
                put_to_s3_terraform_directory(filename, file_content)
    
    def put_to_s3_terraform_directory(filename, file_content):
        response = s3.put_object(
            Body=file_content,
            Bucket=codegen_bucket_name,
            Key=f'codegen_dynamic/{{project_varname}}/terraform/{{filename}}'
        )

    """

    return textwrap.dedent(source_code)