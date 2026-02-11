/* ==========================================================
   1. IMPORT FIREBASE (JANGAN DIUBAH KECUALI VERSI)
   ========================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

/* ==========================================================
   2. KONFIGURASI FIREBASE MAS UUTH (SUDAH DIPASANG)
   ========================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyCUB2S0XMpsSmLPffMy9mtNTWgnbxB1J5g",
  authDomain: "web-profile-84112.firebaseapp.com",
  projectId: "web-profile-84112",
  storageBucket: "web-profile-84112.firebasestorage.app",
  messagingSenderId: "695454852112",
  appId: "1:695454852112:web:b5378b5d0ef72f0753d695",
  measurementId: "G-KYQQ73E2GR"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ==========================================================
   3. INISIALISASI SLIDER FOTO PROFIL (SWIPER.JS)
   ========================================================== */
document.addEventListener('DOMContentLoaded', function () {
    // Cek apakah Swiper ada, untuk menghindari error jika file HTML belum load librarynya
    if (typeof Swiper !== 'undefined') {
        const swiper = new Swiper(".mySwiper", {
            effect: "fade", // Efek pudar yang elegan
            grabCursor: true,
            cubeEffect: {
                shadow: true,
                slideShadows: true,
                shadowOffset: 20,
                shadowScale: 0.94,
            },
            autoplay: {
                delay: 3000, // Ganti foto setiap 3 detik
                disableOnInteraction: false,
            },
            loop: true, // Berputar terus tanpa henti
            speed: 1000, // Kecepatan transisi 1 detik (halus)
        });
    }

    /* ==========================================================
       4. NAVIGASI HALAMAN (SINGLE PAGE APPLICATION)
       ========================================================== */
    const navLinks = document.querySelectorAll('.main-nav a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // Mencegah reload halaman

            // 1. Hapus kelas 'active' dari semua link & section
            navLinks.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            // 2. Tambah kelas 'active' ke link yang diklik
            this.classList.add('active');

            // 3. Tampilkan section yang sesuai
            const targetId = this.getAttribute('href').substring(1); // Ambil id tanpa tanda #
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // 4. Scroll otomatis ke atas (untuk tampilan HP)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Menghilangkan Preloader saat website selesai loading
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        // Beri sedikit jeda agar loading terlihat smooth
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 500);
    }

    // Panggil fungsi ambil data blog
    fetchBlogs();
});

/* ==========================================================
   5. TARIK DATA BLOG DARI FIREBASE (DINAMIS)
   ========================================================== */
async function fetchBlogs() {
    const blogContainer = document.getElementById('blog-container');
    
    if (!blogContainer) return; // Stop jika container tidak ditemukan

    // Tampilkan status loading
    blogContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Sedang memuat kabar terbaru...</p>';

    try {
        // Query ke koleksi 'blogs', diurutkan berdasarkan tanggal (terbaru diatas)
        // Pastikan Mas Uuth membuat collection bernama 'blogs' di Firestore
        const q = query(collection(db, "blogs"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        // Kosongkan container sebelum diisi data baru
        blogContainer.innerHTML = '';

        if (querySnapshot.empty) {
            blogContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Belum ada artikel saat ini.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Buat elemen Kartu Blog (HTML String)
            const blogCard = `
                <div class="blog-card" style="margin-bottom: 20px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.3s;">
                    <div class="blog-img" style="height: 200px; overflow: hidden; position: relative;">
                        <img src="${data.image || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="blog-content" style="padding: 20px;">
                        <h3 style="color: var(--primary-color); margin-bottom: 10px; font-size: 1.2rem;">${data.title}</h3>
                        <p style="font-size: 14px; color: #666; margin-bottom: 15px; line-height: 1.5;">${data.summary}</p>
                        <a href="${data.link || '#'}" target="_blank" style="color: var(--accent-red); font-weight: bold; text-decoration: none; display: inline-flex; align-items: center;">
                            Baca Selengkapnya <i class="fas fa-arrow-right" style="margin-left: 5px;"></i>
                        </a>
                    </div>
                </div>
            `;
            
            // Masukkan ke dalam container
            blogContainer.innerHTML += blogCard;
        });

    } catch (error) {
        console.error("Gagal mengambil data blog: ", error);
        
        // Cek jenis error (biasanya karena Index belum dibuat atau permission)
        let pesanError = "Gagal memuat berita. Periksa koneksi internet.";
        
        if (error.code === 'failed-precondition') {
            pesanError = "Index Firestore perlu dibuat. Cek konsol browser untuk link pembuatan index.";
        } else if (error.code === 'permission-denied') {
            pesanError = "Izin akses database ditolak. Cek Firestore Rules.";
        }
        
        blogContainer.innerHTML = `<p style="text-align:center; color: red; padding: 20px;">${pesanError}</p>`;
    }
}