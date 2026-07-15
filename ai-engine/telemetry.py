from models import cloud_model, grok_api_models

def estimate__tokens_math(text: str) -> int:
    
    word_count = len(text.split())
    token_estimate_by_words = int(word_count * 1.33)
    
    char_count = len(text)
    token_estimate_by_chars = int(char_count / 4.0)
    
    # Return the average of the two methods
    final_estimate = int((token_estimate_by_words + token_estimate_by_chars) / 2)
    return max(1, final_estimate) # Never returns 0

def count_input_tokens(tier: str, context_text: str) -> int:

    try:
        if tier == "gemini":
            # Gemini has a built-in exact token counter via LangChain
            return cloud_model.get_num_tokens(context_text)
        elif tier in grok_api_models:
            return grok_api_models[tier].get_num_tokens(context_text)
        else:
            return estimate__tokens_math(context_text)
            
    except Exception as e:
        print(f"⚠️ Input Telemetry Error: {e}")
        return len(context_text.split()) # Failsafe: just return the raw word count

def count_output_tokens(tier: str, generated_text: str) -> int:

    try:
        if tier == "gemini":
            return cloud_model.get_num_tokens(generated_text)
        elif tier in grok_api_models:
            return grok_api_models[tier].get_num_tokens(generated_text)
        else:
            return estimate__tokens_math(generated_text)
            
    except Exception as e:
        print(f"⚠️ Output Telemetry Error: {e}")
        return len(generated_text.split())