"""
LLM Service for Mood Booster Chatbot
Hosts a pre-trained model from HuggingFace
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for model and tokenizer
model = None
tokenizer = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Model configuration
# Using a smaller, faster model for mood boosting conversations
# You can change this to any model from HuggingFace
MODEL_NAME = "gpt2"  # Start with GPT-2 small (smaller file size)
# Alternative options:
# MODEL_NAME = "distilgpt2"  # Even smaller
# MODEL_NAME = "microsoft/DialoGPT-small"  # Dialogue-focused
# MODEL_NAME = "facebook/blenderbot_small-90M"  # Conversational

# Model path - where the model will be stored on your web hosting
MODEL_PATH = os.environ.get('MODEL_PATH', './models')


class LLMService:
    """Service class for handling LLM operations"""
    
    def __init__(self, model_name, model_path):
        self.model_name = model_name
        self.model_path = model_path
        self.model = None
        self.tokenizer = None
        
    def load_model(self):
        """Load the model and tokenizer from HuggingFace"""
        try:
            logger.info(f"Loading model: {self.model_name}")
            
            # Create model directory if it doesn't exist
            os.makedirs(self.model_path, exist_ok=True)
            model_full_path = os.path.join(self.model_path, self.model_name.replace('/', '_'))
            
            # Load tokenizer
            logger.info("Loading tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                cache_dir=model_full_path
            )
            
            # Set pad token if not set
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Load model
            logger.info("Loading model...")
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                cache_dir=model_full_path,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
            )
            
            # Move model to device
            self.model.to(device)
            self.model.eval()
            
            logger.info(f"Model loaded successfully on {device}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False
    
    def generate_response(self, user_message, max_length=100, temperature=0.7):
        """
        Generate a response to the user's message
        
        Args:
            user_message: The user's input message
            max_length: Maximum length of the generated response
            temperature: Sampling temperature (higher = more creative)
        
        Returns:
            Generated response string
        """
        try:
            # Create a mood-boosting prompt
            prompt = f"User: {user_message}\nAI:"
            
            # Tokenize input
            inputs = self.tokenizer.encode(prompt, return_tensors='pt').to(device)
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_length=inputs.shape[1] + max_length,
                    temperature=temperature,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    top_p=0.9,
                    top_k=50,
                    repetition_penalty=1.2
                )
            
            # Decode response
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract just the AI's response
            if "AI:" in generated_text:
                response = generated_text.split("AI:")[-1].strip()
            else:
                response = generated_text.split(prompt)[-1].strip() if prompt in generated_text else generated_text
            
            # Post-process to make it more mood-boosting
            response = self.post_process_response(response, user_message)
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return "I'm here to boost your mood! Tell me what's on your mind and I'll try to help! 😊"
    
    def post_process_response(self, response, user_message):
        """Post-process the response to make it more mood-boosting"""
        # Remove any incomplete sentences
        sentences = response.split('.')
        if len(sentences) > 1:
            response = '. '.join(sentences[:2]).strip()
            if not response.endswith(('.', '!', '?')):
                response += '.'
        
        # Add emoji for mood boosting
        mood_boosters = ['😊', '🌟', '💪', '✨', '🎉', '🌈']
        import random
        if random.random() > 0.5:
            response = f"{response} {random.choice(mood_boosters)}"
        
        # Ensure response is not too short
        if len(response) < 10:
            response = f"That's interesting! {response}"
        
        # Ensure response is not empty
        if not response or len(response.strip()) == 0:
            response = "I'm here to listen and help boost your mood! 😊"
        
        return response


# Initialize LLM service
llm_service = LLMService(MODEL_NAME, MODEL_PATH)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': llm_service.model is not None,
        'model_name': MODEL_NAME,
        'device': str(device)
    })


@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint - receives user message and returns AI response"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400
        
        user_message = data['message']
        
        if not isinstance(user_message, str) or len(user_message.strip()) == 0:
            return jsonify({
                'success': False,
                'error': 'Message cannot be empty'
            }), 400
        
        # Check if model is loaded
        if llm_service.model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        # Generate response
        response = llm_service.generate_response(user_message)
        
        return jsonify({
            'success': True,
            'response': response
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    return jsonify({
        'model_name': MODEL_NAME,
        'model_path': MODEL_PATH,
        'model_loaded': llm_service.model is not None,
        'device': str(device),
        'model_location': os.path.join(MODEL_PATH, MODEL_NAME.replace('/', '_')) if llm_service.model else None
    })


if __name__ == '__main__':
    # Load model on startup
    logger.info("Starting LLM Service...")
    logger.info(f"Model to load: {MODEL_NAME}")
    logger.info(f"Model will be cached in: {MODEL_PATH}")
    logger.info(f"Device: {device}")
    
    # Load model
    success = llm_service.load_model()
    
    if success:
        logger.info("Model loaded successfully!")
    else:
        logger.error("Failed to load model. Service will still start but chat endpoints will fail.")
    
    # Start Flask server
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting server on port {port}")
    
    app.run(host='0.0.0.0', port=port, debug=False)
