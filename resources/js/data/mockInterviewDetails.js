/**
 * @typedef {Object} ReferenceItem
 * @property {number|string} id - atau value
 * @property {string} code - atau label
 * @property {string} [description]
 */

// Reference data
export const respondentRoles = [
  { id: 1, code: 'pemilik', description: 'Pemilik - Data kolom kiri Excel (Pihak Berhak)' },
  { id: 2, code: 'penggarap', description: 'Penggarap - Data kolom kanan Excel' },
  { id: 3, code: 'penyewa', description: 'Penyewa' },
];

export const genderTypes = [
  { id: 1, code: 'L', label: 'Laki-laki' },
  { id: 2, code: 'P', label: 'Perempuan' },
];

export const landStatuses = [
  { id: 1, code: 'shm', label: 'SHM (Sertifikat Hak Milik)' },
  { id: 2, code: 'hgb', label: 'HGB (Hak Guna Bangunan)' },
  { id: 3, code: 'girik', label: 'Girik' },
  { id: 4, code: 'tanah_negara', label: 'Tanah Negara' },
  { id: 5, code: 'adat', label: 'Tanah Adat' },
];

export const photoTypes = [
  { id: 1, code: 'ktp', minQty: 1, label: 'Identitas (KTP)' },
  { id: 2, code: 'alas_hak', minQty: 2, label: 'Dokumen Alas Hak' },
  { id: 3, code: 'aset', minQty: 3, label: 'Fisik Aset/Lahan' },
];

export const inventoryCategories = [
  { value: 'BANGUNAN', label: 'Bangunan' },
  { value: 'TANAMAN', label: 'Tanaman' },
  { value: 'BENDA_LAIN', label: 'Benda Lain' },
];

export const kondisiOptions = [
  { value: 'Baik', label: 'Baik' },
  { value: 'Rusak Ringan', label: 'Rusak Ringan' },
  { value: 'Rusak Berat', label: 'Rusak Berat' },
];

export const satuanOptions = [
  { value: 'Unit', label: 'Unit' },
  { value: 'M2', label: 'M²' },
  { value: 'Batang', label: 'Batang' },
  { value: 'Rumpun', label: 'Rumpun' },
  { value: 'Meter', label: 'Meter' },
];

// Mock data for parcel PRC001
export const mockRespondents = {
  'INT001': [
    {
      id: 'RSP001',
      parcelId: 'INT001',
      roleId: 1,
      isPrimary: true,
      nama: 'Joko Widodo',
      nik: '3171051505700001',
      tempatLahir: 'Jakarta',
      tanggalLahir: '1970-05-15',
      pekerjaan: 'Wiraswasta',
      alamatKtp: 'Jl. Merdeka No. 17, Jakarta',
      noTelepon: '08123456789',
      createdAt: '2024-03-15T08:00:00Z',
      updatedAt: '2024-03-15T08:00:00Z',
    },
  ],
  'INT003': [
    {
      id: 'RSP003',
      parcelId: 'INT003',
      roleId: 1,
      isPrimary: true,
      nama: 'Ahmad Dahlan',
      nik: '3201011001650003',
      tempatLahir: 'Bogor',
      tanggalLahir: '1965-01-10',
      pekerjaan: 'Petani',
      alamatKtp: 'Desa Cisarua RT 02/03, Bogor',
      noTelepon: '08567890123',
      createdAt: '2024-03-13T07:00:00Z',
      updatedAt: '2024-03-13T07:00:00Z',
    },
    {
      id: 'RSP004',
      parcelId: 'INT003',
      roleId: 2,
      isPrimary: false,
      nama: 'Siti Aisyah',
      nik: '3201012506680004',
      tempatLahir: 'Bogor',
      tanggalLahir: '1968-06-25',
      pekerjaan: 'Ibu Rumah Tangga',
      alamatKtp: 'Desa Cisarua RT 02/03, Bogor',
      noTelepon: '08901234567',
      createdAt: '2024-03-13T07:30:00Z',
      updatedAt: '2024-03-13T07:30:00Z',
    },
  ],
};

