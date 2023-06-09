#STARK Code Generator component.
#Produces the customized static content for a STARK system

#Python Standard Library
import os
import base64
import textwrap
import importlib

#Private modules
import convert_friendly_to_system as converter

#Private modules
prepend_dir = ""
if 'libstark' in os.listdir():
    prepend_dir = "libstark.STARK_CodeGen_Static."

cg_navbar  = importlib.import_module(f"{prepend_dir}cgstatic_html_generic_navbar")


def create(data, breadcrumb):

    project = data["Project Name"]
    navbar  = cg_navbar.create()

    if breadcrumb != "_HomePage":
        entity  = data["Entity"]
        #Convert human-friendly names to variable-friendly names
        entity_varname = converter.convert_to_system_name(entity)

    source_code = f"""\
        <body>
"""
    source_code += navbar

    #Purposely makes a new line after navbar to make navbar code also reusable for semi-static code generation
    source_code += f"""
        <div class="container-fluid" id="vue-root">
            <div class="row bg-primary mb-3 p-3 text-white" style="background-image: url('images/banner_generic_blue.png')">
                <div class="col-12 col-md-10">
                <h2>
                    <span id="main-burger-menu" style="cursor:pointer;" onclick="openNav()">&#9776;</span>
                    {project}
                </h2>
                </div>
                <div class="col-12 col-md-2 text-right">
                    <b-button 
                        v-b-tooltip.hover title="Settings"
                        class="mt-3" 
                        variant="light" 
                        size="sm">
                        <img src="images/settings.png" height="20px">
                    </b-button>
                    <b-button 
                        v-b-tooltip.hover title="Log out"
                        class="mt-3" 
                        variant="light" 
                        size="sm"
                        onClick="STARK.logout()">
                        <img src="images/logout.png" height="20px">
                    </b-button>
                </div>
            </div>
"""
    if breadcrumb == "_Listview":
        source_code += f"""\
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="home.html">Home</a></li>
                    <li class="breadcrumb-item active" aria-current="page">{entity}</li>
                </ol>
            </nav>
"""
    elif breadcrumb == "_HomePage":
        source_code += f"""\
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item active" aria-current="page">Home</li>
                </ol>
            </nav>
"""
    else:
        source_code += f"""\
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="home.html">Home</a></li>
                    <li class="breadcrumb-item"><a href="{entity_varname}.html">{entity}</a></li>
                    <li class="breadcrumb-item active" aria-current="page">{breadcrumb}</li>
                </ol>
            </nav>
"""

    return source_code
