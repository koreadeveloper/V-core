from langchain_core.prompts import PromptTemplate

# Summary / Notes Prompt
SUMMARY_PROMPT_TEMPLATE = """
Analyze the following video transcript titled "{title}".
Transcript:
{transcript}

Based on the length/detail level "{length_desc}", provide a structured summary in Markdown format.
Focus on creating high-quality study notes.

Output Format (Markdown):
# {title}

## 📝 Executive Summary
[Brief high-level summary]

## 🔑 Key Takeaways
- [Point 1]
- [Point 2]
- [Point 3]
...

## 📖 Detailed Notes
[Structured notes with H3 headers, bullet points, and bold text for emphasis]

## 💡 Actionable Insights
[Practical applications or lessons learned]
"""

SUMMARY_PROMPT = PromptTemplate(
    input_variables=["transcript", "length_desc", "title"],
    template=SUMMARY_PROMPT_TEMPLATE
)


# Mind Map Prompt
MINDMAP_PROMPT_TEMPLATE = """
Based on the following video transcript titled "{title}":
{transcript}

Create a Mind Map using Mermaid.js syntax to visualize the core concepts and their relationships.
The graph should go from Top to Bottom (graph TD).
Use square nodes [ ] for main topics and rounded nodes ( ) for sub-topics.

IMPORTANT constraints:
1. Output ONLY the mermaid code.
2. Do NOT wrap in markdown code blocks (```mermaid ... ```).
3. Do NOT include any explanations.
4. Ensure the syntax is valid (no special characters that break mermaid).

Example:
graph TD
    A[Main Topic] --> B(Sub Topic 1)
    A --> C(Sub Topic 2)
    B --> D[Detail 1]
"""

MINDMAP_PROMPT = PromptTemplate(
    input_variables=["transcript", "title"],
    template=MINDMAP_PROMPT_TEMPLATE
)


# Quiz Prompt
QUIZ_PROMPT_TEMPLATE = """
Based on the video transcript titled "{title}":
{transcript}

Generate 3-5 multiple choice questions to test the user's understanding.
Provide the output in the following JSON format ONLY:

{{
    "quizzes": [
        {{
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer_index": 0,
            "explanation": "Explanation of why option A is correct."
        }},
        ...
    ]
}}
"""

QUIZ_PROMPT = PromptTemplate(
    input_variables=["transcript", "title"],
    template=QUIZ_PROMPT_TEMPLATE
)


# Flashcards Prompt
FLASHCARD_PROMPT_TEMPLATE = """
Based on the video transcript titled "{title}":
{transcript}

Create 5-8 flashcards of key terms or concepts discussed.
Provide the output in the following JSON format ONLY:

{{
    "flashcards": [
        {{
            "term": "Key Term 1",
            "definition": "Clear and concise definition based on the video."
        }},
        ...
    ]
}}
"""

FLASHCARD_PROMPT = PromptTemplate(
    input_variables=["transcript", "title"],
    template=FLASHCARD_PROMPT_TEMPLATE
)
