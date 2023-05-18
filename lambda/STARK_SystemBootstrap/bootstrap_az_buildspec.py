#STARK Code Generator component.
#Produces the customized dynamic content for a STARK system

#Python Standard Library
import base64
import textwrap
import os

#Private modules
import convert_friendly_to_system as converter

def create(data):

    cicd_bucket          = data['cicd_bucket']
    project_varname      = data['project_varname']
    cgdynamic_writer_arn = os.environ["CG_DYNAMICV2_ARN"]
    print(cgdynamic_writer_arn)

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
                - aws lambda invoke --function-name {cgdynamic_writer_arn} --payload file://cgdynamic_payload.json response.json
                - terraform init
                - terraform plan
                - terraform apply --auto-approve

        artifacts:
            files:
                - template.yml
                - outputtemplate.yml
                - template_configuration.json
        """
    
    return textwrap.dedent(source_code)