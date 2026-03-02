import httpx
import json
import random
from typing import List, Dict

GEMINI_API_KEY = "AIzaSyCR4YjEB3hruP_3PXyi1_fdBVJD3WK4yAs"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

async def generate_mock_test_questions(topic: str, subtopics: List[str] = None, num_questions: int = 20) -> List[Dict]:
    """
    Generate mock test questions using Gemini API

    Args:
        topic: Main topic for questions
        subtopics: List of subtopics (optional)
        num_questions: Number of questions to generate (default: 20)

    Returns:
        List of question dictionaries with question, options, and correct answer
    """

    # Build prompt
    subtopics_text = ""
    if subtopics:
        subtopics_text = f"\nSubtopics to cover: {', '.join(subtopics)}"

    prompt = f"""Generate {num_questions} multiple choice questions for a technical assessment on the topic: {topic}{subtopics_text}

Requirements:
1. Each question should have 4 options (A, B, C, D)
2. Questions should range from basic to advanced difficulty
3. Include practical scenario-based questions
4. Mark the correct answer clearly

Format your response as a JSON array with this exact structure:
[
  {{
    "question": "What is...",
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_answer": "A"
  }}
]

IMPORTANT: Return ONLY the JSON array, no additional text or markdown formatting."""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json={
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "temperature": 0.8,
                        "maxOutputTokens": 8000
                    }
                },
                timeout=60.0
            )

            if response.status_code != 200:
                raise Exception(f"Gemini API error: {response.text}")

            result = response.json()
            generated_text = result["candidates"][0]["content"]["parts"][0]["text"]

            # Clean up the response (remove markdown code blocks if present)
            generated_text = generated_text.strip()
            if generated_text.startswith("```json"):
                generated_text = generated_text[7:]
            if generated_text.startswith("```"):
                generated_text = generated_text[3:]
            if generated_text.endswith("```"):
                generated_text = generated_text[:-3]
            generated_text = generated_text.strip()

            # Parse JSON
            questions = json.loads(generated_text)

            # Validate structure
            for q in questions:
                if not all(key in q for key in ["question", "option_a", "option_b", "option_c", "option_d", "correct_answer"]):
                    raise Exception("Invalid question structure from Gemini API")

            return questions[:num_questions]  # Ensure we return exactly the requested number

    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse Gemini response as JSON: {str(e)}")
    except Exception as e:
        raise Exception(f"Error generating questions: {str(e)}")

def get_random_questions(questions: List[Dict], count: int = 10) -> List[Dict]:
    """
    Get random questions from a list

    Args:
        questions: List of all questions
        count: Number of random questions to return

    Returns:
        List of random questions
    """
    if len(questions) <= count:
        return questions

    return random.sample(questions, count)
