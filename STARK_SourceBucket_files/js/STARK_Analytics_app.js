var Analytics_app = {
    api_endpoint: STARK.Analytics_url,

    // get: function (data) {
    //     fetchUrl = this.api_endpoint + '?rt=detail&Query=' + data['Query'] 
    //     return STARK.request('GET', fetchUrl)
    // },

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

    get_result: function (query, metadata) {
        // console.log(metadata)
        fetchUrl = this.api_endpoint + '?rt=detail&Query=' + query + '&Metadata=' + metadata
        return STARK.request('GET', fetchUrl)
    },
}