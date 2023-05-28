##TODO: 
#1 resource group and locations are hardcoded using var.rgname and var.location for now. make it so that it will be 
#  using the resource group created through terraform and the location from the environment variable.
#2 make sas start and end date dynamic
                             

import convert_friendly_to_system as converter
import textwrap

def compose_stark_tf_script(data):
    tf_script = []

    tf_script.append({
        'filePath': "terraform/main.tf",
        'fileContent': tf_writer_azure_config(data).encode()
    })

    # Static Site Hosting
    data["type"] = "static"
    storage_source_code = ""
    storage_source_code += tf_writer_storage_account(data)
    storage_source_code += tf_writer_storage_account_container(data)

    tf_script.append({
        'filePath': "terraform/static_site_hosting.tf",
        'fileContent': storage_source_code.encode()
    })

    # Database
    db_source_code = ""
    db_source_code += tf_writer_cosmosdb_account(data)
    db_source_code += tf_writer_cosmosdb_tables(data)

    tf_script.append({
        'filePath': "terraform/database.tf",
        'fileContent': db_source_code.encode()
    })

    # Functions
    functions_source_code = ""
    functions_source_code += tf_writer_function_app(data)

    tf_script.append({
        'filePath': "terraform/functions.tf",
        'fileContent': functions_source_code.encode()
    })

    # API Gateway
    api_management_source_code = ""
    api_management_source_code += tf_writer_api_management(data)
    api_management_source_code += tf_writer_api_management_operations(data)

    tf_script.append({
        'filePath': "terraform/api_management.tf",
        'fileContent': api_management_source_code.encode()
    })

    return tf_script

def tf_writer_variables(data):
    source_code = f"""
    
    """
    
    return textwrap.dedent(source_code)

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

def tf_writer_resource_group(data):
    source_code = f"""
    
    """

    return textwrap.dedent(source_code)

def tf_writer_storage_account(data):
    project_name = data["project_name"]
    type = data["type"] ##zip deployment for function or for static website

    resource_name = f"{project_name}-static-site" if type == 'static' else f"{project_name}-zip-deploy"
    source_code = f"""
    resource "azurerm_storage_account" "{resource_name}" {{
        name                     = "{resource_name}"
        resource_group_name      = var.rgname
        location                 = "westus"
        account_tier             = "Standard"
        account_replication_type = "LRS"
    """

    if type == "static":
        source_code += f"""
        
            static_website {{
                index_document     = "index.html"
                error_404_document = "error.html"
            }}"""
    
    source_code += f"""
    }}
    
    """
    
    return textwrap.dedent(source_code)

def tf_writer_storage_account_container(data):
    project_name = data["project_name"]
    type = data["type"] ##zip deployment for function or for static website

    storage_account_name = f"{project_name}-static-site" if type == 'static' else f"{project_name}-zip-deploy"
    source_code = f"""
    resource "azurerm_storage_container" "container" {{
        name                  = "{storage_account_name}-container"
        storage_account_name  = azurerm_storage_account.{storage_account_name}.name
        container_access_type = "private"
    }}

    """
    
    return textwrap.dedent(source_code)

def tf_writer_cosmosdb_account(data):
    project_name = data["project_name"]
    source_code = f"""
    resource "azurerm_cosmosdb_account" "mongodb_account" {{
        name                 = "stark-{project_name}-mdb"
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
    name                = "{project_name}-db"
    resource_group_name = var.rgname
    account_name        = azurerm_cosmosdb_account.mongodb_account.name
    }}
    
    """
    
    return textwrap.dedent(source_code)

