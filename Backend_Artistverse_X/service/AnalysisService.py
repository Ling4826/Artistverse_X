from groq import Groq


class AnalysisService:
    def __init__(self, api_key):
        self.groq_client = Groq(api_key=api_key)

    def analysis_lyrics(self, lyrics):
        completion = self.groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": ""},
                {"role": "user",
                 "content": f" based on my lyrics {lyrics} can you provide a suggestion of chord,keys,time signature,tempo and extract musical information for me that related with my lyrics"}
            ]
        )

        response = completion.choices[0].message.content
        analysis = response

        return analysis


