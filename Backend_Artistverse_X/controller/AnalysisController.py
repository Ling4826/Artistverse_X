from flask import jsonify, request
from service.AnalysisService import AnalysisService


class AnalysisController:
    def __init__(self, api_key):
        self.analysis_service = AnalysisService(api_key)

    def analysis_lyrics_handler(self):
        try:
            lyrics = request.json.get('lyrics')
            analysis = self.analysis_service.analysis_lyrics(lyrics)
            return jsonify({'analysis': analysis})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