export const mockLandDetails = {
  'INT001': {
    id: 'LD001',
    parcelId: 'INT001',
    statusTanahId: 1,
    alasHakJenis: 'SHM',
    alasHakNomor: 'SHM-001/2020',
    nib: 'NIB-001-2024',
    luasSurat: 300,
    luasUkur: 295,
    luasTerdampak: 250.5,
    luasSisa: 44.5,
    letakTanah: 'Desa Sukamaju, Kec. Cilandak, Jakarta Selatan',
    ruangAtasBawahTanah: 'Bebas',
    pembebananHak: 'Bersih',
    perkiraanDampak: 'Sebagian',
    createdAt: '2024-03-15T08:30:00Z',
    updatedAt: '2024-03-15T08:30:00Z',
  },
  'INT003': {
    id: 'LD003',
    parcelId: 'INT003',
    statusTanahId: 1,
    alasHakJenis: 'SHM',
    alasHakNomor: 'SHM-003/2019',
    nib: 'NIB-003-2024',
    luasSurat: 520,
    luasUkur: 510,
    luasTerdampak: 500,
    luasSisa: 10,
    letakTanah: 'Desa Cisarua, Kec. Cisarua, Bogor',
    ruangAtasBawahTanah: 'Bebas',
    pembebananHak: 'Bersih',
    perkiraanDampak: 'Seluruhnya',
    createdAt: '2024-03-13T07:45:00Z',
    updatedAt: '2024-03-13T07:45:00Z',
  },
};

export const mockInventoryItems = {
  'INT001': [
    {
      id: 'INV001',
      parcelId: 'INT001',
      category: 'BANGUNAN',
      jenisItem: 'Rumah Tinggal',
      spesifikasi: 'Lantai Keramik, Dinding Bata',
      jumlah: 1,
      satuan: 'Unit',
      kondisi: 'Baik',
      keterangan: '',
      createdAt: '2024-03-15T09:30:00Z',
      updatedAt: '2024-03-15T09:30:00Z',
    },
    {
      id: 'INV002',
      parcelId: 'INT001',
      category: 'TANAMAN',
      jenisItem: 'Pohon Mangga',
      spesifikasi: 'Diameter 20cm',
      jumlah: 3,
      satuan: 'Batang',
      kondisi: 'Baik',
      keterangan: '',
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z',
    },
  ],
  'INT003': [
    {
      id: 'INV003',
      parcelId: 'INT003',
      category: 'BANGUNAN',
      jenisItem: 'Rumah Tinggal',
      spesifikasi: 'Permanen, Lantai Keramik',
      jumlah: 1,
      satuan: 'Unit',
      kondisi: 'Baik',
      keterangan: '',
      createdAt: '2024-03-13T08:30:00Z',
      updatedAt: '2024-03-13T08:30:00Z',
    },
    {
      id: 'INV004',
      parcelId: 'INT003',
      category: 'BANGUNAN',
      jenisItem: 'Gudang',
      spesifikasi: 'Semi Permanen',
      jumlah: 1,
      satuan: 'Unit',
      kondisi: 'Rusak Ringan',
      keterangan: '',
      createdAt: '2024-03-13T08:45:00Z',
      updatedAt: '2024-03-13T08:45:00Z',
    },
    {
      id: 'INV005',
      parcelId: 'INT003',
      category: 'TANAMAN',
      jenisItem: 'Pohon Durian',
      spesifikasi: 'Diameter 30cm',
      jumlah: 5,
      satuan: 'Batang',
      kondisi: 'Baik',
      keterangan: '',
      createdAt: '2024-03-13T09:00:00Z',
      updatedAt: '2024-03-13T09:00:00Z',
    },
    {
      id: 'INV006',
      parcelId: 'INT003',
      category: 'BENDA_LAIN',
      jenisItem: 'Sumur Bor',
      spesifikasi: 'Kedalaman 20m',
      jumlah: 1,
      satuan: 'Unit',
      kondisi: 'Baik',
      keterangan: '',
      createdAt: '2024-03-13T09:45:00Z',
      updatedAt: '2024-03-13T09:45:00Z',
    },
  ],
};

