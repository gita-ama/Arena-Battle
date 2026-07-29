// === SETUP DASAR ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200; canvas.height = 650;

// === SUARA ===
const suara = {
    hit: new Audio('sounds/hit.mp3'),
    skor: new Audio('sounds/score.mp3'),
    selesai: new Audio('sounds/gameover.mp3')
};

// === VARIABEL GAME ===
let mode, level, waktu = 60, jalan = true;
let p1 = {x:150,y:450,w:80,h:120,skor:0,vx:0,warna:'#ff4757'};
let p2 = {x:950,y:450,w:80,h:120,skor:0,vx:0,warna:'#3742fa'};
let bola = {x:600,y:300,r:20,vx:5,vy:3};
const keys = {};

// === MULAI GAME ===
function startGame(m) {
    mode = m;
    level = parseInt(document.getElementById('level').value);
    document.getElementById('menu').style.display = 'none';
    document.getElementById('levelInfo').innerText = level;
    if(m==='dua') document.getElementById('labelP2').innerText = 'Pemain 2: ';
    mulaiWaktu();
    requestAnimationFrame(loop);
}

// === WAKTU ===
function mulaiWaktu() {
    let t = setInterval(()=>{
        if(!jalan) return clearInterval(t);
        waktu--;
        document.getElementById('timer').innerText = waktu;
        if(waktu<=0) { selesai(); clearInterval(t); }
    },1000);
}

// === GAMBAR KARAKTER (GAYA 3D/ANIMASI) ===
function gambarKarakter(p) {
    ctx.fillStyle = p.warna;
    ctx.beginPath(); ctx.ellipse(p.x+p.w/2, p.y+p.h, p.w/2, 20, 0, 0, Math.PI*2); ctx.fill(); // Bayangan
    ctx.fillRect(p.x, p.y, p.w, p.h); // Badan
    ctx.beginPath(); ctx.arc(p.x+p.w/2, p.y-15, 25, 0, Math.PI*2); ctx.fill(); // Kepala
    // Efek kilau 3D
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(p.x+10, p.y+10, 20, 40);
}

// === BOLA ===
function gambarBola() {
    ctx.beginPath();
    ctx.arc(bola.x, bola.y, bola.r, 0, Math.PI*2);
    ctx.fillStyle = '#ffdd00';
    ctx.fill();
    ctx.strokeStyle = '#000'; ctx.stroke();
}

// === TABRAKAN ===
function cekTabrak(a,b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }

// === KOMPUTER AI ===
function gerakKomputer() {
    let kecepatan = 2 + level;
    if(bola.x > p2.x+40) p2.x += kecepatan;
    else if(bola.x < p2.x+40) p2.x -= kecepatan;
}

// === PEMAIN & KONTROL ===
document.addEventListener('keydown', e=>keys[e.key]=true);
document.addEventListener('keyup', e=>keys[e.key]=false);

function gerakPemain() {
    // P1: A/D
    if(keys['a'] || keys['A']) p1.x -= 5;
    if(keys['d'] || keys['D']) p1.x += 5;
    // P2: ←/→ (jika mode 2)
    if(mode==='dua') {
        if(keys['ArrowLeft']) p2.x -= 5;
        if(keys['ArrowRight']) p2.x += 5;
    }
    // Batas layar
    [p1,p2].forEach(p=>{ p.x=Math.max(0, Math.min(canvas.width-p.w, p.x)); });
}

// === LOGIKA UTAMA ===
function update() {
    bola.x += bola.vx; bola.y += bola.vy;
    if(bola.y<0 || bola.y>canvas.height-bola.r) bola.vy *= -1;
    if(bola.x<0) { p2.skor++; resetBola(); }
    if(bola.x>canvas.width) { p1.skor++; resetBola(); }

    if(cekTabrak(bola, p1) || cekTabrak(bola, p2)) {
        bola.vx *= -1.02; suara.hit.play();
    }
    if(mode==='computer') gerakKomputer();
    gerakPemain();

    document.getElementById('skor1').innerText = p1.skor;
    document.getElementById('skor2').innerText = p2.skor;
}

function resetBola() {
    bola = {x:600,y:300,r:20,vx:(Math.random()>0.5?1:-1)*(4+level),vy:3};
    suara.skor.play();
}

function selesai() {
    jalan = false; suara.selesai.play();
    let pemenang = p1.skor>p2.skor ? "Pemain 1 Menang!" : p2.skor>p1.skor ? "Pemain 2/Musuh Menang!" : "Seri!";
    document.getElementById('pesan').innerText = "SELESAI! " + pemenang;
    document.getElementById('pesan').style.display = 'block';
}
function pauseGame() { jalan = !jalan; if(jalan) loop(); }

// === LOOP GAME ===
function loop() {
    if(!jalan) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    gambarKarakter(p1); gambarKarakter(p2); gambarBola();
    update();
    requestAnimationFrame(loop);
}
