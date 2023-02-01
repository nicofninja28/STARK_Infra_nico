var root = new Vue({
    el: "#vue-root",
    data: {
        form: {
            data_model: "",
            data_model_temp: "",
        },
        project_name: "",
        yaml_file: null,
        default_pass: "",
        confirm_default_pass: "",
        api_key: '',
        current_stack: 0,
        deploy_time_end: '',
        deploy_time_start: '',
        deploy_visibility: 'hidden',
        disable_deploy_button: true,
        loading_message: '',
        model_readonly: false,
        msg_counter: 0,
        spinner_display: 'block',
        success_message: 'Welcome to STARK: Serverless Transformation and Acceleration Resource Kit.<br> The STARK Parser is idle',
        error_message: "",
        validation_results:"",
        ui_visibility: 'block',
        visibility: 'visible',
        wait_counter: 0,
        wait_limit: 12, 
        validation_properties: {
            'project_name': {
                'state': null,
                'feedback': ''
            },
            'default_pass': {
                'state': null,
                'feedback': ''
            },
            'confirm_default_pass': {
                'state': null,
                'feedback': ''
            },
            'yaml_file': {
                'state': null,
                'feedback': ''
            },
        }
    },
    methods:{
        readAsText() {
            var file = this.yaml_file; 
            if(this.yaml_file)
            {
                var ext = file.name.split('.').pop()
                if(ext != 'yml')
                {
                    this.validation_properties.yaml_file.state = false
                    this.validation_properties.yaml_file.feedback = "Sorry, but you uploaded a non YAML file. Please make sure to upload the correct file type."
                    root.yaml_file = null
                    root.form.data_model_temp = "";
                    root.form.data_model = "";
                    return false
                }
                else {
                    var fr=new FileReader();
                    fr.readAsText(this.yaml_file)
                    fr.onload = function() {
                        root.form.data_model_temp = fr.result;
                        root.form.data_model = `__STARK_project_name__: ${root.project_name}\n__STARK_default_password__: ${root.default_pass}\n${fr.result}`
                        // root.form.data_model = `__STARK_project_name__: ${root.project_name}\n__STARK_default_password__:${root.default_pass}\n${fr.result}`
                        console.log(root.form.data_model)
                    }; 
                    this.validation_properties.yaml_file.state = true
                    this.validation_properties.yaml_file.feedback = ""
                }
            }
            else
            {
                root.form.data_model_temp = ""
                root.form.data_model      = ""
            }
        },
        validate_form: function()
        {
            var valid_form = true;
            var message = []
            this.error_message = ""
            this.disable_deploy_button = true;

            if(this.yaml_file == null) {
                valid_form = false
                this.validation_properties.yaml_file.feedback = 'Please upload a YAML file of your Data Model.'
                this.validation_properties.yaml_file.state = false
            }
            else {
                this.validation_properties.yaml_file.feedback = ''
                this.validation_properties.yaml_file.state = true

            }

            if(this.project_name == "") {
                valid_form = false
                message.push('Name')
                this.validation_properties.project_name.feedback = 'Please enter Project Name.'
                this.validation_properties.project_name.state = false
            }
            else {
                this.validation_properties.project_name.feedback = ''
                this.validation_properties.project_name.state = true

            }

            if((!this.default_pass.length)) 
            {
                message.push('Default Password')
                console.log('a')
                valid_form = false
                this.validation_properties.default_pass.feedback = 'Please enter Password.'
                this.validation_properties.default_pass.state = false
                if((!this.default_pass.length) && (this.confirm_default_pass.length)) 
                {
                    console.log('a.a')
                    this.validation_properties.confirm_default_pass.state = false
                    this.validation_properties.confirm_default_pass.feedback = ''
                }
                else if((!this.default_pass.length) && (!this.confirm_default_pass.length)) 
                {
                    this.validation_properties.confirm_default_pass.feedback = ''
                    this.validation_properties.confirm_default_pass.state = null
                }
                
            } 
            
            if((this.default_pass.length) && (!this.confirm_default_pass.length)) 
            {
                message.push('Default Password')
                console.log('b')
                valid_form = false
                
                this.validation_properties.confirm_default_pass.feedback = 'Please confirm Password.'
                this.validation_properties.confirm_default_pass.state = false
                this.validation_properties.default_pass.state = true
            }
            if((this.default_pass.length) && (this.confirm_default_pass.length))  {
                console.log('c')
                if(this.default_pass != this.confirm_default_pass)
                {
                    message.push('Default Password')
                    valid_form = false
                    console.log('d')
                    this.validation_properties.confirm_default_pass.feedback = 'Passwords do not match'
                    this.validation_properties.default_pass.feedback = ''
                    this.validation_properties.confirm_default_pass.state = false
                } 
                else {
                    
                    console.log('e')
                    this.validation_properties.default_pass.state = true
                    this.validation_properties.confirm_default_pass.state = true
                }
            }
            

            if(this.yaml_file == null && this.form.data_model_temp == "")
            {
                valid_form = false;
                message.push('Data Model')
            }
            else {
                this.validation_results = STARK_Validator.validate_data_model(this.form.data_model_temp)
    
            }


            if(valid_form) {
                root.send_to_STARK()
            }
        },
        send_to_STARK: function () {
            root.deploy_visibility = 'hidden';
            root.success_message = ''
            root.loading_message = "STARK is parsing your YAML model..."
            root.spinner_show();

            let data = {
                data_model: this.form.data_model,
                validation_results: this.validation_results
            }
            
            let fetchData = {
                mode: 'cors',
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                method: "POST",
            }


            fetch(STARK.parser_url, fetchData)
            .then( function(response) {
                //FIX-ME:
                //Error handling here should just be for network-related failiures
                //Actual server errors should be handled properly by the API, giving back useful error messages and status codes.
                if (!response.ok) {
                    console.log(response)
                    throw Error(response.statusText);
                }
                return response;
            })
            .then((response) => response.json())
            .then( function(data) {
                root.loading_message = ""
                root.spinner_hide();

                console.log("Received Response")
                console.log(data)
                if (data == "Code:NoProjectName") {
                    console.log("Error Code")
                    root.success_message = "Please enter a project name in the \"__STARK_project_name__\" attribute below"

                }
                else if(data=="YAML Error") {
                    
                    let error_count = 0;
                    let warning_count = 0;
                    for (const entity in root.validation_results) {
                        if (Object.hasOwnProperty.call(root.validation_results, entity)) {
                            const element = root.validation_results[entity];
                            error_count += element['error_messages'].length
                            warning_count += element['warning_messages'].length
                        }
                    }

                    if((error_count > 0 || warning_count > 0)) {
                        root.error_message = `Found ${error_count} error/s and ${warning_count} warning/s in your data model.`

                    }
                    root.success_message = "Sorry, your YAML is invalid. Make sure it conforms to STARK syntax, then try again. "
                    root.deploy_visibility = 'visible';
                    root.model_readonly = true;
                }
                else {
                    console.log("Success")
                    console.log("DONE!");
                    root.disable_deploy_button = false
                    root.success_message = "Nice! Your YAML looks valid according to the STARK Parser.<br>Click \"Deploy\" to launch your serverless system!"

                    root.deploy_visibility = 'visible';
                    root.model_readonly = true;
                }
            })
            .catch(function(error) {
                root.loading_message = ""
                root.spinner_hide();
                console.log(error)
                root.error_message = "Something went wrong.. Check your network or contact the administrator for help."
            });
        },
        deploy_STARK: function () {
            root.success_message = ''
            root.loading_message = "STARK is deploying your system...." 
            root.spinner_show();

            let datetime = new Date()
            root.deploy_time_start = datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds()

            root.deploy_visibility = 'hidden';
            root.ui_visibility = 'none';

            let data = {
                data_model: this.form.data_model
            }

            let fetchData = {
                mode: 'cors',
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                method: "POST",
            }

            console.log(fetchData);

            fetch(STARK.deploy_url, fetchData)
            .then( function(response) {
                if (!response.ok) {
                    console.log(response)
                    throw Error(response.statusText);
                }
                return response;
            })
            .then((response) => response.json())
            .then( function(data) {
                console.log("DONE!");
                console.log(data);

                //Comm loop:
                //  data will contain an index 'retry' which is bool. True means we should call root.deploy_check()
                //  root.deploy_check() will initiate a comm loop with lambda until it gets a data[retry] = False
                //  While it is looping, each communication also contains `status` and `message` aside from `retry`.
                //  We should display `status` and `message` to the user.
                root.msg_counter += 1;

                if(data['retry'] == true) {
                    root.deploy_check();
                }
                else {
                    //Failed:
                    //This means CF Stack execution failed outright.
                    console.log("CF Stack Failure returned by Lambda!");
                    root.loading_message = ""
                    root.spinner_hide();
                    root.success_message = data['message'];
                }

            })
            .catch(function(error) {
                console.log("CF Stack Failure - 500 Error Code");
                root.loading_message = ""
                root.spinner_hide();
                root.success_message = "Deploy failed: STARK encountered an internal error. It's not you, it's us!<br>(You can try again or come back later to see if this error persists)";            
            });
        },
        deploy_check: function () {

            let data = {
                data_model: this.form.data_model,
                current_stack: root.current_stack
            }

            let fetchData = {
                mode: 'cors',
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                method: "POST",
            }

            console.log(fetchData);

            fetch(STARK.deploy_check_url, fetchData)
            .then( function(response) {
                if (!response.ok) {
                    console.log(response)
                    throw Error(response.statusText);
                }
                return response;
            })
            .then((response) => response.json())
            .then( function(data) {
                console.log("DONE!");
                console.log(data);

                //Status tracker:
                //  current_stack tracks which of the three stacks we are currently tracking:
                //  0 - CI/CD Pipeline stack
                //  1 - Bootstrapper stack
                //  2 - Main application stack
                const stack_messages = [
                    'Deployment 1 of 3: Your CI/CD Pipeline... <br>',
                    'Deployment 2 of 3: System Bootstrapper...<br>',
                    'Deployment 3 of 3: Your main application...<br>'
                ]
                root.current_stack = data['current_stack']
                root.loading_message = stack_messages[root.current_stack]

                //Comm loop:
                //  data will contain an index 'retry' which is bool. True means we should call root.deploy_check() again.
                //  While it is looping, each communication also contains `status` and `message` aside from `retry`.
                //  We should display `status` and `message` to the user.
                //  There's also a special status to track - "STACK_NOT_FOUND" - that means we should decide here whether to
                //  retry again (i.e., wait to see if the stack eventually gets created), or if we've waited enough and there's
                //  probably an internal error that prevented the stack from being created
                if(data['result'] == "STACK_NOT_FOUND") {
                    root.wait_counter +=1
                    if (root.wait_counter > root.wait_limit) {
                        //We've waited enough, abort
                        data['retry'] = false
                        data['result'] = 'FAILED'
                        data['status'] = 'STACK NOT FOUND: Stack #' + root.current_stack
                    }
                }

                if(data['retry'] == true) {

                    if (root.msg_counter == 1) {
                        root.loading_message += "Look at you, testing out next-gen serverless tech! BIG BRAIN MOVE!"
                    }
                    else if (root.msg_counter == 2) {
                        root.loading_message += "DID YOU KNOW: Trying out STARK proves you are a person of exquisite taste and sophistication. (True story)"
                    }
                    else if (root.msg_counter == 3) {
                        root.loading_message += "Serverless is the most sustainable form of computing. Thanks for being a good friend to the environment!"
                    }
                    else if (root.msg_counter == 4) {
                        root.loading_message += "It won't be long now dawg, we're almost done!"
                    }
                    else {
                        root.loading_message += "Hmmm... we're taking a bit longer than usual... must be traffic!"
                    }
    
                    root.msg_counter += 1;
                    if(root.msg_counter > 5) {
                        //Just reset so we can cycle through the messages instead of looking like we're stuck
                        root.msg_counter = 1
                    }
                    root.deploy_check()
                }
                else if (data['result'] == "SUCCESS" && data['current_stack'] == 2 ) {
                    //Success:
                    //Data should contain the S3 bucket URL for website hosting that was created for us.
                    //We'll show a link to the user, for clicking and fun.
                    console.log("Success! Here's your new system URL: " + data['url']);

                    let datetime = new Date()
                    root.deploy_time_end = datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds()
        
                    root.loading_message = ""
                    root.spinner_hide();
                    root.success_message = "Success! Here's your new system URL: <a href='" + data['url'] + "'>" + data['url'] + "</a>";
                    root.success_message += "<br> Time start: " + root.deploy_time_start
                    root.success_message += "<br> Time end: " + root.deploy_time_end
                }
                else if (data['result'] == "FAILED") {
                    //This means CF Stack execution eventually failed.
                    console.log("CF Stack Execution failure...");
                    root.spinner_hide();
                    root.success_message = "Sorry, STARK failed to deploy due to an internal error. It's not you, it's us! {" +  data['status'] + "}";

                }
            })
            .catch(function(error) {
                console.log("CF Stack Failure - Deploy Check - 500 Error Code");
                root.loading_message = ""
                root.spinner_hide();
                root.success_message = "Deploy failed: STARK encountered an internal error. It's not you, it's us!<br>(You can try again or come back later to see if this error persists)";                
            });

        },

        spinner_show: function () {
            console.log("trying to show");
            this.visibility = 'visible';
        },
        spinner_hide: function () {
            console.log("trying to hide");
            this.visibility = 'hidden';
        },


    }
})

root.spinner_hide();