export const mockDocumentationPhotos = {
  'INT001': [
    {
      id: 'PHT001',
      parcelId: 'INT001',
      photoTypeId: 1,
      filePath: '/photos/ktp-int001.jpg',
      fileName: 'ktp-int001.jpg',
      latitude: -6.2615,
      longitude: 106.8106,
      accuracyMeters: 5,
      takenAt: '2024-03-15T09:00:00Z',
      uploadedAt: '2024-03-15T09:05:00Z',
      uploadedBy: 'USR001',
    },
  ],
  'INT003': [
    {
      id: 'PHT002',
      parcelId: 'INT003',
      photoTypeId: 1,
      filePath: '/photos/ktp-int003.jpg',
      fileName: 'ktp-int003.jpg',
      latitude: -6.6858,
      longitude: 106.8501,
      accuracyMeters: 3,
      takenAt: '2024-03-13T07:30:00Z',
      uploadedAt: '2024-03-13T07:35:00Z',
      uploadedBy: 'USR002',
    },
    {
      id: 'PHT003',
      parcelId: 'INT003',
      photoTypeId: 2,
      filePath: '/photos/alas-hak-1-int003.jpg',
      fileName: 'alas-hak-1-int003.jpg',
      takenAt: '2024-03-13T08:00:00Z',
      uploadedAt: '2024-03-13T08:05:00Z',
      uploadedBy: 'USR002',
    },
    {
      id: 'PHT004',
      parcelId: 'INT003',
      photoTypeId: 3,
      filePath: '/photos/aset-1-int003.jpg',
      fileName: 'aset-1-int003.jpg',
      latitude: -6.6860,
      longitude: 106.8503,
      accuracyMeters: 4,
      takenAt: '2024-03-13T08:35:00Z',
      uploadedAt: '2024-03-13T08:40:00Z',
      uploadedBy: 'USR002',
    },
  ],
};

// --- Helper Functions ---

/**
 * @param {string} parcelId
 * @returns {Array<Object>}
 */
export function getParcelRespondents(parcelId) {
  return mockRespondents[parcelId] || [];
}

/**
 * @param {string} parcelId
 * @returns {Object|null}
 */
export function getParcelLandDetail(parcelId) {
  return mockLandDetails[parcelId] || null;
}

/**
 * @param {string} parcelId
 * @returns {Array<Object>}
 */
export function getParcelInventoryItems(parcelId) {
  return mockInventoryItems[parcelId] || [];
}

/**
 * @param {string} parcelId
 * @returns {Array<Object>}
 */
export function getParcelPhotos(parcelId) {
  return mockDocumentationPhotos[parcelId] || [];
}

// --- Reference data helpers ---

/**
 * @param {number} id
 * @returns {string}
 */
export function getRespondentRoleLabel(id) {
  return respondentRoles.find(r => r.id === id)?.code || '-';
}

/**
 * @param {number} id
 * @returns {string}
 */
export function getGenderLabel(id) {
  return genderTypes.find(g => g.id === id)?.label || '-';
}

/**
 * @param {number} id
 * @returns {string}
 */
export function getLandStatusLabel(id) {
  return landStatuses.find(s => s.id === id)?.label || '-';
}

/**
 * @param {number} id
 * @returns {string}
 */
export function getPhotoTypeLabel(id) {
  return photoTypes.find(t => t.id === id)?.label || '-';
}

/**
 * @param {string} cat
 * @returns {string}
 */
export function getCategoryLabel(cat) {
  return inventoryCategories.find(c => c.value === cat)?.label || cat;
}

/**
 * Photo validation for submission
 * @param {Array<Object>} photos
 * @returns {{ valid: boolean, errors: Array<string> }}
 */
export function validatePhotoRequirements(photos) {
  const errors = [];
  for (const pt of photoTypes) {
    const count = photos.filter(p => p.photoTypeId === pt.id).length;
    if (count < pt.minQty) {
      errors.push(`${pt.label}: minimal ${pt.minQty} foto (saat ini ${count})`);
    }
  }
  return { valid: errors.length === 0, errors };
}
