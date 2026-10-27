# Genera el mapa de profundidad (blanco = cerca, negro = lejos) de public/tour/sala.jpg
from PIL import Image, ImageDraw, ImageFilter
W, H = 765, 1020
d = Image.new("L", (W, H), 115)          # pared
g = ImageDraw.Draw(d)
# suelo: degradado de lejos (y=690) a cerca (abajo)
for y in range(690, H):
    t = (y - 690) / (H - 690)
    g.line([(0, y), (W, y)], fill=int(120 + 110 * t))
# techo / sillas colgadas
g.rectangle([0, 0, W, 140], fill=150)
# arco y sala del fondo (muy lejos)
g.polygon([(335, 735), (335, 420), (360, 340), (400, 325), (440, 340), (465, 420), (470, 735)], fill=15)
# marco del arco (ligeramente adelantado)
g.rectangle([282, 330, 330, 735], fill=135); g.rectangle([470, 330, 525, 735], fill=135)
# letrero CINEMA (voladizo)
g.polygon([(180, 150), (680, 150), (680, 240), (560, 290), (300, 290), (180, 300)], fill=175)
# columna izquierda
g.rectangle([0, 60, 100, 700], fill=205)
# estantería / sillas apiladas
g.rectangle([100, 480, 215, 650], fill=150)
# cuadros de pared
g.rectangle([598, 392, 735, 580], fill=135); g.rectangle([145, 420, 220, 560], fill=135)
# mesa central y sillas
g.polygon([(150, 650), (435, 650), (435, 700), (300, 840), (230, 830)], fill=185)
g.rectangle([185, 660, 320, 830], fill=190)
# primer plano: sillas izq., mesa dcha., copas
g.rectangle([0, 690, 215, H], fill=235)
g.polygon([(300, 1020), (330, 900), (520, 790), (765, 800), (765, 1020)], fill=250)
g.rectangle([585, 720, 700, 1000], fill=225)
d = d.filter(ImageFilter.GaussianBlur(9))
d.save("public/tour/sala-depth.png")
