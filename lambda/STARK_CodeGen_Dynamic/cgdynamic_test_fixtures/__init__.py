#STARK Code Generator component.
#Produces the test cases for modules of a STARK system

#Python Standard Library
import base64
from random import randint
import textwrap

#Private modules
import convert_friendly_to_system as converter

def create(data):
  
    pk             = data["PK"]
    entity         = data["Entity"]
    columns        = data["Columns"]
    ddb_table_name = data["DynamoDB Name"]
    bucket_name    = data['Bucket Name']
    relationships  = data["Relationships"]
    
    #Convert human-friendly names to variable-friendly names
    entity_varname  = converter.convert_to_system_name(entity)
    entity_to_lower = entity_varname.lower()
    pk_varname      = converter.convert_to_system_name(pk)
    default_sk      = entity_varname + "|info"
    with_upload     = False

    data_string            = ""
    raw_payload_string     = ""
    payload_string         = ""
    raw_rpt_payload_string = ""
    report_field_string    = ""

    for col, col_type in columns.items():
        col_varname = converter.convert_to_system_name(col)
        col_type_id = set_type(col_type)
        test_data   = generate_test_data(col_type)

        data_string += f"""
        data['{col_varname}'] = {{'{col_type_id}': {test_data}}}"""

        raw_payload_string += f"""
                '{col_varname}': {test_data},"""

        payload_string += f"""
        payload['{col_varname}'] = {test_data}"""

        raw_rpt_payload_string += f"""
        payload['{col_varname}'] = {{'operator': "",'type': "{col_type_id}",'value': ""}},"""

        report_field_string += f""""{col_varname}", """
        
    source_code = f"""\
    def get_data():
        data = {{}}
        data['pk'] = {{'S':'Test1'}}
        data['sk'] = {{'S':'{entity_varname}|info'}}{data_string}
        
        return data

    def set_payload():
        payload = {{}}
        payload['pk'] = 'Test2'
        payload['orig_pk'] = 'Test2'
        payload['sk'] = '{entity_varname}|info'{payload_string}
        payload['STARK-ListView-sk'] = 'Test2'
        payload['STARK_uploaded_s3_keys'] = {{}}
        return payload

    def get_raw_payload():
        raw_payload = {{
            "{entity}": {{
                '{pk_varname}': "Test2",
                'orig_{pk_varname}': 'Test2',{raw_payload_string}
                'sk': ''
            }}
        }}
        return raw_payload

    def get_raw_report_payload():
        raw_payload = {{
            "Customer": {{
                '{pk_varname}': {'operator': "=",'type': "S",'value': "Hello"},{raw_rpt_payload_string}
                'STARK_Chart_Type' : "",
                'STARK_Report_Type' : "Tabular",
                'STARK_X_Data_Source' : "",
                'STARK_Y_Data_Source' : "",
                'STARK_count_fields' : [],
                'STARK_group_by_1' : "",
                'STARK_isReport' : True,
                'STARK_report_fields': [{report_field_string}{pk_varname}],
                'STARK_sum_fields': []
            }}
        }}
    return raw_payload


        """
        
    return textwrap.dedent(source_code)

def generate_test_data(col_type):

    string_test_data = ['Nico', 'Kim', 'JV', 'Jen', 'Ryan', 'Lorem Ipsum', 'John Doe', 'Sample', 'Test Data 1', 'Test Data 2']
    limit = len(string_test_data) - 1
    data = ""
    if isinstance(col_type, dict):
        #special/complex types
        if col_type["type"] in [ "int-spinner", "decimal-spinner" ]:
            data = randint(0, 100)
        
        if col_type["type"] in [ "tags", "multiple choice" ]:
            data = list(string_test_data[randint(0, limit)]
)    
    elif col_type in [ "int", "number" ]:
        data = randint(0, 100)
    
    else:
        data = string_test_data[randint(0, limit)]
          
    if isinstance(data, str):
        data = f"'{data}'"
    return data

def set_type(col_type):

    #Default is 'S'. Defined here so we don't need duplicate Else statements below
    col_type_id = 'S'

    if isinstance(col_type, dict):
        #special/complex types
        if col_type["type"] in [ "int-spinner", "decimal-spinner" ]:
            col_type_id = 'N'
        
        if col_type["type"] in [ "tags", "multiple choice" ]:
            col_type_id = 'SS'
    
    elif col_type in [ "int", "number" ]:
        col_type_id = 'N'

    return col_type_id