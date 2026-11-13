'use strict';
/* =====================================================================
   content.js — every word in the world lives here.
   Edit freely: the CV data feeds both the in-world panels and the
   plain "recruiter mode" page. L('English', 'Türkçe') picks the language.
   ===================================================================== */

const ME = {
  name: 'Artun Balta',
  title: L('Electrical & electronics engineer · neural signal processing · applied ML', 'Elektrik-elektronik mühendisi · nöral sinyal işleme · uygulamalı makine öğrenmesi'),
  city: L('London (via Ankara)', 'Londra (Ankara üzerinden)'),
  email: 'artun.balta@outlook.com',
  github: 'https://github.com/artunbalta',
  linkedin: 'https://linkedin.com/in/artunbalta',
  volina: 'https://volina.ai',
  echo: 'https://echovirtualworld.com',
  scrollio: 'https://scrollio.co',
  chalk: 'https://educhalk.com',
  cv:'assets/Artun_Balta_CV.pdf',
};

const CV = {
  profile: L('Electrical and electronics engineer working at the intersection of neural signal processing and applied machine learning. MRes Neurotechnology researcher at Imperial College London, decoding auditory attention from single-neuron recordings, and co-founder of a funded AI voice-agent company with a shipped product and five clinic pilots.',
    'Nöral sinyal işleme ile uygulamalı makine öğrenmesinin kesişiminde çalışan elektrik-elektronik mühendisi. Imperial College London’da MRes Nöroteknoloji araştırmacısı olarak tekil nöron kayıtlarından işitsel dikkati çözümlüyor; yatırım almış, ürününü yayına almış ve beş klinikte pilot yürütmüş bir yapay zekâ sesli ajan şirketinin kurucu ortağı.'),
  education: [
    { id: 'imperial', org: 'Imperial College London', role: L('MRes Neurotechnology', 'MRes, Nöroteknoloji'), where: L('London, UK', 'Londra, Birleşik Krallık'), when: '2026 – 2027',
      points: L(['Thesis (supervisor: Dr. Andriy Kozlov): <em>Auditory Attention Decoding — Adapting Dynamic Spectrotemporal Receptive Fields to Single-Neuron Spike Recordings.</em> Extends deep-network dSTRF estimation from population-level ECoG to single-unit spike trains, introducing Poisson likelihood formulations and sparsity handling to characterise nonlinear tuning in the auditory pathway.'],
        ['Tez (danışman: Dr. Andriy Kozlov): <em>Auditory Attention Decoding — Adapting Dynamic Spectrotemporal Receptive Fields to Single-Neuron Spike Recordings.</em> Derin ağ tabanlı dSTRF kestirimini popülasyon düzeyindeki ECoG kayıtlarından tekil nöron spike dizilerine genişletiyor; işitsel yolaktaki doğrusal olmayan ayarlanmayı karakterize etmek için Poisson olabilirlik formülasyonları ve seyreklik yönetimi getiriyor.']) },
    { id: 'bilkent', org: L('İhsan Doğramacı Bilkent University', 'İhsan Doğramacı Bilkent Üniversitesi'), role: L('B.Sc. Electrical and Electronics Engineering', 'Lisans, Elektrik ve Elektronik Mühendisliği'), where: 'Ankara, Türkiye', when: '2021 – 2026',
      points: L(['<b>1st Place</b> (12 teams), Graduation Project Competition — with <a href="https://scrollio.co" target="_blank" rel="noopener">Scrollio</a>', '<b>2nd Place</b> (45 teams), Bilkentpreneurs Challenge 2026, with <a href="https://educhalk.com" target="_blank" rel="noopener">Chalk</a> — $3,000 in prize funding', 'Bilkent Entrepreneurship Award'],
        ['<b>Birincilik</b> (12 takım), Bitirme Projesi Yarışması — <a href="https://scrollio.co" target="_blank" rel="noopener">Scrollio</a> ile', '<b>İkincilik</b> (45 takım), Bilkentpreneurs Challenge 2026 — <a href="https://educhalk.com" target="_blank" rel="noopener">Chalk</a> ile, 3.000 dolar ödül fonu', 'Bilkent Girişimcilik Ödülü']) },
    { id: 'lycee', org: 'Lycée Tevfik Fikret', role: L('High School, Mathematics & Sciences', 'Lise, Matematik ve Fen Bilimleri'), where: 'Ankara, Türkiye', when: '2010 – 2021',
      points: L(['High Honour graduate on academic scholarship', 'Top 0.2% nationally in the YKS 2021 entrance exam, among 3M+ candidates', '<b>2nd Place</b>, Mathématiques Sans Frontières'],
        ['Akademik bursla, yüksek onur derecesiyle mezuniyet', 'YKS 2021’de 3 milyonu aşkın aday arasında Türkiye genelinde ilk %0,2', '<b>İkincilik</b>, Mathématiques Sans Frontières']) },
  ],
  projects: [
    { id: 'mri', name: L('Parallel MRI Reconstruction: Kernel Geometry under Anisotropic Sampling', 'Paralel MRI Rekonstrüksiyonu: Anizotropik Örnekleme Altında Çekirdek Geometrisi'),
      points: L(['Gained <b>0.65 dB</b> and matched — with <b>11</b> calibration taps — the reconstruction quality the standard rule needed <b>19</b> taps to reach, by deriving the kernel-support rule from acquisition physics rather than an arbitrary index-space convention. Validated across <b>8,947</b> paired reconstructions against an exact null control.',
        'Showed that a published kernel-shape equivalence breaks down on anisotropic acquisition grids, and exposed a fault in the reference pipeline that invalidated <b>27 of 36</b> cells in the comparison it was built to support.'],
        ['Çekirdek destek kuralını keyfi bir indeks uzayı konvansiyonu yerine görüntü edinim fiziğinden türeterek <b>0,65 dB</b> kazanç sağladım; standart kuralın ancak <b>19</b> kalibrasyon katsayısıyla ulaştığı rekonstrüksiyon kalitesini <b>11</b> katsayıyla yakaladım. Sonuçları, kesin bir null kontrolüne karşı <b>8.947</b> eşleştirilmiş rekonstrüksiyonla doğruladım.',
        'Yayımlanmış bir çekirdek şekli denkliğinin anizotropik edinim ızgaralarında geçerliliğini yitirdiğini gösterdim; referans işlem hattında, desteklemek için kurulduğu karşılaştırmadaki <b>36 hücrenin 27’sini</b> geçersiz kılan bir hatayı ortaya çıkardım.']) },
    { id: 'eeg', name: L('Decoding Imagined Speech from Non-Invasive EEG', 'Girişimsel Olmayan EEG’den Hayal Edilen Konuşmanın Çözümlenmesi'),
      points: L(['Reached <b>46%</b> cross-validated accuracy against a <b>25%</b> chance baseline. Built a kernel SVM with sequential minimal optimisation, Bayesian logistic regression and an EEGNet-class convolutional network from first principles in NumPy, hand-deriving every gradient with no autograd.',
        'A cross-corpus control isolated the near-chance ceiling as a property of the dataset rather than the pipeline.'],
        ['<b>%25</b> şans düzeyine karşı <b>%46</b> çapraz doğrulama doğruluğuna ulaştım. Sıralı minimal optimizasyonlu (SMO) çekirdek SVM, Bayesçi lojistik regresyon ve EEGNet sınıfı bir evrişimli ağı NumPy’da sıfırdan kurdum; autograd kullanmadan tüm gradyanları elle türettim.',
        'Derlemler arası bir kontrol deneyi, şans düzeyine yakın tavanın işlem hattından değil veri setinin kendisinden kaynaklandığını ortaya koydu.']) },
    { id: 'jenga', name: L('Autonomous Jenga-Playing Robot', 'Otonom Jenga Oynayan Robot'),
      points: L(['Hierarchical control stack coupling a learned discrete block-selection policy to an optimisation-based motion planner, bridging reinforcement learning and continuous trajectory synthesis for contact-rich manipulation.'],
        ['Öğrenilmiş ayrık bir blok seçim politikasını optimizasyon tabanlı bir hareket planlayıcıya bağlayan hiyerarşik kontrol yapısı; temas yoğun manipülasyon için pekiştirmeli öğrenme ile sürekli yörünge sentezini bir araya getiriyor.']) },
    { id: 'scrollio', name: L('Scrollio — graduation project', 'Scrollio — bitirme projesi'), link: 'https://scrollio.co',
      points: L(['<b>Turn scrolling into learning.</b> An AI-powered learning playground that borrows the pull of short-video feeds for education.',
        '<b>Scrollio Kids:</b> drawing is the first interface — a child draws a mentor, and Scrollio turns the drawing into one. <b>Scrollio Core:</b> a feed of short clips, because one short clip can land harder than a long lecture.',
        '<b>1st place</b> among 12 teams at Bilkent’s Graduation Project Competition.'],
        ['<b>Kaydırmayı öğrenmeye dönüştür.</b> Kısa video akışlarının çekim gücünü eğitime taşıyan, yapay zekâ destekli bir öğrenme alanı.',
        '<b>Scrollio Kids:</b> ilk arayüz çizim — çocuk bir mentor çiziyor, Scrollio da o çizimi gerçek bir mentora dönüştürüyor. <b>Scrollio Core:</b> kısa kliplerden oluşan bir akış; çünkü kısa bir klip bazen uzun bir dersten çok daha akılda kalıcı.',
        'Bilkent Bitirme Projesi Yarışması’nda 12 takım arasında <b>birincilik</b>.']) },
    { id: 'echo', name: L('echo — side project', 'echo — yan proje'), link: 'https://echovirtualworld.com',
      points: L(['<b>A world that learns you.</b> An open world that reads human intention from play alone: every move a player makes is recorded and folded into a Bayesian model, until the world has their <em>echo</em>.',
        '“A living world. A place of your own.”'],
        ['<b>Seni öğrenen bir dünya.</b> İnsan niyetini yalnızca oyundan okuyan bir açık dünya: oyuncunun her hareketi kaydedilip Bayesçi bir modele işleniyor, ta ki dünya onun <em>yankısına</em> (echo) sahip olana dek.',
        '“Yaşayan bir dünya. Sana ait bir yer.”']) },
    { id: 'more', name: L('Further coursework projects', 'Diğer ders projeleri'),
      points: L(['Medical visual question answering by low-rank adaptation (LoRA) of a vision-language model', 'Convolutional classifier built from scratch to discriminate real from synthetic faces', 'FPGA colour-sensing joint controller in VHDL', 'ARM Cortex-M0+ interactive embedded system', 'Tesla coil, and a JFET high-impedance probe for non-contact electric-field measurement'],
        ['Bir görüntü-dil modelinin düşük ranklı adaptasyonuyla (LoRA) tıbbi görsel soru yanıtlama', 'Gerçek ve sentetik yüzleri ayırt etmek için sıfırdan kurulan evrişimli sınıflandırıcı', 'VHDL ile renk algılayan FPGA tabanlı eklem kontrolcüsü', 'ARM Cortex-M0+ tabanlı etkileşimli gömülü sistem', 'Tesla bobini ve temassız elektrik alanı ölçümü için JFET’li yüksek empedanslı prob']) },
  ],
  experience: [
    { id: 'volina', org: 'volina.', role: L('Co-Founder', 'Kurucu Ortak'), where: 'Ankara, Türkiye', when: L('2025 – present', '2025 – günümüz'), link: 'https://volina.ai',
      points: L(['AI voice-agent platform for Turkish health-tourism dental clinics, re-engaging dormant international leads with agents that profile callers in real time and adapt tone, objection handling and pacing mid-conversation.',
        'Delivered <b>five clinic pilots</b> covering roughly <b>40,000 leads</b>, raising the conversion rate to approximately <b>5.4%</b>, with KVKK and GDPR-compliant call handling and consent capture built into the platform.'],
        ['Türkiye’deki sağlık turizmi odaklı diş klinikleri için yapay zekâ sesli ajan platformu: arayanın profilini gerçek zamanlı çıkaran, konuşma sırasında ses tonunu, itiraz yönetimini ve konuşma temposunu uyarlayan ajanlarla pasif kalmış uluslararası potansiyel müşterileri yeniden kazanıyor.',
        'Yaklaşık <b>40.000 potansiyel müşteriyi</b> kapsayan <b>beş klinik pilotu</b> hayata geçirerek dönüşüm oranını yaklaşık <b>%5,4</b>’e çıkardım; KVKK ve GDPR uyumlu çağrı yönetimi ile onay alma süreçleri platforma yerleşik.']) },
    { id: 'mimlab', org: L('Boğaziçi University MIMLAB', 'Boğaziçi Üniversitesi MIMLAB'), role: L('Volunteer Researcher', 'Gönüllü Araştırmacı'), where: 'İstanbul, Türkiye', when: '2025 – 2026',
      points: L(['Multimodal EEG preprocessing and classification: adaptive filtering against physiological reference channels, artefact evaluation, ERP extraction from n-back tasks, and machine-learning models for cognitive-workload state classification.'],
        ['Çok modlu EEG ön işleme ve sınıflandırma: fizyolojik referans kanallarına karşı uyarlamalı filtreleme, artefakt değerlendirmesi, n-back görevlerinden ERP çıkarımı ve bilişsel iş yükü durumunun sınıflandırılması için makine öğrenmesi modelleri.']) },
    { id: 'aselsan', org: 'ASELSAN', role: L('Radar Systems Engineering Intern', 'Radar Sistemleri Mühendislik Stajyeri'), where: 'Ankara, Türkiye', when: L('July – August 2024', 'Temmuz – Ağustos 2024'),
      points: L(['Signal-processing optimisation for airborne radar systems: CFAR detection, pulse compression and pulse integration, improving detection accuracy and range through SNR enhancement.'],
        ['Hava platformlu radar sistemleri için sinyal işleme optimizasyonu: CFAR tespiti, darbe sıkıştırma ve darbe entegrasyonu; SNR iyileştirmesiyle tespit doğruluğunu ve menzili artırma.']) },
    { id: 'girvak', org: L('Turkish Entrepreneurship Foundation (GirVak)', 'Girişimcilik Vakfı (GirVak)'), role: 'Fellow', where: 'İstanbul, Türkiye', when: '2023 – 2026',
      points: L(['One of <b>28 Fellows</b> selected from <b>154,558</b> applicants to Türkiye’s leading entrepreneurship programme; previously one of 100 Challengers selected from 149,766 applicants.'],
        ['Türkiye’nin önde gelen girişimcilik programına başvuran <b>154.558</b> kişi arasından seçilen <b>28 Fellow</b>’dan biri; daha önce de 149.766 başvuru arasından seçilen 100 Challenger’dan biri.']) },
    { id: 'ta', org: L('Bilkent University Physics Laboratory', 'Bilkent Üniversitesi Fizik Laboratuvarı'), role: L('Teaching Assistant', 'Ders Asistanı'), where: 'Ankara, Türkiye', when: '2023 – 2024',
      points: L(['Teaching assistant for PHYS102 (General Physics II) and laboratory tutor for PHYS101 (General Physics I).'],
        ['PHYS102 (Genel Fizik II) dersinde asistanlık ve PHYS101 (Genel Fizik I) dersinde laboratuvar eğitmenliği.']) },
  ],
  skills: [
    [L('Programming', 'Programlama'), 'Python (NumPy, SciPy, PyTorch, scikit-learn, MNE, pandas), MATLAB, C, C++, JavaScript/TypeScript, VHDL'],
    [L('Methods', 'Yöntemler'), L('Neural signal processing (EEG, ECoG, ERP, spike trains), Bayesian inference, Monte Carlo simulation, deep learning, parallel MRI reconstruction, LLM fine-tuning (LoRA)', 'Nöral sinyal işleme (EEG, ECoG, ERP, spike dizileri), Bayesçi çıkarım, Monte Carlo simülasyonu, derin öğrenme, paralel MRI rekonstrüksiyonu, LLM ince ayarı (LoRA)')],
    [L('Tools', 'Araçlar'), 'Git, Docker, LTspice, LaTeX'],
    [L('Languages', 'Diller'), L('Turkish (native) · English (IELTS Academic 7.5) · French (DELF B2)', 'Türkçe (ana dil) · İngilizce (IELTS Academic 7.5) · Fransızca (DELF B2)')],
    [L('Interests', 'İlgi alanları'), L('Stand-up comedy, mechanical watches, quantitative horse-racing form modelling', 'Stand-up, mekanik saatler, at yarışları için nicel form modellemesi')],
  ],
};

