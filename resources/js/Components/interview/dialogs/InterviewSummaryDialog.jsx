import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
    getLandStatusLabel,
    getCategoryLabel,
    getPhotoTypeLabel,
} from "@/data/mockInterviewDetails";
import {
    X,
    User,
    FileText,
    Package,
    Camera,
    Layers,
    Building2,
    Trees,
    MapPin,
    Star,
    Info,
    Plus,
} from "lucide-react";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const formatNumber = (num) =>
    num ? new Intl.NumberFormat("id-ID").format(num) : "0";

const getRoleBadgeStyles = (roleId) => {
    const id = Number(roleId);
    if (id === 1)
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
    if (id === 2)
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
    return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
};

const getRoleLabel = (roleId) => {
    const id = Number(roleId);
    if (id === 1) return "Pemilik";
    if (id === 2) return "Penggarap";
    return "Lainnya";
};

/* ─────────────────────────────────────────────
   MAIN DIALOG
───────────────────────────────────────────── */
export function InterviewSummaryDialog({ open, onOpenChange, parcel }) {
    if (!parcel) return null;

    const respondents = parcel.respondents || [];
    const land = parcel.landDetail || parcel.land_detail || {};
    const inventory = parcel.inventory_items || parcel.inventoryItems || [];
    const photos = parcel.documentation_photos || parcel.photos || [];

    const bangunan = inventory.filter((i) => i.category === "BANGUNAN");
    const tanaman = inventory.filter((i) => i.category === "TANAMAN");
    const bendaLain = inventory.filter((i) => i.category === "BENDA_LAIN");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "!p-0 !max-w-[860px] w-[95vw]",
                    "overflow-hidden rounded-2xl",
                    "border border-slate-200 dark:border-slate-800",
                    "shadow-2xl shadow-slate-900/10",
                    "bg-white dark:bg-slate-950",
                    "[&>button]:hidden",
                )}
            >
                <DialogTitle className="sr-only">
                    Ringkasan Verifikasi Pendataan
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Detail lengkap informasi objek, subjek, aset, dan
                    dokumentasi visual untuk keperluan verifikasi.
                </DialogDescription>

                <div className="flex flex-col h-[92vh] md:max-h-[88vh]">
                    {/* ── TOPBAR ── */}
                    <div className="flex items-center justify-between px-7 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-50">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2.5">
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                                    Verifikasi pendataan
                                </h2>
                                <StatusBadge status={parcel.status?.code} />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Layers size={11} />
                                <span>NIB</span>
                                <code className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs font-mono">
                                    {parcel.nomor_peta_index || "—"}
                                </code>
                                <span className="text-slate-200 dark:text-slate-700">
                                    /
                                </span>
                                <span>ID</span>
                                <code className="font-mono text-slate-600 dark:text-slate-400">
                                    {parcel.nomor_bidang || "—"}
                                </code>
                            </div>
                        </div>
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X size={16} strokeWidth={2} />
                            </Button>
                        </DialogClose>
                    </div>

                    {/* ── SCROLL AREA ── */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
                        <div className="max-w-3xl mx-auto px-7 py-8 space-y-10 pb-12">
                            {/* ── 1. LEGALITAS & DIMENSI ── */}
                            <Section
                                icon={FileText}
                                title="Legalitas & dimensi bidang"
                                subtitle="Informasi yuridis dan hasil pengukuran fisik di lapangan"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <DataCard title="Data yuridis (surat)">
                                        <InfoRow
                                            label="Status tanah"
                                            value={getLandStatusLabel(
                                                land.status_tanah_id,
                                            )}
                                        />
                                        <InfoRow
                                            label="Jenis & nomor alas hak"
                                            value={`${land.alas_hak_jenis || "—"} / ${land.alas_hak_nomor || "—"}`}
                                            mono
                                        />
                                        <InfoRow
                                            label="Luas tertulis (surat)"
                                            value={formatNumber(
                                                land.luas_surat,
                                            )}
                                            suffix="m²"
                                            accent
                                        />
                                    </DataCard>

                                    <DataCard title="Data fisik (ukur)">
                                        <InfoRow
                                            label="Letak tanah"
                                            value={land.letak_tanah}
                                            span
                                        />
                                        <InfoRow
                                            label="Luas ukur"
                                            value={formatNumber(land.luas_ukur)}
                                            suffix="m²"
                                        />
                                        <InfoRow
                                            label="Terdampak"
                                            value={formatNumber(
                                                land.luas_terdampak,
                                            )}
                                            suffix="m²"
                                            variant="danger"
                                        />
                                        <InfoRow
                                            label="Sisa"
                                            value={formatNumber(land.luas_sisa)}
                                            suffix="m²"
                                            variant="success"
                                        />
                                    </DataCard>

                                    <div className="md:col-span-2 grid grid-cols-3 gap-3">
                                        <DataCard>
                                            <InfoRow
                                                label="Pembebanan hak"
                                                value={land.pembebanan_hak}
                                            />
                                        </DataCard>
                                        <DataCard>
                                            <InfoRow
                                                label="Ruang atas/bawah"
                                                value={
                                                    land.ruang_atas_bawah_tanah
                                                }
                                            />
                                        </DataCard>
                                        <DataCard>
                                            <InfoRow
                                                label="Perkiraan dampak"
                                                value={land.perkiraan_dampak}
                                            />
                                        </DataCard>
                                    </div>
                                </div>
                            </Section>

                            <Divider />

                            {/* ── 2. PIHAK YANG BERHAK ── */}
                            <Section
                                icon={User}
                                title="Pihak yang berhak"
                                subtitle="Daftar seluruh pihak yang menguasai atau memiliki hak atas bidang"
                            >
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                                                {[
                                                    "Profil",
                                                    "NIK",
                                                    "Peran",
                                                    "Pekerjaan & kontak",
                                                ].map((h) => (
                                                    <th
                                                        key={h}
                                                        className="px-5 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {respondents.length > 0 ? (
                                                respondents.map((r, i) => (
                                                    <tr
                                                        key={i}
                                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                                    >
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div
                                                                    className={cn(
                                                                        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                                                                        r.is_primary
                                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 ring-2 ring-amber-200 dark:ring-amber-800"
                                                                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                                                                    )}
                                                                >
                                                                    {(
                                                                        r.nama ||
                                                                        r.name ||
                                                                        "?"
                                                                    )
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">
                                                                        {r.nama ||
                                                                            r.name}
                                                                    </p>
                                                                    {r.is_primary && (
                                                                        <span className="text-xs text-amber-600 dark:text-amber-500 font-semibold flex items-center gap-0.5 uppercase tracking-tight mt-0.5">
                                                                            <Star
                                                                                size={
                                                                                    7
                                                                                }
                                                                                fill="currentColor"
                                                                            />
                                                                            Wakil
                                                                            utama
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                                                            {r.nik || "—"}
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "text-xs font-medium px-2 py-0 h-5",
                                                                    getRoleBadgeStyles(
                                                                        r.role_id,
                                                                    ),
                                                                )}
                                                            >
                                                                {getRoleLabel(
                                                                    r.role_id,
                                                                )}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                {r.pekerjaan ||
                                                                    "—"}
                                                            </p>
                                                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                                                                {r.no_telepon ||
                                                                    "—"}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="4"
                                                        className="px-5 py-10 text-center text-sm text-slate-500 italic"
                                                    >
                                                        Belum ada data
                                                        responden.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Section>

                            <Divider />

                            {/* ── 3. INVENTARISASI ── */}
                            <Section
                                icon={Package}
                                title="Inventarisasi aset & benda atas tanah"
                                subtitle="Bangunan, tanaman, dan utilitas lainnya yang terdampak"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <InventoryCard
                                        title="Bangunan"
                                        icon={Building2}
                                        items={bangunan}
                                        color="blue"
                                    />
                                    <InventoryCard
                                        title="Tanaman"
                                        icon={Trees}
                                        items={tanaman}
                                        color="emerald"
                                    />
                                    <InventoryCard
                                        title="Lain-lain"
                                        icon={Plus}
                                        items={bendaLain}
                                        color="orange"
                                    />
                                </div>
                            </Section>

                            <Divider />

                            {/* ── 4. DOKUMENTASI VISUAL ── */}
                            <Section
                                icon={Camera}
                                title="Bukti visual & geotagging"
                                subtitle="Dokumentasi asli dari lapangan dengan koordinat GPS"
                            >
                                {photos.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {photos.map((p, i) => (
                                            <div
                                                key={i}
                                                className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                                            >
                                                <img
                                                    src={
                                                        p.file_path
                                                            ? `/storage/${p.file_path}`
                                                            : p.url
                                                    }
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    alt={
                                                        p.file_name ||
                                                        `Foto ${i + 1}`
                                                    }
                                                    onError={(e) => {
                                                        e.target.src =
                                                            "https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Photo";
                                                    }}
                                                />
                                                <div className="absolute top-2 left-2">
                                                    <span className="bg-white/90 dark:bg-black/60 text-slate-800 dark:text-slate-200 text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                                        {getPhotoTypeLabel(
                                                            p.photo_type_id,
                                                        )}
                                                    </span>
                                                </div>
                                                {p.latitude && (
                                                    <div className="absolute bottom-2 left-2 right-2">
                                                        <div className="bg-black/55 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                                                            <MapPin
                                                                size={8}
                                                                className="text-white/80 shrink-0"
                                                            />
                                                            <span className="text-xs font-mono text-white/90 truncate leading-none">
                                                                {Number(
                                                                    p.latitude,
                                                                ).toFixed(6)}
                                                                ,{" "}
                                                                {Number(
                                                                    p.longitude,
                                                                ).toFixed(6)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                                        <Camera className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Tidak ada dokumentasi visual.
                                        </p>
                                    </div>
                                )}
                            </Section>

                            <Divider />

                            {/* ── 5. SURVEYOR INFO ── */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0">
                                        <Info size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
                                            Surveyor bertugas
                                        </p>
                                        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                            {parcel.surveyor?.name || "—"}
                                        </p>
                                    </div>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
                                        Waktu pendataan
                                    </p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {parcel.created_at
                                            ? format(
                                                  new Date(parcel.created_at),
                                                  "eeee, dd MMMM yyyy · HH:mm",
                                                  { locale: idLocale },
                                              )
                                            : "—"}
                                    </p>
                                </div>
                            </div>
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

function Section({ icon: Icon, title, subtitle, children }) {
    return (
        <section>
            <div className="flex items-start gap-3 mb-4">
                <div className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                    <Icon size={15} strokeWidth={1.75} />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-tight">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {children}
        </section>
    );
}

function DataCard({ title, children }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {title && (
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {title}
                    </span>
                </div>
            )}
            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 dark:divide-slate-800">
                {children}
            </div>
        </div>
    );
}

function InfoRow({
    label,
    value,
    span = false,
    mono = false,
    accent = false,
    suffix = null,
    variant = "default",
}) {
    const isDanger = variant === "danger";
    const isSuccess = variant === "success";

    return (
        <div
            className={cn(
                "flex flex-col px-4 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors",
                span && "col-span-2",
            )}
        >
            <span className="text-xs font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-1">
                {label}
            </span>
            <div className="flex items-baseline gap-1">
                <span
                    className={cn(
                        "text-sm font-medium truncate leading-snug",
                        mono && "font-mono text-xs",
                        accent &&
                            "text-indigo-600 dark:text-indigo-400 text-[15px]",
                        isDanger && "text-rose-600 dark:text-rose-400",
                        isSuccess && "text-emerald-600 dark:text-emerald-400",
                        !accent &&
                            !isDanger &&
                            !isSuccess &&
                            "text-slate-900 dark:text-white",
                    )}
                >
                    {value || "—"}
                </span>
                {suffix && value && (
                    <span
                        className={cn(
                            "text-xs text-slate-500 dark:text-slate-400",
                            isDanger && "text-rose-600",
                            isSuccess && "text-emerald-600",
                        )}
                    >
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

function InventoryCard({ title, icon: Icon, items, color }) {
    const colorMap = {
        blue: {
            header: "bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900",
            text: "text-blue-700 dark:text-blue-400",
        },
        emerald: {
            header: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900",
            text: "text-emerald-700 dark:text-emerald-400",
        },
        orange: {
            header: "bg-orange-50 dark:bg-orange-950/50 border-orange-100 dark:border-orange-900",
            text: "text-orange-700 dark:text-orange-400",
        },
    };

    const c = colorMap[color] || colorMap.blue;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div
                className={cn(
                    "px-4 py-2 flex items-center justify-between border-b",
                    c.header,
                )}
            >
                <div
                    className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold",
                        c.text,
                    )}
                >
                    <Icon size={13} strokeWidth={2} />
                    {title}
                </div>
                <span className="text-xs font-medium bg-white/60 dark:bg-black/20 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0">
                    {items.length}
                </span>
            </div>
            <div className="flex-1">
                {items.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {items.slice(0, 5).map((item, idx) => (
                            <div
                                key={idx}
                                className="px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                        {item.jenis_item}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                        {item.spesifikasi || "—"}
                                    </p>
                                </div>
                                <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 shrink-0">
                                    {formatNumber(item.jumlah)}{" "}
                                    <span className="text-xs font-sans font-normal text-slate-500">
                                        {item.satuan}
                                    </span>
                                </span>
                            </div>
                        ))}
                        {items.length > 5 && (
                            <div className="px-4 py-2 text-center bg-slate-50 dark:bg-slate-800/30">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    +{items.length - 5} item lainnya
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-8 flex flex-col items-center justify-center opacity-25 dark:opacity-20">
                        <Icon size={18} className="text-slate-500" />
                        <span className="text-xs font-medium text-slate-500 mt-1.5">
                            Kosong
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function Divider() {
    return <div className="h-px bg-slate-100 dark:bg-slate-800" />;
}
