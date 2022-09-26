#STARK Code Generator component.
#Produces the customized static content for a STARK system

#Python Standard Library
import base64
import textwrap
import os
import importlib

#Private modules
prepend_dir = ""
if 'libstark' in os.listdir():
    prepend_dir = "libstark.STARK_CodeGen_Static."

cg_header   = importlib.import_module(f"{prepend_dir}cgstatic_html_generic_header")
cg_footer   = importlib.import_module(f"{prepend_dir}cgstatic_html_generic_footer")
cg_bodyhead = importlib.import_module(f"{prepend_dir}cgstatic_html_generic_bodyhead")
cg_loadmod  = importlib.import_module(f"{prepend_dir}cgstatic_html_generic_loadingmodal")
cg_loadspin = importlib.import_module(f"{prepend_dir}cgstatic_html_generic_loadingspinner")
cg_colreport = importlib.import_module(f"{prepend_dir}cgstatic_controls_report")

import convert_friendly_to_system as converter

def create(data):

    project = data["Project Name"]
    entity  = data["Entity"]
    cols    = data["Columns"]
    pk      = data["PK"]

    #Convert human-friendly names to variable-friendly names
    entity_varname = converter.convert_to_system_name(entity)
    pk_varname = converter.convert_to_system_name(pk)

    source_code  = cg_header.create(data, "Report")
    source_code += cg_bodyhead.create(data, "Report")

    source_code += f"""\
            <!-- <div class="container-unauthorized" v-if="!stark_permissions['{entity}|Report']">UNAUTHORIZED!</div>
            <div class="main-continer" v-if="stark_permissions['{entity}|Report']"> -->
                <div class="container" v-if="!showReport && !showGraph">
                    <div class="row">
                        <div class="col">
                            <div class="my-auto">
                                <form class="border p-3">
                                    <div>
                                        <table class="table table-bordered">
                                                    
                                                <div class="alert alert-danger alert-dismissible fade show" v-if="showError">
                                                    <strong>Error!</strong> Put operator/s on:
                                                    <template v-for="column in no_operator" id="no_operator">
                                                        <tr scope="col"> - {{{{ column }}}}</tr>
                                                    </template>
                                                </div>
                                        </table>
                                    </div>
                                    <table class="table table-dark table-striped report">
                                        <tr>
                                            <th>
                                                <input type="checkbox" class="checkbox-med" name="check_checkbox" v-model="all_selected" onchange="root.toggle_all(!root.all_selected)">
                                            </th>
                                            <th style="padding: 10px; min-width: 250px"> Field Name </th>
                                            <th style="padding: 10px"> Operator </th>
                                            <th style="padding: 10px"> Filter Value </th>    
                                            <th style="padding: 10px"> Sum </th>
                                            <th style="padding: 10px"> Count </th>
                                            <th style="padding: 10px"> Group By</th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="checkbox" class="checkbox-med" name="check_checkbox" value="{pk}" id="{pk_varname}" v-model="checked_fields">
                                            </td>
                                            <td>
                                                    <label for="{pk_varname}">{pk}</label>
                                            </td>
                                            <td>
                                                <b-form-select id="{pk_varname}_operator" :options="lists.Report_Operator" v-model="custom_report.{pk_varname}.operator">
                                                    <template v-slot:first>
                                                        <b-form-select-option :value="null" disabled>-- Please select an option --</b-form-select-option>
                                                    </template>
                                                </b-form-select>
                                            </td>
                                            <td>
                                                <input type="text" class="form-control" id="{pk_varname}_filter_value" placeholder="" v-model="custom_report.{pk_varname}.value">
                                            </td>
                                            <td>
                                                <input type="checkbox" class="checkbox-med" name="check_checkbox" value="{pk_varname}" id="{pk_varname}" v-model="custom_report.STARK_sum_fields">
                                            </td>
                                            <td>
                                                <input type="checkbox" class="checkbox-med" name="check_checkbox" value="{pk_varname}" id="{pk_varname}" v-model="custom_report.STARK_count_fields">
                                            </td>
                                            <td>
                                                <input type="radio" class="checkbox-med" name="check_checkbox" value="{pk_varname}" id="{pk_varname}" v-model="custom_report.STARK_group_by_1">
                                            </td>
                                        </tr>"""
    


    for col, col_type in cols.items():
        col_varname = converter.convert_to_system_name(col)
        html_control_code = cg_colreport.create({
            "col": col,
            "col_type": col_type,
            "col_varname": col_varname,
            "entity" : entity,
            "entity_varname": entity_varname
        })
        source_code += f"""
                                        <tr>
                                            <td>
                                                <input type="checkbox" class="checkbox-med" name="check_checkbox" value="{col}" id="{col_varname}" v-model="checked_fields">
                                            </td>
                                            <td>
                                                    <label for="{col_varname}">{col}</label>
                                            </td>
                                            <td>
                                                <b-form-select id="{col_varname}_operator" :options="lists.Report_Operator" v-model="custom_report.{col_varname}.operator">
                                                    <template v-slot:first>
                                                        <b-form-select-option :value="null" disabled>-- Please select an option --</b-form-select-option>
                                                    </template>
                                                </b-form-select>
                                            </td>
                                            <td>
                                                <div class="report">
                                                    {html_control_code}
                                                </div>
                                            </td>
                                            <td>
                                                <input type="checkbox" class="checkbox-med" name="check_checkbox" value="{col_varname}" id="{col_varname}" v-model="custom_report.STARK_sum_fields">
                                            </td>
                                            <td>
                                                <input type="checkbox" class="checkbox-med" name="check_checkbox" value="{col_varname}" id="{col_varname}" v-model="custom_report.STARK_count_fields">
                                            </td>
                                            <td>
                                                <input type="radio" class="checkbox-med" name="check_checkbox" value="{col_varname}" id="{col_varname}" v-model="custom_report.STARK_group_by_1">
                                            </td>
                                        </tr>
                                    """

    source_code += f"""
                                    </table>    
                                    <table class="table table-dark table-striped report">
                                        <tr>
                                            <hr>
                                            <td></td>
                                            <td>Report Type</td>
                                            <td>
                                                <b-form-group class="form-group" label="" label-for="Report_Type" :state="metadata.STARK_Report_Type.state" :invalid-feedback="metadata.STARK_Report_Type.feedback" >
                                                    <b-form-select id="Report_Type" v-model="custom_report.STARK_Report_Type" :options="lists.STARK_Report_Type" :state="metadata.STARK_Report_Type.state" @change="root.showChartWizard()">
                                                    <template v-slot:first>
                                                        <b-form-select-option :value="null" disabled>-- Please select an option --</b-form-select-option>
                                                    </template>
                                                </b-form-select>
                                                </b-form-group>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </table>
                                    <table v-if="showChartFields" class="table table-dark table-striped report">
                                        <tr>
                                            <hr v-if="showChartFields"> <h5 v-if="showChartFields">Chart Wizard</h5> <hr v-if="showChartFields">
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td>Chart Type</td>
                                            <td>
                                            <b-form-group class="form-group" label="" label-for="Chart_Type" :state="metadata.STARK_Chart_Type.state" :invalid-feedback="metadata.STARK_Chart_Type.feedback" >
                                                <b-form-select id="Chart_Type" v-model="custom_report.STARK_Chart_Type" :options="lists.STARK_Chart_Type" :state="metadata.STARK_Chart_Type.state" @change="root.showFields()">
                                                <template v-slot:first>
                                                    <b-form-select-option :value="null" disabled>-- Please select an option --</b-form-select-option>
                                                </template>
                                            </b-form-select>
                                            </b-form-group>
                                            </td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td>Data Source</td>
                                            <td>
                                                <b-form-group class="form-group" label-for="Data_Source" :state="metadata.STARK_Data_Source.state" :invalid-feedback="metadata.STARK_Data_Source.feedback">
                                                    <b-form-select id="Data_Source" v-model="custom_report.STARK_Data_Source" :options="lists.STARK_Data_Source" :state="metadata.STARK_Data_Source.state">
                                                    <template v-slot:first>
                                                        <b-form-select-option :value="null" disabled>-- Please select an option --</b-form-select-option>
                                                    </template>
                                                </b-form-select>
                                                </b-form-group>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </table>
                                    <button type="button" class="btn btn-secondary" onClick="window.location.href='{entity_varname}.html'">Back</button>
                                    <button type="button" class="btn btn-primary float-right" onClick="root.generate()">Generate</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>"""

    source_code += f"""
                <div v-if="!showReport && showGraph">
                    <div class="row">
                        <div class="col-6 text-left d-inline-block">
                            <button id="prev" type="button" class="btn btn-secondary mb-2" onClick="root.showGraph = false, root.showError = false"> Back </button>
                            <button type="button" id="exportByHTML" class="btn btn-danger mb-2" :disabled="listview_table.length < 1"> Export as PDF</button>
                            <button id="refresh" type="button" class="btn btn-primary mb-2" onClick="root.generate()" :disabled="listview_table.length < 1"> Refresh </button>
                        </div>
                        <div class="col-6">
                        </div>
                    </div>
                    <div id="chart-container"></div>
                </div>
                <div v-if="showReport && !showGraph">
                    <div class="row">
                        <div class="col-6 text-left d-inline-block">
                            <button id="prev" type="button" class="btn btn-secondary mb-2" onClick="root.showReport = false, root.showError = false"> Back </button>
                            <button type="button" class="btn btn-success mb-2" onClick="root.download_report('csv')" :disabled="listview_table.length < 1"> Export as CSV</button>
                            <button type="button" class="btn btn-danger mb-2" onClick="root.download_report('pdf')" :disabled="listview_table.length < 1"> Export as PDF</button>
                            <button id="refresh" type="button" class="btn btn-primary mb-2" onClick="root.generate()" :disabled="listview_table.length < 1"> Refresh </button>
                        </div>
                        <div class="col-6">
                        </div>
                    </div>

                    <div class="row">
                        <div class="col overflow-auto">
                            <table class="table  table-hover table-striped table-dark">
                                <thead class="thead-dark">
                                    <tr>
                                        <th scope="col" width = "20px"> Operations </th>
                                        <template v-for="column in STARK_report_fields" id="STARK_report_fields">
                                            <th scope="col">{{{{column}}}}</th>
                                        </template>"""
    source_code += f"""         
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-for="{entity_varname} in listview_table" id="listview-table">
                                        <tr>
                                            <td>
                                                <a :href="'{entity_varname}_edit.html?{pk_varname}=' + {entity_varname}['{pk}']" target="_blank" v-if="auth_list.Edit.allowed"><img src="images/pencil-square.svg" class="bg-info"></a>
                                                <a :href="'{entity_varname}_delete.html?{pk_varname}=' + {entity_varname}['{pk}']" target="_blank" v-if="auth_list.Delete.allowed"><img src="images/x-square.svg" class="bg-danger"></a>
                                            </td>
                                            <template v-for="column in STARK_report_fields">
                                                <td>{{{{ {entity_varname}[column] }}}}</td>
                                            </template>"""
    source_code += f"""             
                                    </tr>
                                </template>
                                <template v-if="listview_table.length < 1">
                                    No records found
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    """
    source_code += cg_loadmod.create()
    source_code += cg_footer.create()

    return textwrap.dedent(source_code)