def tf_writer_cosmosdb_tables(data):
    project_name = data["project_name"]
    entities = data["entities"]
    source_code = "##Business Modules"
    for entity in entities: 
        entity_varname = converter.convert_to_system_name(entity) 
        source_code += f"""
    resource "azurerm_cosmosdb_mongo_collection" "stark_user_collection" {{
        name                = "{entity_varname}"
        resource_group_name = var.rgname
        account_name        = azurerm_cosmosdb_account.mongodb_account.name
        database_name       = azurerm_cosmosdb_mongo_database.db_name.name

        index {{
            keys    = ["_id"]
            unique = true
        }}

    }}
        """
    
    source_code += f"""

    ##STARK Modules
    resource "azurerm_cosmosdb_mongo_collection" "stark_user_collection" {{
        name                = "STARK_User"
        resource_group_name = var.rgname
        account_name        = azurerm_cosmosdb_account.mongodb_account.name
        database_name       = azurerm_cosmosdb_mongo_database.db_name.name

        index {{
            keys    = ["_id"]
            unique = true
        }}

    }}

    resource "azurerm_cosmosdb_mongo_collection" "stark_user_roles_collection" {{
        name                = "STARK_User_Roles"
        resource_group_name = var.rgname
        account_name        = azurerm_cosmosdb_account.mongodb_account.name
        database_name       = azurerm_cosmosdb_mongo_database.db_name.name

        index {{
            keys    = ["_id"]
            unique = true
        }}

    }}

    resource "azurerm_cosmosdb_mongo_collection" "stark_modules_collection" {{
        name                = "STARK_Modules"
        resource_group_name = var.rgname
        account_name        = azurerm_cosmosdb_account.mongodb_account.name
        database_name       = azurerm_cosmosdb_mongo_database.db_name.name

        index {{
            keys    = ["_id"]
            unique = true
        }}

    }}

    resource "azurerm_cosmosdb_mongo_collection" "stark_module_groups_collection" {{
        name                = "STARK_Module_Groups"
        resource_group_name = var.rgname
        account_name        = azurerm_cosmosdb_account.mongodb_account.name
        database_name       = azurerm_cosmosdb_mongo_database.db_name.name

        index {{
            keys    = ["_id"]
            unique = true
        }}

    }}

    resource "azurerm_cosmosdb_mongo_collection" "stark_user_permissions_collection" {{
        name                = "STARK_User_Permissions"
        resource_group_name = var.rgname
        account_name        = azurerm_cosmosdb_account.mongodb_account.name
        database_name       = azurerm_cosmosdb_mongo_database.db_name.name

        index {{
            keys    = ["_id"]
            unique = true
        }}

    }}

    resource "azurerm_cosmosdb_mongo_collection" "stark_user_sessions_collection" {{
    name                = "STARK_User_Sessions"
    resource_group_name = var.rgname
    account_name        = azurerm_cosmosdb_account.mongodb_account.name
    database_name       = azurerm_cosmosdb_mongo_database.db_name.name

        index {{
            keys    = ["_id"]
            unique = true
        }}

    }}

    """
    
    return textwrap.dedent(source_code)

def tf_writer_function_app(data):
    project_name = data["project_name"]
    source_code = f"""
    data "archive_file" "functions" {{
        type        = "zip"
        source_dir  = "${{path.module}}/packages/final_package"
        output_path = "${{path.module}}/packages/final_package.zip"
    }}

    resource "azurerm_storage_blob" "function-zip-blob" {{
        name                   = "functions-${{substr(data.archive_file.functions.output_md5, 0, 6)}}.zip"
        type                   = "Block"
        source                 = "${{path.module}}/packages/final_package.zip"
        content_md5            = data.archive_file.functions.output_md5
        storage_account_name   = azurerm_storage_account.{project_name}-zip-deploy.name
        storage_container_name = azurerm_storage_container.{project_name}-zip-deploy-container.name
        content_type           = "application/zip"
    }}

    
    data "azurerm_storage_account_blob_container_sas" "blob_container_sas" {{
        connection_string = azurerm_storage_account.{project_name}-zip-deploy.primary_connection_string
        container_name    = azurerm_storage_container.{project_name}-zip-deploy-container.name
        https_only = true
        start = "2023-03-21"
        expiry = "2028-03-21"
        permissions {{
            read = true
            write = false
            delete = false
            list = false
            add = false
            create = false
        }}
    }}
    
    resource "azurerm_service_plan" "{project_name}_sp" {{
        name                = "{project_name}_sp"
        location            = var.rglocation
        resource_group_name = var.rgname
        os_type             = "Linux"
        sku_name            = "Y1"
    }}

    resource "azurerm_application_insights" "{project_name}_ai" {{
        name                = "{project_name}_ai"
        location            = var.rglocation
        resource_group_name = var.rgname
        application_type    = "other"
    }}

    resource "azurerm_linux_function_app" "starkzipdeployment" {{
        name                = "{project_name}-zip-deploy"
        location            = var.rglocation
        resource_group_name = var.rgname
        service_plan_id     = azurerm_service_plan.{project_name}_sp.id

        storage_account_name       = azurerm_storage_account.nicozipdeploy1.name
        storage_account_access_key = azurerm_storage_account.nicozipdeploy1.primary_access_key

            app_settings = {{
            FUNCTIONS_WORKER_RUNTIME                   = "python"
            APPINSIGHTS_INSTRUMENTATIONKEY             = azurerm_application_insights.{project_name}_ai.instrumentation_key
            ApplicationInsightsAgent_EXTENSION_VERSION = "~3"
            WEBSITE_CONTENTAZUREFILECONNECTIONSTRING   = azurerm_storage_account.nicozipdeploy1.primary_connection_string
            WEBSITE_RUN_FROM_PACKAGE                   = "${{azurerm_storage_blob.function-zip-blob.url}}${{data.azurerm_storage_account_blob_container_sas.blob_container_sas.sas}}"
            PYTHON_ENABLE_WORKER_EXTENSIONS            = 1
            }}

        site_config {{
            cors {{
                allowed_origins = ["*"]
            }}
            application_stack {{
                python_version = "3.9"
            }}
        }}
    }}
    """
    
    return textwrap.dedent(source_code)

