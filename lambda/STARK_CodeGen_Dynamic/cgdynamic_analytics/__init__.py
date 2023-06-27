#STARK Code Generator component.

#Python Standard Library
import base64
import textwrap

import convert_friendly_to_system as converter

def create(data):
    s3_athena_bucket_name = data['S3 Bucket Athena']
    project_varname       = data['Project_Name']
    entities              = data["Entities"]
    entities_varname = []
    for entity in entities:
        entities_varname.append(converter.convert_to_system_name(entity))

    source_code = f"""\
    import importlib
    import boto3
    import json
    import base64
    import re
    from botocore.exceptions import ClientError
    
    import stark_core
    from stark_core import data_abstraction
    from stark_core import utilities
    from collections import OrderedDict

    #######
    #CONFIG
    ddb_table       = stark_core.ddb_table
    bucket_name     = stark_core.bucket_name
    region_name     = stark_core.region_name
    page_limit      = stark_core.page_limit
    bucket_url      = stark_core.bucket_url
    bucket_tmp      = stark_core.bucket_tmp
    athena          = boto3.client('athena')
    database        = "stark_{project_varname.lower()}_db"
    ddb             = boto3.client('dynamodb')
    default_sk      = "Analytics|Settings"
    report_pk_field = "Report_Name"

    def lambda_handler(event, context):
        responseStatusCode = 200
        request_type = event.get('queryStringParameters',{{}}).get('rt','')
        global username
        username = event.get('requestContext',{{}}).get('authorizer',{{}}).get('lambda',{{}}).get('Username','')
        response = []
        if request_type == '':
            method  = event.get('requestContext', {{}}).get('http', {{}}).get('method', '')
            if event.get('isBase64Encoded') == True :
                payload = json.loads(base64.b64decode(event.get('body'))).get('Analytics_Report',"")
            else:    
                if method == 'POST':
                    payload = json.loads(event.get('body', {{}})).get('Analytics_Report',"")
                else:
                    payload = event.get('body', {{}}).get('Analytics_Report',"")
            
            data    = {{}}
            if payload != "":
                if(payload.get('Is_Custom_Report','') == 'Yes'):
                    report_name = payload.get('Report_Name', '') + ' - [Custom]'
                else:
                    report_name = payload.get('Report_Name', '')

                data['Report_Name'] = report_name
                data['Report_Settings'] = payload.get('Report_Settings','')
                data['Is_Custom_Report'] = payload.get('Is_Custom_Report','')
                
            if method == 'POST':
                response = save_report(data)
            else:
                dump_csv()
        else:
            
            if request_type == 'detail':
                is_custom_report = event.get('queryStringParameters').get('is_custom_report','')
                table_with_permission = get_report_modules(username)
                if(is_custom_report == 'Yes'):
                    query = event.get('queryStringParameters').get('Query','')
                    table_from_query = [word.replace('_', ' ').title() for word in extract_table_name(query)]
                    valid_report = has_permission(table_from_query, table_with_permission)
                else:
                    report_data = event.get('queryStringParameters').get('Query','')
                    query = compose_query(report_data)
                    data = json.loads(report_data)
                    table_from_query = data['tables']
                    valid_report = has_permission(table_from_query, table_with_permission)

                query_error_list = validate_query(query)
                error_exists = any('error' in item for item in query_error_list)
                
                if not error_exists:
                    if valid_report:

                        temp_metadata = event.get('queryStringParameters').get('Metadata','')
                        temp_response = get_query_result(query)
        
                        if(temp_metadata):
                            metadata = eval(event.get('queryStringParameters').get('Metadata',''))
                        else:
                            tmp_metadata = get_query_metadata(query)
                            metadata = {{
                                item["column_name"].title(): {{'data_type': 'String' if item["data_type"] == 'varchar' 
                                                            else 'Float' if item["data_type"] == 'real'
                                                            else item["data_type"].capitalize()}}
                                for item in tmp_metadata
                            }}
        
                        if(temp_response):
                            report_list = []
                            for d in temp_response:
                                customer_modified = {{}}
                                for key, value in d.items():
                                    if("Sum_of" not in key and "Count_of" not in key):
                                        words = key.split('_')
                                        words = [word.capitalize() for word in words]
                                        new_key = ' '.join(words)
                                        customer_modified[new_key] = value
                                    else:
                                        words = key.split('_of_')
                                        words = [word.capitalize() for word in words]
                                        new_key = ' of '.join(words)
                                        customer_modified[new_key] = value
                                report_list.append(customer_modified)
        
                            key_dict = OrderedDict()
                            for customer_dict in report_list:
                                for key in customer_dict.keys():
                                    if key not in key_dict:
                                        key_dict[key] = None
        
                            report_header = list(key_dict.keys())
                            print(report_header)
                            pk_field = ''
                            report_param_dict = {{}}
                            csv_file, file_buff_value = utilities.create_csv(report_list, report_header)
                            utilities.save_object_to_bucket(file_buff_value, csv_file)
                            pdf_file, pdf_output = utilities.prepare_pdf_data(report_list, report_header, report_param_dict, metadata, pk_field)
                            utilities.save_object_to_bucket(pdf_output, pdf_file)
        
                            csv_bucket_key = bucket_tmp + csv_file
                            pdf_bucket_key = bucket_tmp + pdf_file
                            response = report_list, csv_bucket_key, pdf_bucket_key
                        else:
                            response = []
                    else:
                        rows = []
                        error_message = "Access is not allowed for other tables. Here is a list of the permitted tables: " + ', '.join(table_with_permission)
                        rows.append({{"error": error_message}})
                        response = rows
                else:
                    response = query_error_list
                
            elif request_type == 'get_saved_reports':
                response = get_saved_reports()
            elif request_type == "get_saved_report_settings":
                report_name = event.get('queryStringParameters').get('report_name','')
                print(report_name)
                response = get_saved_report_settings(report_name)
            elif request_type == "get_report_modules":
                response = get_report_modules(username)
        
        return {{
            "isBase64Encoded": False,
            "statusCode": responseStatusCode,
            "body": json.dumps(response),
            "headers": {{
                "Content-Type": "application/json",
            }}
        }}

    def has_permission(array1, array2):
        bool_list = []
        for item in array1:
            if item in array2:
                bool_list.append(True)
            else:
                bool_list.append(False)
        
        if False in bool_list:
            return False
        else:
            return True
        

    def extract_table_name(query):
        regex = r'\b(?:FROM|JOIN)\s+([^\s;]+)'
        matches = re.findall(regex, query, flags=re.IGNORECASE)
        
        if matches:
            return [re.split(r'\s+', match)[0] for match in matches]
        
        return []

    def get_saved_report_settings(pk, sk=default_sk, db_handler = None):
        if db_handler == None:
            db_handler = ddb
        
        items = []
        ddb_arguments = {{}}
        ddb_arguments['TableName'] = ddb_table
        ddb_arguments['Select'] = "ALL_ATTRIBUTES"
        ddb_arguments['KeyConditionExpression'] = "#pk = :pk and #sk = :sk"
        ddb_arguments['ExpressionAttributeNames'] = {{
                                                    '#pk' : 'pk',
                                                    '#sk' : 'sk'
                                                }}
        ddb_arguments['ExpressionAttributeValues'] = {{
                                                    ':pk' : {{'S' : pk }},
                                                    ':sk' : {{'S' : sk }}
                                                }}
        
        print(db_handler)
        response = db_handler.query(**ddb_arguments)
        raw = response.get('Items')

        for record in raw:
            item = {{}}
            item['Report_Name'] = record.get('pk', {{}}).get('S','')
            item['Report_Settings'] = record.get('Report_Settings',{{}}).get('S','')
            items.append(item)

        return items

    def validate_query(analytics_query):
        try:
            # print(analytics_query)
            response = athena.start_query_execution(
                QueryString=analytics_query, 
                QueryExecutionContext={{'Database': database}}, 
                ResultConfiguration={{'OutputLocation': 's3://{s3_athena_bucket_name}/result'}}
            )

            # get the query execution ID
            query_execution_id = response['QueryExecutionId']

            # wait for the query to complete
            while True:
                failure_reason = ''
                query_status = athena.get_query_execution(QueryExecutionId=query_execution_id)
                status = query_status['QueryExecution']['Status']['State']
                if status in ['SUCCEEDED', 'FAILED', 'CANCELLED']:
                    if status == 'FAILED':
                        failure_reason = query_status['QueryExecution']['Status']['StateChangeReason']
                    break

            rows = []
            if failure_reason != '':
                rows = []
                rows.append({{"error": failure_reason}})

        except ClientError as e:
            error_message = e.response['Error']['Message']
            rows = []
            rows.append({{"error": error_message}})
        
        return rows

    def save_report(data, method='POST', db_handler = None):
    
        if data['Is_Custom_Report']: 
            table_with_permission = get_report_modules(username)
            table_from_query = [word.replace('_', ' ').title() for word in extract_table_name(data['Report_Settings'])]
            valid_report = has_permission(table_from_query, table_with_permission)
        else: 
            table_with_permission = get_report_modules(username)
            data = json.loads(data['Report_Settings'])
            table_from_query = data['tables']
            valid_report = has_permission(table_from_query, table_with_permission)
        # print(valid_report)

        if valid_report:
            if db_handler == None:
                db_handler = ddb
            sk = default_sk
            pk = str(data.get('Report_Name', ''))
            Report_Settings = str(data.get('Report_Settings', ''))
            item = utilities.append_record_metadata('add', username)
            item['pk'] = {{'S' : pk}}
            item['sk'] = {{'S' : sk}}
            item['Report_Settings'] = {{'S' : Report_Settings}}
            item['STARK-ListView-sk'] = {{'S' : pk}}

            ddb_arguments = {{}}
            ddb_arguments['TableName'] = ddb_table
            ddb_arguments['Item'] = item
            response = db_handler.put_item(**ddb_arguments)

            global resp_obj
            resp_obj = response
            return "OK"
        else:
            return "Error"
 

    def get_saved_reports(sk=default_sk, db_handler = None):
        if db_handler == None:
            db_handler = ddb

        ExpressionAttributeNamesDict = {{
            '#isDeleted' : 'STARK-Is-Deleted',
        }}
        items = []
        ddb_arguments = {{}}
        ddb_arguments['TableName'] = ddb_table
        ddb_arguments['IndexName'] = "STARK-ListView-Index"
        ddb_arguments['KeyConditionExpression'] = 'sk = :sk'
        ddb_arguments['FilterExpression'] = 'attribute_not_exists(#isDeleted)'
        ddb_arguments['ExpressionAttributeValues'] = {{ ':sk' : {{'S' : sk }} }}
        ddb_arguments['ExpressionAttributeNames'] = ExpressionAttributeNamesDict

        response = db_handler.query(**ddb_arguments)
        raw = response.get('Items')
        
        for record in raw:
            item = {{}}
            item['Report_Name'] = record.get('pk', {{}}).get('S','')
            item['Report_Settings'] = record.get('Report_Settings',{{}}).get('S','')
            items.append(item)

        return items

    def get_query_metadata(analytics_query):
        print(analytics_query)
        response = athena.start_query_execution(
            QueryString=analytics_query, 
            QueryExecutionContext={{'Database': database}}, 
            ResultConfiguration={{'OutputLocation': 's3://{s3_athena_bucket_name}/result'}}
        )

        # get the query execution ID
        query_execution_id = response['QueryExecutionId']

        # wait for the query to complete
        while True:
            query_status = athena.get_query_execution(QueryExecutionId=query_execution_id)
            status = query_status['QueryExecution']['Status']['State']
            if status in ['SUCCEEDED', 'FAILED', 'CANCELLED']:
                break

        # get the query results
        query_results = athena.get_query_results(QueryExecutionId=query_execution_id)

        # extract the column names from the results
        column_metadata = []
        for column_info in query_results['ResultSet']['ResultSetMetadata']['ColumnInfo']:
            column_metadata.append({{'column_name' : column_info['Name'], 'data_type' :column_info['Type']}})
        
        return column_metadata

    def get_query_result(analytics_query):
        print(analytics_query)
        response = athena.start_query_execution(
            QueryString=analytics_query, 
            QueryExecutionContext={{'Database': database}}, 
            ResultConfiguration={{'OutputLocation': 's3://{s3_athena_bucket_name}/result'}}
        )

        # get the query execution ID
        query_execution_id = response['QueryExecutionId']

        # wait for the query to complete
        while True:
            query_status = athena.get_query_execution(QueryExecutionId=query_execution_id)
            status = query_status['QueryExecution']['Status']['State']
            if status in ['SUCCEEDED', 'FAILED', 'CANCELLED']:
                break

        # get the query results
        query_results = athena.get_query_results(QueryExecutionId=query_execution_id)

        # extract the column names from the results
        column_names = []
        for column_info in query_results['ResultSet']['ResultSetMetadata']['ColumnInfo']:
            column_names.append(column_info['Name'])

        # create a list of rows, where each row is a dictionary mapping column names to values
        rows = []
        for result in query_results['ResultSet']['Rows'][1:]:
            row = {{}}
            for i in range(len(column_names)):
                if(len(result['Data'][i]) != 0):
                    row[column_names[i]] = result['Data'][i]['VarCharValue']
                else:
                    row[column_names[i]] = ''
            rows.append(row)
        
        return rows

    def convert_to_system_name(data):
        if(type(data) == 'list'):
            converted_list = []
            for item in data:
                converted_item = item.lower().replace(" ", "_")
                converted_list.append(converted_item)
            return converted_list
        else:
            converted_item = data.lower().replace(" ", "_")
            return converted_item


    def replace_vowels(input_string):
        vowels = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']
        for vowel in vowels:
            input_string = input_string.replace(vowel, '')
        return input_string

    def compose_query(report_data):
        data = json.loads(report_data)
        # for table/s relationship ===================
        str_fields = ''
        where_clause = ''
        group_by = ''
        sort = ''
        str_table = ''
        if(len(data["tables"]) > 1):
            str_table = ''
            str_tbls = ''
            where_tbls = []
            for index, rel_data in enumerate(data['relationships']):
                table1       = rel_data['Table_1'].split(".")[0]
                table1_field = rel_data['Table_1'].split(".")[1]
                table2       = rel_data['Table_2'].split(".")[0]
                table2_field = rel_data['Table_2'].split(".")[1]

                if(index < 1):
                    str_tbls = table1 + " AS " + replace_vowels(table1) + " LEFT JOIN " + table2 + " AS " + replace_vowels(table2) + " ON " + replace_vowels(table1) + "." + table1_field + " = " + replace_vowels(table2) + "." + table2_field
                else:
                    str_tbls =  "LEFT JOIN " + table2 + " AS " + replace_vowels(table2) + " ON " + replace_vowels(table1) + "." + table1_field + " = " + replace_vowels(table2) + "." + table2_field
                
                where_tbls.append(str_tbls)
                
            str_table = " ".join(where_tbls)
            
        else:
            table = convert_to_system_name(data['tables'][0])
            str_table = table + " AS " + replace_vowels(table)

        # SUM =====================================
        sql_sum = ", ".join([f"SUM({{col}}) AS Sum_of_{{col.split('.')[-1].capitalize()}}" for col in data['sum']])

        # COUNT =====================================
        sql_count = ", ".join([f"COUNT({{col}}) AS Count_of_{{col.split('.')[-1].capitalize()}}" for col in data['count']])

        # SELECT FIELDS =====================================
        if data['group_by'] != '':
            grp_by_table = data['group_by'].split(".")[0]
            grp_by_field = data['group_by'].split(".")[1]
            sql_group_by = replace_vowels(grp_by_table) + "." + grp_by_field

            if grp_by_table != '':
                group_by = ' GROUP BY ' + sql_group_by
                select_grp_by = sql_group_by + ", "
            else:
                group_by = ""
                select_grp_by = ""

        if(sql_count != "" and sql_sum != ""):
            str_fields = select_grp_by + sql_sum + ", " + sql_count
        elif(sql_sum != ''):
            str_fields = select_grp_by + sql_sum
        elif(sql_count != ''):
            str_fields = select_grp_by + sql_count
        elif(sql_sum == '' or sql_count == ''):
            if data['count_table_fields'] == len(data['fields']):
                str_fields = '*'
            else:
                str_fields = ", ".join([f"cstmr.{{col.split(' | ')[1].lower().replace(' ', '_')}}" for col in data['fields']])

        # WHERE CLAUSE =====================================
        arr_where_clause = []

        for filter in data['filters']:
            # print(filter)
            if(filter['Operand'] == 'contains'):
                operand_value = "LIKE '%" + filter['Value'] + "%'"
            elif(filter['Operand'] == 'begins_with'):
                operand_value = "LIKE '" + filter['Value'] + "%'"
            elif(filter['Operand'] == 'ends_with'):
                operand_value = "LIKE '%" + filter['Value'] + "'"
            elif(filter['Operand'] == 'IN'):
                operand_value = "IN (" + filter['Value'] + ")"
            elif(filter['Operand'] == 'between'):
                operand_value = "BETWEEN (" + filter['Value'] + ")"
            else:
                operand_value = filter['Operand'] + " '" + filter['Value'] + "'"

            filter_table = filter['Field'].split(".")[0]
            filter_field = filter['Field'].split(".")[1]
            where_clause = replace_vowels(filter_table) + "." + filter_field + " " + operand_value
            arr_where_clause.append(where_clause)
            
        if(len(arr_where_clause) > 0):
            where_clause = ' WHERE ' + " AND ".join(arr_where_clause)
        else:
            where_clause = ''
    
        # ORDER BY =====================================
        arr_sort = []
        for sort in data['sort']:
            table = sort['Field'].split(".")[0]
            field = sort['Field'].split(".")[1]
            sort = replace_vowels(table) + "." + field + " " + sort['Sort_Type']
            arr_sort.append(sort)

        if(len(arr_sort) > 0):
            sort = ' ORDER BY ' + " AND ".join(arr_sort)
        else:
            sort = ''

        query = "SELECT " + str_fields + " FROM " + str_table + where_clause + group_by + sort 
        print(query)
        return query
        
    def get_report_modules(username):
        # 
        ########################
        #1.GET USER PERMISSIONS
        #FIXME: Getting user permissions should be a STARK Core framework utility, only here for now for urgent MVP implementation,
        #       to not hold up related features that need implementation ASAP
        sk = 'STARK|module'
        response = ddb.query(
            TableName=ddb_table,
            Select='ALL_ATTRIBUTES',
            ReturnConsumedCapacity='TOTAL',
            KeyConditionExpression='pk = :pk and sk = :sk',
            ExpressionAttributeValues={
                ':pk' : {'S' : username},
                ':sk' : {'S' : "STARK|user|permissions"}
            }
        )

        raw = response.get('Items')
        permissions = []
        for record in raw:
            permission_string = record.get('Permissions',{}).get('S','')
        
        #Split permission_string by the delimeter (comma+space / ", ")
        permissions_list = permission_string.split(", ")

        ##################################
        #GET SYSTEM MODULES (ENABLED ONLY)
        response = ddb.query(
            TableName=ddb_table,
            IndexName="STARK-ListView-Index",
            Select='ALL_ATTRIBUTES',
            ReturnConsumedCapacity='TOTAL',
            KeyConditionExpression='sk = :sk',
            ExpressionAttributeValues={
                ':sk' : {'S' : sk}
            }
        )
        raw = response.get('Items')

        report_items = []
        for record in raw:
            if 'pk' in record and '|Report' in record['pk']['S'] and 'STARK_' not in record.get('Target', {}).get('S'):
                if record.get('pk', {}).get('S','') in permissions_list:
                    item = {}
                    item = record.get('Descriptive_Title',{}).get('S','').replace('Report ', '')
                    report_items.append(item)

        return report_items


    def dump_csv():
        entities = {entities_varname}

        #FIXME: Temporary solution to duplication of records due to multiple parquet files read in processed bucket
        #       Delete every files inside the processed bucket        
        client = boto3.client('s3')
        resp = client.list_objects(Bucket=stark_core.analytics_processed_bucket_name).get('Contents',{{}})
        for val in resp:
            client.delete_object(Bucket=stark_core.analytics_processed_bucket_name, Key=val["Key"])

        child_entity_for_one_to_many = []
        entities_to_dump_list = {{}}
        for entity in entities:

            entity_namespace = importlib.import_module(entity)

            for fields, dictionary in entity_namespace.metadata.items():
                if dictionary['relationship'] == "1-M":
                    child_entity_for_one_to_many.append({{'parent':entity, 'child': fields}})

            object_expression_values = {{':sk' : {{'S' : entity_namespace.default_sk}}}}
            items, aggregated_items = data_abstraction.get_report_data({{}} ,object_expression_values, "", False, entity_namespace.map_results)

            master_fields = []
            for key in entity_namespace.metadata.keys():
                master_fields.append(key)

            entities_to_dump_list.update({{entity: {{'data':items, 'headers': master_fields}}}})

        ##FIXME: might need refactoring
        for index in child_entity_for_one_to_many:
            ## get data one by one
            child_items = []
            many_sk = f"{{index['parent']}}|{{index['child']}}"
            parent_entity_namespace = importlib.import_module(index['parent'])
            pk_field = parent_entity_namespace.pk_field
            parent_data_list = entities_to_dump_list[index['parent']]['data']
            entities_to_dump_list[index['child']]['headers'] = [pk_field, *entities_to_dump_list[index['child']]['headers']]
            for key in parent_data_list:
                response = data_abstraction.get_many_by_pk(key[pk_field], many_sk)
                for each_child_record in json.loads(response[0][many_sk]['S']):
                    item = {{pk_field:key[pk_field], **each_child_record}}
                    child_items.append(item)
            entities_to_dump_list[index['child']]['data'] = child_items

        for entity, entity_data in entities_to_dump_list.items():
            items = entity_data['data']
            headers = entity_data['headers']
            report_list = []
            # print(headers)
            if len(items) > 0:
                for key in items:
                    temp_dict = {{}}
                    #remove primary identifiers and STARK attributes
                    if 'sk' in key:    
                        key.pop("sk")
                    if "STARK_uploaded_s3_keys" in key:
                        key.pop("STARK_uploaded_s3_keys")
                    for index, value in key.items():
                        temp_dict[index] = value
                    # print(temp_dict)
                    report_list.append(temp_dict)

                csv_file, file_buff_value = utilities.create_csv(report_list, headers)
                ## Do not use csv filename provided by the create_csv function, instead use the entity varname
                #  so that each entity will only have one csv file making the dumper overwrite the existing file 
                #  everytime it runs.
                key_filename = entity + ".csv"
                utilities.save_object_to_bucket(file_buff_value, key_filename, stark_core.analytics_raw_bucket_name, entity)
    """
    return textwrap.dedent(source_code)