/* ---------- panel builders ---------- */
const byId = (list, id) => list.find(e => e.id === id);
function entryHTML(e, extra = '') {
  return `<div class="meta"><span>${e.role || ''}</span><span>${e.where} · ${e.when}</span></div>
    <ul>${e.points.map(p => `<li>${p}</li>`).join('')}</ul>${extra}`;
}
function projectHTML(p, extra = '') { return `<ul>${p.points.map(x => `<li>${x}</li>`).join('')}</ul>${extra}`; }
const aside = (t) => `<p class="aside">${t}</p>`;

const PANELS = {
  home: () => ({
    kicker: L('Home · Ankara', 'Ev · Ankara'), title: ME.name, accent: 'teal',
    body: `<p class="lead">${CV.profile}</p>
      ${L(`<p>Grew up in Ankara, studied electrical engineering, fell into brains, and moved to London in September 2026. I like problems where the data is noisy and the answer is hiding in it.</p>
      <p>When I’m not doing that: <a href="${ME.echo}" target="_blank" rel="noopener">echo</a>, a world that learns you — and my graduation project, <a href="${ME.scrollio}" target="_blank" rel="noopener">Scrollio</a>, which turns scrolling into learning.</p>`,
      `<p>Ankara’da büyüdüm, elektrik mühendisliği okudum, yolum beyinlere düştü ve Eylül 2026’da Londra’ya taşındım. Verinin gürültülü olduğu, cevabın da o gürültünün içinde saklandığı problemleri seviyorum.</p>
      <p>Bunlarla uğraşmadığım zamanlarda: seni öğrenen bir dünya olan <a href="${ME.echo}" target="_blank" rel="noopener">echo</a> — ve kaydırmayı öğrenmeye dönüştüren bitirme projem <a href="${ME.scrollio}" target="_blank" rel="noopener">Scrollio</a>.</p>`)}
      <div class="facts">
        <div><b>${L('Now', 'Şu an')}</b><span>${L('MRes Neurotechnology, Imperial', 'MRes Nöroteknoloji, Imperial')}</span></div>
        <div><b>${L('Building', 'Projeler')}</b><span>${L('volina. (co-founder) · echo', 'volina. (kurucu ortak) · echo')}</span></div>
        <div><b>${L('Speaks', 'Diller')}</b><span>${L('Turkish · English · French', 'Türkçe · İngilizce · Fransızca')}</span></div>
        <div><b>${L('Off-duty', 'Mesai dışı')}</b><span>${L('stand-up, watches, horses (in spreadsheets)', 'stand-up, saatler, atlar (Excel tablolarında)')}</span></div>
      </div>
      ${linksHTML()}
      ${aside(L('This house is mostly door. Everything else is outside — go poke at it.', 'Bu ev büyük ölçüde kapıdan ibaret. Geri kalan her şey dışarıda — git, kurcala.'))}`,
  }),
  contact: () => ({
    kicker: L('Mailbox', 'Posta kutusu'), title: L('Write to Artun', 'Artun’a yaz'), accent: 'blue',
    body: `<p class="lead">${L('The flag is up. That means I’d genuinely like to hear from you — research, startups, a good joke, a watch recommendation.', 'Bayrak kalkık. Yani senden gerçekten haber almak isterim — araştırma, girişimler, iyi bir espri, bir saat önerisi.')}</p>${linksHTML(true)}`,
  }),
  skills: () => ({
    kicker: L('The Tool Shed', 'Alet Kulübesi'), title: L('Skills & languages', 'Yetenekler ve diller'), accent: 'brown',
    body: `<dl class="skills">${CV.skills.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>${aside(L('Every tool on the wall has been used in anger at least once. The soldering iron twice.', 'Duvardaki her alet en az bir kez ciddi ciddi kullanıldı. Havya iki kez.'))}`,
  }),
  imperial: () => ({ kicker: L('South Kensington · now', 'South Kensington · şimdi'), title: 'Imperial College London', accent: 'navy',
    body: `<p class="lead">${L('Picture a loud party. Somehow your brain locks onto one voice and turns the rest into soup. My thesis asks how single neurons in the auditory pathway pull that off.', 'Gürültülü bir parti düşün. Beynin bir şekilde tek bir sese kilitlenir, gerisini çorbaya çevirir. Tezim, işitsel yolaktaki tekil nöronların bunu nasıl başardığını soruyor.')}</p>${entryHTML(byId(CV.education, 'imperial'))}${aside(L('Stand next to someone at the party on the lawn. Watch what happens to the other voices.', 'Çimenlikteki partide birinin yanında dur. Diğer seslere ne olduğunu izle.'))}` }),
  bilkent: () => ({ kicker: L('School Hill · 2021–2026', 'Okul Tepesi · 2021–2026'), title: L('Bilkent University · EEE', 'Bilkent Üniversitesi · EEE'), accent: 'brick', body: entryHTML(byId(CV.education, 'bilkent')) + aside(L('The trophy outside is real-ish. The cheque is definitely too big to cash.', 'Dışarıdaki kupa gerçek sayılır. Çek ise bozdurulamayacak kadar büyük, orası kesin.')) }),
  lycee: () => ({ kicker: L('School Hill · 2010–2021', 'Okul Tepesi · 2010–2021'), title: 'Lycée Tevfik Fikret', accent: 'blue', body: entryHTML(byId(CV.education, 'lycee')) + aside(L('Eleven years at a French lycée in Ankara. Hence the DELF B2, and the strong opinions about croissants.', 'Ankara’da bir Fransız lisesinde on bir yıl. DELF B2 de oradan, kruvasan konusundaki kesin görüşler de.')) }),
  ta: () => ({ kicker: L('School Hill · 2023–2024', 'Okul Tepesi · 2023–2024'), title: L('Physics Lab · Teaching Assistant', 'Fizik Laboratuvarı · Ders Asistanı'), accent: 'blue', body: entryHTML(byId(CV.experience, 'ta')) + aside(L('Most-asked question: “Is this on the exam?” Answer, every time: gravity is on every exam. You’re taking it right now.', 'En çok sorulan soru: “Hocam bu sınavda çıkar mı?” Cevap hep aynı: yer çekimi her sınavda çıkar. Şu an da ondan sınav oluyorsun.')) }),
  volina: () => ({ kicker: L('Work Street · 2025–now', 'İş Sokağı · 2025–bugün'), title: 'volina.', accent: 'violet', body: entryHTML(byId(CV.experience, 'volina'), `<p><a href="${ME.volina}" target="_blank" rel="noopener">volina.ai ↗</a></p>`) + aside(L('Voli, our mascot, is standing outside. If a phone rings somewhere in London, that’s probably Voli too.', 'Maskotumuz Voli dışarıda duruyor. Londra’da bir yerde telefon çalıyorsa, büyük ihtimalle o da Voli’dir.')) }),
  scrollio: () => ({ kicker: L('School Hill · graduation project', 'Okul Tepesi · bitirme projesi'), title: 'Scrollio', accent: 'gold', body: projectHTML(byId(CV.projects, 'scrollio'), `<p><a href="${ME.scrollio}" target="_blank" rel="noopener">scrollio.co ↗</a></p>`) + aside(L('The giant phone outside lets you draw a mentor. It moves in next to the phone.', 'Dışarıdaki dev telefonda bir mentor çizebilirsin. Çizdiğin mentor telefonun yanına taşınıyor.')) }),
  chalk: () => ({ kicker: L('School Hill · Bilkentpreneurs 2026', 'Okul Tepesi · Bilkentpreneurs 2026'), title: 'Chalk', accent: 'green',
    body: L(`<p class="lead">One lesson video in, a whole curriculum out, tailored to every student in the class.</p>
      <ul><li><b>Upload, and that’s it.</b> A teacher uploads a lesson they have already recorded, in any format. Nothing to install, nothing to integrate.</li>
      <li><b>Chalk does the rest.</b> It analyses the video in seconds and builds MEB-aligned lessons for beginner, intermediate and advanced students, then generates quizzes, summaries and practice so each student moves at their own pace.</li>
      <li><b>Made for schools in Türkiye:</b> KVKK-compliant, with data kept on servers in Türkiye, and already being trialled at leading schools.</li>
      <li>Won us <b>$3,000</b> in prize funding at the Bilkentpreneurs Challenge 2026. Hence the cheque.</li></ul>
      <p><a href="${ME.chalk}" target="_blank" rel="noopener">educhalk.com ↗</a></p>${aside('The motto, in Turkish: “Yorulmadan öğretin.” Teach without wearing yourself out.')}`,
      `<p class="lead">İçeri tek bir ders videosu girer, dışarı sınıftaki her öğrenciye göre uyarlanmış koca bir müfredat çıkar.</p>
      <ul><li><b>Yükle, o kadar.</b> Öğretmen daha önce kaydettiği bir dersi, hangi formatta olursa olsun yükler. Kurulacak bir şey yok, entegre edilecek bir şey yok.</li>
      <li><b>Gerisini Chalk halleder.</b> Videoyu saniyeler içinde analiz eder; başlangıç, orta ve ileri seviyedeki öğrenciler için MEB müfredatıyla uyumlu dersler hazırlar, ardından her öğrenci kendi hızında ilerlesin diye testler, özetler ve alıştırmalar üretir.</li>
      <li><b>Türkiye’deki okullar için tasarlandı:</b> KVKK uyumlu, veriler Türkiye’deki sunucularda tutuluyor ve önde gelen okullarda şimdiden deneniyor.</li>
      <li>Bilkentpreneurs Challenge 2026’da bize <b>3.000 dolar</b> ödül fonu kazandırdı. Çek de oradan.</li></ul>
      <p><a href="${ME.chalk}" target="_blank" rel="noopener">educhalk.com ↗</a></p>${aside('Sloganı: “Yorulmadan öğretin.” Adı üstünde.')}`) }),
  echo: () => ({ kicker: L('Lab Garden · side project', 'Lab Bahçesi · yan proje'), title: 'echo', accent: 'violet', body: projectHTML(byId(CV.projects, 'echo'), `<p><a href="${ME.echo}" target="_blank" rel="noopener">echovirtualworld.com ↗</a></p>`) + aside(L('This little world has been doing a tiny version of the same thing to you since you arrived. Step through the doorway.', 'Bu küçük dünya, geldiğinden beri sana bunun minicik bir versiyonunu yapıyor. Kapı aralığından geç.')) }),
  aselsan: () => ({ kicker: L('Work Street · summer 2024', 'İş Sokağı · 2024 yazı'), title: L('ASELSAN · Radar Intern', 'ASELSAN · Radar Stajyeri'), accent: 'navy', body: entryHTML(byId(CV.experience, 'aselsan')) + aside(L('The radar in the yard still works. Ask the guard nicely.', 'Bahçedeki radar hâlâ çalışıyor. Bekçiden kibarca rica et.')) }),
  mimlab: () => ({ kicker: L('Boğaziçi Hill · 2025–2026', 'Boğaziçi Tepesi · 2025–2026'), title: 'Boğaziçi MIMLAB', accent: 'red', body: entryHTML(byId(CV.experience, 'mimlab')) + aside(L('There’s a workload test at the terminal by the door. Your brain will hate it.', 'Kapının yanındaki terminalde bir iş yükü testi var. Beynin bundan nefret edecek.')) }),
  girvak: () => ({ kicker: L('İstanbul · 2023–2026', 'İstanbul · 2023–2026'), title: 'GirVak Fellowship', accent: 'gold', body: entryHTML(byId(CV.experience, 'girvak')) + aside(L('28 out of 154,558 is 0.018%. The lottery machine outside has better odds. Slightly.', '154.558 kişide 28, yani %0,018. Dışarıdaki piyango makinesinin şansı daha yüksek. Azıcık.')) }),
  mri: () => ({ kicker: L('Lab Garden · research', 'Lab Bahçesi · araştırma'), title: L('Parallel MRI reconstruction', 'Paralel MRI rekonstrüksiyonu'), accent: 'teal', body: projectHTML(byId(CV.projects, 'mri')) }),
  eeg: () => ({ kicker: L('Lab Garden · research', 'Lab Bahçesi · araştırma'), title: L('Imagined speech from EEG', 'EEG’den hayal edilen konuşma'), accent: 'violet', body: projectHTML(byId(CV.projects, 'eeg')) }),
  jenga: () => ({ kicker: L('Lab Garden · robotics', 'Lab Bahçesi · robotik'), title: L('Autonomous Jenga robot', 'Otonom Jenga robotu'), accent: 'brown', body: projectHTML(byId(CV.projects, 'jenga')) }),
  more: () => ({ kicker: L('Lab Garden · coursework', 'Lab Bahçesi · ders projeleri'), title: L('More things I built', 'Yaptığım diğer şeyler'), accent: 'teal', body: projectHTML(byId(CV.projects, 'more')) + aside(L('Most of these are standing around this garden. The Tesla coil bites.', 'Çoğu bu bahçede bir yerlerde duruyor. Tesla bobini ısırır.')) }),
  comedy: () => ({ kicker: L('Interest #1', 'İlgi alanı #1'), title: L('Stand-up comedy', 'Stand-up'), accent: 'violet', body: `<p class="lead">${L('A room full of strangers, five minutes, no slides. Turns out it’s the best training for explaining neuroscience at parties.', 'Bir oda dolusu yabancı, beş dakika, slayt yok. Meğer partilerde nörobilim anlatmanın en iyi antrenmanıymış.')}</p>` }),
  watches: () => ({ kicker: L('Interest #2', 'İlgi alanı #2'), title: L('Mechanical watches', 'Mekanik saatler'), accent: 'gold', body: `<p class="lead">${L('A balance wheel beating 28,800 times an hour, no battery, a few seconds of drift a day. Strictly worse than a phone. Strictly better than a phone.', 'Saatte 28.800 kez atan bir balans çarkı, pil yok, günde birkaç saniye sapma. Telefondan kesinlikle daha kötü. Telefondan kesinlikle daha iyi.')}</p>` }),
  horses: () => ({ kicker: L('Interest #3', 'İlgi alanı #3'), title: L('Quantitative form modelling', 'Nicel form modellemesi'), accent: 'green', body: `<p class="lead">${L('Racing form is a gloriously messy dataset: tiny samples, hidden state, and a target that occasionally eats a sandwich. Bayesian priors and Monte Carlo help. The horse still doesn’t care.', 'At yarışı formu muhteşem derecede dağınık bir veri seti: minicik örneklemler, gizli durumlar ve arada bir sandviç yiyen bir hedef değişken. Bayesçi önseller ve Monte Carlo işe yarıyor. At yine de umursamıyor.')}</p>` }),
};
function linksHTML(big) {
  return `<div class="links${big ? ' big' : ''}">
    <a href="mailto:${ME.email}">✉ ${ME.email}</a>
    <a href="${ME.github}" target="_blank" rel="noopener">GitHub ↗</a>
    <a href="${ME.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
    <a href="${ME.cv}" target="_blank" rel="noopener">CV (PDF) ↓</a>
  </div>`;
}

