import { useState } from 'react';
import {
    Eye, Edit, Send, CheckCircle, Lock,
    MapPin, User, AlertCircle, FileText, Trash2, Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';


const validateReadiness = (parcel) => {
    let score = 0;
    const errors = [];

    if (parcel.peruntukan_lahan && parcel.tipe_bangunan_major) {
        score += 15;
    } else {
        errors.push("[Bidang] Peruntukan Lahan atau Tipe Bangunan belum diisi.")
    }

    if (parcel.respondents && parcel.respondents.length > 0) {
        score += 15;
    } else {
        errors.push("Data Pihak Berhak (Utama) belum ditambahkan.");
    }

    const landDetail = parcel.land_detail || parcel.landDetail;
    if (landDetail && landDetail.alas_hak_jenis && landDetail.luas_ukur) {
        score += 15;
    } else {
        errors.push("[Detail Tanah] Alas Hak atau Luas Ukur belum dilengkapi");
    }

    if (parcel.inventory_items !== undefined) {
        score += 10;
    } else {
        errors.push("[Inventaris] Data inventaris belum tervalidasi oleh sistem.")
    }

    const photos = parcel.documentation_photos || [];
    const ktpCount = photos.filter(p => p.photo_type_id === 1).length;
    const alasHakCount = photos.filter(p => p.photo_type_id === 2).length;
    const asetCount = photos.filter(p => p.photo_type_id === 3).length;

    if (ktpCount >= 1) score += 15;
    else errors.push("Foto Identitas/KTP belum diunggah (Min. 1).");

    if (alasHakCount >= 2) score += 15;
    else errors.push(`[Foto] Dokumen Alas Hak kurang ${2 - alasHakCount} lembar.`);

    if (asetCount >= 3) score += 15;
    else errors.push(`[Foto] Fisik Lokasi kurang ${3 - asetCount} lembar.`);

    return {
        score,
        errors,
        isReady: score === 100
    };
};

const actionConfigs = {
    submit: {
        title: 'Kirim Data Wawancara',
        description: 'Data akan dikirim ke Koordinator untuk diverifikasi. Pastikan seluruh dokumen dan foto lapangan (Golden Rule) telah lengkap.',
        confirmLabel: 'Ya, Kirim Data',
        variant: 'default',
    },
    verify: {
        title: 'Verifikasi Berkas',
        description: 'Tandai data ini sebagai Valid (Verified). Status ini menyatakan bahwa data telah diperiksa kualitasnya.',
        confirmLabel: 'Verifikasi',
        variant: 'default',
    },
    lock: {
        title: 'Kunci Permanen',
        description: 'Dokumen yang dikunci tidak dapat diubah kembali oleh siapapun. Lanjutkan?',
        confirmLabel: 'Kunci Data',
        variant: 'destructive',
    },
    delete: {
        title: 'Hapus Draf Wawancara',
        description: 'Apakah Anda yakin ingin menghapus data draf ini? Seluruh form dan foto akan dihancurkan secara permanen.',
        confirmLabel: 'Ya, Hapus Permanen',
        variant: 'destructive',
    },
    void: {
        title: 'Anulir / Batalkan Bidang',
        description: 'Data legal tidak akan dihapus dari database demi menjaga Jejak Audit. Status berkas akan diubah menjadi "Dibatalkan".',
        confirmLabel: 'Ya, Batalkan Berkas',
        variant: 'destructive',
    },
};

export function InterviewTable({
    interviews = [],
    userRole,
    onView,
    onEdit,
    onSubmit,
    onVerify,
    onLock,
    onDelete,
    showSurveyor = false,
    showKoordinator = false,
    mode = 'full' // Ditambahkan: 'full' (MyInterview) atau 'compact' (Dashboard)
}) {
    const [confirmDialog, setConfirmDialog] = useState({ open: false, type: 'submit', interviewId: '' });

    const handleAction = (type, interviewId) => setConfirmDialog({ open: true, type, interviewId });

    const handleConfirm = () => {
        const { type, interviewId } = confirmDialog;
        switch (type) {
            case 'submit': onSubmit?.(interviewId); break;
            case 'verify': onVerify?.(interviewId); break;
            case 'lock':   onLock?.(interviewId);   break;
            case 'delete':
            case 'void':
                onDelete?.(interviewId); break;
        }
        setConfirmDialog({ open: false, type: 'submit', interviewId: '' });
    };

    // --- LOGIKA HAK AKSES ---
    // Memasukkan 'revision' sebagai status yang setara dengan 'draft' untuk aksi surveyor
    const isWorkingState = (statusCode) => ['draft', 'revision', 'rejected'].includes(statusCode);

    const canEdit = (statusCode) => userRole === 'surveyor' && isWorkingState(statusCode);
    const canSubmit = (statusCode) => userRole === 'surveyor' && isWorkingState(statusCode);
    const canDelete = (statusCode) => userRole === 'surveyor' && isWorkingState(statusCode);
    const canVoid = (statusCode) => ['admin', 'koordinator'].includes(userRole) && ['submitted', 'verified', 'locked'].includes(statusCode);
    const canVerify = (statusCode) => userRole === 'koordinator' && statusCode === 'submitted';
    const canLock = (statusCode) => userRole === 'admin' && statusCode === 'verified';
    const isLocked = (statusCode) => statusCode === 'locked' || statusCode === 'cancelled';

    const config = actionConfigs[confirmDialog.type];
    const formatDate = (dateString) => dateString ? format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: localeId }) : '-';

    return (
        <>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Table>
            <TableHeader>
                <TableRow className="bg-slate-50/80 border-b border-slate-200">
                <TableHead className="h-11 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider w-[180px]">No. Bidang / NIB</TableHead>
                {showSurveyor && <TableHead className="h-11 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Surveyor</TableHead>}
                {showKoordinator && <TableHead className="h-11 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Koordinator</TableHead>}
                <TableHead className="h-11 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Pihak Berhak</TableHead>
                <TableHead className="h-11 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Lokasi</TableHead>
                <TableHead className="h-11 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status & Kesiapan</TableHead>
                <TableHead className="h-11 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Update</TableHead>
                <TableHead className="h-11 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Tindakan</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {interviews.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={showSurveyor && showKoordinator ? 8 : (showSurveyor || showKoordinator ? 7 : 6)} className="h-72 px-6">
                    <div className="flex flex-col items-center justify-center w-full h-full p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="h-14 w-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm mb-4">
                        <FileText className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-1">Data Kosong</h3>
                        <p className="text-sm text-slate-500 max-w-sm text-center">Belum ada dokumen yang sesuai.</p>
                    </div>
                    </TableCell>
                </TableRow>
                ) : (
                interviews.map((item) => {
                    const statusCode = item.status?.code || 'draft';
                    const isItemLocked = isLocked(statusCode);

                    // Eksekusi Validator
                    const readiness = validateReadiness(item);
                    // Cek apakah data butuh revisi
                    const isRevision = statusCode === 'revision';

                    const respondents = item.respondents || [];
                    const primaryRespondent = respondents.find(r => r.is_primary) || respondents[0];
                    const namaPemilik = primaryRespondent?.nama || primaryRespondent?.name || item.primary_respondent?.name; // Menerima .nama (snake) atau .name
                    const letakTanah = item.landDetail?.letak_tanah || item.land_detail?.letak_tanah;

                    return (
                    <TableRow
                        key={item.id}
                        className={cn(
                        "transition-colors duration-150 hover:bg-slate-50/80 border-b border-slate-100",
                        isItemLocked && "bg-slate-50/50 opacity-80",
                        isRevision && "bg-rose-50/30 hover:bg-rose-50/60" // Efek visual merah muda jika revisi
                        )}
                    >
                        {/* Kolom IDENTITAS BIDANG */}
                        <TableCell className="px-5 py-4 align-top">
                        <div className={cn("font-semibold text-sm", isItemLocked ? "text-slate-500" : (isRevision ? "text-rose-900" : "text-slate-900"))}>
                            {item.nomor_bidang || <span className="text-slate-400 italic font-normal">Tanpa Nomor</span>}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-1">{item.nomor_peta_index || 'NIB: -'}</div>
                        </TableCell>

                        {showSurveyor && <TableCell className="px-5 py-4 align-top text-sm text-slate-700">{item.surveyor?.name || '-'}</TableCell>}
                        {showKoordinator && <TableCell className="px-5 py-4 align-top text-sm text-slate-700">{item.koordinator?.name || '-'}</TableCell>}

                        {/* Kolom PIHAK BERHAK */}
                        <TableCell className="px-5 py-4 align-top">
                        <div className="flex items-start gap-3">
                            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md border shadow-sm mt-0.5",
                            namaPemilik ? "bg-indigo-50/50 border-indigo-100 text-indigo-600" : "bg-white border-slate-200 text-slate-300"
                            )}>
                            <User className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                            <span className={cn("text-sm font-medium", namaPemilik ? "text-slate-800" : "text-slate-400 italic")}>
                                {namaPemilik || 'Belum terdata'}
                            </span>
                            </div>
                        </div>
                        </TableCell>

                        {/* Kolom LOKASI */}
                        <TableCell className="px-5 py-4 align-top">
                        <div className="flex items-start gap-2.5 max-w-[200px]">
                            <MapPin className={cn("h-4 w-4 shrink-0 mt-0.5", letakTanah ? "text-slate-400" : "text-slate-300")} />
                            <span className={cn("text-sm line-clamp-2 leading-relaxed", letakTanah ? "text-slate-700" : "text-slate-400 italic")} title={letakTanah}>
                            {letakTanah || 'Lokasi belum dicatat'}
                            </span>
                        </div>
                        </TableCell>

                        {/* Kolom STATUS & PROGRESS */}
                        <TableCell className="px-5 py-4 align-top">
                            {/* Jika Draft / Revision, tampilkan Progress Bar */}
                            {isWorkingState(statusCode) ? (
                                <div className="w-full min-w-[140px] max-w-[160px]">
                                    <div className="flex justify-between items-center mb-1.5 text-[11px] font-bold uppercase tracking-wider">
                                        {isRevision ? (
                                            <span className="text-rose-600 flex items-center gap-1"><AlertCircle size={12}/> REVISI</span>
                                        ) : (
                                            <span className={readiness.isReady ? "text-emerald-600" : "text-slate-600"}>
                                                {readiness.isReady ? "SIAP SUBMIT" : "DRAFT (TERTUNDA)"}
                                            </span>
                                        )}
                                        <span className={readiness.isReady ? "text-emerald-600" : "text-slate-400"}>{readiness.score}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-500 ${isRevision && !readiness.isReady ? 'bg-rose-500' : (readiness.isReady ? 'bg-emerald-500' : 'bg-indigo-400')}`}
                                            style={{ width: `${readiness.score}%` }}
                                        ></div>
                                    </div>
                                    {/* Jika ada catatan revisi dari DB, tampilkan */}
                                    {isRevision && item.catatan_revisi && (
                                        <p className="mt-2 text-[11px] text-rose-700 leading-snug font-medium line-clamp-2" title={item.catatan_revisi}>
                                            "{item.catatan_revisi}"
                                        </p>
                                    )}
                                </div>
                            ) : (
                                /* Jika status lain (Verified/Submitted), tampilkan Badge bawaan Anda */
                                <StatusBadge status={statusCode} label={item.status?.label || item.status?.description} />
                            )}
                        </TableCell>

                        {/* Kolom TANGGAL */}
                        <TableCell className="px-5 py-4 align-top text-slate-500 text-sm whitespace-nowrap">
                        {formatDate(item.updated_at)}
                        </TableCell>

                        {/* Kolom TINDAKAN */}
                        <TableCell className="px-5 py-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2">

                            <Button variant="outline" size="icon" onClick={() => onView(item.id)} title="Lihat Detail" className="h-8 w-8 bg-white shadow-sm">
                                <Eye className="h-4 w-4 text-slate-600" />
                            </Button>

                            {canEdit(statusCode) && onEdit && (
                            <Button variant="outline" size="icon" onClick={() => onEdit(item.id)} title="Perbarui Data" className="h-8 w-8 bg-white shadow-sm">
                                <Edit className="h-4 w-4 text-slate-600" />
                            </Button>
                            )}

                            {/* TOMBOL BERBAHAYA & SUBMIT (Hanya muncul jika mode='full', bukan di Dashboard) */}
                            {mode === 'full' && (
                                <>
                                    {/* Hapus Draf */}
                                    {canDelete(statusCode) && onDelete && (
                                    <Button variant="outline" size="icon" onClick={() => handleAction('delete', item.id)} title="Hapus Permanen Draf" className="h-8 w-8 bg-white shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    )}

                                    {/* Submit Draf (DENGAN LOCK & TOOLTIP) */}
                                    {canSubmit(statusCode) && onSubmit && (
                                        <div className="inline-block relative group">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => readiness.isReady && handleAction('submit', item.id)}
                                                disabled={!readiness.isReady}
                                                className={`h-8 w-8 shadow-sm transition-all ${
                                                    readiness.isReady
                                                        ? "bg-white border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-600"
                                                        : "bg-slate-50 border-slate-200 text-slate-300 opacity-60 cursor-not-allowed"
                                                }`}
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>

                                            {/* Tooltip Jika Belum Siap */}
                                            {!readiness.isReady && (
                                                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-56 p-2.5 bg-slate-900 border border-slate-700 text-white text-[11px] rounded-lg shadow-xl text-left z-10">
                                                    <p className="font-semibold text-amber-400 mb-1.5 flex items-center gap-1">
                                                        <AlertCircle size={12} /> Gagal Kirim:
                                                    </p>
                                                    <ul className="list-disc pl-3.5 space-y-1 text-slate-300">
                                                        {readiness.errors.map((err, i) => (
                                                            <li key={i} className="leading-tight">{err}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ... SISA TOMBOL VERIFY, LOCK, VOID DARI KODE ASLI ANDA ... */}
                                    {canVerify(statusCode) && onVerify && (
                                    <Button variant="outline" size="icon" onClick={() => handleAction('verify', item.id)} title="Verifikasi Dokumen" className="h-8 w-8 bg-white border-slate-200 text-slate-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 shadow-sm">
                                        <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    )}

                                    {canLock(statusCode) && onLock && (
                                    <Button variant="outline" size="icon" onClick={() => handleAction('lock', item.id)} title="Kunci Permanen" className="h-8 w-8 bg-white border-slate-200 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 shadow-sm">
                                        <Lock className="h-4 w-4" />
                                    </Button>
                                    )}

                                    {canVoid(statusCode) && onDelete && (
                                    <Button variant="outline" size="icon" onClick={() => handleAction('void', item.id)} title="Batalkan Berkas" className="h-8 w-8 bg-white border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 shadow-sm">
                                        <Ban className="h-4 w-4" />
                                    </Button>
                                    )}
                                </>
                            )}

                        </div>
                        </TableCell>
                    </TableRow>
                    );
                })
                )}
            </TableBody>
            </Table>
        </div>

        <ConfirmDialog
            open={confirmDialog.open}
            onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
            title={config?.title}
            description={config?.description}
            confirmLabel={config?.confirmLabel}
            onConfirm={handleConfirm}
            variant={config?.variant}
        />
        </>
    );
}
