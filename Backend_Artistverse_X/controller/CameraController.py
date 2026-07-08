# controllers/camera_controller.py

from flask import Response, jsonify
from service.CameraService import CameraService
from service.VideoCameraModelService import VideoCamera
class CameraController:
    def __init__(self):
        self.camera_service = CameraService()
        self.video_camera = VideoCamera()

    def video_feed(self):
        print(Response(self.camera_service.gen(), mimetype='multipart/x-mixed-replace; boundary=frame'))
        return Response(self.camera_service.gen(), mimetype='multipart/x-mixed-replace; boundary=frame')

    def gen_table(self):
        response = self.camera_service.get_music_recommendations()
        return jsonify(response)

    def detect_emotion(self):
        from flask import request
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided', 'songs': '[]', 'emotion': None}), 400
        
        image_data = data['image']
        response = self.camera_service.process_image(image_data)
        return jsonify(response)
