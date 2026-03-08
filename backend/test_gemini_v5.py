import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
log_file = "gemini_test_v5.txt"

with open(log_file, "w", encoding="utf-8") as f:
    f.write(f"API Key: {api_key[:10]}...\n")
    genai.configure(api_key=api_key)
    f.write("Testing models/gemini-flash-latest...\n")
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content("Hello")
        f.write(f"SUCCESS: {response.text}\n")
    except Exception as e:
        f.write(f"FAILED: {type(e).__name__}: {e}\n")

print(f"Test complete. See {log_file}")
