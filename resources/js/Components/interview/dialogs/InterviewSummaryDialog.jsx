import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, User, FileText, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

/* ─────────────────────────────────────────────
   MAIN DIALOG
───────────────────────────────────────────── */
export function InterviewSummaryDialog({ open, onOpenChange, parcel }) {
    if (!parcel) return null;

    const primaryRespondent = parcel.respondents?.find(r => r.is_primary) || parcel.respondents?.[0] || {};
    const land = parcel.landDetail || parcel.land_detail || {};

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="
                !p-0 !max-w-[800px] w-[95vw]
                overflow-hidden sm:rounded-2xl
                border border-slate-200
                shadow-2xl shadow-slate-900/10
                [&>button]:hidden bg-white
            ">
                <div className="flex flex-col h-[85vh] md:h-auto md:max-h-[85vh]">

                    {/* Topbar - Clean Solid White */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white sticky top-0 z-20">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Ringkasan Pendataan</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Detail informasi objek dan pihak berhak</p>
                        </div>
                        <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                                <X size={20} strokeWidth={2} />
                            </Button>
                        </DialogClose>
                    </div>

                    {/* Scroll Area */}
                    <div className="flex-1 overflow-y-auto px-8 py-8 scroll-smooth custom-scrollbar">
                        <div className="max-w-3xl mx-auto space-y-10">

                            {/* ── 1. Legalitas ── */}
                            <SectionBlock id="legalitas" icon={FileText} title="Fisik & Legalitas Tanah">
                                <DataCard>
                                    <InfoItem label="Letak Tanah (Alamat Objek)" value={land.letak_tanah} span={2} />
                                    <InfoItem label="Jenis Alas Hak" value={land.alas_hak_jenis} />
                                    <InfoItem label="Nomor Alas Hak" value={land.alas_hak_nomor} isMono />
                                    <InfoItem label="Luas Terdampak" value={land.luas_terdampak ? `${land.luas_terdampak} m²` : null} span={2} />
                                </DataCard>
                            </SectionBlock>

                            {/* ── 2. Pihak Berhak ── */}
                            <SectionBlock id="pihak" icon={User} title="Pihak Berhak (Utama)">
                                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                    <ProfileHeader name={primaryRespondent.name} />
                                    <div className="bg-slate-200 gap-[1px] grid grid-cols-1 md:grid-cols-2 border-t border-slate-200">
                                        <InfoItem label="Nomor Induk Kependudukan" value={primaryRespondent.nik} isMono />
                                        <InfoItem label="Pekerjaan" value={primaryRespondent.pekerjaan} />
                                        <InfoItem label="Alamat Sesuai KTP" value={primaryRespondent.alamat_ktp} span={2} />
                                    </div>
                                </div>
                            </SectionBlock>

                            {/* ── 3. Tinjauan Lapangan ── */}
                            <SectionBlock id="lapangan" icon={ClipboardList} title="Tinjauan Lapangan & Surveyor">
                                <DataCard>
                                    <InfoItem label="Peruntukan Saat Ini" value={parcel.peruntukan_lahan} />
                                    <InfoItem label="Tipe Bangunan Dominan" value={parcel.tipe_bangunan_major} />
                                    <InfoItem label="Surveyor Bertugas" value={parcel.surveyor?.name} />
                                    <InfoItem label="Waktu Pendataan" value={parcel.created_at ? format(new Date(parcel.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale }) : null} />
                                    {parcel.catatan_lapangan && (
                                        <InfoItem label="Catatan Tambahan Surveyor" value={parcel.catatan_lapangan} span={2} isNote />
                                    )}
                                </DataCard>
                            </SectionBlock>

                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

function SectionBlock({ id, icon: Icon, title, children }) {
    return (
        <section id={`isd-${id}`} className="scroll-mt-6">
            <div className="flex items-center gap-2.5 mb-4 px-1">
                <div className="p-1.5 bg-slate-100 rounded-md text-slate-500">
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                    {title}
                </h3>
            </div>
            {children}
        </section>
    );
}

function ProfileHeader({ name }) {
    const initial = (name || '?').charAt(0).toUpperCase();
    return (
        <div className="flex items-center gap-4 px-6 py-5 bg-white">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white text-lg font-semibold flex items-center justify-center flex-shrink-0 shadow-inner">
                {initial}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-slate-900 truncate">
                    {name || <span className="text-slate-400 italic font-normal">Belum diisi</span>}
                </p>
                <p className="text-sm text-slate-500 mt-0.5 font-medium">Subjek / Pihak yang Berhak</p>
            </div>
        </div>
    );
}

function DataCard({ children }) {
    return (
        <div className="bg-slate-200 border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px]">
                {children}
            </div>
        </div>
    );
}

function InfoItem({ label, value, children, span = 1, isMono = false, isNote = false }) {
    return (
        <div className={cn(
            'flex flex-col justify-center px-6 py-4 bg-white transition-colors hover:bg-slate-50',
            span === 2 && 'col-span-1 md:col-span-2'
        )}>
            <span className="text-[13px] font-semibold tracking-wide text-slate-400 uppercase mb-1.5">
                {label}
            </span>
            {children ? (
                <div className="text-sm font-medium text-slate-900">{children}</div>
            ) : value ? (
                <span className={cn(
                    "text-[15px] leading-relaxed",
                    isMono ? "font-mono font-medium text-slate-700 bg-slate-100 w-fit px-2.5 py-1 rounded-md text-sm border border-slate-200" : "font-medium text-slate-900",
                    isNote && "bg-amber-50 text-amber-900 p-3.5 rounded-lg border border-amber-200 mt-2 text-sm"
                )}>
                    {value}
                </span>
            ) : (
                <span className="text-[15px] italic text-slate-300 font-normal">Belum diisi</span>
            )}
        </div>
    );
}
