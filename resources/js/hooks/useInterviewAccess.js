/**
 * @typedef {Object} AccessState
 * @property {boolean} canEdit
 * @property {boolean} canDelete
 * @property {boolean} canSubmit
 * @property {boolean} canAddChildren
 * @property {boolean} isReadOnly
 * @property {boolean} isFinal
 * @property {string} [message]
 */

// 1. Sumber Kebenaran Tunggal (Enum)
// Memetakan ID Databas ke konstanta agar kode mudah di bacca dan kebal dari salah ketik
export const PARCEL_STATUS = {
    DRAFT: 1,
    SUBMITTED: 2,
    VERIFIED: 3,
    LOCKED: 4,
    REVISION: 6,
    CANCELLED: 5,
};

/**
 * Hook untuk menentukan hak akses user terhadap sebuah bidang tanah (Parcel).
 * @param {Object} options
 * @param {Object|null} options.interview - Data objek Parcel dari database
 * @param {string} options.userRole - Role dari user ('surveyor', 'koordinator', 'admin')
 * @param {boolean} options.isOwner - Apakah user saat ini adalah pembuat data tersebut
 * @returns {AccessState}
 */
export function useInterviewAccess({ interview, userRole, isOwner }) {
    // 1. Jika data belum ada (Mode Create)
    if (!interview) {
        return {
            canEdit: true,
            canDelete: false,
            canSubmit: false,
            canAddChildren: false,
            isReadOnly: false,
            isFinal: false,
            message: "Isi data bidang lalu simpan untuk melanjutkan.",
        };
    }

    // 2. Tangkap ID Status dari Database (Pastika selalu berupa angka)
    const statusId = Number(interview?.status_id) || PARCEL_STATUS.DRAFT;

    // 3. Data Terkunci (Locked)
    if (statusId === PARCEL_STATUS.LOCKED) {
        return {
            canEdit: false,
            canDelete: false,
            canSubmit: false,
            canAddChildren: false,
            isReadOnly: true,
            isFinal: true,
            message: "Bidang sudah dikunci. Tidak dapat diubah.",
        };
    }

    // 4. Status Draft
    if (statusId === PARCEL_STATUS.DRAFT) {
        if (userRole === "surveyor" && isOwner) {
            return {
                canEdit: true,
                canDelete: true,
                canSubmit: true,
                canAddChildren: true,
                isReadOnly: false,
                isFinal: false,
            };
        }
        return {
            canEdit: false,
            canDelete: false,
            canSubmit: false,
            canAddChildren: false,
            isReadOnly: true,
            isFinal: false,
            message: "Hanya surveyor pemilik yang dapat mengedit draft ini.",
        };
    }

    // 4.5 Status Revisi
    if (statusId === PARCEL_STATUS.REVISION) {
        if (userRole === "surveyor" && isOwner) {
            return {
                canEdit: true,
                canDelete: false, // Mencegah data terhapus, hanya boleh diedit/disubmit ulang
                canSubmit: true,
                canAddChildren: true,
                isReadOnly: false,
                isFinal: false,
                message: "Silakan perbaiki data sesuai catatan Koordinator.",
            };
        }
        return {
            canEdit: false,
            canDelete: false,
            canSubmit: false,
            canAddChildren: false,
            isReadOnly: true,
            isFinal: false,
            message:
                "Hanya surveyor pemilik yang dapat mengakses data revisi ini.",
        };
    }

    // 5. Status disubmit (Menunggu verifikasi)
    if (statusId === PARCEL_STATUS.SUBMITTED) {
        return {
            canEdit: false,
            canDelete: false,
            canSubmit: false,
            canAddChildren: false,
            isReadOnly: true,
            isFinal: false,
            message:
                userRole === "surveyor"
                    ? "Bidang sudah disubmit. Menunggu verifikasi."
                    : "Silahkan lakukan verifikasi pada bidang ini.",
        };
    }

    // 6. Status Terverifikasi
    if (statusId === PARCEL_STATUS.VERIFIED) {
        if (userRole === "koordinator" || userRole === "admin") {
            return {
                canEdit: true,
                canDelete: true,
                canSubmit: false,
                canAddChildren: true,
                isReadOnly: false,
                isFinal: false,
            };
        }
        return {
            canEdit: false,
            canDelete: false,
            canSubmit: false,
            canAddChildren: false,
            isReadOnly: true,
            isFinal: false,
            message: "Hanya verifikator atau admin yang dapat mengedit.",
        };
    }

    // 7. Fallback default jika status tidak dikenali (Pengaman terakhir)
    return {
        canEdit: false,
        canDelete: false,
        canSubmit: false,
        canAddChildren: false,
        isReadOnly: true,
        isFinal: false,
        message: "Status bidang tidak valid.",
    };
}

/**
 * Mengubah ID status menjadi label yang mudah dibaca.
 * @param {number|string} statusId - ID status dari database (status_id)
 * @return {string}
 */
export function getStatusLabel(statusId) {
    const labels = {
        [PARCEL_STATUS.DRAFT]: "Draft",
        [PARCEL_STATUS.SUBMITTED]: "Disubmit",
        [PARCEL_STATUS.VERIFIED]: "Terverifikasi",
        [PARCEL_STATUS.LOCKED]: "Terkunci",
        [PARCEL_STATUS.REVISION]: "Revisi",
        [PARCEL_STATUS.CANCELLED]: "Dibatalkan",
    };

    return labels[Number(statusId)] || "Tidak Diketahui";
}

/**
 * Mengembalikan utility class tailwind berdasarkan ID status.
 * @param {number|string} statusId - ID status dari database (status_id)
 * @returns {string}
 */
export function getStatusColor(statusId) {
    const colors = {
        [PARCEL_STATUS.DRAFT]: "bg-muted text-muted-foreground",
        [PARCEL_STATUS.SUBMITTED]:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        [PARCEL_STATUS.VERIFIED]:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [PARCEL_STATUS.LOCKED]:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        [PARCEL_STATUS.REVISION]:
            "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
        [PARCEL_STATUS.CANCELLED]:
            "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
    };

    return (
        colors[Number(statusId)] ||
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    );
}
