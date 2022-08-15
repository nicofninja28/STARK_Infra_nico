#STARK Code Generator component.
#Produces HTML code for different controls in reporting, depending on column type

#Python Standard Library
import base64
import textwrap

#Private modules
import convert_friendly_to_system as converter
import cgstatic_controls_coltype as cg_coltype

def create(data):

    col             = data['col']
    col_type        = data['col_type']
    col_varname     = data['col_varname']
    entity          = data['entity']
    entity_varname  = data['entity_varname']
    html_code       = ""
    default_control = False

    if isinstance(col_type, dict):
        col_values = col_type.get("values", "")
        if isinstance(col_values, list):
            html_code= cg_coltype.create({
                "col": col,
                "col_type": "multi-select-combo",
                "col_varname": col_varname,
                "entity" : entity,
                "entity_varname": entity_varname
            })
        else:
            default_control = True
    else:
        default_control = True

    if default_control:
        html_code = f"""<input type="text" class="form-control" id="{col_varname}_filter_value" placeholder="" v-model="custom_report.{col_varname}.value">"""

    
    return html_code