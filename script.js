// === SETUP KANVAS ===
const canvas = document.getElementById('areaGame');
const ctx = canvas.getContext('2d');
function aturUkuran() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
aturUkuran();
window.addEventListener('resize', aturUkuran);

// === SUARA & AUDIO ===
const sfx = {
    hit: new Audio('assets/sounds/hit.mp3'),
    skor: new Audio('assets/sounds/score.mp3'),
    selesai: new Audio('assets/sounds/gameover.mp3')
};

// === VARIABEL UTAMA ===
let modeMain, levelGame, waktuMain = 60, gameJalan = false;
const kunci = {};

// === OBJEK PEMAIN & BOLA ===
const p1 = {
    x: 120, y: canvas.height/2 - 80, w: 90, h: 150,
    skor: 0, kecepatan: 6, warna: '#ff4757', bayang: '#8b0000'
};
const p2 = {
    x: canvas.width - 210, y: canvas.height/2 - 80, w: 90, h: 150,
    skor: 0, kecepatan: 6, warna: '#3742fa', bayang: '#00008b'
};
const bola = {
    x: canvas.width/2, y: canvas.height/2, r: 25,
    vx: 7, vy: 4, rotasi: 0
};

// === KONTROL KEYBOARD ===
document.addEventListener('keydown', e => kunci[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => kunci[e.key.toLowerCase()] = false);

// === MULAI GAME ===
function mulaiGame(mode) {
    modeMain = mode;
    levelGame = parseInt(document.getElementById('pilihLevel').value);
    document.getElementById('menu').style.display = 'none';
    document.getElementById('levelTampil').innerText = levelGame;
    if (mode === 'berdua') document.getElementById('labelMusuh').innerText = 'Pemain 2: ';
    
    gameJalan = true;
    mulaiHitungMundur();
    requestAnimationFrame(lingkaranGame);
}

// === SISTEM WAKTU ===
function mulaiHitungMundur() {
    let timer = setInterval(() => {
        if (!gameJalan) return clearInterval(timer);
        waktuMain--;
        document.getElementById('waktu').innerText = waktuMain;
        if (waktuMain <= 0) {
            akhirGame();
            clearInterval(timer);
        }
    }, 1000);
}

// === GAMBAR KARAKTER (GAYA 3D/REALISTIS) ===
function gambarPetarung(p) {
    // Bayangan kaki
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(p.x + p.w/2, p.y + p.h + 10, p.w/2, 18, 0, 0, Math.PI*2);
    ctx.fill();

    // Tubuh (Efek gradasi agar terlihat 3D)
    let grad = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y);
    grad.addColorStop(0, p.warna);
    grad.addColorStop(1, p.bayang);
    ctx.fillStyle = grad;
    ctx.fillRect(p.x, p.y, p.w, p.h);

    // Kepala
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(p.x + p.w/2, p.y - 25, 30, 0, Math.PI*2);
    ctx.fill();
    
    // Efek kilauan cahaya
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(p.x + 10, p.y + 15, 25, 60);
}

// === GAMBAR BOLA BERPUTAR ===
function gambarBolaUtama() {
    ctx.save();
    ctx.translate(bola.x, bola.y);
    bola.rotasi += bola.vx * 0.05;
    ctx.rotate(bola.rotasi);

    // Efek kilau bola
    let grad = ctx.createRadialGradient(-8, -8, 5, 0, 0, bola.r);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.3, '#ffd700');
    grad.addColorStop(1, '#ff9500');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.arc(0, 0, bola.r, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
}

// === LOGIKA TABRAKAN ===
function cekTabrak(rect, lingkaran) {
    let terdekatX = Math.max(rect.x, Math.min(lingkaran.x, rect.x + rect.w));
    let terdekatY = Math.max(rect.y, Math.min(lingkaran.y, rect.y + rect.h));
    let jarakX = lingkaran.x - terdekatX;
    let jarakY = lingkaran.y - terdekatY;
    return (jarakX*jarakX + jarakY*jarakY) < (lingkaran.r*lingkaran.r);
}

