import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key: {api_key[:10]}...")

genai.configure(api_key=api_key)

print("Starting Gemini Test...")
try:
    # prompt exact de l'app
    prompt = "Analyse mes notes : Math: 15/20. Donne un conseil court et motivant."
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"FAILED: {type(e).__name__}: {e}")
