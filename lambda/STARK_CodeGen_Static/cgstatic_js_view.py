#STARK Code Generator component.
#Produces the customized static content for a STARK system

#Python Standard Library
import textwrap
import os

#Private modules
import cgstatic_controls_coltype as cg_coltype
import convert_friendly_to_system as converter

def create(data):

    entity = data["Entity"]
    cols   = data["Columns"]
    pk     = data['PK']
    bucket_name = data['Bucket Name'] #temporary: remove once s3 credentials for file upload is solved
    region_name   = os.environ['AWS_REGION'] #temporary: remove once s3 credentials for file upload is solved

    entity_varname = converter.convert_to_system_name(entity)
    entity_app     = entity_varname + '_app'
    pk_varname     = converter.convert_to_system_name(pk)

    source_code = f"""\
        var root = new Vue({{
            el: "#vue-root",
            data: {{
                listview_table: '',
                STARK_report_fields: [],
                {entity_varname}: {{
                    '{pk_varname}': '',
                    'sk': '',"""

    for col in cols:
        col_varname = converter.convert_to_system_name(col)
        source_code += f"""
                    '{col_varname}': '',""" 

    source_code += f"""
                    'STARK_uploaded_s3_keys':{{}}
                }},
                custom_report:{{
                    '{pk_varname}': {{"operator": "", "value": "", "type":"S"}},"""
    for col, col_type in cols.items():
        col_varname = converter.convert_to_system_name(col)
        col_type_id = set_type(col_type)
        source_code += f"""
                    '{col_varname}':  {{"operator": "", "value": "", "type":"{col_type_id}"}},""" 

    source_code += f"""
                    'STARK_isReport':true,
                    'STARK_report_fields':[]
                }},
                lists: {{
                    'Report_Operator': [
                        {{ value: '', text: '' }},
                        {{ value: '=', text: 'EQUAL TO (=)' }},
                        {{ value: '<>', text: 'NOT EQUAL TO (!=)' }},
                        {{ value: '<', text: 'LESS THAN (<)' }},
                        {{ value: '<=', text: 'LESS THAN OR EQUAL TO (<=)' }},
                        {{ value: '>', text: 'GREATER THAN (>)' }},
                        {{ value: '>=', text: 'GREATER THAN OR EQUAL TO (>=)' }},
                        {{ value: 'contains', text: 'CONTAINS (%..%)' }},
                        {{ value: 'begins_with', text: 'BEGINS WITH (..%)' }},
                        {{ value: 'IN', text: 'IN (value1, value2, value3, ... valueN)' }},
                        {{ value: 'between', text: 'BETWEEN (value1, value2)' }},
                    ],"""

    for col, col_type in cols.items():
        col_varname = converter.convert_to_system_name(col)
        js_list_code = cg_coltype.create_list({
            "col": col,
            "col_type": col_type,
            "col_varname": col_varname
        })

        if js_list_code != None:
            source_code += f"""
                    {js_list_code}"""

    source_code += f"""
                }},
                list_status: {{"""

    #FIXME: These kinds of logic (determining col types, lists, retreiving settings, etc) are repetitive, should be refactored shipped to a central lib
    for col, col_type in cols.items():
        if isinstance(col_type, dict) and col_type["type"] == "relationship":
            has_one = col_type.get('has_one', '')
            has_many = col_type.get('has_many', '')
            if  has_one != '' or has_many != '':
                #simple 1-1 relationship
                col_varname = converter.convert_to_system_name(col)

                source_code += f"""
                    '{col_varname}': 'empty',"""



    source_code += f"""
                }},
                multi_select_values: {{"""

    #FIXME: These kinds of logic (determining col types, lists, retreiving settings, etc) are repetitive, should be refactored shipped to a central lib
    for col, col_type in cols.items():
        if isinstance(col_type, dict) and col_type["type"] == "relationship":
            has_many = col_type.get('has_many', '')
            if  has_many != '':
                col_varname = converter.convert_to_system_name(col)

                source_code += f"""
                    '{col_varname}': [],"""

    source_code += f"""

                }},
                visibility: 'hidden',
                next_token: '',
                next_disabled: true,
                prev_token: '',
                prev_disabled: true,
                page_token_map: {{1: ''}},
                curr_page: 1,
                showReport: false,
                temp_csv_link: "",
                temp_pdf_link: "",
                showError: false,
                no_operator: [],
                error_message: '',
                authFailure: false,
                authTry: false,
                STARK_upload_elements: {{"""
    search_string = ""
    for col, col_type in cols.items():
        col_varname = converter.convert_to_system_name(col)
        if isinstance(col_type, dict) and col_type["type"] == "relationship":
            has_many = col_type.get('has_many', '')
            search_string += f"""
                {col_varname}: '',"""

        if isinstance(col_type, str) and col_type == 'file-upload':
            source_code += f"""
                        "{col_varname}": {{"file": '', "progress_bar_val": 0}},"""
    source_code += f"""}},
                search:{{
                    {search_string}
                }},
            }},
            methods: {{

                show: function () {{
                    this.visibility = 'visible';
                }},

                hide: function () {{
                    this.visibility = 'hidden';
                }},

                add: function () {{
                    loading_modal.show()
                    console.log("VIEW: Inserting!")"""
    for col, col_type in cols.items():
        col_varname = converter.convert_to_system_name(col)
        if isinstance(col_type, dict) and col_type["type"] == "relationship":
            has_many = col_type.get('has_many', '')
            if has_many != "":
                source_code += f"""
                    this.{entity_varname}.{col_varname} = root.multi_select_values.{col_varname}.join(', ')"""
    
    source_code += f"""

                    let data = {{ {entity_varname}: this.{entity_varname} }}

                    {entity_app}.add(data).then( function(data) {{
                        console.log("VIEW: INSERTING DONE!");
                        loading_modal.hide()
                        window.location.href = "{entity_varname}.html";
                    }}).catch(function(error) {{
                        console.log("Encountered an error! [" + error + "]")
                        loading_modal.hide()
                    }});
                }},

                delete: function () {{
                    loading_modal.show()
                    console.log("VIEW: Deleting!")

                    let data = {{ {entity_varname}: this.{entity_varname} }}

                    {entity_app}.delete(data).then( function(data) {{
                        console.log("VIEW: DELETE DONE!");
                        console.log(data);
                        loading_modal.hide()
                        window.location.href = "{entity_varname}.html";
                    }})
                    .catch(function(error) {{
                        console.log("Encountered an error! [" + error + "]")
                        loading_modal.hide()
                    }});
                }},

                update: function () {{
                    loading_modal.show()
                    console.log("VIEW: Updating!")

                    let data = {{ {entity_varname}: this.{entity_varname} }}

                    {entity_app}.update(data).then( function(data) {{
                        console.log("VIEW: UPDATING DONE!");
                        console.log(data);
                        loading_modal.hide()
                        window.location.href = "{entity_varname}.html";
                    }})
                    .catch(function(error) {{
                        console.log("Encountered an error! [" + error + "]")
                        loading_modal.hide()
                    }});
                }},

                get: function () {{
                    const queryString = window.location.search;
                    const urlParams = new URLSearchParams(queryString);
                    //Get whatever params are needed here (pk, sk, filters...)
                    data = {{}}
                    data['{pk_varname}'] = urlParams.get('{pk_varname}');

                    if(data['{pk_varname}'] == null) {{
                        root.show();
                    }}
                    else {{
                        loading_modal.show();
                        console.log("VIEW: Getting!")

                        {entity_app}.get(data).then( function(data) {{
                            root.{entity_varname} = data[0]; //We need 0, because API backed func always returns a list for now
                            root.{entity_varname}.orig_{pk_varname} = root.{entity_varname}.{pk_varname};"""
    for col, col_type in cols.items():
        col_varname = converter.convert_to_system_name(col)
        if col_type == 'file-upload':
            source_code += f"""
                            root.{entity_varname}.STARK_uploaded_s3_keys['{col_varname}'] = root.{entity_varname}.{col_varname} != "" ? root.{entity_varname}.STARK_uploaded_s3_keys.{col_varname}.S : ""
                            root.STARK_upload_elements['{col_varname}'].file              = root.{entity_varname}.{col_varname} != "" ? root.{entity_varname}.{col_varname} : ""
                            root.STARK_upload_elements['{col_varname}'].progress_bar_val  = root.{entity_varname}.{col_varname} != "" ? 100 : 0
                            """

    #If there are 1:1 rel fields, we need to assign their initial value to the still-unpopulated drop-down list so that it displays 
    #   a value even before the lazy-loading is triggered.
    for col, col_type in cols.items():
        if isinstance(col_type, dict) and col_type["type"] == "relationship":
            has_one = col_type.get('has_one', '')
            if  has_one != '':
                #simple 1-1 relationship
                foreign_entity  = converter.convert_to_system_name(has_one)
                foreign_field   = converter.convert_to_system_name(col_type.get('value', foreign_entity))
                foreign_display = converter.convert_to_system_name(col_type.get('display', foreign_field))

                source_code += f"""
                            root.lists.{foreign_field} = [  {{ value: root.{entity_varname}.{foreign_field}, text: root.{entity_varname}.{foreign_field} }},]"""

    source_code += f"""
                            console.log("VIEW: Retreived module data.")
                            root.show()
                            loading_modal.hide()
                        }})
                        .catch(function(error) {{
                            console.log("Encountered an error! [" + error + "]")
                            loading_modal.hide()
                        }});
                    }}
                }},

               list: function (lv_token='', btn='') {{
                    spinner.show()
                    payload = []
                    if (btn == 'next') {{
                        root.curr_page++;
                        console.log(root.curr_page);
                        payload['Next_Token'] = lv_token;

                        //When Next button is clicked, we should:
                        // - save Next Token to new page in page_token_map
                        // - hide Next button - it will be visible again if API call returns a new Next Token
                        // - if new_page is > 2, assign {{new_page - 1}} token to prev_token
                        root.prev_disabled = false;    
                        root.next_disabled = true;

                        root.page_token_map[root.curr_page] = lv_token;

                        if (root.curr_page > 1) {{
                            root.prev_token = root.page_token_map[root.curr_page - 1];
                        }}
                        console.log(root.page_token_map)
                        console.log(root.prev_token)
                    }}
                    else if (btn == "prev") {{
                        root.curr_page--;

                        if (root.prev_token != "") {{
                            payload['Next_Token'] = root.page_token_map[root.curr_page];
                        }}

                        if (root.curr_page > 1) {{
                            root.prev_disabled = false
                            root.prev_token = root.page_token_map[root.curr_page - 1]
                        }}
                        else {{
                            root.prev_disabled = true
                            root.prev_token = ""
                        }}
                    }}

                    {entity_app}.list(payload).then( function(data) {{
                        token = data['Next_Token'];
                        root.listview_table = data['Items'];
                        console.log("DONE! Retrieved list.");
                        spinner.hide()

                        if (token != "null") {{
                            root.next_disabled = false;
                            root.next_token = token;
                        }}
                        else {{
                            root.next_disabled = true;
                        }}

                    }})
                    .catch(function(error) {{
                        console.log("Encountered an error! [" + error + "]")
                        spinner.hide()
                    }});
                }},

                formValidation: function () {{
                    root.error_message = ""
                    let no_operator = []
                    let isValid = true;
                    root.showError = false
                    for (element in root.custom_report) {{
                        if(root.custom_report[element].value != '' && root.custom_report[element].operator == '')
                        {{
                            root.showError = true
                            //fetch all error
                            if(root.custom_report[element].operator == '')
                            {{
                                isValid = false
                                no_operator.push(element)
                            }}
                        }}
                    }}
                    root.no_operator = no_operator;
                    //display error
                    root.error_message = "Put operator/s on: " + no_operator ;
                    return isValid
                }},

                generate: function () {{
                    let temp_show_fields = []
                    checked_fields.forEach(element => {{
                        let temp_index = {{'field': element, label: element.replace("_"," ")}}
                        temp_show_fields.push(temp_index)
                    }});
                    root.STARK_report_fields = temp_show_fields;
                    this.custom_report['STARK_report_fields'] = root.STARK_report_fields
                    let report_payload = {{ {entity_varname}: this.custom_report }}
                    if(root.formValidation())
                    {{
                        loading_modal.show()
                        {entity_app}.report(report_payload).then( function(data) {{
                            root.listview_table = data[0];
                            root.temp_csv_link = data[2][0];
                            root.temp_pdf_link = data[2][1];
                            console.log("DONE! Retrieved report.");
                            loading_modal.hide()
                            root.showReport = true
            
                        }})
                        .catch(function(error) {{
                            console.log("Encountered an error! [" + error + "]")
                            loading_modal.hide()
                        }});
                    }}
                }},
                download_report(file_type = "csv") {{
                    let link = "https://" + (file_type == "csv" ? root.temp_csv_link : root.temp_pdf_link)
                    window.location.href = link
                }},
                checkUncheck: function (checked) {{
                    arrCheckBoxes = document.getElementsByName('check_checkbox');
                    for (var i = 0; i < arrCheckBoxes.length; i++)
                    {{
                        arrCheckBoxes[i].checked = checked;
                    }}

                    if(checked)
                    {{
                        checked_fields = temp_checked_fields
                    }}
                    else
                    {{
                        checked_fields = []
                    }}
                }},
                process_upload_file(file_upload_element) {{
                    var upload_object = null
                    var uuid = ""
                    var ext = ""
                    var file = root.STARK_upload_elements[file_upload_element].file;
                    if(typeof root.{entity_varname}.STARK_uploaded_s3_keys[file_upload_element] == 'undefined')
                    {{
                        uuid = create_UUID()
                        ext = file.name.split('.').pop()
                    }}
                    else
                    {{
                        var s3_key = root.{entity_varname}.STARK_uploaded_s3_keys[file_upload_element]
                        uuid = s3_key.split('.').shift()
                        ext = file.name.split('.').pop()
                    }}
                    
                    if(file)
                    {{
                        upload_object = {{
                            'file_body' : file,
                            'filename'  : file.name,
                            's3_key'    : uuid + '.' + ext
                        }}
                        return upload_object
                    }}
                }},
                s3upload: function(file_upload_element) {{

                    root.STARK_upload_elements[file_upload_element].progress_bar_val = 0
                    var upload_object = root.process_upload_file(file_upload_element)
        
                    root.{entity_varname}[file_upload_element] = upload_object['filename']
                    var filePath = 'tmp/' + upload_object['s3_key'];
                    root.{entity_varname}.STARK_uploaded_s3_keys[file_upload_element] = upload_object['s3_key']
                    s3.upload({{
                        Key: filePath,
                        Body: upload_object['file_body'],
                        ACL: 'public-read'
                        }}, function(err, data) {{
                            console.log(data)
                        if(err) {{
                            console.log(err)
                        }}
                        }}).on('httpUploadProgress', function (progress) {{
                        root.STARK_upload_elements[file_upload_element].progress_bar_val = parseInt((progress.loaded * 100) / progress.total);
                    }});
                    
                }},
                onOptionClick({{ option, addTag }}, reference) {{
                    addTag(option)
                    this.search[reference] = ''
                    this.$refs[reference].show(true)
                }},"""

    for col, col_type in cols.items():
        if isinstance(col_type, dict) and col_type["type"] == "relationship":
            has_one = col_type.get('has_one', '')
            has_many = col_type.get('has_many', '')
            if  has_one != '' or has_many != '':
                relationship = has_one if has_one != '' else has_many
                foreign_entity  = converter.convert_to_system_name(relationship)
                foreign_field   = converter.convert_to_system_name(col_type.get('value', foreign_entity))
                foreign_display = converter.convert_to_system_name(col_type.get('display', foreign_field))

                source_code += f"""
                list_{foreign_entity}: function () {{
                    if (this.list_status.{foreign_field} == 'empty') {{
                        loading_modal.show();
                        root.lists.{foreign_field} = []

                        //FIXME: for now, generic list() is used. Can be optimized to use a list function that only retrieves specific columns
                        {foreign_entity}_app.list().then( function(data) {{
                            data['Items'].forEach(function(arrayItem) {{
                                value = arrayItem['{foreign_field}']
                                text  = arrayItem['{foreign_display}']"""
                if has_one != '': 
                    source_code += f"""            
                                root.lists.{foreign_field}.push({{ value: value, text: text }})"""
                if has_many != '': 
                    source_code += f"""            
                                root.lists.{foreign_field}.push({{ value }})"""
                source_code += f""" }})
                            root.list_status.{foreign_field} = 'populated'
                            loading_modal.hide();
                        }}).catch(function(error) {{
                            console.log("Encountered an error! [" + error + "]")
                            loading_modal.hide();
                        }});
                    }}
                }}"""
    source_code += f"""
            }},
            computed: {{"""
    for col, col_type in cols.items():
        col_varname = converter.convert_to_system_name(col)
        if isinstance(col_type, dict) and col_type["type"] == "relationship":
            has_many = col_type.get('has_many', '')
            if has_many != "":
                source_code += f"""
                {col_varname}_criteria() {{
                    return this.search['{col_varname}'].trim().toLowerCase()
                }},
                {col_varname}() {{
                    const {col_varname}_criteria = this.{col_varname}_criteria
                    // Filter out already selected options
                    const options = this.lists.{col_varname}.filter(opt => this.multi_select_values.{col_varname}.indexOf(opt) === -1)
                    if ({col_varname}_criteria) {{
                    // Show only options that match {col_varname}_criteria
                    return options.filter(opt => opt.toLowerCase().indexOf({col_varname}_criteria) > -1);
                    }}
                    // Show all options available
                    return options
                }},
                {col_varname}_search_desc() {{
                    if (this.{col_varname}_criteria && this.{col_varname}.length === 0) {{
                    return 'There are no tags matching your search criteria'
                    }}
                    return ''
                }}"""
    source_code += f"""
            }}    
        }})

    //for selecting individually, select all or uncheck all of checkboxes
    var temp_checked_fields = ['{pk_varname}',"""

    for col in cols:
        col_varname = converter.convert_to_system_name(col)
        source_code += f"""'{col_varname}',"""
    
    source_code += f"""]"""
    source_code += f"""
    var checked_fields = ['{pk_varname}',"""

    for col in cols:
        col_varname = converter.convert_to_system_name(col)
        source_code += f"""'{col_varname}',"""
    
    source_code += f"""]
    
    //Bucket Configurations
    var bucketName = '{bucket_name}';
    var bucketRegion = '{region_name}';
    var credentials = get_s3_credential_keys()
    var s3 = new AWS.S3({{
        params: {{Bucket: bucketName}},
        region: bucketRegion,
        apiVersion: '2006-03-01',
        accessKeyId: credentials['access_key_id'],
        secretAccessKey: credentials['secret_access_key'],
    }});"""

    return textwrap.dedent(source_code)


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