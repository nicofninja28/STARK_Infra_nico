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

cg_rel  = importlib.import_module(f"{prepend_dir}cgstatic_relationships")
import convert_friendly_to_system as converter

def create(data, special="none"):

    project = data["Project Name"]
    
    with_upload = False

    if special != "HomePage":
        entity  = data["Entity"]
        cols    = data["Columns"]
        #Convert human-friendly names to variable-friendly names
        entity_varname = converter.convert_to_system_name(entity)

    source_code = f"""\
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <meta http-equiv="content-type" content="text/html; charset=UTF-8" />

            <link rel="stylesheet" href="css/bootstrap.min.css" />
            <link rel="stylesheet" href="css/bootstrap-vue.css" />
            <link rel="stylesheet" href="css/STARK.css" />

            <script src="js/vue.js" defer></script>
            <script src="js/bootstrap-vue.min.js" defer></script>
            <script src="js/STARK.js" defer></script>
            <script src="js/STARK_spinner.js" defer></script>
            <script src="js/STARK_loading_modal.js" defer></script>
            <script src="js/STARK_nav_bar.js" defer></script>
            """

    if special == "HomePage":
        source_code += f"""\
            <script src="js/STARK_home.js" defer></script>
            """

    else:
        source_code += f"""
            <script src="js/{entity_varname}_app.js" defer></script>
            <script src="js/{entity_varname}_view.js" defer></script>
            """

        #Figure out which other _app.js files we need to add based on relationships
        for col, col_type in cols.items():
            entities = cg_rel.get({
                "col": col,
                "col_type": col_type,
            })
        
            for related in entities:
                related_varname = converter.convert_to_system_name(related)
                source_code += f"""
            <script src="js/{related_varname}_app.js" defer></script>"""

            if isinstance(col_type, dict):
                if col_type["type"] == 'file-upload': 
                    with_upload = True 

    if special in ['New', 'Edit'] and with_upload:
        source_code += f"""
            <script src="https://sdk.amazonaws.com/js/aws-sdk-2.1.24.min.js"></script>"""

    if(special in ['none']):
        source_code += f"""
            <script src="js/generic_root_get.js" defer></script>"""
    elif(special == "New"):
        source_code += f"""
            <script src="js/generic_check_auth_add.js" defer></script>
            <script src="js/generic_root_get.js" defer></script>"""
    elif(special == "Edit"):
        source_code += f"""
            <script src="js/generic_root_get.js" defer></script>
            <script src="js/generic_check_auth_edit.js" defer></script>"""
    elif(special == "Delete"):
        source_code += f"""
            <script src="js/generic_root_get.js" defer></script>
            <script src="js/generic_check_auth_delete.js" defer></script>"""
    elif(special == "View"):
        source_code += f"""
            <script src="js/generic_root_get.js" defer></script>
            <script src="js/generic_check_auth_view.js" defer></script>"""
    elif(special == "Report"):
        source_code += f"""
            <script src="js/generic_check_auth_report.js" defer></script>"""
    elif(special == "Listview"):
        source_code += f"""
            <script src="js/generic_root_list.js" defer></script>
            <script src="js/generic_check_auth_listview.js" defer></script>"""

    if special != "HomePage":
        source_code += f"""

            <title>{project} - {entity}</title>
        </head>
"""
    else:
        source_code += f"""

            <title>{project}</title>
        </head>
"""

    return source_code
