#Python Standard Library
import base64
import json

def parse(data):

    data_model      = data['data_model']

    #ANALYTICS-SETTINGS-START
    enabled   = False
    cron      = ""
    activated = False

    for key in data_model:
        if key == "__STARK_advanced__":
            for advance_config in data_model[key]:
                if advance_config == 'Analytics':
                    enabled                    = data_model[key][advance_config].get('enabled', enabled)
                    cron                       = data_model[key][advance_config].get('cron', cron)
                    activated                  = data_model[key][advance_config].get('activated', True if enabled else False)
    #ANALYTICS-SETTINGS-END

    parsed = {
        "enabled": enabled,
        "cron": cron,
        "activated": activated
    }


    return parsed