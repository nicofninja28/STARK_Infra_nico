#STARK Code Generator component.
#Produces the customized static content for a STARK system

#Python Standard Library
import base64
import textwrap

def create():

    source_code = f"""\
        <div id="mySidenav" class="sidenav">
            <a href="javascript:void(0)" class="sidenav-close-btn" onclick="closeNav()">&times;</a>
            <template v-for="(group, index) in modules" id="nav-groups-template">
                <h4>
                    <a v-b-toggle class="text-decoration-none" :href="'#nav-group-collapse-'+index" @click.prevent>
                        <span class="align-bottom">{{{{ group.group_name }}}}</span>
                    </a>
                </h4>
                <b-collapse :id="'nav-group-collapse-'+index" visible class="mt-0 mb-2 pl-2">
                    <div class="menu-group-container">
                        <template v-for="module in group.modules" id="nav-modules-template">
                            <div class="sidenav-menu-item" :onclick="'window.location.href=\\''  + module.href + '\\''">
                                <a href="#"><img class="filter-fill-svg menu-item-icon" :src="module.image" alt="menu item icon"> {{{{module.title}}}} </a>
                            </div>
                        </template>
                    </div>
                </b-collapse>
            </template>
        </div>"""

    return source_code
