from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import base64
from PIL import Image
import io
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def get_gemini_model():
    return genai.GenerativeModel('gemini-2.0-flash-exp')

def extract_text_from_image(image_data):
    """Extract text from image using Gemini Vision API"""
    try:
        model = get_gemini_model()
        
        # Convert image data to PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        prompt = """
        Please extract all text from this medical lab report image. 
        Return the text in a structured format that includes:
        1. Patient information
        2. Test results with values and reference ranges
        3. Any abnormal findings
        4. Doctor's notes if present
        
        Format the response as JSON with the following structure:
        {
            "patientInfo": {
                "name": "",
                "age": "",
                "gender": "",
                "date": ""
            },
            "testResults": [
                {
                    "testName": "",
                    "value": "",
                    "unit": "",
                    "referenceRange": "",
                    "status": "normal/abnormal"
                }
            ],
            "abnormalFindings": [],
            "notes": ""
        }
        """
        
        response = model.generate_content([prompt, image])
        # Clean JSON output - strip markdown formatting
        text = response.text
        if text.startswith('```json'):
            text = text.replace('```json', '').replace('```', '').strip()
        return text
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        return None

def analyze_lab_results(extracted_text):
    """Analyze extracted lab results and provide insights"""
    try:
        model = get_gemini_model()
        
        prompt = f"""
        Analyze the following lab report data and provide health insights:
        
        {extracted_text}
        
        Please provide:
        1. Summary of overall health status
        2. Key findings and their implications
        3. Recommendations for follow-up
        4. Any concerning values that need immediate attention
        
        Format as JSON:
        {{
            "summary": "",
            "keyFindings": [],
            "recommendations": [],
            "concerningValues": []
        }}
        """
        
        response = model.generate_content(prompt)
        # Clean JSON output - strip markdown formatting
        text = response.text
        if text.startswith('```json'):
            text = text.replace('```json', '').replace('```', '').strip()
        return text
    except Exception as e:
        print(f"Error analyzing results: {str(e)}")
        return None

@app.route('/api/analyze', methods=['POST'])
def analyze_report():
    """Analyze lab report from uploaded image"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read image data
        image_data = file.read()
        
        # Extract text using Gemini Vision
        extracted_text = extract_text_from_image(image_data)
        if not extracted_text:
            return jsonify({'error': 'Failed to extract text from image'}), 500
        
        # Analyze the extracted text
        analysis = analyze_lab_results(extracted_text)
        if not analysis:
            return jsonify({'error': 'Failed to analyze lab results'}), 500
        
        # Combine results
        try:
            extracted_data = json.loads(extracted_text)
            analysis_data = json.loads(analysis)
            
            result = {
                **extracted_data,
                'analysis': analysis_data
            }
            
            return jsonify(result)
        except json.JSONDecodeError:
            # If JSON parsing fails, return raw text
            return jsonify({
                'extractedText': extracted_text,
                'analysis': analysis
            })
            
    except Exception as e:
        print(f"Error in analyze_report: {str(e)}")
        return jsonify({'error': f'Analysis failed: {str(e)}', 'details': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat_with_bot():
    """Chat with health assistant bot"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('history', [])
        context = data.get('context', {})
        
        model = get_gemini_model()
        
        # Build context-aware prompt
        context_prompt = ""
        if context:
            context_prompt = f"""
            Context: The user has uploaded a lab report with the following information:
            - Test Results: {context.get('testResults', 'Not available')}
            - Summary: {context.get('summary', 'Not available')}
            """
        
        # Format conversation history
        conversation = ""
        for msg in history[-5:]:  # Keep last 5 messages for context
            role = msg.get('role', 'user')
            text = msg.get('parts', [{}])[0].get('text', '')
            conversation += f"{role}: {text}\n"
        
        prompt = f"""
        You are a helpful health assistant. You have access to the user's lab report context.
        
        {context_prompt}
        
        Recent conversation:
        {conversation}
        
        User's current message: {message}
        
        Please provide a helpful, informative response about their health questions.
        If discussing lab results, be informative but always recommend consulting with a healthcare provider
        for medical advice. Do not provide definitive medical diagnoses.
        """
        
        response = model.generate_content(prompt)
        # Clean response - strip any markdown formatting
        text = response.text
        if text.startswith('```'):
            text = text.replace('```', '').strip()
        return jsonify({'text': text})
        
    except Exception as e:
        print(f"Error in chat_with_bot: {str(e)}")
        return jsonify({'error': 'Chat service unavailable', 'details': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'HealthWise OCR Backend'})

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'message': 'HealthWise OCR Backend API',
        'version': '1.0.0',
        'endpoints': {
            'analyze': '/api/analyze (POST)',
            'chat': '/api/chat (POST)',
            'health': '/api/health (GET)'
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
