#STARK Code Generator component.
#Produces the customized dynamic content for a STARK system

#Python Standard Library
import base64
import textwrap

def create():
    source_code = f"""\
    import os
    import sys
    import json
    import yaml
    
    STARK_folder = os.getcwd() + '/lambda/helpers'
    sys.path = [STARK_folder] + sys.path
    import convert_friendly_to_system as converter

    data = {{
        "bindings" : [
            {{
                "authLevel" : "anonymous",
                "direction" : "in",
                "methods" : [
                "get",
                "post",
                "delete",
                "put"
                ],
                "name" : "req",
                "type" : "httpTrigger"
            }},
            {{
                "direction" : "out",
                "name"      : "$return",
                "type"      : "http"
            }}
        ]
    }}

    file_path = "function.json"
    with open(file_path, "w") as file:
        json.dump(data, file)
    file.close()    

    with open('cloud_resources.yml') as f:
        resources_raw = f.read()
        resources_yml = yaml.safe_load(resources_raw)

    os.system(f"mkdir functions_package")
    os.system(f"cp -R lambda/* functions_package")

    for stark_func in resources_yml['Lambda']:
        func_def = resources_yml['Lambda'][stark_func]
        destination_varname = converter.convert_to_system_name(stark_func)
        
        if destination_varname not in ["stark_sysmodules", "STARK_Analytics"]:
            os.system(f"cp function.json functions_package/{{destination_varname}}/function.json")
    """
    return textwrap.dedent(source_code)


