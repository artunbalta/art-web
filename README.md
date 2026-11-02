# Artun Balta: piksel bir dünya

Kişisel portfolyo, ama yürüyerek geziliyor. Ankara → İstanbul → (Spike Train ile) Londra.
Görsel dosya yok. Her piksel kodla çiziliyor. Ses dosyası yok, sesler WebAudio ile sentezleniyor. Build adımı ve bağımlılık da yok.

## Açmak

- `index.html` dosyasına çift tıkla. Bu kadar.
- Ya da yerel sunucuyla: `python3 -m http.server` → http://localhost:8000

## Yayınlamak

Statik bir site, olduğu gibi yüklenir:
- **GitHub Pages:** repoya at, Settings → Pages → `main` / root.
- **Netlify / Vercel:** klasörü sürükle-bırak, build komutu yok.

## Nereyi düzenlemeli?

| Dosya | İçinde ne var |
|---|---|
| `js/content.js` | **Bütün metinler.** CV verisi, paneller, stand-up esprileri, balık avından çıkanlar, kokteyl partisi, ipuçları, sır listesi |
| `js/world.js` | Harita (adalar, yollar, platolar) ve her bina/obje/NPC'nin yeri |
| `js/eggs.js` | Etkileşimler ve mini oyunlar (MRI, zihin okuyucu, Jenga, radar, 2-back, at yarışı, tren…) |
| `js/chars.js` | Karakterler. Artun'un görünüşü `LOOKS.artun` içinde (saç, ten, kıyafet renkleri) |
| `js/art-buildings.js`, `js/art-props.js` | Binalar ve objeler, hepsi kodla çiziliyor |
| `js/terrain.js` | Zemin ressamı (kıyılar, su derinliği, uçurumlar) |
| `js/game.js` | Motor: kamera, çarpışma, dokunarak yürüme, gece/gündüz, Londra yağmuru |
| `css/style.css` | Arayüz (diyalog, paneller, harita, CV modu) |
| `assets/Artun_Balta_CV.pdf` | İndirilebilir CV |

İlerleme (bulunan sırlar vb.) ziyaretçinin tarayıcısında `localStorage`'da tutuluyor.
Sıfırlamak için konsolda: `localStorage.clear()`.

## Kontroller

- **WASD / oklar:** yürü (Shift ile koş) · **E / Space / Enter:** etkileşim · **M:** harita + hızlı seyahat
- **Telefon:** gitmek istediğin yere ya da objeye dokun
- **CV** butonu: sade, eksiksiz CV sayfası (işe alımcılar için) + PDF

## Sırlar (spoiler!)

<details><summary>33 sırrın hepsi</summary>

| Sır | Nerede |
|---|---|
| Paşa approves | Evin önünde oturan Paşa'yı sev. Seni her yere takip eder (martıya da havlar) |
| The family axe | Bahçedeki kütükte saplı balta |
| Time flies | Çeşmenin sağındaki bankta otur (gündüz → gece) |
| Fed by teyze | Teyzeyle üç kere konuş |
| Mathématiques Sans Frontières | Lycée önündeki kara tahta |
| Drew a mentor | Bilkent önündeki dev Scrollio telefonu: bir mentor çiz, dünyaya çıksın |
| Polished the trophy | Bilkent önündeki kupa |
| Gravity, applied | Fizik labının yanındaki elma ağacını salla |
| Constant false alarm rate | ASELSAN: önce bekçiyle konuş, sonra radar (bulunmamış sırları gösterir) |
| Brain scan: unremarkable | Lab Garden'daki MRI |
| Met your echo | Lab Garden'ın en altındaki echo kapısı: seni Bayesyen olarak modelliyor, sonra 'echo'n peşinden yürüyor |
| Mind, read (46%) | EEG zihin okuyucu |
| Contact-rich failure | Jenga robotu kuleyi devirene kadar oynat |
| Reaction time | M0+ arcade |
| Real or synthetic? | Portre şövalesi |
| Ask the X-ray | Röntgen ışıklığı |
| Conductive hair | Tesla bobinine dokun |
| Cognitive workload | Boğaziçi MIMLAB önündeki terminal (2-back testi, d′ hesaplar) |
| Persistence noted | GirVak piyango makinesini 4 kere çevir |
| Tavşan kanı | Çay bahçesinde çay |
| İstanbul tax | Simitçiden simit al, denize yaklaş (martı) |
| Rastgele | İskeledeki balıkçı |
| Message in a bottle | Kayıkla Manş'taki adaya git |
| Rode the spike train | İstanbul garındaki kondüktör |
| Cocktail party effect | Imperial çimindeki partide birinin yanında dur |
| Westminster quarters | Saat kulesi (Londra'nın gerçek saatini gösterir) |
| 10:10 | Escapement & Sons saatçisi |
| Tight five | The Refractory Period önünde 5 espri dinle |
| Dormant lead, re-engaged | Londra'daki kırmızı telefon kulübesini aç (arayan Voli) |
| Beat the form model | Hipodromda bahis yap ve kazan |
| Diplomatic incident | Londra'da sütlü çay iç |
| Chief Mouser (Acting) | Saat kulesinin yanındaki kara kedi |
| ↑↑↓↓←→←→BA | Konami kodu (herkese parti şapkası) |

Ekstralar: volina.'nın önünde maskot Voli duruyor. Dünyada yürürken `hire` yaz, CV açılır. Tarayıcı konsolunu açan geliştiricilere bir mesaj var. Gece/gündüz ziyaretçinin yerel saatine göre değişiyor.
</details>
