/**
 * ENUM-LIKE CONSTANTS
 */
export const INTERVIEW_STATUS = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    VERIFIED: 'verified',
    LOCKED: 'locked',
};

export const USER_ROLE = {
    SURVEYOR: 'surveyor',
    KOORDINATOR: 'koordinator',
    ADMIN: 'admin',
};

export const GENDER = {
    L: 'L',
    P: 'P',
};

/**
 * @typedef {'draft' | 'submitted' | 'verified' | 'locked'} InterviewStatus
 * @typedef {'surveyor' | 'koordinator' | 'admin'} UserRole
 * @typedef {'L' | 'P'} GenderType
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {UserRole} role
 * @property {boolean} isActive
 * @property {string} createdAt
 */

/**
 * Reference tables
 */
export const REFERENCE_TABLE = {
    USER_ROLE: 'user_roles',
    INTERVIEW_STATUS: 'interview_statuses',
    RESPONDENT_ROLE: 'respondent_roles',
    LAND_STATUS: 'land_statuses',
    DOCUMENT_TYPE: 'document_types',
    PHOTO_ENTITY_TYPE: 'photo_entity_types',
    PHOTO_TYPE: 'photo_types',
};

/**
 * @typedef {Object} Interview
 * @property {string} id
 * @property {string} nomorPetaIndex
 * @property {string} nomorBidang
 * @property {string} lokasiWawancara
 * @property {string} tanggalWawancara
 * @property {string} waktuWawancara
 * @property {string} namaResponden
 * @property {InterviewStatus} status
 * @property {number} statusId
 * @property {string} createdBy
 * @property {string} surveyorId
 * @property {string} surveyorName
 * @property {string=} reviewStartedAt
 * @property {string=} reviewedAt
 * @property {string=} reviewedBy
 * @property {string=} koordinatorId
 * @property {string=} koordinatorName
 * @property {string=} submittedAt
 * @property {string=} verifiedAt
 * @property {string=} lockedAt
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string=} deletedAt
 * @property {string=} location
 * @property {string=} date
 * @property {string=} lastUpdated
 */

/**
 * @typedef {Object} Respondent
 * @property {string} id
 * @property {string} interviewId
 * @property {string} nama
 * @property {number} respondentRoleId
 * @property {number} genderId
 * @property {GenderType} gender
 * @property {string} tanggalLahir
 * @property {string} pekerjaan
 * @property {string} alamatKtp
 * @property {string} nik
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} LandAsset
 * @property {string} id
 * @property {string} interviewId
 * @property {string} nib
 * @property {string} desa
 * @property {string} rtRw
 * @property {string} kecamatan
 * @property {string} kabupatenProvinsi
 * @property {number} landStatusId
 * @property {number} luasTerdampak
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} LandDocument
 * @property {string} id
 * @property {string} landAssetId
 * @property {number} documentTypeId
 * @property {string} uploadedBy
 * @property {string} filePath
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Building
 * @property {string} id
 * @property {string} interviewId
 * @property {string} peruntukan
 * @property {number} jumlah
 * @property {number} luas
 * @property {string} tipeBangunan
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Plant
 * @property {string} id
 * @property {string} interviewId
 * @property {string} namaTanaman
 * @property {number} jumlah
 * @property {string} createdAt
 */

/**
 * @typedef {Object} OtherObject
 * @property {string} id
 * @property {string} interviewId
 * @property {string} jenis
 * @property {number} jumlah
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Photo
 * @property {string} id
 * @property {string} interviewId
 * @property {number} entityTypeId
 * @property {string} entityId
 * @property {number} photoTypeId
 * @property {string} filePath
 * @property {string} caption
 * @property {string} takenAt
 * @property {string} uploadedBy
 * @property {string} createdAt
 */
