// resources/js/lib/utils.js

/**
 * Fungsi untuk menggabungkan class Tailwind
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Fungsi Validasi Foto Dinamis (Database-Driven)
 * @param {Array} photos - Daftar foto yang sudah diunggah
 * @param {Array} photoTypes - Daftar tipe foto dari database
 */
export function validatePhotoRequirements(photos = [], photoTypes = []) {
  const errors = [];

  photoTypes.forEach(type => {
    // Hitung jumlah foto yang memiliki photoTypeId cocok dengan ID tipe dari DB
    const count = photos.filter(p => p.photoTypeId === type.id).length;

    // Gunakan properti min_qty (sesuai kolom DB Anda)
    if (count < type.min_qty) {
      errors.push(`Kurang foto ${type.label} (Wajib ${type.min_qty}, Ada ${count})`);
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
