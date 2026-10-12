"""Preserve supplied boards and extract original pixels with reviewed alpha outlines.
No character generation, repainting, or color correction is performed.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import shutil, json, hashlib
import numpy as np
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'.tools/ip-matting'))
import cv2

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path('C:/Users/EDY/Desktop/IP')
DEST=ROOT/'public/assets/works/ip'
ORIGINALS=DEST/'originals'
ORIGINALS.mkdir(parents=True,exist_ok=True)
for source in SOURCE.glob('*.png'):
    target=ORIGINALS/source.name
    if target.exists() and target.read_bytes()!=source.read_bytes():
        raise RuntimeError(f'Refusing to overwrite differing original: {target}')
    if not target.exists():shutil.copy2(source,target)

characters=[
 ('linya','凛芽','0901_凛芽_人物设定.png','10，02_凛芽_表情与细节.png',(743,410,986,807)),
 ('landou','岚斗','11.03_岚斗_人物设定.png','12.04_岚斗_表情档案.png',(61,415,295,821)),
 ('wuli','雾璃','13.05_雾璃_人物设定与三视图.png','14.06_雾璃_表情与细节.png',(734,275,1001,840)),
 ('nuanyou','暖柚','15.07_暖柚_人物设定.png','16.08_暖柚_表情档案.png',(713,207,1047,760)),
]
# Coordinates are measured against each source crop, never against generated art.
# The masks contain only the complete front view, excluding labels and platforms.
outlines={
 'linya':[(44,9),(54,13),(87,38),(98,43),(113,38),(133,40),(183,9),(190,8),(195,23),(199,60),(198,79),(194,89),(186,89),(193,102),(202,107),(210,108),(207,119),(193,130),(204,131),(200,137),(184,147),(167,154),(168,163),(165,176),(183,190),(196,207),(208,221),(210,237),(205,244),(212,253),(216,267),(212,282),(202,286),(193,283),(186,280),(177,275),(174,291),(182,309),(199,301),(218,298),(229,306),(235,318),(233,330),(219,341),(199,343),(179,337),(181,346),(187,353),(194,365),(197,383),(187,389),(145,389),(123,389),(113,385),(111,376),(106,376),(103,385),(87,389),(33,389),(22,385),(20,375),(24,358),(34,347),(43,339),(46,325),(53,318),(53,309),(57,299),(45,296),(44,287),(40,278),(31,286),(20,289),(9,282),(6,271),(8,256),(15,250),(9,243),(13,232),(23,216),(39,204),(50,185),(62,175),(59,160),(67,155),(42,151),(29,143),(23,133),(30,130),(19,120),(16,107),(32,105),(39,93),(34,89),(33,75),(32,68),(36,36)],
 'landou':[(7,77),(17,61),(47,26),(61,15),(83,21),(98,31),(114,25),(129,27),(170,6),(181,10),(195,28),(212,47),(221,63),(217,80),(208,90),(199,90),(196,104),(210,113),(210,120),(200,126),(207,127),(198,137),(195,144),(179,151),(177,159),(178,174),(192,191),(207,206),(213,212),(211,220),(219,234),(222,242),(213,246),(227,258),(227,271),(221,283),(209,292),(198,294),(186,283),(183,294),(189,309),(177,315),(173,331),(180,333),(183,350),(191,353),(205,367),(211,383),(211,397),(202,401),(163,401),(144,399),(126,399),(121,394),(111,394),(109,401),(91,400),(76,403),(31,401),(23,397),(22,383),(27,369),(34,360),(41,350),(50,347),(52,329),(62,330),(63,316),(49,313),(47,302),(46,291),(37,296),(26,297),(15,288),(10,277),(15,255),(21,247),(18,240),(21,226),(31,213),(27,209),(35,196),(48,197),(62,184),(72,174),(69,158),(79,154),(60,153),(47,153),(43,147),(46,135),(34,134),(27,125),(26,120),(36,119),(52,111),(41,104),(28,110),(18,106),(11,93)],
 'wuli':[(34,69),(34,34),(40,15),(49,9),(61,12),(78,31),(97,63),(113,99),(124,127),(143,125),(149,100),(164,61),(184,30),(204,10),(216,6),(226,12),(232,29),(235,69),(230,104),(226,117),(233,124),(232,143),(222,156),(215,174),(216,187),(229,201),(242,208),(236,219),(220,229),(235,234),(231,244),(214,255),(193,264),(189,273),(192,285),(187,298),(208,307),(224,322),(241,332),(250,349),(258,362),(256,376),(248,382),(254,394),(253,406),(246,416),(236,425),(227,424),(219,413),(214,410),(215,434),(225,466),(222,475),(216,475),(211,459),(207,450),(201,456),(204,478),(213,480),(215,493),(223,508),(235,522),(242,544),(239,556),(217,560),(173,560),(139,556),(137,548),(123,548),(120,555),(98,557),(46,558),(24,552),(24,538),(30,519),(43,502),(53,492),(56,480),(71,478),(72,458),(56,453),(48,462),(44,476),(40,476),(38,469),(47,441),(52,422),(46,416),(37,424),(26,426),(17,419),(12,409),(11,395),(14,383),(7,381),(6,369),(10,357),(20,350),(18,337),(29,325),(45,316),(58,307),(72,296),(70,284),(77,276),(73,268),(57,261),(40,252),(29,240),(31,234),(40,231),(27,221),(22,209),(36,205),(49,191),(55,177),(57,166),(50,155),(42,148),(34,147),(32,136),(37,119),(39,115)],
 'nuanyou':[(9,140),(29,125),(35,109),(46,99),(48,85),(59,79),(67,58),(83,47),(95,30),(120,26),(131,25),(143,12),(167,9),(185,11),(195,16),(215,18),(228,27),(235,41),(243,43),(255,53),(260,63),(275,84),(283,97),(279,108),(294,123),(311,134),(323,146),(327,162),(324,174),(315,182),(300,188),(285,192),(274,188),(270,202),(259,213),(249,216),(244,230),(247,240),(243,252),(260,274),(273,288),(284,300),(278,307),(285,317),(292,327),(294,338),(289,344),(295,348),(297,355),(289,360),(291,374),(294,382),(289,394),(280,399),(266,399),(254,392),(252,382),(244,391),(250,405),(243,417),(246,432),(255,452),(248,455),(242,438),(235,438),(236,456),(233,465),(233,476),(244,478),(248,490),(259,502),(270,523),(273,539),(266,546),(231,550),(194,549),(174,543),(171,536),(157,536),(154,543),(139,549),(81,549),(50,546),(47,536),(51,519),(59,503),(69,494),(75,478),(88,474),(92,455),(89,438),(72,436),(69,422),(63,423),(62,415),(72,390),(62,386),(62,397),(54,409),(42,412),(29,406),(20,397),(17,385),(21,371),(30,359),(34,349),(35,338),(41,324),(49,309),(49,299),(61,285),(69,280),(77,264),(84,253),(85,238),(86,226),(82,216),(68,214),(58,207),(52,195),(47,191),(34,192),(23,187),(12,180),(5,169),(4,153)],
}
holes={
 'linya':[[(98,300),(112,299),(117,324),(116,350),(111,370),(107,370),(104,342),(97,322)]],
 'landou':[[(101,316),(125,318),(127,336),(121,359),(122,387),(114,388),(112,358),(107,334)]],
 'wuli':[[(114,454),(139,454),(142,484),(140,515),(135,544),(125,544),(121,522),(121,490)]],
 'nuanyou':[[(147,435),(173,435),(178,462),(175,483),(171,506),(169,530),(155,532),(151,511),(144,487),(147,464)]],
}
for id,name,board,expression,crop in characters:
    folder=DEST/'characters'/id;folder.mkdir(parents=True,exist_ok=True)
    source=Image.open(ORIGINALS/board)
    source.crop(crop).save(folder/'source-crop.png')
    figure=source.crop(crop).convert('RGBA')
    mask=Image.new('L',(figure.width*4,figure.height*4),0);draw=ImageDraw.Draw(mask)
    draw.polygon([(x*4,y*4) for x,y in outlines[id]],fill=255)
    for hole in holes[id]:draw.polygon([(x*4,y*4) for x,y in hole],fill=0)
    mask=mask.resize(figure.size,Image.Resampling.LANCZOS)
    # Classical graph-cut refines the measured silhouette. Only alpha changes;
    # sure foreground protects white fur/clothing from white-board removal.
    rgb=np.array(figure)[:,:,:3];alpha=np.array(mask)
    trimap=np.where(alpha>127,cv2.GC_PR_FGD,cv2.GC_PR_BGD).astype('uint8')
    interior=np.array(mask.filter(ImageFilter.MinFilter(5)))>250
    exterior=np.array(mask.filter(ImageFilter.MaxFilter(15)))<2
    trimap[interior]=cv2.GC_FGD;trimap[exterior]=cv2.GC_BGD
    yellow=(rgb[:,:,0]>240)&(rgb[:,:,1]>205)&(rgb[:,:,2]<60)
    trimap[yellow]=cv2.GC_BGD
    if id=='landou':
        trimap[148:184,180:]=cv2.GC_BGD
        trimap[398:,:]=cv2.GC_BGD
    cv2.setRNGSeed(0)
    cv2.grabCut(rgb,trimap,None,np.zeros((1,65)),np.zeros((1,65)),5,cv2.GC_INIT_WITH_MASK)
    matte=np.where((trimap==cv2.GC_FGD)|(trimap==cv2.GC_PR_FGD),255,0).astype('uint8')
    count,labels,stats,_=cv2.connectedComponentsWithStats(matte,8)
    if count>1:matte=np.where(labels==1+np.argmax(stats[1:,cv2.CC_STAT_AREA]),255,0).astype('uint8')
    mask=Image.fromarray(matte).filter(ImageFilter.GaussianBlur(.35))
    figure.putalpha(mask);figure.save(folder/'main.png')
    for file,label in [(board,'turnaround'),(expression,'expressions')]:
        image=Image.open(ORIGINALS/file);image.thumbnail((1000,1000));image.save(folder/(label+'-preview.webp'),quality=88,method=6)
scene_files=['17.01_商城中庭快闪展.png','18.02_柜台选购_背影.png','19.03_海报长廊_背影.png','20.04_展台近景_背影挑选.png']
scene_folder=DEST/'scenes';scene_folder.mkdir(exist_ok=True)
for i,name in enumerate(scene_files,1):
    image=Image.open(ORIGINALS/name);image.thumbnail((600,600));image.save(scene_folder/f'scene-{i:02}-preview.webp',quality=88,method=6)
manifest={'sourceFolder':str(SOURCE),'method':'Original RGB + manually reviewed GrabCut alpha; no generative repainting','characters':[{'id':id,'name':name,'source':board,'crop':list(crop),'display':f'characters/{id}/main.png'} for id,name,board,expression,crop in characters],'originals':{file.name:hashlib.sha256(file.read_bytes()).hexdigest() for file in ORIGINALS.glob('*.png')}}
(DEST/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('IP original files preserved; source crops and thumbnails ready.')