def tf_writer_api_management(data):
    
    project_name = data["project_name"]
    api_name = data['api_name']
    sku_name = "Consumption_0" ##Configuration for serverless implementation
    source_code = f"""
    resource "azurerm_api_management" "{project_name}" {{
    name                = "{api_name}"
    location            = var.rglocation
    resource_group_name = var.rgname
    publisher_name      = "My Company"
    publisher_email     = "company@terraform.io"
    sku_name            = "{sku_name}"
    }}

    resource "azurerm_api_management_api" "{project_name}" {{
    for_each = var.function_map
    name                = "api-integrate-${{each.value.name}}"
    display_name        = "${{each.value.name}} Integration in API Management"
    path                = "${{each.value.name}}"
    resource_group_name = var.rgname
    api_management_name = azurerm_api_management.{project_name}.name
    revision            = 1
    protocols           = ["https", "http"]
    service_url         = "https://${{azurerm_linux_function_app.{project_name}.default_hostname}}/api/${{each.value.name}}"
    subscription_required = false
    depends_on = [
        azurerm_storage_account.{project_name}
    ]
    }}


    """
    return textwrap.dedent(source_code)

def tf_writer_api_management_operations(data):
    project_name = data["project_name"]
    source_code = f"""

    resource "azurerm_api_management_api_operation" "post_operation" {{
        for_each = var.function_map
        operation_id          = "${{each.value.name}}-post"
        api_name              = azurerm_api_management_api.{project_name}[each.value.name].name
        display_name          = "${{each.value.name}} API"
        method                = "POST"
        url_template          = ""
        api_management_name   = azurerm_api_management.{project_name}.name
        resource_group_name   = var.rgname
        description           = "${{each.value.name}} api"
    
    }}

    resource "azurerm_api_management_api_operation" "get_operation" {{
        for_each = var.function_map
        operation_id          = "${{each.value.name}}-get"
        api_name              = azurerm_api_management_api.{project_name}[each.value.name].name
        display_name          = "${{each.value.name}} API"
        method                = "GET"
        url_template          = ""
        api_management_name   = azurerm_api_management.{project_name}.name
        resource_group_name   = var.rgname
        description           = "${{each.value.name}} api"
    
    }}

    resource "azurerm_api_management_api_operation" "put_operation" {{
        for_each = var.function_map
        operation_id          = "${{each.value.name}}-put"
        api_name              = azurerm_api_management_api.{project_name}[each.value.name].name
        display_name          = "${{each.value.name}} API"
        method                = "PUT"
        url_template          = ""
        api_management_name   = azurerm_api_management.{project_name}.name
        resource_group_name   = var.rgname
        description           = "${{each.value.name}} api"
    
    }}

    resource "azurerm_api_management_api_operation" "delete_operation" {{
        for_each = var.function_map
        operation_id          = "${{each.value.name}}-delete"
        api_name              = azurerm_api_management_api.{project_name}[each.value.name].name
        display_name          = "${{each.value.name}} API"
        method                = "DELETE"
        url_template          = ""
        api_management_name   = azurerm_api_management.{project_name}.name
        resource_group_name   = var.rgname
        description           = "${{each.value.name}} api"
    
    }}

    resource "azurerm_api_management_api" "access_api" {{
    for_each            = var.access_api
    name                = "api-integrate-${{each.value.name}}"
    display_name        = "${{each.value.name}} Integration in API Management"
    path                = "${{each.value.name}}"
    resource_group_name = var.rgname
    api_management_name = azurerm_api_management.{project_name}.name
    revision            = 1
    protocols           = ["https", "http"]
    service_url         = "https://${{azurerm_linux_function_app.{project_name}.default_hostname}}/api/${{each.value.name}}?"
    subscription_required = false
    depends_on = [
        azurerm_storage_account.nicozipdeploy1
    ]
    }}

    resource "azurerm_api_management_api_operation" "access_operations" {{
        for_each              = var.access_api
        operation_id          = "${{each.value.name}}"
        api_name              = azurerm_api_management_api.access_api[each.value.name].name
        display_name          = "Logout API"
        method                = "POST"
        url_template          = ""
        api_management_name   = azurerm_api_management.{project_name}.name
        resource_group_name   = var.rgname
        description           = "Logout api"
    
    }}

    resource "azurerm_api_management_api_policy" "access_cors" {{
    api_name            = azurerm_api_management_api_operation.access_operations.api_name
    api_management_name = azurerm_api_management.{project_name}.name
    resource_group_name = var.rgname

    xml_content = <<XML
    <policies>
        <inbound>
            <base />
            <cors allow-credentials="true">
                <allowed-origins>
                    <origin>${{var.origin}}</origin>
                    <origin>http://localhost</origin>
                </allowed-origins>
                <allowed-methods preflight-result-max-age="200">
                    <method>POST</method>
                </allowed-methods>
                <allowed-headers>
                    <header>content-type</header>
                </allowed-headers>
            </cors>
        </inbound>
        <backend>
            <base />
        </backend>
        <outbound>
            <base />
        </outbound>
        <on-error>
            <base />
        </on-error>
    </policies>
    XML

    }}

    resource "azurerm_api_management_api_policy" "api_cors" {{
        for_each = var.function_map
        api_name            = azurerm_api_management_api_operation.post_operation[each.value.name].api_name
        api_management_name = azurerm_api_management.{project_name}.name
        resource_group_name = var.rgname

    xml_content = <<XML
    <policies>
        <inbound>
            <base />
            <cors allow-credentials="true">
                <allowed-origins>
                    <origin>${{var.origin}}</origin>
                    <origin>http://localhost</origin>
                </allowed-origins>
                <allowed-methods preflight-result-max-age="200">
                    <method>GET</method>
                    <method>POST</method>
                    <method>PUT</method>
                    <method>DELETE</method>
                </allowed-methods>
                <allowed-headers>
                    <header>content-type</header>
                </allowed-headers>
            </cors>
            <choose>
                <!--
                    If a cache miss call external authorizer
                -->
                <when condition="@(!context.Variables.ContainsKey("status"))">
                    <!-- Invoke -->
                    <send-request mode="new" response-variable-name="response" timeout="10" ignore-error="false">
                        <set-url>https://{project_name}.azurewebsites.net/api/authorizer_default?</set-url>
                        <set-method>GET</set-method>
                        <set-header name="Authorization" exists-action="override">
                            <value>@(context.Request.Headers.GetValueOrDefault("Authorization"))</value>
                        </set-header>
                        <set-header name="Cookie" exists-action="override">
                            <value>@(context.Request.Headers.GetValueOrDefault("Cookie"))</value>
                        </set-header>
                    </send-request>
                    <!-- Extract authorization status from authorizer's response -->
                    <set-variable name="response-body" value="@(((IResponse)context.Variables["response"]).Body.As<JObject>())" />
                    <trace source="MyTraceSource" severity="information">
                        <message>@("Newly fetched " +((JObject)context.Variables["response-body"]).ToString())</message>
                    </trace>
                    <set-variable name="status" value="@(((JObject)context.Variables["response-body"])["isAuthorized"].ToString())" />
                    <set-variable name="username" value="@(((JObject)((JObject)context.Variables["response-body"])["context"])["Username"].ToString())" />

                    <!-- Cache authorization result -->
                    <set-header name="x-STARK-Username" exists-action="override">
                        <value>@((string)context.Variables["username"])</value>
                    </set-header>
                    <trace source="MyTraceSource" severity="information">
                        <message>@((string)context.Variables["status"] + " : " + " : " + (string)context.Variables["username"])</message>
                    </trace>
                    <cache-store-value key="@(context.Request.Headers.GetValueOrDefault("Authorization"))" value="@((string)context.Variables["username"])" duration="5" />
                </when>
            </choose>
            <choose>
                <when condition="@((string)context.Variables["status"] == "403")">
                    <return-response>
                        <set-status code="403" reason="Forbidden" />
                    </return-response>
                </when>
            </choose>
        </inbound>
        <backend>
            <base />
        </backend>
        <outbound>
            <base />
        </outbound>
        <on-error>
            <base />
        </on-error>
    </policies>
    XML

    }}

    """
    return textwrap.dedent(source_code)
