var sidebar = new Vue({
    el: "#mySidenav",
    data: {
        group_collapse_name: 'nav-group-collapse-1',
        modules: '',
        localStorage_tables: ''
    },
    methods:{
        get_module_list: function () {
            //FIXME: When default permissions and module registry are implemented in PreLaunch, this should become the default endpoint for homepage modules
            fetchUrl = STARK.STARK_Module_url + '?rt=usermodules'
            //fetchUrl = STARK.sys_modules_url
            STARK.request('GET', fetchUrl)
            .then( function(data) {
                const grouped_modules = []

                grouping = []
                grouping_ctr = 0

                for (const key in data['items']) {
                    data['items'].sort((a, b) => b.priority - a.priority)

                    group = data['items'][key]['group']
                    if ( group in grouping ) {
                        //Skip
                    }
                    else {
                        module_grp = data['module_grps'].find(element=>element.Group_Name == group)
                        grouping[group] = grouping_ctr
                        grouped_modules[grouping_ctr] = {
                            "group_name": group,
                            "priority": module_grp['Priority'],
                            "modules": []
                        }
                        grouping_ctr++
                    }
                    grouped_modules[grouping[group]]["modules"].push(data['items'][key])
                }
                grouped_modules.sort((a, b) => b.priority - a.priority)
                // console.log(grouped_modules)
                console.log("Hi")

                sidebar.modules = grouped_modules;
                root.modules = grouped_modules
                STARK.set_local_storage_item('Permissions', 'modules', grouped_modules)
                console.log(sidebar.modules)

                //For Analytics_Data localStorage setting
                sidebar.get_metadata(data['report_items'])
                
                console.log("DONE! Retrieved list of modules.")
                spinner.hide();
            })                    
            .catch(function(error) {
                console.log("Encountered an error! [" + error + "]");
            });
        },

        get_metadata: function(tables) {
            analytics_data = {};
            tables.forEach(element => {
                
                table = element.replace(' ', '_') + "_url"
                fetchUrl = STARK[table] + '?rt=get_metadata'
                analytics_data[element] = {};
                STARK.request('GET', fetchUrl)
                .then( function(data) {
                    dataTypeMapping = {};
                    
                    sidebar.get_relationship(element).then( function(rel_data) {
                        if(rel_data['belongs_to'] && !rel_data['has_many'] && !rel_data['has_one']) {
                            rel_data['belongs_to'].forEach(rel_element => {
                                
                                if(rel_element['rel_type'] == 'has_many') {
                                    field = rel_element['pk_field']
                                    data[field] = {data_type: 'string'};
                                }
                            });
                        }

                        new_data = data
                        for (key in new_data) {
                            fields = {}
                            if (data.hasOwnProperty(key)) {
                                const dataType = data[key].data_type
                                analytics_data[element][key] = dataType.charAt(0).toUpperCase() + dataType.slice(1)
                            }
                        }
                        STARK.set_local_storage_item('Analytics_Data', 'analytics', analytics_data)
                    })
                })
                
            });
            
        },

        get_relationship: function(table) {
            table_url = table.replace(' ', '_') + "_url"
            fetchUrl = STARK[table_url] + '?rt=get_relationship'
            return STARK.request('GET', fetchUrl)
        },
    }
})

var modules = STARK.get_local_storage_item('Permissions','modules')
if (modules) {
    sidebar.modules = modules
    spinner.hide();
}
else {
    sidebar.get_module_list();
}

function openNav() {
    // document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("mySidenav").style.minWidth = "20%";
    document.getElementById("mySidenav").style.maxWidth = "40%";
    document.getElementById("vue-root").style.marginLeft = "20%";
    document.getElementById("main-burger-menu").style.display = "none";
}
    
function closeNav() {
    // document.getElementById("mySidenav").style.width = "0";
    document.getElementById("mySidenav").style.minWidth = "0";
    document.getElementById("mySidenav").style.maxWidth = "0";
    document.getElementById("vue-root").style.marginLeft= "0";
    document.getElementById("main-burger-menu").style.display = "inline";
}
