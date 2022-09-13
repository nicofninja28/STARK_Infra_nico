var root = new Vue({
    el: "#vue-root",
    data: {
        metadata: {
            'Group_Name': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': '',
                'state': null,
                'feedback': ''
            },
            'Description': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': '',
                'state': null,
                'feedback': ''
            },
            'Icon': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': '',
                'state': null,
                'feedback': ''
            },
            'Priority': {
                'value': '',
                'required': true,
                'max_length': '',
                'data_type': '',
                'state': null,
                'feedback': ''
            },
        },
        auth_config: { },

        auth_list: {
            'View': {'permission': 'Module Groups|View', 'allowed': false},
            'Add': {'permission': 'Module Groups|Add', 'allowed': false},
            'Delete': {'permission': 'Module Groups|Delete', 'allowed': false},
            'Edit': {'permission': 'Module Groups|Edit', 'allowed': false},
            'Report': {'permission': 'Module Groups|Report', 'allowed': false}
        },
        STARK_report_fields: [],
        listview_table: '',
        STARK_Module_Groups: {
            'Group_Name': '',
            'sk': '',
            'Description': '',
            'Icon': '',
            'Priority': '',
        },
        custom_report:{
            'Group_Name': {"operator": "", "value": "", "type":"S"},
            'Description':  {"operator": "", "value": "", "type":"S"},
            'Icon':  {"operator": "", "value": "", "type":"S"},
            'Priority':  {"operator": "", "value": "", "type":"S"},
            'STARK_isReport':true,
            'STARK_report_fields':[]
        },
        lists: {
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
                { value: 'IN', text: 'IN (value1, value2, value3, ... valueN)' },
                { value: 'between', text: 'BETWEEN (value1, value2)' },
            ],
        },
        list_status: {
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
        all_selected: true,
        temp_checked_fields: ['Group_Name','Description','Icon','Priority',],   
        checked_fields: ['Group_Name','Description','Icon','Priority',]

    },
    methods: {

        show: function () {
            this.visibility = 'visible';
        },

        hide: function () {
            this.visibility = 'hidden';
        },

        add: function () {
            
            console.log("VIEW: Inserting!")
            response = STARK.validate_form(root.metadata, root.STARK_Module_Groups)
            this.metadata = response['new_metadata']
            if(response['is_valid_form']) {
                loading_modal.show()

                let data = { STARK_Module_Groups: this.STARK_Module_Groups }

                STARK_Module_Groups_app.add(data).then( function(data) {
                    loading_modal.hide()
                    if(data != "OK")
                    {
                        for (var key in data) {
                            if (data.hasOwnProperty(key)) {
                                root.metadata[key]['state'] = false
                                root.metadata[key]['feedback'] = data[key]
                            }
                        }
                        return false
                    }
                    console.log("VIEW: INSERTING DONE!");
                    STARK.local_storage_delete_key('Listviews', 'STARK_Module_Groups'); //localStorage
                    window.location.href = "STARK_Module_Groups.html";
                }).catch(function(error) {
                    console.log("Encountered an error! [" + error + "]")
                    alert("Request Failed: System error or you may not have enough privileges")
                    loading_modal.hide()
                });
            }
        },

        delete: function () {
            loading_modal.show()
            console.log("VIEW: Deleting!")

            let data = { STARK_Module_Groups: this.STARK_Module_Groups }

            STARK_Module_Groups_app.delete(data).then( function(data) {
                console.log("VIEW: DELETE DONE!");
                STARK.local_storage_delete_key('Listviews', 'STARK_Module_Groups');
                console.log(data);
                loading_modal.hide()
                window.location.href = "STARK_Module_Groups.html";
            })
            .catch(function(error) {
                console.log("Encountered an error! [" + error + "]")
                alert("Request Failed: System error or you may not have enough privileges")
                loading_modal.hide()
            });
        },

        update: function () {
            console.log("VIEW: Updating!")
            response = STARK.validate_form(root.metadata, root.STARK_Module_Groups)
            this.metadata = response['new_metadata']
            if(response['is_valid_form']) {
                loading_modal.show()

                let data = { STARK_Module_Groups: this.STARK_Module_Groups }

                STARK_Module_Groups_app.update(data).then( function(data) {
                    console.log(data);
                    loading_modal.hide()
                    if(data != "OK")
                    {
                        for (var key in data) {
                            if (data.hasOwnProperty(key)) {
                                root.metadata[key]['state'] = false
                                root.metadata[key]['feedback'] = data[key]
                            }
                        }
                        return false
                    }
                    console.log("VIEW: UPDATING DONE!");
                    STARK.local_storage_delete_key('Listviews', 'STARK_Module_Groups'); //localStorage
                    window.location.href = "STARK_Module_Groups.html";
                })
                .catch(function(error) {
                    console.log("Encountered an error! [" + error + "]")
                    alert("Request Failed: System error or you may not have enough privileges")
                    loading_modal.hide()
                });
            }
        },

        get: function () {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            //Get whatever params are needed here (pk, sk, filters...)
            data = {}
            data['Group_Name'] = urlParams.get('Group_Name');
            console.log(data['Group_Name'])
            if(data['Group_Name'] == null) {
                root.show();
            }
            else {
                loading_modal.show();
                console.log("VIEW: Getting!")
                console.log(data)
                STARK_Module_Groups_app.get(data).then( function(data) {
                    console.log(data["item"])
                    root.STARK_Module_Groups = data["item"]; //We need 0, because API backed func always returns a list for now
                    
                    root.STARK_Module_Groups.orig_Group_Name = root.STARK_Module_Groups.Group_Name;
                    console.log("VIEW: Retreived module data.")
                    root.show()
                    loading_modal.hide()
                })
                .catch(function(error) {
                    console.log("Encountered an error! [" + error + "]")
                    alert("Request Failed: System error or you may not have enough privileges")
                    loading_modal.hide()
                });
            }
        },

        list: function (lv_token='', btn='') {
            spinner.show()
            
            payload = []
            if (btn == 'next') {
                root.curr_page++;
                console.log(root.curr_page);
                payload['Next_Token'] = lv_token;

                //When Next button is clicked, we should:
                // - save Next Token to new page in page_token_map
                // - hide Next button - it will be visible again if API call returns a new Next Token
                // - if new_page is > 2, assign {new_page - 1} token to prev_token
                root.prev_disabled = false;    
                root.next_disabled = true;

                root.page_token_map[root.curr_page] = lv_token;

                if (root.curr_page > 1) {
                    root.prev_token = root.page_token_map[root.curr_page - 1];
                }
                console.log(root.page_token_map)
                console.log(root.prev_token)
            }
            else if (btn == "prev") {
                root.curr_page--;

                if (root.prev_token != "") {
                    payload['Next_Token'] = root.page_token_map[root.curr_page];
                }

                if (root.curr_page > 1) {
                    root.prev_disabled = false
                    root.prev_token = root.page_token_map[root.curr_page - 1]
                }
                else {
                    root.prev_disabled = true
                    root.prev_token = ""
                }
            }

            var listview_data = STARK.get_local_storage_item('Listviews', 'STARK_Module_Groups')
            var fetch_from_db = false;
            console.log(listview_data)
            if(listview_data) {
                root.listview_table = listview_data[root.curr_page]
                root.next_token = listview_data['next_token'];
                spinner.hide()
            }
            else {
                fetch_from_db = true
            }

            if(fetch_from_db) {
                STARK_Module_Groups_app.list(payload).then( function(data) {
                                        
                    token = data['Next_Token'];
                    root.listview_table = data['Items'];
                    var data_to_store = {}
                    data_to_store[root.curr_page] = data['Items']
                    data_to_store['next_token'] = token
                    STARK.set_local_storage_item('Listviews', 'STARK_Module_Groups', data_to_store)
                    console.log("DONE! Retrieved list.");
                    spinner.hide()

                    if (token != "null") {
                        root.next_disabled = false;
                        root.next_token = token;
                    }
                    else {
                        root.next_disabled = true;
                    }

                })
                .catch(function(error) {
                    console.log("Encountered an error! [" + error + "]")
                    alert("Request Failed: System error or you may not have enough privileges")
                    spinner.hide()
                });
            }
        },

        formValidation: function () {
            root.error_message = ""
            let no_operator = []
            let isValid = true;
            root.showError = false
            for (element in root.custom_report) {
                if(root.custom_report[element].value != '' && root.custom_report[element].operator == '')
                {
                    root.showError = true
                    //fetch all error
                    if(root.custom_report[element].operator == '')
                    {
                        isValid = false
                        no_operator.push(element)
                    }
                }
            }
            root.no_operator = no_operator;
            //display error
            root.error_message = "Put operator/s on: " + no_operator ;
            return isValid
        },

        generate: function () {
            let temp_show_fields = []
            root.checked_fields.forEach(element => {
                let temp_index = {'field': element, label: element.replaceAll("_"," ")}
                temp_show_fields.push(temp_index)
            });
            root.STARK_report_fields = temp_show_fields;
            root.custom_report['STARK_report_fields'] = root.STARK_report_fields
            let report_payload = { STARK_Module_Groups: root.custom_report }
            if(root.formValidation())
            {
                loading_modal.show()
                STARK_Module_Groups_app.report(report_payload).then( function(data) {
                    root.listview_table = data[0];
                    root.temp_csv_link = data[2][0];
                    root.temp_pdf_link = data[2][1];
                    console.log("DONE! Retrieved report.");
                    loading_modal.hide()
                    root.showReport = true

                })
                .catch(function(error) {
                    console.log("Encountered an error! [" + error + "]")
                    loading_modal.hide()
                });
            }
        },
        download_report(file_type = "csv") {
            let link = "https://" + (file_type == "csv" ? root.temp_csv_link : root.temp_pdf_link)
            window.location.href = link
        },
        toggle_all(checked) {
            root.checked_fields = checked ? root.temp_checked_fields.slice() : []
            root.all_selected = checked
        },

        refresh_list () {
            root.listview_table = ''
            STARK.local_storage_delete_key('Listviews', 'STARK_Module_Groups'); //localStorage
            root.list()
        },
    }
})
