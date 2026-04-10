from AppOpener import open as open_app, close as close_app, give_appnames

def list_apps():
    print("Available applications found by AppOpener:")
    apps = give_appnames()
    for name in sorted(apps.keys()):
        print(f"- {name}")

def open_specific_app(app_name):
    print(f"Attempting to open: {app_name}")
    try:
        open_app(app_name, throw_error=True)
        print(f"Successfully sent command to open {app_name}")
    except Exception as e:
        print(f"Error opening {app_name}: {e}")

if __name__ == "__main__":
    # Example: List apps
    # list_apps()
    
    # Example: Open Notepad
    open_specific_app("notepad")
    
    # You can also open multiple apps:
    # open_app("notepad, calculator")
