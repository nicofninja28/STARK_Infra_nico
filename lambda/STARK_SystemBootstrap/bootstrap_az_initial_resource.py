#STARK Code Generator component.
#Produces the customized dynamic content for a STARK system

#Python Standard Library
import base64
import textwrap

#Private modules
import convert_friendly_to_system as converter

def create_store_terraform_files_to_bucket(data):

    source_code = f"""\
    import subprocess
    import json
    import boto3
    import os
    import chardet

    s3  = boto3.client('s3')
    codegen_bucket_name  = os.environ['CODEGEN_BUCKET_NAME']
    project_varname      = '{converter.convert_to_system_name(data["project_name"])}'

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
    
    def put_to_s3_terraform_directory(filename, file_content):
        response = s3.put_object(
            Body=file_content,
            Bucket=codegen_bucket_name,
            Key=f'codegen_dynamic/{{project_varname}}/terraform/{{filename}}'
        )
        
    # Call the function to get the Terraform output
    tf_output = get_terraform_output()
    mongodb_database_name     = tf_output['database_name'].strip('"')
    mongodb_connection_string = tf_output['connection_string'].strip('"')

    # Open the JSON file
    with open('../cgdynamic_payload.json', 'r') as file:
        data = json.load(file)

    # Modify the content by adding a new attribute
    data['ResourceProperties']['DBConnection'] = mongodb_connection_string
    data['ResourceProperties']['DDBTable'] = mongodb_database_name

    repo_name = data['ResourceProperties']["RepoName"]
    
    # Save the modified data back to the same file
    with open('../cgdynamic_payload.json', 'w') as file:
        json.dump(data, file)
                
    directory_path = "."
    # Traverse the directory and collect file paths
    file_paths = []
    for root, dirs, files in os.walk(directory_path):
        for file in files:
            file_path = os.path.join(root, file)
            file_paths.append(file_path)

    # Collect files to store in s3
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
    
    # update stark_core files

    for root, subdirs, files in os.walk('../lambda/stark_core'):
        for source_file in files:
            with open(os.path.join(root, source_file)) as f:
                source_code = f.read().replace("[[STARK_MDB_TABLE_NAME]]", mongodb_database_name)
                source_code = source_code.replace("[[COSMOSDB_CONNECTION_STRING]]", mongodb_connection_string)
    """

    return textwrap.dedent(source_code)