/* ---------- secrets ---------- */
const SECRETS = {
  pasa: L('Paşa approves', 'Paşa onaylıyor'), balta: L('The family axe', 'Aile yadigârı balta'), bench: L('Time flies', 'Zaman uçup gidiyor'), zap: L('Conductive hair', 'İletken saçlar'),
  mri: L('Brain scan: unremarkable', 'Beyin MR’ı: özellik yok'), mind: L('Mind, read (46%)', 'Akıl okundu (%46)'), jenga: L('Contact-rich failure', 'Temas yoğun başarısızlık'), arcade: L('Reaction time', 'Tepki süresi'),
  faces: L('Real or synthetic?', 'Gerçek mi sentetik mi?'), xray: L('Ask the X-ray', 'Röntgene sor'), radar: L('Constant false alarm rate', 'Sabit yanlış alarm oranı'), apple: L('Gravity, applied', 'Uygulamalı yer çekimi'),
  msf: 'Mathématiques Sans Frontières', trophy: L('Polished the trophy', 'Kupayı parlattın'), nback: L('Cognitive workload', 'Bilişsel iş yükü'), lottery: L('Persistence noted', 'Azmin not edildi'),
  cay: 'Tavşan kanı', gull: L('İstanbul tax', 'İstanbul vergisi'), fish: 'Rastgele', island: L('Message in a bottle', 'Şişedeki mesaj'), train: L('Rode the spike train', 'Spike trenine bindin'),
  party: L('Cocktail party effect', 'Kokteyl partisi etkisi'), chime: L('Westminster quarters', 'Westminster çanları'), tenten: '10:10', comedy: L('Tight five', 'Kusursuz beş dakika'), volina: L('Dormant lead, re-engaged', 'Pasif müşteri geri kazanıldı'),
  race: L('Beat the form model', 'Form modelini yendin'), milktea: L('Diplomatic incident', 'Diplomatik kriz'), konami: '↑↑↓↓←→←→BA', teyze: L('Fed by teyze', 'Teyze seni doyurdu'), mouser: L('Chief Mouser (Acting)', 'Baş Fare Avcısı (Vekâleten)'),
  echo: L('Met your echo', 'Yankınla tanıştın'), mentor: L('Drew a mentor', 'Bir mentor çizdin'),
};

