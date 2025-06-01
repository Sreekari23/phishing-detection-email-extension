import requests

def generate_threatphrases(prompt: str) -> list:
    """
    Sends a prompt to the Mistral model running on Ollama and extracts threat phrases from the response.

    Args:
        prompt (str): Input text to analyze.

    Returns:
        list: A list of threat phrases (strings).
    """
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "mistral",
        "prompt": f"Extract all possible threat-related phrases or suspicious words from this message:\n\n\"{prompt}\"\n\nRespond ONLY with a Python list of strings.",
        "stream": False
    }

    response = requests.post(url, json=payload)
    response.raise_for_status()

    # Expecting a Python list of strings in response (as text)
    result_text = response.json()["response"]

    try:
        # Evaluate only if it’s a literal list (safe since you control prompt)
        threat_phrases = eval(result_text.strip())
        if isinstance(threat_phrases, list):
            return threat_phrases
        return ["Invalid format returned from model."]
    except Exception:
        return ["Error parsing model output."]
