import base64
import os
from google.cloud import aiplatform
from flask import jsonify
import functions_framework

# Constants
PROJECT_ID = os.environ.get("PROJECT_ID")
REGION = "us-central1"
ENDPOINT_ID = os.environ.get("ENDPOINT_ID")

@functions_framework.http
def create_image(request):
    """HTTP Cloud Function for Stable Diffusion text-to-image generation with CORS support."""
    
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
            'Access-Control-Max-Age': '3600',
        }
        return '', 204, headers

    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    }

    try:
        # Parse the request JSON
        request_json = request.get_json(silent=True)
        if not request_json:
            return jsonify({"error": "Invalid request: No JSON body found"}), 400, headers

        # Extract parameters
        instances = request_json.get("instances")
        if not instances or len(instances) == 0:
            return jsonify({"error": "Missing required parameter: instances"}), 400, headers

        # The prompt should be inside the "instances" array, get it from the first instance
        prompt = instances[0].get("prompt")
        if not prompt:
            return jsonify({"error": "Missing required parameter: prompt"}), 400, headers

        num_inference_steps = instances[0].get("num_inference_steps", 4)
        size = instances[0].get("size", "512x512")
        width, height = map(int, size.split('x'))

        # Initialize the AI Platform endpoint
        aiplatform.init(project=PROJECT_ID, location=REGION)
        endpoint = aiplatform.Endpoint(endpoint_name=ENDPOINT_ID)

        # Send the prediction request
        instances_data = [{"text": prompt}]
        parameters = {
            "height": height,
            "width": width,
            "num_inference_steps": num_inference_steps,
            "guidance_scale": 7.5
        }
        response = endpoint.predict(instances=instances_data, parameters=parameters, use_raw_predict=True)

        if not response or not response.predictions:
            return jsonify({"error": "Model did not return predictions"}), 500, headers

        # Decode the base64-encoded image
        generated_image_base64 = response.predictions[0]["output"]

        # Return the base64-encoded image with CORS headers
        return jsonify({"image_base64": generated_image_base64, "prompt": prompt}), 200, headers

    except Exception as e:
        return jsonify({"error": f"Error processing request: {str(e)}"}),500, headers