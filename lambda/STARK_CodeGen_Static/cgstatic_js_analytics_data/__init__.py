#Python Standard Library
import textwrap
import os

#Private modules
import convert_friendly_to_system as converter

def create(data):
    print('data in cg static')
    print(data)

    

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