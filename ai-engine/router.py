import numpy as np 
import re
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
print("Router Embedding Engine...")

embedding_engine = HuggingFaceInferenceAPIEmbeddings(
    api_key=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
COMPLEXITY_ANCHORS = {
    "gemini": [
        "Write code implement algorithm design pattern backend architecture react component function",
        "Debug error stack trace fix memory leak optimization optimization performance scaling script",
        "Advanced logical puzzles math calculations algorithmic engineering problems recursive solutions",
        "System design microservices database scaling load balancing web socket cluster infrastructure",
        "Complex data transformation parsing custom ast compiler optimization neural network implementation"
    ],
    "120b": [
        "Explain historical event conceptual political economic theories philosophy breakdown deep analysis",
        "Write comprehensive long form essay blog post formal legal corporate technical documentation article",
        "Provide strategic advice multi-paragraph comparative evaluation design pros and cons review",
        "Language translation complex text creative writing storytelling poetry scripts creative generation",
        "Detailed step by step tutorial conceptual layout of advanced engineering topics without code snippets"
    ],
    "27b": [
        "What is the definition summary key points brief description explanation short context facts",
        "Who discovered invented born history general trivia base level facts straightforward data",
        "Convert this text to uppercase lowercase format bullet points fix basic spelling mistakes",
        "Short simple single sentence answer question query lookup recipe basic routine instruction",
        "Simple calculations conversion unit metrics math arithmetic strings text slices"
    ]
}

def compute_centroid(prompts):
  vectors = embedding_engine.embed_documents(prompts)
  return np.mean(vectors, axis=0)

CENTROIDS = {}
for tier, prompts in COMPLEXITY_ANCHORS.items():
  math_array = compute_centroid(prompts) 
  CENTROIDS[tier] = math_array

def get_cosine_similarity(vec1, vec2):
  dot_product = np.dot(vec1,vec2)
  norm_vec1 = np.linalg.norm(vec1)
  norm_vec2 = np.linalg.norm(vec2)
  if norm_vec1 == 0 or norm_vec2 == 0 :
    return 0.0
  return dot_product/(norm_vec1*norm_vec2)

def has_code_signature(text: str) -> bool:
  code_patterns = [
    r"(def\s+\w+\(|function\s+\w+\(|const\s+\w+\s*=)",  # Functions
    r"(import\s+\w+|from\s+\w+\s+import)",              # Imports
    r"(class\s+\w+:|class\s+\w+\s+extends)",            # Classes
    r"(<\/?[a-z][^>]*>|\{\s*.*\s*\})",                  # HTML tags / JSobjects
    r"(for\s+.+\s+in|while\s+\(.+\))"                   # Contrstructures
  ]
  for pattern in code_patterns:
    if re.search(pattern, text):
      return True 
  return False

def classify_prompt(text: str)-> str:
  clean_text = text.strip()  # remove whitespace character 
  word_count = len(clean_text.split())   #split into word 

  #basic conversation 
  trivial_words = {"hi", "hello", "hey", "bye", "goodbye", "thanks", "thank you"}
  if word_count <= 3 and any(word in clean_text.lower() for word in trivial_words):
    return "20b"

  # high complexity already known 
  if has_code_signature(clean_text):
    return "gemini"
  
  complex_word = {"debug", "reseach", "refactor", "api setup"}
  for kw in complex_word:
    if kw in clean_text.lower():
      return "gemini"
  
  #else case 
  query_vector = embedding_engine.embed_query(clean_text)

  scores = {}
  for tier, centroid in CENTROIDS.items():
    similarity_score = get_cosine_similarity(query_vector, centroid)

    scores[tier] = similarity_score
  
  best_tier = ""
  highest_score = -1.0
  
  for tier, score in scores.items():
    if score > highest_score:
      highest_score = score
      best_tier = tier

  # override compexity
  if best_tier == "27b" and highest_score <0.40 and word_count > 40:
    return "120b"
  
  if best_tier == "120b" and word_count > 120:
    return "gemini"
  
  return best_tier 
