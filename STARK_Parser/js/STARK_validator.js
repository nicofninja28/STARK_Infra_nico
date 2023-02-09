const STARK_Validator = {
    validation_results: {},
    arr_valid_simple_control_types: [
                                'string', 'date', 'time', 'number',
                                'int', 'yes-no', 'boolean', 'multi-line-string'    
    ],
    arr_valid_complex_control_types: [
                                'int-spinner', 'decimal-spinner', 'radio bar', 'radio button',
                                'rating', 'tags', 'file-upload', 'relationship'
    ],
    error_message_template: {
        'MISSING_PK': "No 'pk' attribute found in '${1}'",
        'MISSING_DATA_ATTRIBUTE': "No 'data' attribute found in '${1}'",
        'INVALID_PK': "Invalid 'pk' attribute in '${1}'. Expecting string as data type, '${2}' provided.",
        'INVALID_DATA_ATTRIBUTES': "Invalid 'data' attribute in '${1}'. Expecting array as data type, '${2}' provided.",
        'INVALID_SEQUENCE_ATTRIBUTES': "Invalid sequence attribute for '${1}'. Expecting object as data type, '${2}' provided.",
        'INVALID_SEQUENCE': "Invalid sequence property. Missing property '${1}'.",
        'INVALID_COLUMN_ATTRIBUTES': "Invalid column attribute for '${1}'. Expecting object as data type, '${2}' provided.",
        'INVALID_COLUMN_FORMAT': "Invalid column format found in '${1}': Column position '${2}' must be a single key-value pair",
        'INVALID_CONTROL_TYPE': "Invalid control type for '${1}' column",
        'INVALID_COLUMN_PROPERTIES': "Invalid properties for '${1}' column",
        'INVALID_INT_DEC_SPINNER_WRAP_VAL': "Invalid 'wrap' value for '${1}'. Acceptable values: 'wrap or no-wrap'",
        'NUMBER_ONLY': "Invalid '${1}' value for '${2}'. Acceptable values: Numbers",
        'STRING_ONLY': "Invalid '${1}' value for '${2}'. Acceptable values: Strings",
        'POSITIVE_NUMBER_ONLY': "Invalid '${1}' value for '${2}'. Acceptable values: Positive Numbers",
        'INTEGER_ONLY': "Invalid '${1}' value for '${2}'. Acceptable value: Integers",
        'ARRAY_ONLY': "Invalid '${1}' value for '${2}'. Acceptable value: Array",
        'ARRAY_STRING_ONLY': "Invalid '${1}' value for '${2}'. Acceptable value: Array of strings",
        'ARRAY_VALUE_MUST_HAVE_AT_LEAST_ONE_DATA': "Array value for '${1}' of '${2}' must have atleast one data",
        'NO_RELATIONSHIP_TYPE': "No relationship type defined for '${1}'. Columns that have 'type': 'relationship' must have either 'has_one' or 'has_many' as key and table name as value specified",
        'ONE_RELATION_TYPE_ONLY': "Two relationship defined in ${1}. Only one relationship allowed per column.",
        'TABLE_NOT_FOUND': "Cannot find table ${1} defined in ${2} of ${3}.",
        'DUPLICATE_TABLE': "Table ${1} already exists.",
        'NO_SEQUENCE': "No sequence properties defined. Please remove sequence if not needed."
    },
    warning_message_template: {
        'NOT_A_PROPERTY_OF_CONTROL_TYPE': "'${1}' is not a property of '${2}' therefore it will not affect the '${3}' column.",
        'NOT_A_PROPERTY_OF_SEQUENCE': "'${1}' is not a property of Sequence."
    },
    //functions
    fetch_error_message: function(message_code, message_params = []) {
            return this.fetch_message(message_code, 'error', message_params)
    },
    fetch_warning_message: function(message_code, message_params = []) {
        return this.fetch_message(message_code, 'warning', message_params)
    },
    fetch_message: function (message_code, message_type, message_params = []) {

        let message_map = {}
        if(message_type == 'warning') {
            message_map = this.warning_message_template
        }
        else if(message_type == 'error') {
            message_map = this.error_message_template
        }
        else {
            console.log("No message type", message_type)
        }
        message = message_map[message_code]
        counter = 1
        message_params.forEach(element => {
            param_count = "${" + counter + "}"
            message = message.replace(param_count, element)
            counter++
        });
        return message
    },
    validate_data_model: function(data_model_string) {
        data_model = YAML.parse(data_model_string)
        table_list = Object.keys(data_model)
        this.validation_results = {}

        for(let table in data_model) {
            if(Object.keys(this.validation_results).indexOf(table) === -1) {
                this.validation_results[table] = {
                                                    'columns': {},
                                                    'relationships': {},
                                                    'error_messages': [],
                                                    'warning_messages': []
                }
                table_element = data_model[table]
            
                // Check structure of table
                // must have pk with a value of string
                if(table_element.hasOwnProperty('pk')) {
                    if(typeof table_element['pk'] == 'string') {
                        //do nothing
                        this.validation_results[table]['columns'][table_element['pk']] = 'PK'
                    }
                    else {
                        
                        this.validation_results[table]['error_messages'].push(this.fetch_error_message('INVALID_PK',[table, typeof table_element['pk']]))
                        valid_column = false
                    }
                    
                }
                else {
                    this.validation_results[table]['error_messages'].push(this.fetch_error_message('MISSING_PK', [table]))
                    valid_column = false
                }
                // sequences are optional
                console.log(table_element.hasOwnProperty('sequence'))
                if(table_element.hasOwnProperty('sequence')) {
                    let valid_column = true
                    console.log(table_element['sequence'])
                    //sequence must be object
                    if(typeof table_element['sequence'] === 'object' && table_element['sequence'] instanceof Array) {
                        console.log('here1')
                        this.validation_results[table]['error_messages'].push(this.fetch_error_message('INVALID_SEQUENCE_ATTRIBUTES',[table, typeof table_element['sequence']]))
                        valid_column = false
                    }
                    else {
                        //start checking here
                        // check if table has sequence/not null
                        if (table_element['sequence'] != null) {
                            
                            arr_properties = ['current_counter', 'prefix', 'left_pad']

                            Object.keys(table_element['sequence']).forEach(element => {
                                property_value = table_element['sequence'][element]
                                if(this.is_valid_property_of_control_type(element, arr_properties)) {
                                    //data type checker
                                    if(element == 'current_counter' ||  element == 'left_pad') {
                                        if(typeof(property_value) === 'number' && Number.isInteger(property_value)) {
                                            //do nothing..
                                        }
                                        else {
                                            this.validation_results[table]['error_messages'].push(this.fetch_error_message('INTEGER_ONLY', [element, 'Sequence']))
                                            valid_column = false
                                        }
                                    }
                                    if(element == 'prefix') {
                                        if(typeof(property_value) === 'string') {
                                            //do nothing..
                                        }
                                        else {
                                            this.validation_results[table]['error_messages'].push(this.fetch_error_message('STRING_ONLY', [element, 'Sequence']))
                                            valid_column = false
                                        }
                                    }
                                }
                                else {
                                    //if property is not a valid property in arr_properties
                                    this.validation_results[table]['warning_messages'].push(this.fetch_warning_message('NOT_A_PROPERTY_OF_SEQUENCE', [element]))
                                }
                            });

                            //sequence with missing property based from arr_properties
                            missing_seq_attributes = arr_properties.filter(x => !Object.keys(table_element['sequence']).includes(x));
                            if(missing_seq_attributes.length > 0) {
                                this.validation_results[table]['error_messages'].push(this.fetch_error_message('INVALID_SEQUENCE', [missing_seq_attributes]))
                                valid_column = false
                            }
                            
                        } else {
                            //with sequence but no property at all
                            this.validation_results[table]['error_messages'].push(this.fetch_error_message('NO_SEQUENCE', []))
                            valid_column = false
                        }
                        

                    }
                    console.log(valid_column)
                }
                // must have data with value of array
                if(table_element.hasOwnProperty('data')) {
                    table_attributes = table_element['data']
    
                    if(typeof table_attributes == 'object' && table_attributes instanceof Array) {
                        //do nothing
                        column_position = 0
                        table_attributes.forEach(column => {
                            column_position++
                            if(typeof(column) == 'object') {
                                if(Object.keys(column).length == 1) {
                                    let column_name = Object.keys(column)[0]
                                    let column_value = column[column_name]
                                    let valid_column = true
    
                                    if(typeof(column_value) === 'string') {
                                        if (this.arr_valid_simple_control_types.indexOf(column_value) !== -1) {
                                            //Simple attributes
                                            // console.log('Simple',column_value)
                                            // console.log(typeof column_value)
                                        }
                                        else {
                                            this.validation_results[table]['error_messages'].push(this.fetch_error_message('INVALID_CONTROL_TYPE', [column_name]))
                                            valid_column = false
                                        }
                                    }
                                    else {
                                        if((typeof(column_value) === 'object' && column_value instanceof Array) && typeof(column_value.find(element => typeof(element) == 'object')) != 'object') {
                                            // //Shortcut radio button
                                            // console.log('Simple radio button',column_value)
                                        }
                                        else if((typeof(column_value) === 'object' && column_value instanceof Object) && this.is_complex_control_types_object(column_value)) {
                                            // Complex attributes
                                            // console.log('Complex',column_value)
                                            column_properties = column_value
                                            control_type = column_properties['type']
                                            
                                            // FIXME: At one glance it is obvious that there are parts that are repeating, revisit for refactoring 
                                            // maybe we can make this as dynamic as possible that can rely on metadata.
    
                                            //int spinner dec spinner
                                            if(control_type == 'int-spinner' || control_type == 'decimal-spinner') {
                                                //default properties
                                                //spin_wrap = no-wrap
                                                //spin_min = 0
                                                //spin_step = 1 for int 0.1 for dec
                                                //spin_max = 100 for int 10 for dec
                                                arr_properties = ['min', 'max', 'wrap', 'spin_step']
                                                
                                                Object.keys(column_properties).forEach(element => {
                                                    property_value = column_properties[element]
                                                    console.log(property_value)
                                                    if(this.is_valid_property_of_control_type(element, arr_properties)) {
                                                        if(element == 'wrap') {
                                                            if(['wrap', 'no-wrap'].indexOf(property_value) !== -1) {
                                                                //do nothing..
                                                            }
                                                            else {
                                                                this.validation_results[table]['error_messages'].push(this.fetch_error_message('INVALID_INT_DEC_SPINNER_WRAP_VAL', [column_name]))
                                                                valid_column = false
                                                            }
                                                        }
    
                                                        if(element == 'min' || element == 'max' || element == 'spin_step') {
                                                            if(typeof(property_value) === 'number') {
                                                                if(control_type == 'int-spinner') {
                                                                    if(Number.isInteger(property_value)) {
                                                                        // do nothing..
                                                                    }
                                                                    else {
                                                                        
                                                                        this.validation_results[table]['error_messages'].push(this.fetch_error_message('INTEGER_ONLY', [element, column_name]))
                                                                        valid_column = false
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                this.validation_results[table]['error_messages'].push(this.fetch_error_message('NUMBER_ONLY', [element, column_name]))
                                                                valid_column = false
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        this.validation_results[table]['warning_messages'].push(this.fetch_warning_message('NOT_A_PROPERTY_OF_CONTROL_TYPE', [element, control_type, column_name]))
                                                    }
                                                });
                                            }
                                            
                                            //rating
                                            else if(control_type == 'rating') {
                                                arr_properties = ['max']
                                                Object.keys(column_properties).forEach(element => {
                                                    property_value = column_properties[element]
                                                    if(this.is_valid_property_of_control_type(element, arr_properties)) {
                                                        if(element == 'max' ) {
                                                            if(typeof(property_value) === 'number' && Number.isInteger(property_value)) {
                                                                //do nothing..
                                                            }
                                                            else {
                                                                this.validation_results[table]['error_messages'].push(this.fetch_error_message('INTEGER_ONLY', [element, column_name]))
                                                                valid_column = false
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        this.validation_results[table]['warning_messages'].push(this.fetch_warning_message('NOT_A_PROPERTY_OF_CONTROL_TYPE', [element, control_type, column_name]))
                                                    }
                                                });
    
                                            }
                                            //tags
                                            else if(control_type == 'tags') {
                                                arr_properties = ['values', 'limit']
                                                Object.keys(column_properties).forEach(element => {
                                                    property_value = column_properties[element]
                                                    if(this.is_valid_property_of_control_type(element, arr_properties)) {
                                                        if(element == 'limit' ) {
                                                            if(typeof(property_value) === 'number' && Number.isInteger(property_value)) {
                                                                //do nothing..
                                                            }
                                                            else {
                                                                this.validation_results[table]['error_messages'].push(this.fetch_error_message('INTEGER_ONLY', [element, column_name]))
                                                                valid_column = false
                                                            }
                                                        }
                                                        
                                                        if(element == 'values' ) {
                                                            if((typeof(property_value) === 'object' && property_value instanceof Array)) {
                                                                if (property_value.length > 1) {
                                                                    //do nothing..
                                                                }
                                                                else {
                                                                    this.validation_results[table]['error_messages'].push(this.fetch_error_message('ARRAY_VALUE_MUST_HAVE_AT_LEAST_ONE_DATA', [element, column_name]))
                                                                    valid_column = false
                                                                }
                                                            }
                                                            else {
                                                                this.validation_results[table]['error_messages'].push(this.fetch_error_message('ARRAY_ONLY', [element, column_name]))
                                                                valid_column = false
                                                            }
                                                        }
    
                                                    }
                                                    else {
                                                        this.validation_results[table]['warning_messages'].push(this.fetch_warning_message('NOT_A_PROPERTY_OF_CONTROL_TYPE', [element, control_type, column_name]))
                                                    }
                                                });
                                            }
                                            //multiple choice,radio button or radio bar
                                            // FIXME: temporary combined for now since these three properties only use the same 'values' property
                                            else if(['multiple choice', 'radio button', 'radio bar'].indexOf(control_type) !== -1) {
                                                arr_properties = ['values']
                                                Object.keys(column_properties).forEach(element => {
                                                    property_value = column_properties[element]
                                                    if(this.is_valid_property_of_control_type(element, arr_properties)) {
                                                        if(element == 'values' ) {
                                                            if((typeof(property_value) === 'object' && property_value instanceof Array)) {
                                                                if (property_value.length > 1) {
                                                                    //do nothing..
                                                                }
                                                                else {
                                                                    this.validation_results[table]['error_messages'].push(this.fetch_error_message('ARRAY_VALUE_MUST_HAVE_AT_LEAST_ONE_DATA', [element, column_name]))
                                                                    valid_column = false
                                                                }
                                                            }
                                                            else {
                                                                this.validation_results[table]['error_messages'].push(this.fetch_error_message('ARRAY_ONLY', [element, column_name]))
                                                                valid_column = false
                                                            }
                                                        }
    
                                                    }
                                                    else {
                                                        this.validation_results[table]['warning_messages'].push(this.fetch_warning_message('NOT_A_PROPERTY_OF_CONTROL_TYPE', [element, control_type, column_name]))
                                                    }
                                                });
                                            }
                                            //file upload
                                            else if(control_type == 'file-upload') {
                                                arr_properties = ['allowed_ext', 'max_upload_size']
                                                Object.keys(column_properties).forEach(element => {
                                                    property_value = column_properties[element]
                                                    if(this.is_valid_property_of_control_type(element, arr_properties)) {
                                                        if(element == 'allowed_ext' ) {
                                                            if((typeof(property_value) === 'object' && property_value instanceof Array)) {
                                                                // FIXME: No need to nitpick for now, just make sure its an array of string. The real validator for file-upload, 
                                                                // is in the view and STARK js files of generated project.
                                                                for (let index = 0; index < property_value.length; index++) {
                                                                    let ext_value = property_value[index];
                                                                    if(typeof(ext_value) === 'string') {
    
                                                                    }
                                                                    else {
                                                                        this.validation_results[table]['error_messages'].push(this.fetch_error_message('ARRAY_STRING_ONLY', [element, column_name]))
                                                                        valid_column = false
                                                                    }
                                                                    
                                                                }
                                                            }
                                                            else {
                                                                this.validation_results[table]['error_messages'].push(this.fetch_error_message('ARRAY_STRING_ONLY', [element, column_name]))
                                                                valid_column = false
                                                            }
                                                        }
                                                        
                                                        else if(element == 'max_upload_size' ) {
                                                            if(typeof(property_value) === 'number' && property_value >= 1) {
                                                                //do nothing..
                                                            }
                                                            else {
                                                                this.validation_results[table]['error_messages'].push(this.fetch_error_message('POSITIVE_NUMBER_ONLY', [element, column_name]))
                                                                valid_column = false
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        this.validation_results[table]['warning_messages'].push(this.fetch_warning_message('NOT_A_PROPERTY_OF_CONTROL_TYPE', [element, control_type, column_name]))
                                                    }
                                                });
    
                                            }
                                            //relationship
                                            else if(control_type == 'relationship') {
                                                arr_relationship_types = ['has_one', 'has_many']
                                                if(Object.keys(column_properties).includes('has_one') && Object.keys(column_properties).includes('has_many')) {
                                                    this.validation_results[table]['error_messages'].push(this.fetch_error_message('ONE_RELATION_TYPE_ONLY', [column_name]))
                                                    valid_column = false
                                                }
                                                else {
                                                    if(Object.keys(column_properties).indexOf('has_one')!== -1) {
                                                        if(table_list.indexOf(column_properties['has_one']) !== -1) {
                                                            Object.keys(column_properties).forEach(element => {
                                                                let property_value = column_properties[element]
                                                                if(table_list.indexOf())
                                                                arr_sub_properties = ['value', 'display']
                                                                if(this.is_valid_property_of_control_type(element, arr_sub_properties, true)){
        
                                                                }
                                                                else {
                                                                    this.validation_results[table]['warning_messages'].push(this.fetch_warning_message('NOT_A_PROPERTY_OF_CONTROL_TYPE', [element, control_type, column_name]))
        
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            this.validation_results[table]['error_messages'].push(this.fetch_error_message('TABLE_NOT_FOUND', [column_properties['has_one'], 'has_one', column_name]))
                                                            valid_column = false
                                                        }
                                                    }
                                                    else if (Object.keys(column_properties).indexOf('has_many')!== -1) {
                                                        if(table_list.indexOf(column_properties['has_many']) !== -1) {
                                                            Object.keys(column_properties).forEach(element => {
                                                                let property_value = column_properties[element]
                                                                arr_sub_properties = ['has_many_ux']
                                                                if(this.is_valid_property_of_control_type(element, arr_sub_properties, true)){
    
                                                                }
                                                                else {
                                                                    this.validation_results[table]['warning_messages'].push(this.fetch_warning_message('NOT_A_PROPERTY_OF_CONTROL_TYPE', [element, control_type, column_name]))
    
                                                                }
                                                            });
                                                        }
                                                        else {   
                                                            this.validation_results[table]['error_messages'].push(this.fetch_error_message('TABLE_NOT_FOUND', [column_properties['has_many'], 'has_many', column_name]))
                                                            valid_column = false
                                                        }
                                                    }
                                                    else {
                                                        this.validation_results[table]['error_messages'].push(this.fetch_error_message('NO_RELATIONSHIP_TYPE', [column_name]))
                                                        valid_column = false
                                                    }
                                                }
    
                                            }
    
                                        }
                                        else {
                                            this.validation_results[table]['error_messages'].push(this.fetch_error_message('INVALID_COLUMN_PROPERTIES', [column_name]))
                                            valid_column = false
                                        }
    
                                    }
    
    
    
                                    if(valid_column) {
                                        this.validation_results[table]['columns'][column_name] = 'OK'
                                    }
                                }
                                else {
                                    this.validation_results[table]['error_messages'].push(this.fetch_error_message('INVALID_COLUMN_FORMAT',[table, column_position])) 
                                    valid_column = false
                                }
                                
                                
                                // console.log(Object.values(column)[0])
                            }
                            else {
                                this.validation_results[table]['error_messages'].push(this.fetch_error_message('INVALID_COLUMN_ATTRIBUTES',[column, typeof column]))
                                valid_column = false
                            }
                        });
                    }
                    else {
                        this.validation_results[table]['error_messages'].push(this.fetch_error_message('INVALID_DATA_ATTRIBUTES', [table, typeof table_element['data']]))
                        valid_column = false
                    }
                }
                else {
                    this.validation_results[table]['error_messages'].push(this.fetch_error_message('MISSING_DATA_ATTRIBUTE',[table]))
                        valid_column = false
                }

            }
            else {
                this.validation_results[table+' Duplicate'] = {
                    // 'error_messages': this.fetch_error_message('DUPLICATE_TABLE', [table])
                }
                valid_column = false
            }
        }
        console.log(this.validation_results)

        return this.validation_results
    },
    is_complex_control_types_object(column_value) {
        let valid_complex_control_type = true
        for (let key in column_value) {
            if (Object.hasOwnProperty.call(column_value, key)) {
                let element = column_value[key];
                if(element.toString() === '[object Object]') {
                    valid_complex_control_type = false;
                    break
                }
            }
        }
        return valid_complex_control_type
    },
    is_valid_property_of_control_type(property, arr_valid_properties, is_type_rel = false) {
           
        valid_property = false
        if(arr_valid_properties.indexOf(property) !== -1) {
            //valid property
            valid_property = true
        }

        // always a valid property but no need to include in arr_valid_properties
        if(property == 'type') {
            valid_property = true
        }
        if(is_type_rel) {
            if (property == 'has_one' || property == 'has_many') {
                valid_property = true
            }
        }

        return valid_property

    },

}