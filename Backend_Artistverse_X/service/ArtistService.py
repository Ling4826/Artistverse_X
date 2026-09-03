from groq import Groq
from util.extract_lyrics import extract_lyrics


class ArtistService:
    def __init__(self, api_key):
        self.groq_client = Groq(api_key=api_key)

    def generate_lyrics_artist(self, prompt, artist, language):
        system_prompt = (
            f"You are a professional human songwriter specializing in writing in the signature style, "
            f"metaphors, and rhythm of {artist}. Structure the song naturally using sections like "
            "([Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro]). "
            "STRICT RULES:\n"
            "1. NEVER use any emojis.\n"
            "2. NEVER include conversational filler, intros, or outros.\n"
            "3. Output ONLY the raw song lyrics."
        )
        completion = self.groq_client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",
                 "content": f"Write song lyrics about '{prompt}' in {language} language in the authentic style of {artist}."}
            ]
        )

        response = completion.choices[0].message.content

        lyrics = extract_lyrics(response)

        return lyrics



