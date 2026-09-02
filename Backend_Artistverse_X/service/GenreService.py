from groq import Groq
from util.extract_lyrics import extract_lyrics


class GenreService:
    def __init__(self, api_key):
        self.groq_client = Groq(api_key=api_key)

    def generate_lyrics_genre(self, prompt, genre, language):
        system_prompt = (
            "You are a professional human songwriter. Write authentic, emotionally resonant, "
            "and musically structured song lyrics using natural human songwriting techniques "
            "(with sections like [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro]). "
            "STRICT RULES:\n"
            "1. NEVER use any emojis.\n"
            "2. NEVER include conversational filler, intros, or outros (e.g. 'Sure, here is...').\n"
            "3. Output ONLY the raw song lyrics."
        )
        completion = self.groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",
                 "content": f"Write song lyrics about '{prompt}' in {language} language for the {genre} genre."}
            ]
        )

        response = completion.choices[0].message.content

        lyrics = extract_lyrics(response)

        return lyrics



