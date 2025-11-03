# LLM Service for Mood Booster Chatbot

This is the Python Flask service that hosts the pre-trained model from HuggingFace for the Mood Booster Chatbot.

## Model Information

**Model Used:** GPT-2 (small)
**Source:** HuggingFace (https://huggingface.co/gpt2)
**Model Path:** The model will be downloaded and cached in `./models/gpt2/` directory

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Service

1. Start the service:
```bash
python app.py
```

The service will:
- Download the model from HuggingFace on first run (this may take several minutes and requires several GB of disk space)
- Cache the model in `./models/gpt2/` directory
- Start listening on port 5000 (or PORT environment variable)

## Environment Variables

- `PORT`: Port to run the service on (default: 5000)
- `MODEL_PATH`: Path to store/cache the model files (default: `./models`)

## API Endpoints

- `GET /api/health`: Health check endpoint
- `POST /api/chat`: Send a message and get a response
  - Request body: `{ "message": "your message here" }`
  - Response: `{ "success": true, "response": "AI response here" }`
- `GET /api/model/info`: Get information about the loaded model

## Hosting on Web Service

When hosting on your web hosting service:

1. Upload the entire `llm-service` directory to your web hosting
2. Install Python dependencies on the server
3. Set environment variables for PORT and MODEL_PATH
4. The model will be downloaded and cached in the MODEL_PATH directory
5. For the bonus points, you need to show that the model files are physically present on your web hosting service

## Model Location on Web Hosting

After the first run, the model files will be located at:
- `MODEL_PATH/MODEL_NAME/` (e.g., `./models/gpt2/`)

You can verify the model location using the `/api/model/info` endpoint, which will return the full path where the model is stored.

## Notes

- The model download happens automatically on first run
- Model files are large (several GB), so ensure sufficient disk space
- The service uses CPU by default, but will use GPU if available (CUDA)
- You can change the model by modifying `MODEL_NAME` in `app.py`
