#STARK Code Generator component.
#Produces the customized dynamic content for a STARK system

#Python Standard Library
import base64
import textwrap
import os
import yaml

import boto3

#Private modules
import convert_friendly_to_system as converter

def create(data):

    cicd_bucket        = data['cicd_bucket']
    project_varname    = data['project_varname']

    ENV_TYPE = os.environ['STARK_ENVIRONMENT_TYPE']

    config = {}
    if ENV_TYPE == "PROD":
        default_response_headers = { "Content-Type": "application/json" }
        s3  = boto3.client('s3')

        codegen_bucket_name  = os.environ['CODEGEN_BUCKET_NAME']
        response = s3.get_object(
            Bucket=codegen_bucket_name,
            Key=f'STARKConfiguration/STARK_config.yml'
        )
        config = yaml.safe_load(response['Body'].read().decode('utf-8'))

    cgdynamic_writer_arn = config["CGDynamicV2_ARN"]
    cgstatic_writer_arn  = config["CGStaticV2_ARN"]

    source_code = f"""\
        version: 0.2
        env:
            variables:
                ARM_SUBSCRIPTION_ID: "6e672af2-b111-49d2-8291-46038afe5f04"
                ARM_CLIENT_ID: "77514469-7062-46da-9d6b-6fc027e7722a"
                ARM_CLIENT_SECRET: "aBx8Q~M2x~tFFQGWxD-AFd3WcIpwvfTLT5sQOcCm"
                ARM_TENANT_ID: "c2051487-3f8f-4ee3-b98b-c6d53c2daf07"

        phases:
            install:
                runtime-versions:
                    python: 3.8
                commands:
                    - curl -s -qL -o terraform_install.zip https://releases.hashicorp.com/terraform/1.4.0/terraform_1.4.0_linux_amd64.zip
                    - unzip terraform_install.zip -d /usr/bin/
                    - chmod +x /usr/bin/terraform
                finally:
                    - terraform --version
            build:
                commands:
                - BUCKET={cicd_bucket}
                - aws cloudformation package --template-file template.yml --s3-bucket $BUCKET --s3-prefix {project_varname} --output-template-file outputtemplate.yml
                - aws s3 cp outputtemplate.yml s3://$BUCKET/{project_varname}/
                - cd terraform
                - terraform init
                - terraform apply --auto-approve
                - cd ..
                - python get_mdb_connection.py
                - aws lambda invoke --function-name {cgdynamic_writer_arn} --payload file://cgdynamic_payload.json response.json
                - aws lambda invoke --function-name {cgstatic_writer_arn} --payload file://cgstatic_payload.json response.json

        artifacts:
            files:
                - template.yml
                - outputtemplate.yml
                - template_configuration.json
        """
    
    return textwrap.dedent(source_code)