from PIL import Image, ImageDraw, ImageFont, ImageEnhance
W,H = 1280,720
bg = Image.open("frames/p03.png").convert("RGB").resize((W,H), Image.LANCZOS)
bg = ImageEnhance.Contrast(ImageEnhance.Color(bg).enhance(0.92)).enhance(1.06)
grad = Image.new("L",(W,H),0); gd = ImageDraw.Draw(grad)
for x in range(W): gd.line([(x,0),(x,H)], fill=int(150*max(0.0,1-x/(W*0.82))))
bg = Image.composite(Image.new("RGB",(W,H),(10,12,16)), bg, grad)
d = ImageDraw.Draw(bg)
fk = ImageFont.truetype("assets/fonts/Montserrat-800.ttf",26)
fm = ImageFont.truetype("assets/fonts/Montserrat-900.ttf",84)
fs = ImageFont.truetype("assets/fonts/Montserrat-700.ttf",30)
d.text((72,118),"WHY WE BECOME",font=fk,fill=(224,90,43))
for i,(txt,col) in enumerate([("WHY YOU",(255,255,255)),("KEEP",(255,255,255)),("STARTING",(224,90,43)),("OVER",(224,90,43))]):
    d.text((72,168+i*90),txt,font=fm,fill=col)
d.rectangle([72,556,192,562],fill=(224,90,43))
d.text((72,588),"It's not a starting problem. It's a continuing one.",font=fs,fill=(206,210,218))
bg.save("thumbnail.png",quality=94); print("thumbnail", bg.size)
