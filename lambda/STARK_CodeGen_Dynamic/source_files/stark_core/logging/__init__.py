name = "STARK Logging"

def whoami():
    return name

def event(event):
    #log the event payload of function
    print("**EVENT LOG START**")
    print(event)
    print("**EVENT LOG END**")
    pass

def msg(msg, ):
    #log a custom message
    print(msg)
    pass