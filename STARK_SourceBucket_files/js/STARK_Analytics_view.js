var root = new Vue({
    el: "#vue-root",
    data: {
        metadata: '',
        rel_metadata: {
            'Table_1': {
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
        tables: '',
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
            'Saved_Report': '',
            'Query_Box': ''
        },
        Save_Report_Settings: {
            'Report_Name': '',
            'Report_Settings': '',
            'Is_Custom_Report': ''
        },
        lists: {
            'Item': [],
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
            'Report_Type_with_Query_Box': [
                { value: 'New Report', text: 'New Report' },
                { value: 'Saved Report', text: 'Saved Report' },
                { value: 'Query Box', text: 'Query Box' },
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
        from_query_box: false,
        from_new_report: false,
        table_field: [],
        disableRelationship: true,
        Relationship: {
            'Table_1': {},
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
        show_query_error_message: false,
        query_error: '',
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
        action_from_run_saved_report: false,
        is_custom_report: false,
        auth_config: { 

        },
        auth_list: {
            'View': {'permission': 'Analytics|View', 'allowed': false},
            'Add': {'permission': 'Analytics|Add', 'allowed': false},
            'Delete': {'permission': 'Analytics|Delete', 'allowed': false},
            'Edit': {'permission': 'Analytics|Edit', 'allowed': false},
            'Report': {'permission': 'Analytics|Report', 'allowed': false},
            'Custom_Query': {'permission': 'Analytics|Custom Report', 'allowed': false}
        },
        operations_to_avoid: [
            'ALTER', 'ANALYZE', 'CALL', 'COMMENT', 'COMMIT', 'CREATE', 'DEALLOCATE', 'DELETE', 'DENY', 'DESC', 
            'DESCRIBE', 'DROP', 'EXECUTE', 'EXPLAIN', 'GRANT', 'INSERT', 'MERGE', 'PREPARE', 'REFRESH', 'RESET', 
            'REVOKE', 'ROLLBACK', 'SET', 'SHOW', 'START', 'TRUNCATE', 'UNLOAD', 'UPDATE', 'USE'
        ],
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
                data['fields']              = field_data['checked_fields']
                data['count_table_fields']  = field_data['count_of_table_fields']
            } else {
                data['fields']              = root.checked_fields
                data['count_table_fields']  = (root.table_field).length
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
            
            if(root.Analytics.Choose_Report == 'Query Box') {
                root.Save_Report_Settings['Is_Custom_Report'] = 'Yes'
                root.Save_Report_Settings['Report_Settings']  = root.Analytics.Query_Box
            } else {
                root.Save_Report_Settings['Is_Custom_Report'] = 'No'
                root.Save_Report_Settings['Report_Settings'] = JSON.stringify(data)
            }
            let payload = { Analytics_Report: root.Save_Report_Settings }

            Analytics_app.add(payload).then( function(data) {
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
                    data['fields']              = field_data['checked_fields']
                    data['count_table_fields']  = field_data['count_of_table_fields']
                } else {
                    data['fields']              = root.checked_fields
                    data['count_table_fields']  = (root.table_field).length
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
            
            if(root.Analytics.Choose_Report == 'Query Box') {
                Is_Custom_Report = 'Yes'
                report_data  = root.Analytics.Query_Box
            } else {
                Is_Custom_Report = 'No'
                report_data = JSON.stringify(data)
            }

            if(data != '') {
                loading_modal.show();
                console.log("VIEW: Getting!")
                Analytics_app.get_result(Is_Custom_Report, report_data, metadata).then( function(data) {
                    console.log(data)
                    if(data.length > 0)
                    {
                        if(data[0]['error']) {
                            console.log(data[0]['error'])
                            root.report_result = []
                            root.temp_report_header = []
                            root.show_query_error_message = true
                            root.query_error = data[0]['error']
                        } else {
                            root.report_result = data[0];
                            root.temp_report_header = Object.keys(data[0][0])
                            root.report_header = root.convert_to_system_display(root.temp_report_header)
                            root.temp_csv_link = data[1];
                            root.temp_pdf_link = data[2];
                            root.show_query_error_message = false
                        }
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

        string_has_element_from_list: function(string, list) {
            var lowercasedString = string.toLowerCase(); // Convert the string to lowercase
            
            for (var i = 0; i < list.length; i++) {
              var lowercasedElement = list[i].toLowerCase(); // Convert the list element to lowercase
              
              if (lowercasedString.includes(lowercasedElement)) {
                return true;
              }
            }
            
            return false;
        },

        submit_query_box: function(query) {
            root.from_query_box = true
            has_avoided_operation = root.string_has_element_from_list(query, root.operations_to_avoid)
            if(query != '') {
                if(has_avoided_operation) {
                    root.report_result = []
                    root.temp_report_header = []
                    const findElementFromList = (string, list) => list.find(element => string.toLowerCase().includes(element.toLowerCase()));
                    operation = findElementFromList(query, root.operations_to_avoid)
                    root.show_query_error_message = true
                    root.query_error = operation + " statement from the provided query is not allowed. Please make sure to use only SELECT statements.";
                } else {
                    loading_modal.show();
                    metadata = ''
                    Is_Custom_Report = 'Yes'
                    report_data  = query
                    Analytics_app.get_result(Is_Custom_Report, report_data, metadata).then( function(data) {

                        if(data.length > 0)
                        {
                            if(data[0]['error']) {
                                console.log(data[0]['error'])
                                root.report_result = []
                                root.temp_report_header = []
                                root.show_query_error_message = true
                                root.query_error = data[0]['error']
                            } else {
                                root.report_result = data[0];
                                root.temp_report_header = Object.keys(data[0][0])
                                root.report_header = root.convert_to_system_display(root.temp_report_header)
                                root.temp_csv_link = data[1];
                                root.temp_pdf_link = data[2];
                                root.show_query_error_message = false
                            }
                            console.log("VIEW: Retreived module data.")
                        } else {
                            root.report_result = []
                            root.temp_report_header = []
                        }
                        
                        loading_modal.hide();
                    })
                    .catch(function(error) {
                        console.log("Encountered an error! [" + error + "]")
                        alert("Request Failed: System error or you may not have enough privileges")
                        loading_modal.hide()
                    });
                }
                root.page_1_show = false
                root.page_2_show = false
                root.page_3_show = false
                root.page_4_show = false
                root.page_5_show = false
                root.page_6_show = false
                root.page_7_show = false
                root.page_0_show = false
                root.show_result = true
            }
        },

        set_local_storage_from_setting: function(data) {
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
                        root.from_new_report = false
                        root.change_page('1', 'Next')
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
                        console.log(data)
                        if(root.Analytics.Saved_Report.includes('[Custom]')) {
                            report_setting = data[0]['Report_Settings']
                            console.log(report_setting)
                            root.submit_query_box(report_setting)
                        } else {
                            report_setting = JSON.parse(data[0]['Report_Settings'])
                            console.log(report_setting)
                            root.submit(report_setting)
                        }
                        
                        root.page_0_show = false
                        root.from_run_report = true
                        root.from_load_report = false
                        root.from_query_box = false
                        root.from_new_report = false
                    }).catch(function(error) {
                        console.log("Encountered an error! [" + error + "]")
                        alert("Request Failed: System error or you may not have enough privileges")
                        loading_modal.hide()
                    });
                }
            }
        },

        onSavedReport: function() {
            if(root.Analytics.Saved_Report.includes('[Custom]')) {
                root.is_custom_report = true
            } else {
                root.is_custom_report = false
            }
        },

        onReport_Type: function() {
            // Analytics_app.test_dump().then( function(data) {})
            if(root.Analytics.Choose_Report != ''){
                root.delete_local_storage()
                root.action_from_saved_report = false
                root.from_query_box = false
                root.showSuccessSaveReport = false
            }

            if(root.Analytics.Choose_Report == 'Saved Report') {
                root.action_from_saved_report = true
                if (root.list_status.Saved_Report == 'empty') {
                    Analytics_app.get_saved_reports().then( function(data) {
                        root.lists.Saved_Report = []
                        saved_report_list = [...data].sort((a, b) => a - b)
                        console.log(saved_report_list)
                        saved_report_list.forEach(function(arrayItem) {
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
            } else if(root.Analytics.Choose_Report == 'New Report') {
                root.from_new_report = true
            } else if(root.Analytics.Choose_Report == 'Query Box') {
                root.from_query_box = true
            }
        },

        get_tables: function() {
            var analytics_data = STARK.get_local_storage_item('Analytics_Data', 'analytics')
            var table_data = Object.keys(analytics_data)
            var selected_table_data = STARK.get_local_storage_item('Analytics_Input', 'Tables')
            
            root.system_tables = table_data
            if(selected_table_data && selected_table_data['checked_tables'].length > 0) {
                selected_tables = selected_table_data['checked_tables']
                root.checked_tables = selected_tables
                root.multi_select_values.Sum = []
                root.multi_select_values.Count = []
                root.Analytics.Group_By = ''
            } else {
                root.checked_tables = root.system_tables
            }
        },

        get_table_fields_data: function(final_table_list) {
            var analytics_data = STARK.get_local_storage_item('Analytics_Data', 'analytics')
            
            data = []
            final_table_list.forEach(obj => {
                const keys = [];
                if (analytics_data[obj]) {
                    keys.push(...Object.keys(analytics_data[obj]));
                }
                console.log(keys)
                if (analytics_data[obj]) {
                    keys.forEach(element => {
                        data.push({
                            column_name: element.replace('_', ' '),
                            data_type: analytics_data[obj][element],
                            table_name: obj,
                        });
                        
                    });
                }
            })

            return data
        },

        get_table_fields: function() {
            var selected_table_data = STARK.get_local_storage_item('Analytics_Input', 'Tables')
            final_table_list = selected_table_data['checked_tables']
            data = root.get_table_fields_data(final_table_list)
            
            var selected_table_fields_data = STARK.get_local_storage_item('Analytics_Input', 'Fields')

            temp_metadata = data.reduce((result, { column_name, data_type }) => {
                const temp_key = root.convert_to_system_display(column_name).replace(/ /g, '_')
                const temp_id_key = temp_key.replace('_ID', '_Id')
                const key = temp_id_key.replace('_in_', '_In_')
                
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
            root.metadata =  JSON.stringify(temp_metadata)
            console.log(root.metadata)

            root.table_field = data
                    
            temp_system_fields = []
            temp_for_metadata  = []
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                table_field = element['table_name'] + ' | ' + element['column_name'].replace(/_/g, ' ')
                rel_table_field = root.convert_to_system_name(element['table_name']) + '.' + root.convert_to_system_name(element['column_name'])
                
                temp_system_fields.push(table_field)
            }
            root.system_fields = temp_system_fields

            if(selected_table_fields_data && selected_table_fields_data['checked_fields'].length > 0) {
                root.checked_fields = selected_table_fields_data['checked_fields']
            } else {
                root.checked_fields = root.system_fields
            }

            var data_to_store = {}
            data_to_store['metadata'] = root.metadata
            STARK.set_local_storage_item('Analytics_Input', 'Metadata', data_to_store)
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
            var selected_table_data = STARK.get_local_storage_item('Analytics_Input', 'Tables')
            final_table_list = selected_table_data['checked_tables']
            data = root.get_table_fields_data(final_table_list)
            console.log(data)
            action.forEach(action_element => {
                if (root.list_status[action_element] == 'empty') {
                    root.lists[action_element] = []
                    
                    final_table_list = table_list
                    if(action_element == 'Sum'){
                        new_data = []
                        for (let index = 0; index < data.length; index++) {
                            const element = data[index];
                            if(element['data_type'] == 'Float' || element['data_type'] == 'Number' || element['data_type'] == 'Integer') {
                                new_data.push({
                                    column_name: element['column_name'],
                                    data_type: element['data_type'],
                                    table_name: element['table_name'],
                                });
                            }
                        }
                        console.log(new_data)
                        temp_check_fields = []
                        for (let index = 0; index < new_data.length; index++) {
                            const element = new_data[index];
                            rel_table_field = root.convert_to_system_name(element['table_name']) + '.' + root.convert_to_system_name(element['column_name'])
                            root.lists[action_element].push({ value: rel_table_field, text: rel_table_field })
                        }
                        root.list_status[action_element] = 'populated'
                        
                    } else {
                        for (let index = 0; index < data.length; index++) {
                            const element = data[index];
                            rel_table_field = root.convert_to_system_name(element['table_name']) + '.' + root.convert_to_system_name(element['column_name'])
                            root.lists[action_element].push({ value: rel_table_field, text: rel_table_field })
                        }
                        root.list_status[action_element] = 'populated'
                    }
                }
            });
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
                var selected_field_data = STARK.get_local_storage_item('Analytics_Input', 'Fields')
                var data_to_store = {}
                data_to_store['checked_fields'] = root.checked_fields
                data_to_store['count_of_table_fields'] = (root.table_field).length
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
                    if(root.from_run_report && !root.from_load_report &&  !root.from_new_report || root.from_query_box ) {
                        root.page_6_show = false
                        root.page_0_show = true
                    } else  {
                        root.page_6_show = true
                    }
                }
            }
            else if(page_number == '7') { //Save Report
                
                root.page_2_show = false
                root.page_3_show = false
                root.page_4_show = false
                root.page_5_show = false
                root.page_6_show = false
                root.show_result = false
                
                if(action == 'Back') {
                    if(root.from_run_report && !root.from_load_report && !root.from_query_box && !root.from_new_report) {
                        root.page_7_show = false
                        root.page_0_show = true
                    } else if(!root.from_run_report && !root.from_load_report && !root.from_query_box ) {
                        root.page_7_show = true
                    } else {
                        root.page_7_show = true
                    }
                    
                    root.list_status.Relationship = 'empty'
                } else {
                    root.page_7_show = true
                    root.page_0_show = false
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
        
        convert_to_system_display: function(elem) {
            if(typeof(elem) == 'string'){
                let words = elem.split("_");
                let capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
                let joinedWords = capitalizedWords.join(" ");
                let finalStr = joinedWords.replace(/_/g, "");
                return finalStr
            } else {
                rpt_header = []
                elem.forEach(element => {
                    let words = element.split("_");
                    let capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
                    let joinedWords = capitalizedWords.join(" ");
                    let finalStr = joinedWords.replace(/_/g, "");
                    rpt_header.push(finalStr)
                });
                return rpt_header
            }
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

        set_local_storage_data() {
            tables = STARK.get_local_storage_item('Analytics_Table', 'tables')
            sidebar.get_metadata(tables)
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
            root.Analytics.Saved_Report = ''
            root.Analytics.Save_Report = ''
            root.Analytics.Query_Box = ''
            root.Save_Report_Settings.Report_Name = ''
            root.list_status.Saved_Report = 'empty'
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
root.set_local_storage_data()