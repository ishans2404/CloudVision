import requests
import json
import os
from dotenv import load_dotenv
load_dotenv()

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json", 
}

conversation = []

while True:
    user_message = input("You: ")  
    if user_message.lower() == "exit":
        print("Goodbye!")
        break  
    
    conversation.append({
        "role": "user",
        "content": user_message
    }) 
    
    response = requests.post(
        url=url,
        headers=headers,
        data=json.dumps({
            "model": "deepseek/deepseek-r1-distill-llama-70b:free",  
            "messages": conversation,  
        })
    )
    
    if response.status_code == 200:
        data = response.json()
        model_reply = data.get("choices", [])[0].get("message", {}).get("content")
        print(f"Model: {model_reply}") 
        
        conversation.append({
            "role": "assistant",
            "content": model_reply
        })
    else:
        print(f"Error: {response.status_code}, {response.text}")