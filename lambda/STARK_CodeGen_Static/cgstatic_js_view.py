#STARK Code Generator component.
#Produces the customized static content for a STARK system

#Python Standard Library
import textwrap

#Private modules
import cgstatic_controls_coltype as cg_coltype
import convert_friendly_to_system as converter

def create(data):

    entity = data["Entity"]
    cols   = data["Columns"]
    pk     = data['PK']

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
                }},
                custom_report:{{
                    '{pk_varname}': {{"operator": "", "value": "", "type":"S"}},"""
    for col in cols:
        col_varname = converter.convert_to_system_name(col)
        source_code += f"""
                    '{col_varname}':  {{"operator": "", "value": "", "type":"S"}},""" 

    source_code += f"""
                    'STARK_isReport':true,
                    'STARK_report_fields':[]
                }},
                lists: {{
                    'Report_Operator': [
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
            if  has_one != '':
                #simple 1-1 relationship
                col_varname = converter.convert_to_system_name(col)

                source_code += f"""
                    '{col_varname}': 'empty',"""



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
                temp_csv_link: ""

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
                    console.log("VIEW: Inserting!")

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

                generate: function () {{
                    let temp_show_fields = []
                    checked_fields.forEach(element => {{
                        let temp_index = {{'field': element, label: element.replace("_"," ")}}
                        temp_show_fields.push(temp_index)
                    }});
                    root.STARK_report_fields = temp_show_fields;
                    root.showReport = true
                    loading_modal.show()
                    this.custom_report['STARK_report_fields'] = root.STARK_report_fields
                    let report_payload = {{ {entity_varname}: this.custom_report }}
        
                    {entity_app}.report(report_payload).then( function(data) {{
                        root.listview_table = data[0];
                        root.temp_csv_link = data[2]
                        console.log("DONE! Retrieved report.");
                        loading_modal.hide()
                        root.showReport = true
        
                    }})
                    .catch(function(error) {{
                        console.log("Encountered an error! [" + error + "]")
                        loading_modal.hide()
                    }});
                }},
                download_csv() {{
                    let link = "https://" + root.temp_csv_link
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
                }},"""

    for col, col_type in cols.items():
        if isinstance(col_type, dict) and col_type["type"] == "relationship":
            has_one = col_type.get('has_one', '')
            if  has_one != '':
                #simple 1-1 relationship
                foreign_entity  = converter.convert_to_system_name(has_one)
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
                                text  = arrayItem['{foreign_display}']
                                root.lists.{foreign_field}.push({{ value: value, text: text }})
                            }})
                            root.list_status.{foreign_field} = 'populated'
                            loading_modal.hide();
                        }}).catch(function(error) {{
                            console.log("Encountered an error! [" + error + "]")
                            loading_modal.hide();
                        }});
                    }}
                }},"""


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
    """

    return textwrap.dedent(source_code)