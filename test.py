import boto3

codebuild = boto3.client('codebuild')

CB_project_name = f"STARK_NicoTestAZ4_build"

response = codebuild.list_builds_for_project(projectName=CB_project_name)
build_summaries = codebuild.batch_get_builds(ids=response['ids']).get("builds", {})
print(build_summaries)
print("______________________________________________________________________")
if len(build_summaries) > 1 :
    print(len(build_summaries))
    for build in build_summaries:
        
        if build.get("buildNumber") == 2:
            print("______________________________________________________________________")
            print(build)
            if build.get("buildStatus") == 'IN_PROGRESS':
                retry         = True
                result        = ''
                current_stack = 2
            else:
                retry = False
        
                # s3_resp = s3.get_object(Bucket=codegen_bucket_name, Key=f"codegen_dynamic/{project_varname}/static_site_url.txt")

                # url_txt = s3_resp['Body'].read().decode('utf-8')
                return_val = "\"https://nicotestaz9ydsd5dak.z22.web.core.windows.net/\""
                url_txt= return_val.strip('"')
                if url_txt == '':
                    result = "FAILED"
                else:
                    result = url_txt
else:
    retry = True
    result = ""

print("______________________________________________________________________")

print(result)
print(retry)