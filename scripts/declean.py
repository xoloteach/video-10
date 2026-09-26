import cv2, numpy as np, os
from pathlib import Path
os.makedirs("panels4", exist_ok=True)
log=[]
for f in sorted(Path("panels3").glob("*.png")):
    img=cv2.imread(str(f)); g=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    # locate caption rows: dark pixels in a wide, centred horizontal run
    rows=[]
    for y in range(880,1070):
        dk=np.where(g[y]<110)[0]
        if len(dk)>60:
            spread=dk.max()-dk.min()
            centre=abs(((dk.min()+dk.max())/2)-960)
            if spread>320 and centre<330: rows.append(y)
    if not rows:
        cv2.imwrite(f"panels4/{f.name}",img); log.append((f.name,"clean")); continue
    y0,y1=max(870,min(rows)-16), min(1080,max(rows)+16)
    sub=img[y0:y1]; gs=g[y0:y1]
    mask=((gs<118)*255).astype(np.uint8)
    mask=cv2.dilate(mask,np.ones((13,13),np.uint8),iterations=2)
    img[y0:y1]=cv2.inpaint(sub,mask,9,cv2.INPAINT_TELEA)
    cv2.imwrite(f"panels4/{f.name}",img)
    log.append((f.name,f"{y0}-{y1}"))
print("cleaned:",sum(1 for _,s in log if s!="clean"),"/",len(log))
