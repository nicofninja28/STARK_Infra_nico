var Analytics_app = {
    api_endpoint: STARK.Analytics_url,

    // get: function (data) {
    //     fetchUrl = this.api_endpoint + '?rt=detail&Query=' + data['Query'] 
    //     return STARK.request('GET', fetchUrl)
    // },

    test_dump: function () {
        fetchUrl = this.api_endpoint + '?rt=' 
        return STARK.request('GET', fetchUrl)
    },

    add: function (payload) {
        console.log(payload)
        fetchUrl = this.api_endpoint
        return STARK.request('POST', fetchUrl, payload)
    },

    get_saved_reports: function () {
        fetchUrl = this.api_endpoint + '?rt=get_saved_reports'
        return STARK.request('GET', fetchUrl)
    },  

    get_saved_report_settings: function (report_name) {
        fetchUrl = this.api_endpoint + '?rt=get_saved_report_settings&report_name=' + report_name
        return STARK.request('GET', fetchUrl)
    },

    get: function (payload) {
        console.log(payload)
        fetchUrl = this.api_endpoint
        return STARK.request('POST', fetchUrl, payload)
    },

    get_tables: function () {
            fetchUrl = this.api_endpoint + '?rt=get_tables' 
            return STARK.request('GET', fetchUrl)
    },

    get_table_fields: function (tables=[]) {
        fetchUrl = this.api_endpoint + '?rt=get_table_fields&tables=' + tables
        return STARK.request('GET', fetchUrl)
    },

    get_table_fields_int: function (tables=[]) {
        fetchUrl = this.api_endpoint + '?rt=get_table_fields_int&tables=' + tables
        return STARK.request('GET', fetchUrl)
    },

    get_result: function (is_custom_report, report_data, metadata) {
        // console.log(metadata)
        fetchUrl = this.api_endpoint + '?rt=detail&is_custom_report=' + is_custom_report + '&Query=' + report_data + '&Metadata=' + metadata
        return STARK.request('GET', fetchUrl)
    },

    get_report_modules: function() {
        fetchUrl = this.api_endpoint + '?rt=get_report_modules'
        return STARK.request('GET', fetchUrl)
    }
}