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
    

    output "mongodb_connection_string" {{
        sensitive = true
        description = "Connection string for the MongoDB instance"
        value       = azurerm_cosmosdb_account.mongodb_account.connection_strings[0]
    }}


    """
    
    return textwrap.dedent(source_code)

def create_get_mdb_connection():

    source_code = f"""\
    import subprocess
    import json

    def get_terraform_output():
        # Run the `terraform output` command and capture the output
        output = subprocess.check_output(["terraform", "output", "mongodb_connection_string"])
        
        # Decode the output from bytes to string
        output_str = output.decode("utf-8").strip()
        
        return output_str

    # Call the function to get the Terraform output
    mongodb_connection_string = get_terraform_output()

    # Open the JSON file
    with open('cgdynamic_payload.json', 'r') as file:
        data = json.load(file)

    # Modify the content by adding a new attribute
    data['DBConnection'] = mongodb_connection_string

    # Save the modified data back to the same file
    with open('data.json', 'w') as file:
    json.dump(data, file)
    """

    return textwrap.dedent(source_code)