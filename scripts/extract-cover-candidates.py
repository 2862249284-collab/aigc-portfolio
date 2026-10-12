"""Extract auditable 20/40/60/80% frames without modifying source videos."""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg', required=True)
args = parser.parse_args()
out = ROOT / '.tools/cover-candidates'
out.mkdir(parents=True, exist_ok=True)
projects = json.loads((ROOT / 'docs/video-covers/sources.json').read_text(encoding='utf-8'))
font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 20)
records = []
for project in projects:
    for episode in project['episodes']:
        source = Path(episode['source'])
        if not source.is_absolute():
            source = ROOT / source
        if not source.is_file():
            raise FileNotFoundError(source)
        probe = subprocess.run([args.ffmpeg, '-hide_banner', '-i', str(source)], capture_output=True)
        metadata = probe.stderr.decode('utf-8', errors='replace')
        duration = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', metadata)
        if not duration:
            raise ValueError(metadata)
        hours, minutes, seconds = map(float, duration.groups())
        seconds += hours * 3600 + minutes * 60
        candidates = []
        sheet = Image.new('RGB', (960, 660), '#15161b')
        draw = ImageDraw.Draw(sheet)
        for index, percentage in enumerate([20, 40, 60, 80]):
            timestamp = round(seconds * percentage / 100, 3)
            target = out / f'{episode["id"]}-{percentage}.png'
            subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y',
                            '-ss', str(timestamp), '-i', str(source), '-frames:v', '1',
                            '-update', '1', str(target)], check=True)
            frame = Image.open(target).convert('RGB')
            preview = ImageOps.contain(frame, (480, 270))
            x, y = (index % 2) * 480, (index // 2) * 330
            sheet.paste(preview, (x + (480-preview.width)//2, y + (270-preview.height)//2))
            draw.text((x+12, y+277), f'{percentage}% | {timestamp:.2f}s | {frame.width}×{frame.height}', font=font, fill='white')
            draw.text((x+12, y+303), episode['id'], font=font, fill='#bfc1c9')
            candidates.append({'percentage': percentage, 'seconds': timestamp,
                               'path': str(target.relative_to(ROOT)).replace('\\', '/'),
                               'width': frame.width, 'height': frame.height})
        sheet.save(out / f'{episode["id"]}-sheet.jpg', quality=90)
        records.append({'projectId': project['id'], 'episodeId': episode['id'],
                        'duration': seconds, 'source': episode['source'],
                        'sourceSha256': hashlib.file_digest(source.open('rb'), 'sha256').hexdigest(),
                        'candidates': candidates})
        print(episode['id'], '4 candidates extracted', flush=True)
(ROOT / 'docs/video-covers/candidates.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
