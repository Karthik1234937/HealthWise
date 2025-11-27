from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
import re
from PIL import Image  # Pillow for image processing (future use)

app = Flask(__name__)
CORS(app)

# Use the API Key from Environment Variable (Set this in Render)
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def clean_json_response(text):
    """Removes markdown formatting and extracts JSON from response."""
    cleaned = re.sub(r"```json\s*", "", text)
    cleaned = re.sub(r"\s*```", "", cleaned)
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        return match.group(0).strip()
    return cleaned.strip()

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
            
        file = request.files['file']
        image_data = file.read()
        
        # Use the latest vision model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """
        Analyze this medical lab report. Extract the patient name, test results, units, and reference ranges.
        Identify any abnormal values.
        Provide a clinical summary and dietary recommendations.
        
        Return ONLY valid JSON matching this structure:
        {
          "patientName": "Name or Unknown",
          "labName": "Lab Name or Unknown",
          "reportDate": "Date or Unknown",
          "results": [
            {"testName": "Test Name", "value": "Value", "unit": "Unit", "referenceRange": "Range", "status": "Normal/High/Low/Critical", "category": "Category"}
          ],
          "summary": "Clinical summary...",
          "abnormalities": ["List of abnormal findings"],
          "clinicalInterpretation": {
            "keyFindings": [],
            "clinicalImplications": [],
            "recommendedActions": []
          },
          "dietaryRecommendations": [
            {"topic": "Topic", "priority": "High/Medium", "action": "Action", "items": ["Item 1", "Item 2"]}
          ]
        }
        """
        
        response = model.generate_content([
            {"mime_type": "image/png", "data": image_data},
            prompt
        ])
        
        json_str = clean_json_response(response.text)
        try:
            return jsonify(json.loads(json_str))
        except Exception as json_err:
            print(f"JSON parse error: {json_err}\nRaw response: {response.text}")
            return jsonify({"error": "Failed to parse AI response as JSON"}), 500

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        model = genai.GenerativeModel('gemini-1.5-flash')
        chat = model.start_chat(history=data.get('history', []))
        response = chat.send_message(data.get('message'))
        return jsonify({"text": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)