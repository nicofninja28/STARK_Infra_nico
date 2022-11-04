#STARK Code Generator component.
#Produces the customized static content for a STARK system

#Python Standard Library
import textwrap
import os
import importlib

#Private modules
prepend_dir = ""
if 'libstark' in os.listdir():
    prepend_dir = "libstark.STARK_CodeGen_Static."

cg_coltype = importlib.import_module(f"{prepend_dir}cgstatic_controls_coltype")  
import convert_friendly_to_system as converter

def create(data):
    entity         = data["Entity"]
    cols           = data["Columns"]
    pk             = data['PK']
    relationships  = data["Relationships"]

    entity_varname = converter.convert_to_system_name(entity)
    entity_app     = entity_varname + '_app'
    pk_varname     = converter.convert_to_system_name(pk)
    
    #file upload controls
    with_upload             = False
    upload_fields           = []
    ext_string              = ""
    allowed_size_string     = ""
    upload_elems_string     = ""
    uploaded_s3_keys_string = ""

    source_code = f"""\
    many_{entity_varname} = {{
        metadata: {{
            '{pk_varname}': {{
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': 'String'
            }},"""
    
    for col, col_type in cols.items():
        col_varname = converter.convert_to_system_name(col)
        data_type = set_data_type(col_type)
        if isinstance(col_type, dict) and col_type["type"] == "relationship":
            has_many_ux = col_type.get('has_many_ux', None)
            if has_many_ux == None:
                source_code += f"""
            '{col_varname}': {{
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': '{data_type}'
            }},""" 
        else:
            source_code += f"""
            '{col_varname}': {{
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': '{data_type}'
            }},""" 
        
    source_code += f"""
        }},
        module_fields: [],
        validation_properties: [],
        list_status: {{"""

    for col, col_type in cols.items():
        if isinstance(col_type, dict) and col_type["type"] == "relationship":
            has_one = col_type.get('has_one', '')
            if  has_one != '':
                foreign_entity  = converter.convert_to_system_name(has_one)
                source_code += f"""
            '{foreign_entity}': 'empty',"""

    source_code += f"""
        }},"""

    search_string       = ""
    for col, col_type in cols.items():
        col_varname = converter.convert_to_system_name(col)
        if isinstance(col_type, dict):
            col_values = col_type.get("values", "")
            if col_type["type"] == "relationship" or isinstance(col_values, list):
                has_many = col_type.get('has_many', '')
                search_string += f"""
                    {col_varname}: '',"""
            if col_type["type"] == 'file-upload': 
                with_upload = True 
                upload_fields.append(col_varname)
                ext_string += f"""
                         "{col_varname}": "{str(col_type.get("allowed_ext",""))}","""
                allowed_size = col_type.get("max_upload_size", "1 MB")
                temp_split = allowed_size.split()
                allowed_size_string += f"""
                         "{col_varname}": {int(temp_split[0])},"""
                upload_elems_string += f"""
                        "{col_varname}": [],"""
                uploaded_s3_keys_string += f"""
                        "{col_varname}": [],"""

    if with_upload:
        source_code += f"""
        ext_whitelist: {{{ext_string}
        }},
        allowed_size: {{{allowed_size_string}
        }},
        ext_whitelist_table: "",
        allowed_size_table: 0,
        STARK_upload_elements: {{{upload_elems_string}
        }},
        STARK_uploaded_s3_keys: {{{uploaded_s3_keys_string}
        }},"""

    for col, col_type in cols.items():
        if isinstance(col_type, dict) and col_type["type"] == "relationship":
            has_one = col_type.get('has_one', '')
            if  has_one != '':
                foreign_entity  = converter.convert_to_system_name(has_one)
                foreign_field   = converter.convert_to_system_name(col_type.get('value', foreign_entity))
                foreign_display = converter.convert_to_system_name(col_type.get('display', foreign_field))

                source_code += f"""
        list_{foreign_entity}: function () {{
            if (this.list_status.{foreign_entity} == 'empty') {{
                loading_modal.show();
                root.lists.{foreign_entity} = []

                fields = ['{foreign_field}', '{foreign_display}']
                {foreign_entity}_app.get_fields(fields).then( function(data) {{
                    data.forEach(function(arrayItem) {{
                        value = arrayItem['{foreign_field}']
                        text  = arrayItem['{foreign_display}']"""
                    
                source_code += f"""            
                    root.lists.{foreign_entity}.push({{ value: value, text: text }})"""
                
                source_code += f""" 
                    }})
                    many_{entity_varname}.list_status.{foreign_entity} = 'populated'
                    loading_modal.hide();
                }}).catch(function(error) {{
                    console.log("Encountered an error! [" + error + "]")
                    loading_modal.hide();
                }});
            }}
        }},
        many_validation() {{
            is_valid_form = true
            for (let index = 0; index < this.module_fields.length; index++) {{
                console.log(this.module_fields[index])
                response = STARK.validate_form(this.metadata, this.module_fields[index])
                this.validation_properties[index] = response['validation_properties']
                if (response['is_valid_form'] == false)
                {{
                    is_valid_form = false
                }}
            }}
            return is_valid_form
        }},"""

    source_code += f"""
        add_row: function (row = "") {{
            var new_row = {{}}"""

    if with_upload:
        source_code += f"""
            var upload_fields = this.get_upload_fields()
            var new_s3_key = "" """

    source_code += f"""
            var new_validation_property = {{}}

            for (const key in this.metadata) {{
                if (Object.hasOwnProperty.call(this.metadata, key)) {{
                    const element = this.metadata[key];
                    new_row[key] = ""
                    new_validation_property[key] = {{'state':null, 'feedback':''}}
                }}
            }}

            if(row != "") {{
                new_row = row"""

    if with_upload:
        source_code += f"""
                upload_fields.forEach(element => {{
                    if(row[element['field']] != ""){{
                        element['filename'] = row[element['field']]
                        element['progress_bar_val'] = 100
                    }}
                }})
            }}
            else {{
                upload_fields.forEach(element => {{
                    this.STARK_uploaded_s3_keys[element['field']].push(new_s3_key)
                }});
            }}
            upload_fields.forEach(element => {{
                this.STARK_upload_elements[element['field']].push({{"file": element['filename'], "progress_bar_val": element['progress_bar_val']}})
            }});"""
    else:
        source_code += f"""
            }}"""
    source_code += f"""
            this.module_fields.push(new_row)
            this.validation_properties.push(new_validation_property)
        }},
        remove_row: function (index) {{
            this.module_fields.splice(index, 1);
            this.validation_properties.splice(index, 1);"""
    if with_upload:
        source_code += f""" 
            var upload_fields = this.get_upload_fields()   
            upload_fields.forEach(element => {{
                this.STARK_upload_elements[element['field']].splice(index, 1);    
                this.STARK_uploaded_s3_keys[element['field']].splice(index, 1);    

            }});"""  
    source_code += f""" 
        }},"""

    if with_upload:
        source_code += f"""
        get_upload_fields: function(){{
            
            var upload_fields = []
            for (const key in this.metadata) {{
                if (Object.hasOwnProperty.call(this.metadata, key)) {{
                    const element = this.metadata[key];
                    if(element.data_type == 'File') {{
                        upload_fields.push({{'field':key, 'filename':'', progress_bar_val: 0}})
                    }}
                }}
            }}
            return upload_fields
        }},
        s3upload: function(file_upload_element, index) {{
            
            this.STARK_upload_elements[file_upload_element][index].progress_bar_val = 0
            var upload_processed = this.process_upload_file(file_upload_element, index)
            if(upload_processed['message'] == "") {{
                this.module_fields[index][file_upload_element] = upload_processed['filename']
                var filePath = 'tmp/' + upload_processed['s3_key'];
                this.STARK_uploaded_s3_keys[file_upload_element][index] = upload_processed['s3_key']
                root.s3_access.upload({{
                    Key: filePath,
                    Body: upload_processed['file_body'],
                    ACL: 'public-read'
                    }}, function(err, data) {{
                        console.log(data)
                        if(err) {{
                            console.log(err)
                        }}
                    }}).on('httpUploadProgress', function (progress) {{
                    many_{entity_varname}.STARK_upload_elements[file_upload_element][index].progress_bar_val = parseInt((progress.loaded * 100) / progress.total);
                    many_{entity_varname}.validation_properties[index][file_upload_element].state = true
                    many_{entity_varname}.validation_properties[index][file_upload_element].feedback = "" 
                }});
            }}
            else {{
                //do not show alert when file upload is opened then closed
                if(upload_processed['message'] != 'initial') {{
                    this.validation_properties[index][file_upload_element].state = false
                    this.validation_properties[index][file_upload_element].feedback = upload_processed['message'] 
                }}
            }}

        }},
        process_upload_file(file_upload_element, index) {{
            var upload_processed = {{
                'message': 'initial'
            }}
            var uuid = ""
            var ext = ""
            var file = this.STARK_upload_elements[file_upload_element][index].file;
            is_valid = true;
            error_message = ""

            if(file) {{
                if( this.STARK_uploaded_s3_keys[file_upload_element][index] == '') {{
                    uuid = STARK.create_UUID()
                    ext = file.name.split('.').pop()
                }}
                else {{
                    uuid = this.STARK_uploaded_s3_keys[file_upload_element][index].split('.').shift()
                    ext = file.name.split('.').pop()
                }}
                valid_file = STARK.get_file_ext_whitelist(this.ext_whitelist[file_upload_element], this.ext_whitelist_table).split(", ").includes(ext)
                allowed_file_size = STARK.get_allowed_upload_size(this.allowed_size[file_upload_element], this.allowed_size_table)
                if(!valid_file) {{
                    //check if file type is valid
                    error_message = `Invalid file type: ${{ext.toUpperCase()}}`
                }}
                else if(file.size > allowed_file_size) {{
                    // check if file size is allowed
                    error_message = `Uploaded file exceeded allowed file size of ${{allowed_file_size / 1024 / 1024}}MB`
                }}

                if(error_message == "") {{
                    upload_processed = {{
                        'message'   : error_message,
                        'file_body' : file,
                        'filename'  : file.name,
                        's3_key'    : uuid + '.' + ext
                    }}
                }}
                else {{
                    upload_processed = {{
                        'message'   : error_message
                    }}
                }}
            }}

            return upload_processed
        }},
        """

    
    source_code += f"""
    }}
    """

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