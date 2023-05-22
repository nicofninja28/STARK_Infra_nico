#Python Standard Library
import textwrap
import os
import importlib

#Private modules
# prepend_dir = ""
# if 'libstark' in os.listdir():
#     prepend_dir = "libstark.STARK_CodeGen_Static."

# cg_coltype = importlib.import_module(f"{prepend_dir}cgstatic_controls_coltype")  

import convert_friendly_to_system as converter

def create(data):
    models        = data['Entities']
    relationships = data["Relationships"]
    
    source_code = f"""\
analytics_data = {{"""
    for entities in models:
        source_code += f"""
    '{entities}': {{"""
        source_code += f"""
        '{models[entities]['pk']}': 'String',"""
        for fields in models[entities]['data']:
            data_type = set_data_type(models[entities]['data'][fields])
            source_code += f"""
        '{fields}': '{data_type}',""" 
        source_code += f"""
    }},"""
    source_code += f"""
}}"""
    # print(source_code)
    return textwrap.dedent(source_code)

def set_data_type(col_type):

    #Default is 'S'. Defined here so we don't need duplicate Else statements below
    data_type = 'String'

    if isinstance(col_type, dict):
        #special/complex types
        if col_type["type"] in [ "int-spinner" ]:
            data_type = 'Number'

        if col_type["type"] in [ "decimal-spinner" ]:
            data_type = 'Float'
        
        if col_type["type"] in [ "tags", "multiple choice" ]:
            data_type = 'List'

        if col_type["type"] == 'file-upload':
            data_type = 'File'
    
    elif col_type in [ "int", "number" ]:
        data_type = 'Number'

    return data_type