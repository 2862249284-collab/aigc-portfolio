"""Extract actual decoded frames from the original PLATE source, without grading or compositing.
Requires Pillow + imageio-ffmpeg, or an explicit FFMPEG executable environment variable.
"""
import hashlib
import io
import json
import math
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.tools'))
from PIL import Image

ffmpeg = os.environ.get('FFMPEG')
if not ffmpeg:
    import imageio_ffmpeg
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

source = ROOT / 'public/assets/source/plate-original.mp4'
destination = ROOT / 'public/assets/backgrounds'
destination.mkdir(parents=True, exist_ok=True)
selection = [
    ('01-street', 0.0, '街道远景与纵深 / 圆环'),
    ('02-approach', 0.8, '街道与人物完整构图 / 个人介绍'),
    ('03-profile', 4.8, '人物侧面与暖色建筑'),
    ('04-confrontation', 5.6, '双人对峙'),
    ('05-action', 7.2, '近身动作全景'),
    ('06-closeup', 8.8, '人物对照特写'),
    ('07-perspective', 11.2, '街道斜向透视 / 详情'),
    ('08-finale', 13.0, '原视频最后一帧 / AIGC 首页衔接')
]
frames = []
for name, timestamp, purpose in selection:
    # PNG pipe retains the exact decoded pixels before WebP compression.
    pixels = subprocess.run([ffmpeg, '-loglevel', 'error', '-ss', str(timestamp), '-i', str(source),
        '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], check=True, capture_output=True).stdout
    image = Image.open(io.BytesIO(pixels)).convert('RGB')
    file = destination / f'{name}.webp'
    image.save(file, format='WEBP', quality=92, method=6)
    frame_index = math.ceil(timestamp * 24 - 1e-6)
    frames.append({'file': file.name, 'requestedTime': timestamp, 'frameIndex': frame_index, 'frameTime': frame_index / 24,
        'width': image.width, 'height': image.height, 'purpose': purpose, 'bytes': file.stat().st_size})
manifest = {
    'sourceURL': 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260811_041248_545214ed-be7c-4672-91ec-ba075f6fa895.mp4',
    'sourceSHA256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'duration': 13.041667, 'fps': 24, 'resolution': [1280, 720],
    'processing': 'Original decoded frames. No crop, color grading, blur, compositing or generated imagery. WebP quality 92.',
    'frames': frames
}
(destination / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(frames, ensure_ascii=False, indent=2))
