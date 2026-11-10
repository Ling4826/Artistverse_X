from groq import Groq
from util.extract_lyrics import strip_emojis


class AnalysisService:
    def __init__(self, api_key):
        self.groq_client = Groq(api_key=api_key)

    def analysis_lyrics(self, lyrics):
        system_prompt = (
            "You are an expert human music producer and arranger. Analyze the given lyrics and provide "
            "concise, professional Producer Notes detailing:\n"
            "- Key & Scale\n"
            "- Recommended Tempo (BPM) & Time Signature\n"
            "- Suggested Chord Progression (e.g., Verse, Chorus progressions)\n"
            "- Production Vibe & Arrangement Tips\n\n"
            "STRICT RULES:\n"
            "1. NEVER use any emojis.\n"
            "2. NEVER include conversational greetings, intros, or outros.\n"
            "3. Present as clean, direct, professional Producer Notes."
        )
        completion = self.groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",
                 "content": f"Analyze these lyrics and provide musical recommendations:\n\n{lyrics}"}
            ]
        )

        response = completion.choices[0].message.content
        return strip_emojis(response).strip()



