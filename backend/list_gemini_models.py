import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
log_file = "gemini_models_list.txt"

with open(log_file, "w", encoding="utf-8") as f:
    f.write(f"API Key: {api_key[:10]}...\n")
    genai.configure(api_key=api_key)
    f.write("Listing available models...\n")
    try:
        found = False
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"Model: {m.name}\n")
                found = True
        if not found:
            f.write("No models found with generateContent support.\n")
    except Exception as e:
        f.write(f"FAILED to list models: {type(e).__name__}: {e}\n")

print(f"List complete. See {log_file}")
