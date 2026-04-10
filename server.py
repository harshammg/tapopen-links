from flask import Flask, request, jsonify
from flask_cors import CORS
from AppOpener import open as open_app, close as close_app, give_appnames
import threading

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Cache app names to speed up requests
cached_apps = sorted(list(give_appnames().keys()))

@app.route('/apps', methods=['GET'])
def list_apps():
    """Returns a list of all available applications."""
    try:
        apps = sorted(list(give_appnames().keys()))
        return jsonify({"status": "success", "apps": apps})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/open', methods=['POST'])
def open_application():
    """Opens a specific application."""
    data = request.json
    app_name = data.get('app_name')
    
    if not app_name:
        return jsonify({"status": "error", "message": "No app_name provided"}), 400
    
    try:
        # Run in a separate thread to avoid blocking the API response
        # although AppOpener is usually fast.
        threading.Thread(target=open_app, args=(app_name,), kwargs={"throw_error": True}).start()
        return jsonify({"status": "success", "message": f"Opening {app_name}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/close', methods=['POST'])
def close_application():
    """Closes a specific application."""
    data = request.json
    app_name = data.get('app_name')
    
    if not app_name:
        return jsonify({"status": "error", "message": "No app_name provided"}), 400
    
    try:
        threading.Thread(target=close_app, args=(app_name,), kwargs={"match_closest": True, "throw_error": True}).start()
        return jsonify({"status": "success", "message": f"Closing {app_name}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("TAPOPEN Local Backend Running...")
    print("URL: http://127.0.0.1:5000")
    app.run(port=5000, debug=True)
