var root = new Vue({
    el: "#vue-root",
    data: {
        metadata: '',
        STARK_Analytics_data: {    
            'STARK_Analytics_data': analytics_data,
        },
        rel_metadata: {
            'Table_1': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': 'String'
            },
            'Join_Type': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': 'String'
            },
            'Table_2': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': 'String'
            },
        },
        filter_metadata: {
            'Field': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': 'String'
            },
            'Operand': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': 'String'
            },
            'Value': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': 'String'
            },
        },
        sort_metadata: {
            'Field': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': 'String'
            },
            'Sort_Type': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': 'String'
            },
        },
        visibility: 'hidden',
        next_token: '',
        next_disabled: true,
        prev_token: '',
        prev_disabled: true,
        page_token_map: {1: ''},
        curr_page: 1,
        showReport: false,
        object_url_prefix: "",
        temp_csv_link: "",
        temp_pdf_link: "",
        showError: false,
        no_operator: [],
        error_message: '',
        authFailure: false,
        authTry: false,
        all_selected_tables: true,
        all_selected_fields: true,
        temp_csv_link: '',
        temp_pdf_link: '',
        Analytics: {
            'Relationship': '',
            'Query': '',
            'Group_By': '',
            'STARK_uploaded_s3_keys':{},
            'Save_Report': '',
            'Saved_Report': ''
        },
        Save_Report_Settings: {
            'Report_Name': '',
            'Report_Settings': ''
        },
        lists: {
            'Item': [],
            'Join_Type': [
                { value: 'Inner Join', text: 'Inner Join' },
                { value: 'Left Join', text: 'Left Join' },
                { value: 'Right Join', text: 'Right Join' },
                { value: 'Full Outer Join', text: 'Full Outer Join' },
            ],
            'Relationship': [],
            'Sum': [],
            'Count': [],
            'Group_By': [],
            'Report_Operator': [
                { value: '', text: '' },
                { value: '=', text: 'EQUAL TO (=)' },
                { value: '<>', text: 'NOT EQUAL TO (!=)' },
                { value: '<', text: 'LESS THAN (<)' },
                { value: '<=', text: 'LESS THAN OR EQUAL TO (<=)' },
                { value: '>', text: 'GREATER THAN (>)' },
                { value: '>=', text: 'GREATER THAN OR EQUAL TO (>=)' },
                { value: 'contains', text: 'CONTAINS (%..%)' },
                { value: 'begins_with', text: 'BEGINS WITH (..%)' },
                { value: 'ends_with', text: 'ENDS WITH (..%)' },
                { value: 'IN', text: 'IN (value1, value2, value3, ... valueN)' },
                { value: 'between', text: 'BETWEEN (value1, value2)' },
            ],
            'Sort_Type': [
                { value: 'ASC', text: 'ASC' },
                { value: 'DESC', text: 'DESC' },
            ],
            'Save_Report': [
                { value: 'Yes', text: 'Yes' },
                { value: 'No', text: 'No' },
            ],
            'Report_Type': [
                { value: 'New Report', text: 'New Report' },
                { value: 'Saved Report', text: 'Saved Report' },
            ],
            'Saved_Report': [

            ]
        },
        list_status: {
            'Relationship': 'empty',
            'Sum': 'empty',
            'Count': 'empty',
            'Group_By': 'empty',
            'Saved_Report': 'empty'
        },
        validation_properties: {
            'Group_By': {
                'state': null,
                'feedback': ''
            },
        },
        showError: false,
        valid_page: false,
        temp_report_header: [],
        report_header: [],
        report_result: [], 
        checked_tables: [],
        checked_fields: [],
        system_tables: [],
        system_fields: [],
        temp_checked_tables: [],
        temp_checked_fields: [],
        page_0_show: true,
        page_1_show: false,
        page_2_show: false,
        page_3_show: false,
        page_4_show: false,
        page_5_show: false,
        page_6_show: false,
        page_7_show: false,
        show_result: false,
        show_query_box: false,
        show_next_button: false,
        show_report_name_input: false,
        from_run_report: false,
        from_load_report: false,
        table_field: [],
        disableRelationship: true,
        Relationship: {
            'Table_1': {},
            'Join_Type': {},
            'Table_2': {}
        },
        Temp_Filters: {
            'Field': {},
            'Operand': {},
            'Value': {}
        },
        Temp_Sort: {
            'Field': {},
            'Sort_Type': {}
        },
        Filters: {
        },
        Sort: {
        },
        rel_many_val:[],
        rel_many:[],
        filter_many:[],
        sort_many:[],
        multi_select_values: {
            'Sum': [],
            'Count': [],
        },
        search:{
            'Sum': '',
            'Count': '',
        },
        for_next_page: '',
        rel_validation_properties: [],
        filter_validation_properties: [],
        sort_validation_properties: [],
        showFilterAlert: true,
        showSortAlert: true,
        filter_has_value: false,
        sort_has_value: false,
        same_table_selected: false,
        action_from_saved_report: false,
        showSuccessSaveReport: false,
        action_from_run_saved_report: false
    },
    methods: {
        
        show: function () {
            this.visibility = 'visible';
        },

        hide: function () {
            this.visibility = 'hidden';
        },

        
        get: function () {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            //Get whatever params are needed here (pk, sk, filters...)
            data = {}
            data['Query'] = urlParams.get('Query');

            if(data['Query'] == null) {
                root.show();
                
                
            }
            else {
                loading_modal.show();
                console.log("VIEW: Getting!")

                Analytics_app.get(data).then( function(data) {
                    loading_modal.hide();
                })
                .catch(function(error) {
                    console.log("Encountered an error! [" + error + "]")
                    alert("Request Failed: System error or you may not have enough privileges")
                    loading_modal.hide()
                });
            }
        },

        saveReport: function() {

            var table_data = STARK.get_local_storage_item('Analytics_Input', 'Tables')
            var field_data = STARK.get_local_storage_item('Analytics_Input', 'Fields')
            var relationship_data = STARK.get_local_storage_item('Analytics_Input', 'Relationship')
            var sum_data = STARK.get_local_storage_item('Analytics_Input', 'Sum')
            var count_data = STARK.get_local_storage_item('Analytics_Input', 'Count')
            var group_by_data = STARK.get_local_storage_item('Analytics_Input', 'Group_by')
            var filter_data = STARK.get_local_storage_item('Analytics_Input', 'Filters')
            var sort_data = STARK.get_local_storage_item('Analytics_Input', 'Sort')
            var metadata = STARK.get_local_storage_item('Analytics_Input', 'Metadata')

            
            data = {}
            if(table_data) {
                data['tables']          = table_data['checked_tables']
            } else {
                data['tables']          = root.checked_tables
            }

            if(field_data) {
                data['fields']          = field_data['checked_fields']
            } else {
                data['fields']          = root.checked_fields
            }

            if(relationship_data) {
                data['relationships']   = relationship_data['relationship']
            } else {
                data['relationships']   = root.rel_many
            }

            if(sum_data) {
                data['sum']             = sum_data['sum']
            } else {
                data['sum']             = root.multi_select_values.Sum
            }

            if(count_data) {
                data['count']           = count_data['count']
            } else {
                data['count']           = root.multi_select_values.Count
            }

            if(group_by_data) {
                data['group_by']        = group_by_data['group_by']
            } else {
                data['group_by']        = root.Analytics.Group_By
            }

            if(filter_data) {
                data['filters']         = filter_data['filters']
            } else {
                data['filters']         = root.filter_many
            }
            
            if(sort_data) {
                data['sort']            = sort_data['sort']
            } else {
                data['sort']            = root.sort_many
            }

            if(metadata) {
                data['metadata']            = metadata['metadata']
            } else {
                data['metadata']            = root.metadata
            }
            
            root.Save_Report_Settings['Report_Settings'] = JSON.stringify(data)
            let payload = { Analytics_Report: root.Save_Report_Settings }
            console.log(payload)

            Analytics_app.add(payload).then( function(data) {
                console.log(data)
                if(data == 'OK') {
                    root.showSuccessSaveReport = true
                } else {
                    root.showSuccessSaveReport = false
                }
            })
            .catch(function(error) {
                console.log("Encountered an error! [" + error + "]")
                alert("Request Failed: System error or you may not have enough privileges")
                loading_modal.hide()
            });
        },

        submit: function(data) {
            if(root.Analytics.Choose_Report == 'Query Box') {
                query = root.Analytics.Query
            } else {
                var data_to_store = {}
                data_to_store['sort'] = root.sort_many
                STARK.set_local_storage_item('Analytics_Input', 'Sort', data_to_store)

                var table_data = STARK.get_local_storage_item('Analytics_Input', 'Tables')
                var field_data = STARK.get_local_storage_item('Analytics_Input', 'Fields')
                var relationship_data = STARK.get_local_storage_item('Analytics_Input', 'Relationship')
                var sum_data = STARK.get_local_storage_item('Analytics_Input', 'Sum')
                var count_data = STARK.get_local_storage_item('Analytics_Input', 'Count')
                var group_by_data = STARK.get_local_storage_item('Analytics_Input', 'Group_by')
                var filter_data = STARK.get_local_storage_item('Analytics_Input', 'Filters')
                var sort_data = STARK.get_local_storage_item('Analytics_Input', 'Sort')

                if(!data){
                    data = {}
                    if(table_data) {
                        data['tables']          = table_data['checked_tables']
                    } else {
                        data['tables']          = root.checked_tables
                    }

                    if(field_data) {
                        data['fields']          = field_data['checked_fields']
                    } else {
                        data['fields']          = root.checked_fields
                    }

                    if(relationship_data) {
                        data['relationships']   = relationship_data['relationship']
                    } else {
                        data['relationships']   = root.rel_many
                    }

                    if(sum_data) {
                        data['sum']             = sum_data['sum']
                    } else {
                        data['sum']             = root.multi_select_values.Sum
                    }

                    if(count_data) {
                        data['count']           = count_data['count']
                    } else {
                        data['count']           = root.multi_select_values.Count
                    }

                    if(group_by_data) {
                        data['group_by']        = group_by_data['group_by']
                    } else {
                        data['group_by']        = root.Analytics.Group_By
                    }

                    if(filter_data) {
                        data['filters']         = filter_data['filters']
                    } else {
                        data['filters']         = root.filter_many
                    }
                    
                    if(sort_data) {
                        data['sort']            = sort_data['sort']
                    } else {
                        data['sort']            = root.sort_many
                    }
                    metadata = root.metadata
                } else {
                    metadata = data['metadata']
                }
                
                root.compose_query(data)
                query = root.Analytics.Query
            }

            if(query != '') {
                loading_modal.show();
                console.log("VIEW: Getting!")
                Analytics_app.get_result(query, metadata).then( function(data) {
                    console.log(data.length)

                    if(data.length > 0)
                    {
                        root.report_result = data[0];
                        root.temp_report_header = Object.keys(data[0][0])
                        root.report_header = root.convert_to_system_display(root.temp_report_header)
                        root.temp_csv_link = data[1];
                        root.temp_pdf_link = data[2];
                        console.log("VIEW: Retreived module data.")
                    } else {
                        root.report_result = []
                        root.temp_report_header = []
                    }
                    root.page_1_show = false
                    root.page_2_show = false
                    root.page_3_show = false
                    root.page_4_show = false
                    root.page_5_show = false
                    root.page_6_show = false
                    root.page_7_show = false
                    root.show_result = true
                    loading_modal.hide();
                })
                .catch(function(error) {
                    console.log("Encountered an error! [" + error + "]")
                    alert("Request Failed: System error or you may not have enough privileges")
                    loading_modal.hide()
                });
            }
        },

        set_local_storage_from_setting: function(data) {
            console.log(data['relationships'])
            var data_to_store = {}
            data_to_store['checked_tables'] = data['tables']
            STARK.set_local_storage_item('Analytics_Input', 'Tables', data_to_store)

            var data_to_store = {}
            data_to_store['checked_fields'] = data['fields']
            STARK.set_local_storage_item('Analytics_Input', 'Fields', data_to_store)

            var data_to_store = {}
            data_to_store['relationship'] = data['relationships']
            STARK.set_local_storage_item('Analytics_Input', 'Relationship', data_to_store)

            var data_to_store = {}
            data_to_store['sum'] = data['sum']
            STARK.set_local_storage_item('Analytics_Input', 'Sum', data_to_store)

            var data_to_store = {}
            data_to_store['count'] = data['count']
            STARK.set_local_storage_item('Analytics_Input', 'Count', data_to_store)

            var data_to_store = {}
            data_to_store['group_by'] = data['group_by']
            STARK.set_local_storage_item('Analytics_Input', 'Group_by', data_to_store)

            var data_to_store = {}
            data_to_store['filters'] = data['filters']
            STARK.set_local_storage_item('Analytics_Input', 'Filters', data_to_store)

            var data_to_store = {}
            data_to_store['sort'] = data['sort']
            STARK.set_local_storage_item('Analytics_Input', 'Sort', data_to_store)

            var data_to_store = {}
            data_to_store['metadata'] = data['metadata']
            STARK.set_local_storage_item('Analytics_Input', 'Metadata', data_to_store)
        },

        load_report: function() {
            if(root.Analytics.Saved_Report == '') {
                root.showError = true
            } else {
                if(root.Analytics.Choose_Report == 'Saved Report') {
                    root.show_next_button = true
                    report_name = root.Analytics.Saved_Report
                    Analytics_app.get_saved_report_settings(report_name).then( function(data) {
                        report_setting = JSON.parse(data[0]['Report_Settings'])
                        root.set_local_storage_from_setting(report_setting)
                        root.from_load_report = true
                        root.from_run_report = false
                    }).catch(function(error) {
                        console.log("Encountered an error! [" + error + "]")
                        alert("Request Failed: System error or you may not have enough privileges")
                        loading_modal.hide()
                    });
                }
            }
        },
        
        run_report: function() {
            if(root.Analytics.Saved_Report == '') {
                root.showError = true
            } else {
                root.showError = false
                root.action_from_run_saved_report = true
                if(root.Analytics.Choose_Report == 'Saved Report') {
                    report_name = root.Analytics.Saved_Report
                    
                    Analytics_app.get_saved_report_settings(report_name).then( function(data) {
                        report_setting = JSON.parse(data[0]['Report_Settings'])
                        root.submit(report_setting)
                        root.page_0_show = false
                        root.from_run_report = true
                        root.from_load_report = false
                    }).catch(function(error) {
                        console.log("Encountered an error! [" + error + "]")
                        alert("Request Failed: System error or you may not have enough privileges")
                        loading_modal.hide()
                    });
                }
            }
        },

        onReport_Type: function() {
            // Analytics_app.test_dump().then( function(data) {})
            if(root.Analytics.Choose_Report != ''){
                root.delete_local_storage()
                root.action_from_saved_report = false
            }

            if(root.Analytics.Choose_Report == 'Saved Report') {
                root.action_from_saved_report = true
                if (root.list_status.Saved_Report == 'empty') {
                    Analytics_app.get_saved_reports().then( function(data) {
                        console.log(data)
                        root.lists.Saved_Report = []
                        data.forEach(function(arrayItem) {
                            text = arrayItem['Report_Name']
                            value = arrayItem['Report_Name']            
                            root.lists.Saved_Report.push({ value: value, text: text }) 
                        })
                        root.list_status.Saved_Report = 'populated'
                    }).catch(function(error) {
                        console.log("Encountered an error! [" + error + "]")
                        alert("Request Failed: System error or you may not have enough privileges")
                        loading_modal.hide()
                    });
                }
            } 
        },

        get_tables: function() {
            var table_data = STARK.get_local_storage_item('Analytics_Data', 'Tables')
            var selected_table_data = STARK.get_local_storage_item('Analytics_Input', 'Tables')
            var fetch_from_db = false;
            
            if(table_data) {
                root.system_tables = table_data['tables']
                if(selected_table_data && selected_table_data['checked_tables'].length > 0) {
                    selected_tables = selected_table_data['checked_tables']
                    root.checked_tables = selected_tables
                } else {
                    root.checked_tables = root.system_tables
                }
            }
            else {
                loading_modal.show()
                fetch_from_db = true
            }

            if(fetch_from_db) {
                Analytics_app.get_tables().then( function(data) {
                    
                    for (let index = 0; index < data.length; index++) {
                        const element = data[index]['table_name'];
                        root.temp_checked_tables.push(element)
                    }
                    root.system_tables = root.temp_checked_tables

                    if(selected_table_data && selected_table_data['checked_tables'].length > 0) {
                        selected_tables = selected_table_data['checked_tables']
                        root.checked_tables = selected_tables
                    } else {
                        root.checked_tables = root.system_tables
                    }

                    var data_to_store = {}
                    data_to_store['tables'] = root.system_tables
                    STARK.set_local_storage_item('Analytics_Data', 'Tables', data_to_store)

                    loading_modal.hide()
                })
                .catch(function(error) {
                    console.log("Encountered an error! [" + error + "]")
                    alert("Request Failed: System error or you may not have enough privileges")
                    loading_modal.hide()
                });
            }
        },

        get_table_fields: function(table_list=[]) {
            final_table_list = []
            
            var field_data = STARK.get_local_storage_item('Analytics_Data', 'Fields')
            var selected_table_data = STARK.get_local_storage_item('Analytics_Input', 'Tables')
            var selected_table_fields_data = STARK.get_local_storage_item('Analytics_Input', 'Fields')
            var fetch_from_db = false;

            if(field_data) {
                if (JSON.stringify(selected_table_data['checked_tables']) === JSON.stringify(field_data['tables']) && root.metadata != '') {
                    root.same_table_selected = true
                    root.system_fields = field_data['fields']
                    if(selected_table_fields_data && selected_table_fields_data['checked_fields'].length > 0) {
                        root.checked_fields = selected_table_fields_data['checked_fields']
                    } else {
                        root.checked_fields = root.system_fields
                    }
                } else {
                    STARK.local_storage_delete_key('Analytics_Data', 'Table_Fields_Option')
                    root.same_table_selected = false
                    final_table_list = selected_table_data['checked_tables']
                    fetch_from_db = true
                }
            }
            else {
                fetch_from_db = true
                final_table_list = selected_table_data['checked_tables']
            }

            if(fetch_from_db) {
                data = []
                final_table_list.forEach(obj => {
                    const keys = [];
                    if (analytics_data[obj]) {
                        console.log(analytics_data[obj])
                        keys.push(...Object.keys(analytics_data[obj]));
                    }
                    console.log(keys)
                    if (root.STARK_Analytics_data['STARK_Analytics_data'][obj]) {
                        
                        keys.forEach(element => {
                            data.push({
                                column_name: element,
                                data_type: analytics_data[obj][element],
                                table_name: obj,
                            });
                            
                        });
                    }
                })
                console.log(data)

                temp_metadata = data.reduce((result, { column_name, data_type }) => {
                    const key = column_name.replace(/\s+/g, '_'); 
                    
                    if(data_type == 'varchar') {
                        data_type = 'string'
                    } else if (data_type == 'real') {
                        data_type = 'float'
                    } else {
                        data_type = data_type
                    }
                    result[key] = { data_type };
                    return result;
                }, {});
                console.log(JSON.stringify(temp_metadata))
                root.metadata =  JSON.stringify(temp_metadata)

                root.table_field = data
                    
                temp_system_fields = []
                temp_for_metadata  = []
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    console.log(element)
                    for_metadata = element['column_name'] + ' | ' + element['data_type']
                    table_field = element['table_name'] + ' | ' + element['column_name']
                    rel_table_field = root.convert_to_system_name(element['table_name']) + '.' + root.convert_to_system_name(element['column_name'])
                    
                    temp_system_fields.push(table_field)
                    temp_for_metadata.push(for_metadata)
                }
                console.log(temp_for_metadata)
                root.system_fields = temp_system_fields

                if(selected_table_fields_data && selected_table_fields_data['checked_fields'].length > 0) {
                    root.checked_fields = selected_table_fields_data['checked_fields']
                } else {
                    root.checked_fields = root.system_fields
                }

                var data_to_store = {}
                data_to_store['tables'] = table_list
                data_to_store['fields'] = root.system_fields
                STARK.set_local_storage_item('Analytics_Data', 'Fields', data_to_store)

                var data_to_store = {}
                data_to_store['metadata'] = root.metadata
                STARK.set_local_storage_item('Analytics_Input', 'Metadata', data_to_store)
                
            }
        },

        download_report(file_type = "csv") {
            let link = "https://" + (file_type == "csv" ? root.temp_csv_link : root.temp_pdf_link)
            window.location.href = link
        },

        rel_row: function (count) {
            
            for (let index = 0; index < count; index++) {
                var new_row = {}
                var new_validation_property = {}
                for (const key in root.rel_metadata) {
                    if (Object.hasOwnProperty.call(root.rel_metadata, key)) {
                        const element = root.rel_metadata[key];
                        new_row[key] = ""
                        new_validation_property[key] = {'state':null, 'feedback':''}
                    }
                }

                root.rel_many.push(new_row)
                root.rel_validation_properties.push(new_validation_property)
            }
        },

        add_row:function (action_many, row="") {
            var new_row = {}
            var new_validation_property = {}
            if(action_many == 'Filter') {
                arr                 = root.filter_metadata
                arr_row             = root.filter_many
                root.showFilterAlert= false
            } else if (action_many == 'Sort') {
                arr                 = root.sort_metadata
                arr_row             = root.sort_many
                root.showSortAlert  = false
            }
            
            for (const key in arr) {
                if (Object.hasOwnProperty.call(arr, key)) {
                    const element = arr[key];
                    new_row[key] = ""
                    new_validation_property[key] = {'state':null, 'feedback':''}
                }
            }
            
            if(row != "") {
                new_row = row
            }

            arr_row.push(new_row)
            if(action_many == 'Filter') {
                root.filter_validation_properties.push(new_validation_property)
            } else if (action_many == 'Sort') {
                root.sort_validation_properties.push(new_validation_property)
            }
        },

        remove_row: function (action_many, index) {
            if(action_many == 'Filter') {
                arr_row = root.filter_many
            } else if (action_many == 'Sort') {
                arr_row = root.sort_many
            }
            arr_row.splice(index, 1);
            root.rel_validation_properties.splice(index, 1); 

            if(action_many == 'Filter') {
                if(arr_row.length == 0) {
                    root.showFilterAlert = true
                    root.showError = false
                }
                root.filter_validation_properties.splice(index, 1); 
            } else if (action_many == 'Sort') {
                if(arr_row.length == 0) {
                    root.showSortAlert = true
                    root.showError = false
                }
                root.sort_validation_properties.splice(index, 1); 
            }
        },

        list_field_options: function (action, table_list) {
            var list_field_data = STARK.get_local_storage_item('Analytics_Data', 'Table_Fields_Option')
            var list_sum_field_data = STARK.get_local_storage_item('Analytics_Data', 'Table_Fields_Option_Sum')
            var field_data = STARK.get_local_storage_item('Analytics_Data', 'Fields')
            var selected_table_data = STARK.get_local_storage_item('Analytics_Input', 'Tables')
            var fetch_from_db = false;

            if(list_field_data) {
                action.forEach(action_element => {
                    if (JSON.stringify(selected_table_data['checked_tables']) === JSON.stringify(field_data['tables']) && root.metadata != '') {
                        
                            if(action_element != 'Sum') {
                                console.log(root.same_table_selected)
                                root.lists[action] = list_field_data['table_fields_option']
                            }
                        
                    } else {
                        fetch_from_db = true
                    }
                })
            }
            else {
                fetch_from_db = true
            }

            if (list_sum_field_data) {
                if (JSON.stringify(selected_table_data['checked_tables']) === JSON.stringify(field_data['tables']) && root.metadata != '') {
                    root.lists.Sum = list_sum_field_data['table_fields_option']
                } else {
                    fetch_from_db = true
                }
            } else {
                fetch_from_db = true
            }

            if(fetch_from_db) {
                
                action.forEach(action_element => {
                    if (root.list_status[action_element] == 'empty') {
                        root.lists[action_element] = []
                        
                        final_table_list = table_list
                        if(action_element == 'Sum'){
                            data = []
                            final_table_list.forEach(obj => {
                                const keys = [];
                                if (analytics_data[obj]) {
                                    keys.push(...Object.keys(analytics_data[obj]));
                                }
                                console.log(keys)
                                if (root.STARK_Analytics_data['STARK_Analytics_data'][obj]) {
                                    
                                    keys.forEach(element => {
                                        if(analytics_data[obj][element] == 'Float' || analytics_data[obj][element] == 'Number') {
                                            data.push({
                                                column_name: element,
                                                data_type: analytics_data[obj][element],
                                                table_name: obj,
                                            });
                                        }
                                    });
                                }
                            })
                            
                            temp_check_fields = []
                            for (let index = 0; index < data.length; index++) {
                                const element = data[index];
                                rel_table_field = root.convert_to_system_name(element['table_name']) + '.' + root.convert_to_system_name(element['column_name'])
                                root.lists[action_element].push({ value: rel_table_field, text: rel_table_field })
                            }
                            root.list_status[action_element] = 'populated'
                            
                            var data_to_store = {}
                            data_to_store['table_fields_option'] = root.lists[action_element]
                            STARK.set_local_storage_item('Analytics_Data', 'Table_Fields_Option_Sum', data_to_store)
                            
                        } else {
                            data = []
                            final_table_list.forEach(obj => {
                                const keys = [];
                                if (analytics_data[obj]) {
                                    keys.push(...Object.keys(analytics_data[obj]));
                                }
                                console.log(keys)
                                if (root.STARK_Analytics_data['STARK_Analytics_data'][obj]) {
                                    
                                    keys.forEach(element => {
                                        data.push({
                                            column_name: element,
                                            data_type: analytics_data[obj][element],
                                            table_name: obj,
                                        });
                                        
                                    });
                                }
                            })
                            
                            for (let index = 0; index < data.length; index++) {
                                const element = data[index];
                                rel_table_field = root.convert_to_system_name(element['table_name']) + '.' + root.convert_to_system_name(element['column_name'])
                                root.lists[action_element].push({ value: rel_table_field, text: rel_table_field })
                            }
                            root.list_status[action_element] = 'populated'
                            var data_to_store = {}
                            data_to_store['table_fields_option'] = root.lists[action_element]
                            STARK.set_local_storage_item('Analytics_Data', 'Table_Fields_Option', data_to_store)
                        }
                    }
                });
                
            }
        },

        many_validation(many_tab) {

            if(many_tab == 'Relationship') {
                arr_validation_prop = root.rel_validation_properties
                arr_many            = root.rel_many
                arr_metadata        = root.rel_metadata
            } else if (many_tab == 'Filter') {
                arr_validation_prop = root.filter_validation_properties
                arr_many            = root.filter_many
                arr_metadata        = root.filter_metadata
            } else if (many_tab == 'Sort') {
                arr_validation_prop = root.sort_validation_properties
                arr_many            = root.sort_many
                arr_metadata        = root.sort_metadata
            }
            
            is_valid_form = true
            for (let index = 0; index < arr_many.length; index++) {
                response = STARK.validate_form(arr_metadata, arr_many[index])
                arr_validation_prop[index] = response['validation_properties']
                if (response['is_valid_form'] == false)
                {
                    is_valid_form = false
                }
            }

            if(many_tab == 'Filter') {
                if(root.filter_many.length != 0) {
                    has_val = []
                    for (let index = 0; index < root.filter_many.length; index++) {
                        filter_has_val = true
                        const element = root.filter_many[index];
                        if(element['Field'] == '' || element['Operand'] == '' || element['Value'] == '') {
                            filter_has_val = false
                        } 
                        has_val.push(filter_has_val)
                    }

                    if(has_val.includes(false)) {
                        root.filter_has_value = false
                    } else {
                        is_valid_form = true
                        root.filter_has_value = true
                    }
                }
            }

            if(many_tab == 'Sort') {
                
                if(root.sort_many.length != 0) {
                    has_val = []
                    for (let index = 0; index < root.sort_many.length; index++) {
                        sort_has_val = true
                        const element = root.sort_many[index];
                        if(element['Field'] == '' || element['Sort_Type'] == '') {
                            sort_has_val = false
                        } 
                        has_val.push(sort_has_val)
                    }

                    if(has_val.includes(false)) {
                        root.sort_has_value = false
                    } else {
                        is_valid_form = true
                        root.sort_has_value = true
                    }
                }
            }

            console.log(is_valid_form)
            return is_valid_form
        },

        validate_tab: function(page){
            if (page == '1') {
                if(root.checked_tables.length < 1) {
                    root.showError = true
                    root.valid_page = false
                } else {
                    root.valid_page = true
                    root.showError = false
                }
            }
            else if (page == '2') {
                if(root.checked_fields.length < 1) {
                    root.showError = true
                    root.valid_page = false
                } else {
                    root.valid_page = true
                    root.showError = false
                }
            }
            else if (page == '3') {
                if(root.many_validation('Relationship') == false) {
                    root.valid_page = false
                } else {
                    root.valid_page = true
                }
            }
            else if(page == '4') {
                
                if((root.multi_select_values.Sum.length > 0 || root.multi_select_values.Count.length > 0) && root.Analytics.Group_By == '') {
                    console.log('dito')
                    root.validation_properties['Group_By']['state'] = false
                    root.validation_properties['Group_By']['feedback'] = "This field is required"
                    root.valid_page = true
                    root.for_next_page = '4'
                }
                else {
                    root.valid_page = false
                    root.validation_properties['Group_By']['state'] = null
                    root.validation_properties['Group_By']['feedback'] = ""
                }
                
            } 
            else if(page == '5') {
                if(root.filter_many.length != 0) {
                    if(root.many_validation('Filter') == false) {
                        root.showError = true
                        root.valid_page = false
                    } else {
                        root.showError = false
                        root.valid_page = true
                    }
                } else {
                    root.valid_page = true
                }
                
            } 
            else if(page == '6') {
                if(root.sort_many.length != 0) {
                    console.log(root.many_validation('Sort'))
                    if(root.many_validation('Sort') == false) {
                        root.showError = true
                        root.valid_page = false
                    } else {
                        root.valid_page = true
                        root.showError = false
                    }
                } else {
                    root.valid_page = true
                }
                
            }
            return root.valid_page
        },

        change_page: function(page_number, action) {
            console.log(page_number)
            console.log(action)

            if(page_number == '0') { //Choose Report
                
                root.page_2_show = false
                root.page_1_show = false
                root.page_0_show = true

                if(root.Analytics.Choose_Report == 'Query Box') {
                    root.show_query_box = false
                }
            }
            else if(page_number == '1') { //Tables
                root.page_0_show = false
                if(root.Analytics.Choose_Report == 'Query Box') {
                    root.show_query_box = true
                } else {
                    root.get_tables()
                    root.page_2_show = false
                    root.page_1_show = true
                    root.list_status.Relationship = 'empty'

                    var selected_field_data = STARK.get_local_storage_item('Analytics_Input', 'Fields')
                    if(selected_field_data) {
                        root.checked_fields = selected_field_data['checked_fields']
                    } 
    
                    var relationship_data = STARK.get_local_storage_item('Analytics_Input', 'Relationship')
                    if(relationship_data) {
                        root.rel_many = relationship_data['relationship']
                    } 
                }
                
            }
            else if(page_number == '2') { // Table Columns
                if(!root.action_from_saved_report) {
                    var data_to_store = {}
                    data_to_store['checked_tables'] = root.checked_tables
                    STARK.set_local_storage_item('Analytics_Input', 'Tables', data_to_store)
                }
                root.page_1_show = false
                root.page_2_show = true
                root.page_3_show = false
                root.page_4_show = false
                root.list_status.Relationship = 'empty'
                
                root.get_table_fields(root.checked_tables)
                var selected_field_data = STARK.get_local_storage_item('Analytics_Input', 'Fields')

                if(selected_field_data) {
                    root.checked_fields = selected_field_data['checked_fields']
                } 

                var relationship_data = STARK.get_local_storage_item('Analytics_Input', 'Relationship')
                if(relationship_data) {
                    root.rel_many = relationship_data['relationship']
                } 
            }
            else if(page_number == '3') { //Relationship table
                var data_to_store = {}
                data_to_store['checked_fields'] = root.checked_fields
                STARK.set_local_storage_item('Analytics_Input', 'Fields', data_to_store)

                root.list_field_options(['Relationship'], root.checked_tables)
                if(action == 'Next') {
                    root.page_2_show = false
                    if(root.checked_tables.length > 1) {
                        root.page_3_show = true
                        root.page_4_show = false
                        root.list_status.Sum = 'empty'
                        root.list_status.Count = 'empty'
                        root.list_status.Group_By = 'empty'
                    } else {
                        root.page_3_show = false
                        root.page_4_show = true
                        root.list_field_options(['Sum', 'Count', 'Group_By'], root.checked_tables)

                        if(root.action_from_saved_report) {
                            
                            var selected_sum_data = STARK.get_local_storage_item('Analytics_Input', 'Sum')
                            root.multi_select_values.Sum = selected_sum_data['sum']
                            
                            var selected_count_data = STARK.get_local_storage_item('Analytics_Input', 'Count')
                            root.multi_select_values.Count = selected_count_data['count']
        
                            var selected_group_by_data = STARK.get_local_storage_item('Analytics_Input', 'Group_by')
                            root.Analytics.Group_By = selected_group_by_data['group_by']

                        } else {
                            var data_to_store = {}
                            data_to_store['relationship'] = root.rel_many
                            STARK.set_local_storage_item('Analytics_Input', 'Relationship', data_to_store)

                            var data_to_store = {}
                            data_to_store['count'] = root.multi_select_values.Count
                            STARK.set_local_storage_item('Analytics_Input', 'Count', data_to_store)

                            var data_to_store = {}
                            data_to_store['group_by'] = root.Analytics.Group_By
                            STARK.set_local_storage_item('Analytics_Input', 'Group_by', data_to_store)
                        }
                    }
                } else {
                    root.page_4_show = false
                    if(root.checked_tables.length > 1) {
                        root.page_2_show = false
                        root.page_3_show = true
                    } else {
                        root.page_2_show = true
                    }
                }
                
                root.page_5_show = false
                root.show_result = false
                
                if(action == 'Next')
                {
                    //FIX ME: Will empty relationships from page 2 even when tables are not change
                    if(root.same_table_selected) {
                        var relationship_data = STARK.get_local_storage_item('Analytics_Input', 'Relationship')
                        console.log(relationship_data)
                        if(relationship_data) {
                            root.rel_many = relationship_data['relationship']
                        } 
                    } else {

                        if(root.action_from_saved_report) {
                            var relationship_data = STARK.get_local_storage_item('Analytics_Input', 'Relationship')
                            
                            if(relationship_data) {
                                root.rel_many = relationship_data['relationship']
                            } 
                        } else {
                            rel_count = 0
                            rel_count = root.checked_tables.length - 1
                            root.rel_many = []
                            root.rel_row(rel_count)
                            root.rel_many_val = root.rel_many
                        }
                        
                    }
                    
                } else {
                    root.list_status.Sum = 'empty'
                    root.list_status.Count = 'empty'
                    root.list_status.Group_By = 'empty'
                    root.list_status.Relationship = 'empty'
                }
            }
            else if(page_number == '4') {  //Sum, count, group by
                if(action == 'Back') {
                    root.page_3_show = true
                    root.valid_page = false
                    root.list_status.Relationship = 'empty'
                }
                if(!root.action_from_saved_report){
                    var data_to_store = {}
                    data_to_store['relationship'] = root.rel_many
                    STARK.set_local_storage_item('Analytics_Input', 'Relationship', data_to_store)

                    var data_to_store = {}
                    data_to_store['count'] = root.multi_select_values.Count
                    STARK.set_local_storage_item('Analytics_Input', 'Count', data_to_store)

                    var data_to_store = {}
                    data_to_store['group_by'] = root.Analytics.Group_By
                    STARK.set_local_storage_item('Analytics_Input', 'Group_by', data_to_store)
                } else {
                    var selected_sum_data = STARK.get_local_storage_item('Analytics_Input', 'Sum')
                    root.multi_select_values.Sum = selected_sum_data['sum']

                    var selected_count_data = STARK.get_local_storage_item('Analytics_Input', 'Count')
                    root.multi_select_values.Count = selected_count_data['count']

                    var selected_group_by_data = STARK.get_local_storage_item('Analytics_Input', 'Group_by')
                    root.Analytics.Group_By = selected_group_by_data['group_by']
                }
                root.page_4_show = true
                root.page_2_show = false
                root.page_3_show = false
                root.page_5_show = false
                root.show_result = false
                root.validate_tab('4')
                root.for_next_page = '4'
                root.list_field_options(['Sum', 'Count', 'Group_By'], root.checked_tables)
                
            }
            else if(page_number == '5') { //Filters
                if(!root.action_from_saved_report) {
                    var data_to_store = {}
                    data_to_store['sum'] = root.multi_select_values.Sum
                    STARK.set_local_storage_item('Analytics_Input', 'Sum', data_to_store)

                    var data_to_store = {}
                    data_to_store['count'] = root.multi_select_values.Count
                    STARK.set_local_storage_item('Analytics_Input', 'Count', data_to_store)

                    var data_to_store = {}
                    data_to_store['group_by'] = root.Analytics.Group_By
                    STARK.set_local_storage_item('Analytics_Input', 'Group_by', data_to_store)
                
                } else {
                    var selected_filter_data = STARK.get_local_storage_item('Analytics_Input', 'Filters') 
                    root.filter_many = selected_filter_data['filters']
                }
                root.page_2_show = false
                root.page_3_show = false
                root.page_4_show = false
                root.page_6_show = false
                root.page_5_show = true

                root.show_result = false
                
                if(action == 'Back') {
                    root.list_status.Relationship = 'empty'
                }
            }
            else if(page_number == '6') { //Sort
                if(!root.action_from_saved_report) {
                    var data_to_store = {}
                    data_to_store['filters'] = root.filter_many
                    STARK.set_local_storage_item('Analytics_Input', 'Filters', data_to_store)
                } else {
                    root.showSortAlert  = false
                    var selected_sort_data = STARK.get_local_storage_item('Analytics_Input', 'Sort') 
                    root.sort_many = selected_sort_data['sort']
                }
                
                root.page_2_show = false
                root.page_3_show = false
                root.page_4_show = false
                root.page_5_show = false
                root.page_6_show = true
                root.page_7_show = false
                root.show_result = false
                
                if(action == 'Back') {
                    root.list_status.Relationship = 'empty'
                }
            }
            else if(page_number == '7') { //Sort
                
                root.page_2_show = false
                root.page_3_show = false
                root.page_4_show = false
                root.page_5_show = false
                root.page_6_show = false
                root.show_result = false
                
                if(action == 'Back') {
                    if(root.from_run_report && !root.from_load_report) {
                        root.page_7_show = false
                        root.page_0_show = true
                    } else {
                        root.page_7_show = true
                    }
                    
                    root.list_status.Relationship = 'empty'
                } else {
                    root.page_7_show = true
                }
            }
        },

        tag_display_text: function (action, tag) {
            if((this.lists[action]).length !== 0)
            {
                var index = this.lists[action].findIndex(opt => tag == opt.value)
                return this.lists[action][index].text
            }
        },

        onOptionClick({ option, addTag }, reference) {
            addTag(option.value)
            this.search[reference] = ''
            this.$refs[reference].show(true)
        },

        toggle_all(checked, checkbox) {
            
            if(checkbox == 'all_selected_tables')
            {
                temp_list = []
                root.checked_tables = checked ? root.system_tables.slice() : temp_list 
            }
            
            if(checkbox == 'all_selected_fields')
            {
                temp_list = []
                root.checked_fields = checked ? root.system_fields.slice() : temp_list
            }
        },

        onSaveReport: function() {
            if(root.Analytics.Save_Report == 'Yes') {
                root.show_report_name_input = true
            } else {
                root.show_report_name_input = false
            }
        },

        compose_query: function(data) {
            temp_table_fields = root.convert_to_system_name(data['fields'])

            str_table = ''
            if(data['tables'].length > 1) {
                str_table = ''
                str_tbls = ''
                where_tbls = []
                for (let index = 0; index < data['relationships'].length; index++) {
                    
                    const rel_element = data['relationships'][index];
                    table1       = rel_element['Table_1'].split(".")[0]
                    table1_field = rel_element['Table_1'].split(".")[1]
                    table2       = rel_element['Table_2'].split(".")[0]
                    table2_field = rel_element['Table_2'].split(".")[1]
                    if(index < 1) {

                        str_tbls = table1 + " AS " + table1.replace(/[aeiou]/gi, '') + " " + rel_element['Join_Type'] + " " + table2 + " AS " + table2.replace(/[aeiou]/gi, '') + " ON " + table1.replace(/[aeiou]/gi, '') + "." + table1_field + " = " + table2.replace(/[aeiou]/gi, '') + "." + table2_field
                    } else {
                        str_tbls =  rel_element['Join_Type'] + " " + table2 + " AS " + table2.replace(/[aeiou]/gi, '') + " ON " + table1.replace(/[aeiou]/gi, '') + "." + table1_field + " = " + table2.replace(/[aeiou]/gi, '') + "." + table2_field
                    }
                    console.log(str_tbls)
                    where_tbls.push(str_tbls)
                }
                str_table = where_tbls.join(" ")
            } else {
                table = root.convert_to_system_name(data['tables'][0])
                console.log(table)
                console.log(typeof(table))
                str_table = table + " AS " + table.replace(/[aeiou]/gi, '')
                
            }

            data_sum     = data['sum'].map(str => {
                let firstWord = str.match(/^\w+/)[0];
                let replacedWord = firstWord.replace(/[aeiou]/gi, '');
                return str.replace(firstWord, replacedWord);
              });

            sql_sum = data_sum.map(item => {
                const words = item.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1));
                console.log(words)
                return `SUM(${item}) AS Sum_of_${words[1]}`;
              }).join(', ');

            data_count   = data['count'].map(str => {
                let firstWord = str.match(/^\w+/)[0];
                let replacedWord = firstWord.replace(/[aeiou]/gi, '');
                return str.replace(firstWord, replacedWord);
              });
            
            sql_count = data_count.map(item => {
                const words = item.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1));
                console.log(words)
                return `Count(${item}) AS Count_of_${words[1]}`;
              }).join(', ');

            grp_by_table = data['group_by'].split(".")[0]
            grp_by_field = data['group_by'].split(".")[1]
            sql_group_by = grp_by_table.replace(/[aeiou]/gi, '') + "." + grp_by_field

            if(grp_by_table != '') {
                group_by = ' GROUP BY ' + sql_group_by
                select_grp_by = sql_group_by + ", "
            } else {
                group_by = ""
                select_grp_by = ""
            }

            if(sql_count != "" && sql_sum != "") {
                console.log('1024')

                str_fields = select_grp_by + sql_sum + ", " + sql_count
            } else if(sql_sum != '') {
                console.log('1099')
                str_fields = select_grp_by + sql_sum
            } else if(sql_count != '') {
                console.log('1102')
                str_fields = select_grp_by + sql_count
            } else if(sql_sum == '') {
                if(root.table_field.length == temp_table_fields.length)
                {
                    str_fields = '*'
                } else {
                    console.log('1007')
                    data['tables']        = []
                    for (let i = 0; i < temp_table_fields.length; i++) {
                        const [prefix, suffix] = temp_table_fields[i].split('_|_');
                        data['tables'].push(`${prefix.replace(/[aeiou]/gi, '')}.${suffix}`);
                    }
                    str_fields = select_grp_by + data['tables'].join(', ')
                }
            } 

            // WHERE CLAUSE
            arr_where_clause = []
            for (let index = 0; index < data['filters'].length; index++) {
                const element = data['filters'][index];
                if(element['Operand'] == 'contains') {
                    operand_value = "LIKE '%" + element['Value'] + "%'"
                } else if(element['Operand'] == 'begins_with') {
                    operand_value = "LIKE '" + element['Value'] + "%'"
                } else if(element['Operand'] == 'ends_with') {
                    operand_value = "LIKE '%" + element['Value'] + "'"
                } else if(element['Operand'] == 'IN') {
                    operand_value = "IN (" + element['Value'] + ")"
                } else if(element['Operand'] == 'between') {
                    operand_value = "BETWEEN (" + element['Value'] + ")"
                } else {
                    operand_value = element['Operand'] + " '" + element['Value'] + "'"
                }
                filter_table = element['Field'].split(".")[0]
                filter_field = element['Field'].split(".")[1]
                where_clause = filter_table.replace(/[aeiou]/gi, '') + "." + filter_field + " " + operand_value
                if(element['Field'] != undefined) {
                    arr_where_clause.push(where_clause)
                }
            }
            console.log(arr_where_clause.length)
            if(arr_where_clause.length > 0 && root.filter_has_value) {
                where_clause = ' WHERE ' + arr_where_clause.join(' AND ')
            } else {
                if(root.action_from_run_saved_report && arr_where_clause.length > 0) {
                    where_clause = ' WHERE ' + arr_where_clause.join(' AND ')
                } else {
                    where_clause = ''
                }
            }

            // ORDER BY
            arr_sort = []
            for (let index = 0; index < data['sort'].length; index++) {
                const element = data['sort'][index];
                table = element['Field'].split(".")[0]
                field = element['Field'].split(".")[1]
                sort = table.replace(/[aeiou]/gi, '') + "." + field + " " + element['Sort_Type']
                if(element['Field'] != undefined) {
                    arr_sort.push(sort)
                }
            }

            if(arr_sort.length > 0 && root.sort_has_value) {
                sort = ' ORDER BY ' + arr_sort.join(', ')
            } else {
                console.log('here')
                console.log(root.action_from_run_saved_report)
                if(root.action_from_run_saved_report && arr_sort.length > 0) {
                    console.log('here')
                    sort = ' ORDER BY ' + arr_sort.join(', ')
                } else {
                    sort = ''
                }
            }

            query = "SELECT " + str_fields + " FROM " + str_table + where_clause + group_by + sort 
            console.log(query)
            root.Analytics.Query = query
        },
        
        convert_to_system_display: function(arr) {
            rpt_header = []
            arr.forEach(element => {
                let words = element.split("_");
                let capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
                let joinedWords = capitalizedWords.join(" ");
                let finalStr = joinedWords.replace(/_/g, "");
                rpt_header.push(finalStr)
            });
            return rpt_header
        },

        convert_to_system_name: function(elem) {
            if(typeof(elem) == 'string'){
                let words = elem.split(" ");
                let capitalizedWords = words.map(word => word.toLowerCase());
                let joinedWords = capitalizedWords.join("_");
                
                return joinedWords
            } else {
                rpt_header = []
                elem.forEach(element => {
                    let words = element.split(" ");
                    let capitalizedWords = words.map(word => word.toLowerCase());
                    let joinedWords = capitalizedWords.join("_");
                    rpt_header.push(joinedWords)
                });
                return rpt_header
            }
            
        },

        delete_local_storage() {
            STARK.local_storage_delete_key('Analytics_Input', 'Tables')
            STARK.local_storage_delete_key('Analytics_Input', 'Fields')
            STARK.local_storage_delete_key('Analytics_Input', 'Relationship')
            STARK.local_storage_delete_key('Analytics_Input', 'Sum')
            STARK.local_storage_delete_key('Analytics_Input', 'Count')
            STARK.local_storage_delete_key('Analytics_Input', 'Group_by')
            STARK.local_storage_delete_key('Analytics_Input', 'Filters')
            STARK.local_storage_delete_key('Analytics_Input', 'Sort')
            STARK.local_storage_delete_key('Analytics_Input', 'Metadata')
        }
    },
    computed: {
        Sum_criteria() {
            return this.search['Sum'].trim().toLowerCase()
        },
        Sum() {
            const Sum_criteria = this.Sum_criteria
            
            // Filter out already selected options
            const options = this.lists.Sum.filter(opt => this.multi_select_values.Sum.indexOf(opt.value) === -1)
            if (Sum_criteria) {
            // Show only options that match Sum_criteria
            return options.filter(opt => (opt.text).toLowerCase().indexOf(Sum_criteria) > -1);
            }
            // Show all options available
            return options
        },
        Sum_search_desc() {
            if (this.Sum_criteria && this.Sum.length === 0) {
            return 'There are no tags matching your search criteria'
            }
            return ''
        },

        Count_criteria() {
            return this.search['Count'].trim().toLowerCase()
        },
        Count() {
            const Count_criteria = this.Count_criteria
            // Filter out already selected options
            const options = this.lists.Count.filter(opt => this.multi_select_values.Count.indexOf(opt.value) === -1)
            if (Count_criteria) {
            // Show only options that match Count_criteria
            return options.filter(opt => (opt.text).toLowerCase().indexOf(Count_criteria) > -1);
            }
            // Show all options available
            return options
        },
        Count_search_desc() {
            if (this.Count_criteria && this.Count.length === 0) {
            return 'There are no tags matching your search criteria'
            }
            return ''
        },
    },
    // created() {
    //     window.onbeforeunload = this.handlePageRefresh;
    // },
    // destroyed() {
    //     window.onbeforeunload = null;
    // },
})
// root.get_tables()
root.add_row('Filter')