/* ---------- writing that isn't a CV ---------- */
const JOKES = L([
  'My thesis is auditory attention decoding — a machine that can tell who you’re actually listening to. My mum has had this technology since 1999.',
  'My startup builds AI agents that call people who stopped replying. My friends say I’ve finally found a way to scale my personality.',
  'I moved from Ankara to London. The weather’s basically the same. The only difference is the rain now has an accent.',
  'In London they put milk in tea. In Turkey, if you put milk in tea, the tea calls the police.',
  'I worked on radar. CFAR — Constant False Alarm Rate. It’s also how my mum calls me: steady, reliable, and every single one is a false alarm.',
  'I decoded imagined speech from EEG at 46% accuracy. Chance is 25%. So I can read your mind about as well as a coin with ambition.',
  'I built a neural network in NumPy and derived every gradient by hand. No autograd. Was it necessary? No. Was it character-building? Also no.',
  'In MRI you can skip half the measurements and reconstruct the rest. I tried that with my lecture notes. The professor called it “aliasing”.',
  'Top 0.2% in the national exam. Bottom 0.2% in parallel parking.',
  'I collect mechanical watches. Less accurate than my phone, more expensive than my phone, and they need winding. It’s not a hobby. It’s a hostage situation.',
  'I model horse races with Bayesian priors and Monte Carlo simulation. Net result: the horse doesn’t care.',
  'I study single neurons. They fire, they rest, they fire again for no clear reason. Honestly? Relatable.',
  'In Turkey, when a guest says “no thanks” to tea, that’s the opening bid.',
], [
  'Tezim işitsel dikkat çözümleme üzerine — aslında kimi dinlediğini anlayabilen bir makine. Annemde bu teknoloji 1999’dan beri var.',
  'Girişimim, cevap vermeyi bırakan insanları arayan yapay zekâ ajanları yapıyor. Arkadaşlarım nihayet kişiliğimi ölçeklemenin bir yolunu bulduğumu söylüyor.',
  'Ankara’dan Londra’ya taşındım. Hava aşağı yukarı aynı. Tek fark, yağmurun artık aksanı var.',
  'Londra’da çaya süt koyuyorlar. Türkiye’de çaya süt koyarsan, çay polisi arar.',
  'Radar üzerinde çalıştım. CFAR — Sabit Yanlış Alarm Oranı. Annemin beni arayışı da tam böyle: istikrarlı, güvenilir ve her biri yanlış alarm.',
  'EEG’den hayal edilen konuşmayı %46 doğrulukla çözdüm. Şans düzeyi %25. Yani aklını, hırslı bir yazı-tura parası kadar okuyabiliyorum.',
  'NumPy’da sıfırdan bir sinir ağı kurdum, her gradyanı elle türettim. Autograd yok. Gerekli miydi? Hayır. Karakter geliştirdi mi? O da hayır.',
  'MRI’da ölçümlerin yarısını atlayıp gerisini rekonstrükte edebilirsin. Bunu ders notlarımla denedim. Hoca buna “aliasing” dedi.',
  'Üniversite sınavında ilk %0,2. Paralel parkta son %0,2.',
  'Mekanik saat biriktiriyorum. Telefonumdan daha az doğru, telefonumdan daha pahalı ve bir de kurulmaları gerekiyor. Bu bir hobi değil. Bu bir rehine krizi.',
  'At yarışlarını Bayesçi önseller ve Monte Carlo simülasyonuyla modelliyorum. Net sonuç: at umursamıyor.',
  'Tekil nöronlar üzerine çalışıyorum. Ateşliyorlar, dinleniyorlar, belirgin bir sebep yokken yine ateşliyorlar. Açıkçası? Kendimi görüyorum.',
  'Türkiye’de misafir çaya “yok, sağ ol” diyorsa, bu pazarlığın açılış teklifidir.',
]);
// TR: the first item is sentence-initial and nominative, to fit “${what} yakaladın!”
const CATCHES = L([
  ['a fish', 'It’s a fish. Respect the classics.'],
  ['an old boot', 'Size 43. Not yours. Probably.'],
  ['a 2021 exam booklet', 'Top 0.2%. Someone dropped this on purpose.'],
  ['a mechanical watch', 'It’s still ticking. 28,800 beats an hour, underwater. Impressive.'],
  ['an EEG electrode', 'Still has gel on it. Put it back.'],
  ['a GRAPPA kernel', '11 taps. Physics-derived. Someone’s been here.'],
  ['a simit', 'Soggy. The seagulls will still fight you for it.'],
  ['nothing', 'The fish are in a meeting.'],
], [
  ['Bir balık', 'Balık bu. Klasiklere saygı.'],
  ['Eski bir bot', '43 numara. Senin değil. Herhalde.'],
  ['2021’den kalma bir sınav kitapçığı', 'İlk %0,2. Biri bunu bilerek düşürmüş.'],
  ['Mekanik bir saat', 'Hâlâ çalışıyor. Su altında, saatte 28.800 vuruş. Etkileyici.'],
  ['Bir EEG elektrodu', 'Üstünde hâlâ jel var. Geri koy.'],
  ['Bir GRAPPA çekirdeği', '11 katsayı. Fizikten türetilmiş. Buraya biri gelmiş.'],
  ['Bir simit', 'Sırılsıklam. Martılar yine de onun için seninle kavga eder.'],
  ['Koca bir hiç', 'Balıklar toplantıda.'],
]);
// clear: drawn in the pixel font, so capitals and plain punctuation only
const PARTY = L([
  { clear: '...SO I SAID THE STRF IS JUST A FANCY LINEAR FILTER. HE DID NOT LIKE THAT.', say: '…so I said the STRF is just a fancy linear filter. He did not like that.' },
  { clear: 'SPIKES ARE COUNTS! POISSON! I WILL DIE ON THIS HILL.', say: 'Spikes are counts! Poisson! I will die on this hill.' },
  { clear: 'YOUR BRAIN PICKS ONE VOICE OUT OF A CROWD. IT IS DOING IT RIGHT NOW.', say: 'You know your brain picks one voice out of a crowd? It’s doing it right now.' },
  { clear: 'MOSTLY I AM HERE FOR THE CANAPÉS.', say: 'Honestly? Mostly here for the canapés.' },
], [
  { clear: '...BEN DE STRF SÜSLÜ BİR DOĞRUSAL FİLTREDEN İBARET DEDİM. HİÇ HOŞUNA GİTMEDİ.', say: '…ben de STRF süslü bir doğrusal filtreden ibaret dedim. Hiç hoşuna gitmedi.' },
  { clear: 'SPIKE DEDİĞİN SAYIMDIR! POISSON! BU UĞURDA ÖLÜRÜM.', say: 'Spike dediğin sayımdır! Poisson! Bu uğurda ölürüm.' },
  { clear: 'BEYNİN KALABALIKTAN TEK BİR SESİ SEÇER. ŞU AN DA BUNU YAPIYOR.', say: 'Beynin kalabalıktan tek bir sesi seçiyor, biliyor muydun? Şu an da bunu yapıyor.' },
  { clear: 'AÇIKÇASI BEN KANAPELER İÇİN BURADAYIM.', say: 'Açıkçası? Ben daha çok kanapeler için buradayım.' },
]);
const MENTOR_FACTS = L([
  'Your brain runs on about 20 watts. A fridge light bulb uses more.',
  'You can’t tickle yourself. Your brain predicts the touch and turns it down.',
  'After a neuron fires, it needs a short rest before it can fire again. That pause is called the refractory period.',
  'An MRI scanner doesn’t take a photo. It listens to protons wobbling in a magnetic field.',
  'Octopuses keep most of their neurons in their arms.',
  'The cocktail party effect is why you hear your own name across a loud room.',
  'Every colour on a screen is just red, green and blue light, mixed.',
  'Sound travels about four times faster in water than in air.',
], [
  'Beynin yaklaşık 20 watt ile çalışır. Buzdolabının ampulü bile daha fazla harcar.',
  'Kendini gıdıklayamazsın. Beynin dokunuşu önceden tahmin edip etkisini kısar.',
  'Bir nöron ateşledikten sonra tekrar ateşleyebilmek için kısa bir molaya ihtiyaç duyar. Bu molaya refrakter dönem denir.',
  'MR cihazı fotoğraf çekmez. Manyetik alanda yalpalayan protonları dinler.',
  'Ahtapotlar nöronlarının çoğunu kollarında taşır.',
  'Gürültülü bir odanın öbür ucundan kendi adını duymanın sebebi kokteyl partisi etkisidir.',
  'Ekrandaki her renk aslında kırmızı, yeşil ve mavi ışığın karışımıdır.',
  'Ses suda, havadakinden yaklaşık dört kat daha hızlı yayılır.',
]);
const HINTS = L([
  'At the bottom of the Lab Garden there’s a doorway that has been watching you. Kindly.',
  'On School Hill there’s a phone the size of a person. Draw on it.',
  'The guard at ASELSAN will let you use the radar. It sees things you haven’t found yet.',
  'Somebody keeps calling the red phone box in London. Pick up.',
  'There’s a bench by the fountain. Sitting on it is… time-consuming.',
  'Never hold a simit near the sea in İstanbul.',
  'The island in the Channel isn’t on any tourist map. There’s a rowboat at the pier.',
  'Old video game codes still work in some places. ↑↑↓↓…',
  'The clock tower is real. As in, it shows the actual time in London right now.',
], [
  'Lab Bahçesi’nin en dibinde seni izleyen bir kapı aralığı var. İyi niyetle.',
  'Okul Tepesi’nde insan boyunda bir telefon var. Üstüne çiz.',
  'ASELSAN’daki bekçi radarı kullanmana izin verir. Radar, henüz bulmadığın şeyleri görür.',
  'Londra’daki kırmızı telefon kulübesini biri durmadan arıyor. Aç.',
  'Çeşmenin yanında bir bank var. Üstüne oturmak… epey zaman alıyor.',
  'İstanbul’da deniz kenarında asla elinde simit tutma.',
  'Manş’taki ada hiçbir turist haritasında yok. İskelede bir sandal var.',
  'Eski oyun şifreleri bazı yerlerde hâlâ çalışıyor. ↑↑↓↓…',
  'Saat kulesi gerçek. Yani şu an Londra’daki gerçek saati gösteriyor.',
]);
