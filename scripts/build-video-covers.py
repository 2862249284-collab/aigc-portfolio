"""Compose selected real video frames into sRGB WebP portfolio covers.

Run extract-cover-candidates.py first, then curate selections.json visually.
Pillow and a Chinese font are required; font paths can be overridden.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageCms, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--font', default='C:/Windows/Fonts/msyhbd.ttc')
parser.add_argument('--regular-font', default='C:/Windows/Fonts/msyh.ttc')
parser.add_argument('--only', nargs='+', help='Regenerate only these project IDs; preserve all other files')
args = parser.parse_args()
OUT = ROOT / 'public/assets/video-covers'
OUT.mkdir(parents=True, exist_ok=True)
read = lambda name: json.loads((ROOT / f'docs/video-covers/{name}.json').read_text(encoding='utf-8'))
projects, candidates, selections = read('sources'), read('candidates'), read('selections')
candidate_map = {record['episodeId']: record for record in candidates}
labels = {'short-film':'AI短片', 'comic-drama':'AI漫剧', 'tvc':'TVC', 'ai-live-action':'AI真人', 'game':'游戏'}
line_breaks = {
    'taoyuan':['桃园村长第一季，','小酒来也'],
    'white-card':['觉醒无限复制，','看我白卡成神'],
    'seventh-element':['THE Seventh Element','第七元素'],
    'lies-and-love':['Between Lies and Love','谎言与爱之间'],
}
profile = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
manifest, bindings = [], {}
previous = read('results') if args.only else []
if args.only and not set(args.only).issubset({p['id'] for p in projects}):
    raise ValueError('Unknown project ID')

def compose(project, episode, filename, episode_label=False):
    if args.only and project['id'] not in args.only:
        entry = next(item for item in previous if item['file'] == '/assets/video-covers/'+filename)
        manifest.append(entry)
        return entry['file']
    selection = selections[episode['id']]
    record = candidate_map[episode['id']]
    candidate = next(c for c in record['candidates'] if c['percentage'] == selection['percentage'])
    source = Image.open(ROOT / candidate['path']).convert('RGB')
    # The sharp foreground always remains intact. Only the same frame's blurred
    # background is cropped to fill the 16:9 canvas, including vertical originals.
    backdrop = ImageOps.fit(source, (1920,1080), method=Image.Resampling.LANCZOS)
    backdrop = ImageEnhance.Brightness(backdrop.filter(ImageFilter.GaussianBlur(48))).enhance(.66)
    foreground = ImageOps.contain(source, (1920,1080), method=Image.Resampling.LANCZOS)
    backdrop.paste(foreground, ((1920-foreground.width)//2,(1080-foreground.height)//2))
    canvas = backdrop.convert('RGBA')
    gradient = Image.new('RGBA', canvas.size)
    gd = ImageDraw.Draw(gradient)
    for y in range(540,1080):
        opacity = int(220 * ((y-540)/539)**1.6)
        gd.line((0,y,1920,y), fill=(9,11,17,opacity))
    canvas = Image.alpha_composite(canvas,gradient)
    draw = ImageDraw.Draw(canvas)
    lines = line_breaks.get(project['id'],[project['title']])
    size = 92
    while True:
        font = ImageFont.truetype(args.font, size)
        if max(draw.textlength(line,font=font) for line in lines) <= 1696:
            break
        size -= 2
    assert len(lines)<=2 and size>=64
    spacing = size+24
    # Center the visible glyph bounds, including two-line Chinese titles.
    row_boxes=[draw.textbbox((0,i*spacing),line,font=font,anchor='ls') for i,line in enumerate(lines)]
    top=min(box[1] for box in row_boxes)
    bottom=max(box[3] for box in row_boxes)
    shift=540-(top+bottom)/2
    shadow=Image.new('RGBA',canvas.size)
    shadow_draw=ImageDraw.Draw(shadow)
    positions=[]
    for index,line in enumerate(lines):
        box=row_boxes[index]
        x=960-(box[0]+box[2])/2
        y=index*spacing+shift
        positions.append((x,y))
        shadow_draw.text((x,y+4),line,font=font,fill=(0,0,0,220),anchor='ls',stroke_width=6,stroke_fill=(0,0,0,180))
    canvas=Image.alpha_composite(canvas,shadow.filter(ImageFilter.GaussianBlur(7)))
    draw=ImageDraw.Draw(canvas)
    title_bounds=[]
    for line,(x,y) in zip(lines,positions):
        draw.text((x,y),line,font=font,fill='#ffffff',anchor='ls',stroke_width=1,stroke_fill='#ffffff')
        bounds=draw.textbbox((x,y),line,font=font,anchor='ls',stroke_width=1)
        assert bounds[0]>=0 and bounds[2]<=1920 and bounds[3]<=1080
        title_bounds.append(bounds)
    if episode_label:
        small = ImageFont.truetype(args.regular_font, 36)
        draw.text((960,bottom+shift+54),f'第{episode["number"]:02d}集',font=small,fill='#ffffff',anchor='mm',stroke_width=1,stroke_fill='#35353c')
    label=labels[project['category']]
    label_font=ImageFont.truetype(args.font,34)
    label_width=round(draw.textlength(label,font=label_font))+52
    draw.rounded_rectangle((1824-label_width,72,1824,140),radius=8,fill=(13,16,23,190),outline=(255,255,255,100),width=1)
    draw.text((1824-label_width/2,105),label,font=label_font,fill='white',anchor='mm')
    dest=OUT/filename
    canvas.convert('RGB').save(dest,'WEBP',quality=88,method=6,icc_profile=profile)
    entry={'projectId':project['id'],'title':project['title'],'category':label,
           'episode':episode['number'] if episode_label else None,'file':'/assets/video-covers/'+filename,
           'sourceEpisode':episode['id'],'source':record['source'],'sourceSha256':record['sourceSha256'],
           'sourceSize':[source.width,source.height],'percentage':selection['percentage'],
           'seconds':candidate['seconds'],'selectionReason':selection['reason'],
           'composition':'完整主体居中；同帧模糊延展；底部渐变；正中央标题与集数；右上分类',
           'titleLines':lines,'titleBounds':title_bounds,'size':[1920,1080],'colorSpace':'sRGB',
           'quality':88,'bytes':dest.stat().st_size,'sha256':hashlib.file_digest(dest.open('rb'),'sha256').hexdigest(),
           'status':'完成：本地原片提帧，已人工比较四张候选'}
    manifest.append(entry)
    return entry['file']

for project in projects:
    main=compose(project,project['episodes'][0],project['id']+'-main.webp')
    episodes={}
    for ep in project['episodes']:
        episodes[ep['id']]=compose(project,ep,f'{project["id"]}-ep{ep["number"]:02d}.webp',True) if len(project['episodes'])>1 else main
    bindings[project['id']]={'cover':main,'episodes':episodes}
(ROOT/'src/data/video-covers.js').write_text('// Generated by scripts/build-video-covers.py from verified original video frames.\nexport const videoCovers = '+json.dumps(bindings,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
(ROOT/'docs/video-covers/results.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
report=['# 视频封面制作结果','',f'15 个作品、20 集，输出 {len(manifest)} 张独立封面（15 张主封面＋10 张多集封面）。单集详情复用对应主封面。','',
        '全部使用对应本地原视频，逐集比较 20%、40%、60%、80% 四张候选后选取；未使用生成图、其他作品图片或外部下载素材。',
        '统一 1920×1080、WebP quality 88、嵌入 sRGB。竖屏完整居中，背景仅使用同一帧模糊延展。原素材分辨率低于输出尺寸时使用 Lanczos 缩放，不将其描述为新增高清细节。',
        '按最新要求，作品标题在封面正中央，集数在标题下方居中，分类保留右上角。未添加水印、品牌或装饰图案；画面原有字幕、产品标识和游戏界面属于原片内容。','',
        '| 作品 | 用途 | 封面路径（public 下） | 原片与取帧点 | 状态 |','|---|---|---|---|---|']
for item in manifest:
    use=f'第{item["episode"]:02d}集' if item['episode'] else '分类主封面'
    report.append(f'| {item["title"]} | {use} | `{item["file"]}` | `{item["source"]}` · {item["percentage"]}% / {item["seconds"]:.3f}s | 已完成 |')
report+=['','## 素材待补充','', '无缺失原视频的作品。部分原片为 480–780 像素宽的压缩版本；如以后提供更高清母版，可按同一时间点重新提帧。',
         '', '## 可核验记录','', '`sources.json`：作品、原封面与原视频映射；`candidates.json`：原视频 SHA-256、时长和80张候选信息；`selections.json`：逐集人工选帧理由；`results.json`：输出尺寸、字体布局边界、来源和文件校验值。',
         '', '本地候选画面和四宫格保存在 `.tools/cover-candidates/`，不参与网站发布。']
(ROOT/'docs/video-covers/README.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
print(f'Generated {len(manifest)} covers, total {sum(i["bytes"] for i in manifest)/1024/1024:.2f} MiB')