// === KOMPUTER AI PINTAR ===
function gerakKomputerPintar() {
    let reaksi = 2 + levelGame; // Semakin tinggi level, semakin cepat
    if (bola.x > p2.x + p2.w/2) p2.x += reaksi;
    else if (bola.x < p2.x + p2.w/2) p2.x -= reaksi;

    // Gerak vertikal
    if (bola.y > p2.y + p2.h/2) p2.y += reaksi * 0.8;
    else if (bola.y < p2.y + p2.h/2) p2.y -= reaksi * 0.8;
}

// === KONTROL PEMAIN ===
function gerakanPemain() {
    // P1: W A S D
    if (kunci['w'] && p1.y > 80) p1.y -= p1.kecepatan;
    if (kunci['s'] && p1.y < canvas.height - p1.h - 20) p1.y += p1.kecepatan;
    if (kunci['a'] && p1.x > 10) p1.x -= p1.kecepatan;
    if (kunci['d'] && p1.x < canvas.width/2 - p1.w - 50) p1.x += p1.kecepatan;

    // P2: Panah (jika mode berdua)
    if (modeMain === 'berdua') {
        if (kunci['arrowup'] && p2.y > 80) p2.y -= p2.kecepatan;
        if (kunci['arrowdown'] && p2.y < canvas.height - p2.h - 20) p2.y += p2.kecepatan;
        if (kunci['arrowleft'] && p2.x > canvas.width/2 + 50) p2.x -= p2.kecepatan;
        if (kunci['arrowright'] && p2.x < canvas.width - p2.w - 10) p2.x += p2.kecepatan;
    }
}

// === UPDATE POSISI ===
function perbaruiSemua() {
    bola.x += bola.vx;
    bola.y += bola.vy;

    // Pantulan dinding atas bawah
    if (bola.y < bola.r || bola.y > canvas.height - bola.r) bola.vy *= -1;

    // Cek Gol
    if (bola.x < -10) { p2.skor++; resetBola(); }
    if (bola.x > canvas.width + 10) { p1.skor++; resetBola(); }

    // Tabrakan Pemain
    if (cekTabrak(p1, bola) || cekTabrak(p2, bola)) {
        bola.vx *= -1.08; // Memantul makin kencang
        sfx.hit.play();
    }

    if (modeMain === 'komputer') gerakKomputerPintar();
    gerakanPemain();

    // Update Skor Layar
    document.getElementById('skorP1').innerText = p1.skor;
    document.getElementById('skorP2').innerText = p2.skor;
}

// === KEMBALIKAN BOLA KE TENGAH ===
function resetBola() {
    bola.x = canvas.width/2;
    bola.y = canvas.height/2;
    bola.vx = (Math.random() > 0.5 ? 1 : -1) * (5 + levelGame);
    bola.vy = (Math.random() - 0.5) * 6;
    sfx.skor.play();
}

// === GAME SELESAI ===
function akhirGame() {
    gameJalan = false;
    sfx.selesai.play();
    let pemenang = '';
    if (p1.skor > p2.skor) pemenang = '🏆 PEMAIN 1 MENANG!';
    else if (p2.skor > p1.skor) pemenang = '🏆 PEMAIN 2 / MUSUH MENANG!';
    else pemenang = '⚔️ PERTANDINGAN SERI!';

    document.getElementById('teksPesan').innerText = pemenang;
    document.getElementById('kotakPesan').style.display = 'block';
}

// === JEDA ===
function jedaGame() {
    gameJalan = !gameJalan;
    if (gameJalan) requestAnimationFrame(lingkaranGame);
}

// === LOOP UTAMA ===
function lingkaranGame() {
    if (!gameJalan) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Garis tengah arena
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    gambarPetarung(p1);
    gambarPetarung(p2);
    gambarBolaUtama();
    perbaruiSemua();

    requestAnimationFrame(lingkaranGame);
}
