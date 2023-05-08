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
    
    import stark_core
    from stark_core import data_abstraction
    from stark_core import utilities
    from collections import OrderedDict

    #######
    #CONFIG
    ddb_table         = stark_core.ddb_table
    bucket_name       = stark_core.bucket_name
    region_name       = stark_core.region_name
    page_limit        = stark_core.page_limit
    bucket_url        = stark_core.bucket_url
    bucket_tmp        = stark_core.bucket_tmp
    athena            = boto3.client('athena')
    database          = "stark_{project_varname.lower()}_db"

    def lambda_handler(event, context):
        responseStatusCode = 200
        request_type = event.get('queryStringParameters',{{}}).get('rt','')
        if request_type == '':
            dump_csv()
        else:
            
            if request_type == 'get_tables':
                query = "SELECT table_name FROM information_schema.tables WHERE table_schema = '" + database + "'"
                temp_response = get_query_result(query)

                formatted_data = []
                for d in temp_response:
                    formatted_dict = {{}}
                    formatted_dict['table_name'] = d['table_name'].title().replace('_', ' ')
                    formatted_data.append(formatted_dict)

                response = formatted_data
            elif request_type == 'get_table_fields':
                tables = event.get('queryStringParameters').get('tables','')
                table_list = "('{{}}')".format("','".join(tables.split(',')))
                query = "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = '" + database + "' AND table_name IN " + table_list
                temp_response = get_query_result(query)
                formatted_data = []
                for d in temp_response:
                    formatted_dict = {{}}
                    formatted_dict['table_name'] = d['table_name'].title().replace('_', ' ')
                    formatted_dict['column_name'] = d['column_name'].title().replace('_', ' ')
                    formatted_dict['data_type'] = d['data_type']
                    formatted_data.append(formatted_dict)
                response = formatted_data

            elif request_type == 'get_table_fields_int':
                tables = event.get('queryStringParameters').get('tables','')
                table_list = "('{{}}')".format("','".join(tables.split(',')))
                query = "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = '" + database + "' AND table_name IN " + table_list + " AND data_type in ('real', 'integer')"
                temp_response = get_query_result(query)

                formatted_data = []
                for d in temp_response:
                    formatted_dict = {{}}
                    formatted_dict['table_name'] = d['table_name'].title().replace('_', ' ')
                    formatted_dict['column_name'] = d['column_name'].title().replace('_', ' ')
                    formatted_data.append(formatted_dict)
                
                response = formatted_data

            elif request_type == 'detail':
                query = event.get('queryStringParameters').get('Query','')
                metadata = eval(event.get('queryStringParameters').get('Metadata',''))

                temp_response = get_query_result(query)
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
                pk_field = ''
                report_param_dict = {{}}
                csv_file, file_buff_value = utilities.create_csv(report_list, report_header)
                utilities.save_object_to_bucket(file_buff_value, csv_file)
                pdf_file, pdf_output = utilities.prepare_pdf_data(report_list, report_header, report_param_dict, metadata, pk_field)
                utilities.save_object_to_bucket(pdf_output, pdf_file)
                
                csv_bucket_key = bucket_tmp + csv_file
                pdf_bucket_key = bucket_tmp + pdf_file
                
                response = report_list, csv_bucket_key, pdf_bucket_key

            return {{
                "isBase64Encoded": False,
                "statusCode": responseStatusCode,
                "body": json.dumps(response),
                "headers": {{
                    "Content-Type": "application/json",
                }}
            }}

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
                row[column_names[i]] = result['Data'][i]['VarCharValue']
            rows.append(row)
        
        return rows

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


