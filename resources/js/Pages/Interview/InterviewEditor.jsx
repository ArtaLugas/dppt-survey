import { useState, useMemo } from "react";
import { router, Head } from "@inertiajs/react";
import {
    ArrowLeft,
    Lock,
    AlertCircle,
    Users,
    MapPin,
    Package,
    Camera,
    FileText,
    CheckCircle2,
    ShieldCheck,
    XCircle,
    AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { DashboardLayout } from "@/Components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";
import {
    useInterviewAccess,
    getStatusLabel,
    getStatusColor,
} from "@/hooks/useInterviewAccess";
import { cn } from "@/lib/utils";

import { ParcelInfoTab } from "@/Components/interview/tabs/ParcelInfoTab";
import { RespondentsTab } from "@/Components/interview/tabs/RespondentsTab";
import { LandDetailTab } from "@/Components/interview/tabs/LandDetailTab";
import { InventoryTab } from "@/Components/interview/tabs/InventoryTab";
import { DocumentationPhotosTab } from "@/Components/interview/tabs/DocumentationPhotosTab";

const TABS = [
    {
        id: "info",
        label: "Bidang",
        icon: <FileText className="h-4 w-4" />,
        requiresSaved: false,
    },
    {
        id: "respondents",
        label: "Responden",
        icon: <Users className="h-4 w-4" />,
        requiresSaved: true,
    },
    {
        id: "land-detail",
        label: "Detail Tanah",
        icon: <MapPin className="h-4 w-4" />,
        requiresSaved: true,
    },
    {
        id: "inventory",
        label: "Inventaris",
        icon: <Package className="h-4 w-4" />,
        requiresSaved: true,
    },
    {
        id: "photos",
        label: "Foto",
        icon: <Camera className="h-4 w-4" />,
        requiresSaved: true,
    },
];

export default function InterviewEditor({
    auth,
    parcel = null,
    respondents = [],
    landDetail = null,
    inventoryItems = [],
    photos = [],
    photoTypes = [],
    respondentRoles = [],
    tab = "info",
}) {
    const { toast } = useToast();
    const isCreateMode = !parcel;

    const [activeTab, setActiveTab] = useState(tab);
    const [isSaving, setIsSaving] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);

    const currentUser = auth?.user || { id: null };
    const userRoleString =
        currentUser?.role?.code ??
        (currentUser?.role_id === 3
            ? "surveyor"
            : currentUser?.role_id === 2
              ? "koordinator"
              : currentUser?.role_id === 1
                ? "admin"
                : "unknown");

    const accessState = useInterviewAccess({
        interview: parcel,
        userRole: userRoleString,
        isOwner:
            Number(parcel?.surveyor_id) === Number(currentUser.id) ||
            isCreateMode,
    });

    // ── NAVIGASI KEMBALI ──────────────────────────────────────────────────────
    const handleBack = () => {
        if (window.history.length > 2 || document.referrer) {
            window.history.back();
        } else {
            const fallback = {
                surveyor: route("surveyor.dashboard"),
                koordinator: route("koordinator.dashboard"),
                admin: route("admin.dashboard"),
            };
            router.visit(fallback[userRoleString] ?? "/");
        }
    };

    // ── CHECKLIST KELENGKAPAN ─────────────────────────────────────────────────
    const photoValidation = useMemo(() => {
        if (!photoTypes || photoTypes.length === 0) return { valid: false };
        const isAllValid = photoTypes.every((pt) => {
            const count = photos.filter(
                (p) => p.photo_type_id === pt.id || p.photoTypeId === pt.id,
            ).length;
            const minRequired = pt.min_qty ?? pt.minQty ?? 0;
            return count >= minRequired;
        });
        return { valid: isAllValid };
    }, [photos, photoTypes]);

    const readinessChecklist = useMemo(
        () => [
            { id: "info", label: "Informasi Dasar", met: !!parcel },
            {
                id: "respondents",
                label: "Data Responden",
                met: respondents.length > 0,
            },
            { id: "landDetail", label: "Detail Tanah", met: !!landDetail },
            {
                id: "inventory",
                label: "Inventaris",
                met: inventoryItems.length > 0,
            },
            { id: "photos", label: "Bukti Visual", met: photoValidation.valid },
        ],
        [parcel, respondents, landDetail, inventoryItems, photoValidation],
    );

    const canSubmit = readinessChecklist.every((item) => item.met);

    // ── HANDLERS ──────────────────────────────────────────────────────────────

    /**
     * POST /surveyor/interviews          → surveyor.interviews.store
     * PUT  /surveyor/interviews/{parcel} → surveyor.interviews.update
     */
    const handleSaveParcelInfo = (data, callbacks = {}) => {
        const url = isCreateMode
            ? route("surveyor.interviews.store")
            : route("surveyor.interviews.update", parcel.id);
        const method = isCreateMode ? "post" : "put";

        router[method](url, data, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setIsSaving(true),
            onSuccess: (page) => {
                toast({
                    title: "Tersimpan",
                    description: "Data informasi bidang berhasil disimpan.",
                });
                if (callbacks.onSuccess) callbacks.onSuccess(page);
            },
            onError: (errors) => {
                toast({
                    title: "Gagal",
                    description: Object.values(errors)[0],
                    variant: "destructive",
                });
                if (callbacks.onError) callbacks.onError(errors);
            },
            onFinish: () => setIsSaving(false),
        });
    };

    /**
     * POST /surveyor/interviews/{parcel}/submit → surveyor.interviews.submit
     */
    const handleSubmit = () => {
        if (!canSubmit) return;
        router.post(
            route("surveyor.interviews.submit", parcel.id),
            {},
            {
                preserveState: true,
                onStart: () => setIsSaving(true),
                onSuccess: () => {
                    toast({
                        title: "Verifikasi Terkirim",
                        description:
                            "Data berhasil disubmit dan dikunci untuk proses review.",
                    });
                    setShowSubmitDialog(false);
                    handleBack();
                },
                onError: (errors) =>
                    toast({
                        title: "Gagal Submit",
                        description:
                            Object.values(errors)[0] || "Terjadi kesalahan.",
                        variant: "destructive",
                    }),
                onFinish: () => setIsSaving(false),
            },
        );
    };

    /**
     * POST /surveyor/interviews/{parcel}/respondents → surveyor.interviews.respondents.store
     */
    const handleAddRespondent = (data, callbacks = {}) => {
        router.post(
            route("surveyor.interviews.respondents.store", parcel.id),
            data,
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast({
                        title: "Berhasil",
                        description: "Responden ditambahkan.",
                    });
                    if (callbacks.onSuccess) callbacks.onSuccess(page);
                },
                onError: (errors) => {
                    toast({
                        title: "Gagal",
                        description: "Cek input Anda.",
                        variant: "destructive",
                    });
                    if (callbacks.onError) callbacks.onError(errors);
                },
            },
        );
    };

    /**
     * PUT /surveyor/interviews/respondents/{respondent} → surveyor.interviews.respondents.update
     */
    const handleEditRespondent = (id, data, callbacks = {}) => {
        router.put(route("surveyor.interviews.respondents.update", id), data, {
            preserveScroll: true,
            onSuccess: (page) => {
                toast({
                    title: "Berhasil",
                    description: "Data responden diperbarui.",
                });
                if (callbacks.onSuccess) callbacks.onSuccess(page);
            },
            onError: (errors) => {
                console.error("LARAVEL REJECTED:", errors);
                toast({
                    title: "Ditolak Server",
                    description:
                        Object.values(errors).join(" | ") ||
                        "Gagal menyimpan ke database.",
                    variant: "destructive",
                });
                if (callbacks.onError) callbacks.onError(errors);
            },
        });
    };

    /**
     * DELETE /surveyor/interviews/respondents/{respondent} → surveyor.interviews.respondents.destroy
     */
    const handleDeleteRespondent = (id) => {
        router.delete(route("surveyor.interviews.respondents.destroy", id), {
            preserveScroll: true,
            onSuccess: () =>
                toast({ title: "Berhasil", description: "Responden dihapus." }),
        });
    };

    /**
     * POST /surveyor/interviews/{parcel}/land-details → surveyor.interviews.land-details.store
     */
    const handleSaveLandDetail = (data, callbacks = {}) => {
        router.post(
            route("surveyor.interviews.land-details.store", parcel.id),
            data,
            {
                preserveScroll: true,
                onStart: () => {
                    if (callbacks.onStart) callbacks.onStart();
                },
                onSuccess: (page) => {
                    toast({
                        title: "Berhasil",
                        description: "Detail bidang tanah berhasil disimpan.",
                    });
                    if (callbacks.onSuccess) callbacks.onSuccess(page);
                },
                onError: (err) => {
                    if (callbacks.onError) callbacks.onError(err);
                },
                onFinish: () => {
                    if (callbacks.onFinish) callbacks.onFinish();
                },
            },
        );
    };

    const handleDeleteLandDetail = (callbacks = {}) => {
        router.delete(
            route("surveyor.interviews.land-details.destroy", parcel.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: "Berhasil",
                        description: "Detail tanah telah dikosongkan.",
                    });
                    if (callbacks.onSuccess) callbacks.onSuccess();
                },
                onFinish: () => {
                    if (callbacks.onFinish) callbacks.onFinish();
                },
            },
        );
    };

    /**
     * POST /surveyor/interviews/{parcel}/inventory-items → surveyor.interviews.inventory-items.store
     */
    const handleAddInventory = (data, callbacks = {}) => {
        router.post(
            route("surveyor.interviews.inventory-items.store", parcel.id),
            data,
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast({
                        title: "Berhasil",
                        description: "Aset baru berhasil ditambahkan.",
                    });
                    if (callbacks.onSuccess) callbacks.onSuccess(page);
                },
                onError: (errors) => {
                    toast({
                        title: "Gagal",
                        description: "Periksa kembali isian form anda.",
                        variant: "destructive",
                    });
                    if (callbacks.onError) callbacks.onError(errors);
                },
            },
        );
    };

    /**
     * PUT /surveyor/interviews/inventory-items/{inventoryItem} → surveyor.interviews.inventory-items.update
     */
    const handleEditInventory = (itemId, data, callbacks = {}) => {
        router.put(
            route("surveyor.interviews.inventory-items.update", itemId),
            data,
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast({
                        title: "Berhasil",
                        description: "Data aset diperbarui.",
                    });
                    if (callbacks.onSuccess) callbacks.onSuccess(page);
                },
                onError: (errors) => {
                    toast({ title: "Gagal", variant: "destructive" });
                    if (callbacks.onError) callbacks.onError(errors);
                },
            },
        );
    };

    /**
     * DELETE /surveyor/interviews/inventory-items/{inventoryItem} → surveyor.interviews.inventory-items.destroy
     */
    const handleDeleteInventory = (itemId) => {
        router.delete(
            route("surveyor.interviews.inventory-items.destroy", itemId),
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast({
                        title: "Terhapus",
                        description: "Data aset telah dihapus.",
                    }),
            },
        );
    };

    /**
     * POST /surveyor/interviews/{parcel}/documentation-photos → surveyor.interviews.documentation-photos.store
     */
    const handleAddPhoto = (data, callbacks = {}) => {
        router.post(
            route("surveyor.interviews.documentation-photos.store", parcel.id),
            data,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    toast({
                        title: "Berhasil",
                        description: "Foto berhasil diunggah.",
                    });
                    if (callbacks.onSuccess) callbacks.onSuccess(page);
                },
                onError: (errors) => {
                    toast({
                        title: "Gagal Mengunggah",
                        description:
                            Object.values(errors)[0] || "Periksa koneksi.",
                        variant: "destructive",
                    });
                    if (callbacks.onError) callbacks.onError(errors);
                },
            },
        );
    };

    /**
     * DELETE /surveyor/interviews/documentation-photos/{photo} → surveyor.interviews.documentation-photos.destroy
     */
    const handleDeletePhoto = (photoId, callbacks = {}) => {
        router.delete(
            route("surveyor.interviews.documentation-photos.destroy", photoId),
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: "Terhapus",
                        description: "Foto dokumentasi telah dihapus.",
                    });
                    if (callbacks.onSuccess) callbacks.onSuccess();
                },
                onFinish: () => {
                    if (callbacks.onFinish) callbacks.onFinish();
                },
            },
        );
    };

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <DashboardLayout
            userName={currentUser.name}
            userRole={currentUser.role}
        >
            <Head>
                <title>
                    {isCreateMode
                        ? "Registrasi Bidang Baru | Surveyor Dashboard"
                        : `Berkas ${parcel?.nomor_peta_index || ""} | Surveyor Dashboard`}
                </title>
            </Head>

            <div className="w-full space-y-8 animate-in fade-in duration-500 pb-10">
                {/* ── STICKY HEADER ─────────────────────────────────────────── */}
                <div className="sticky top-[-30px] z-40 -mx-6 px-6 py-4 mb-6 bg-background/95 backdrop-blur-md border-b border-border/60 transition-all duration-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                                className="rounded-full hover:bg-muted/80"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                                    {isCreateMode
                                        ? "Registrasi Bidang Baru"
                                        : "Berkas Bidang"}
                                </h1>
                                {parcel && (
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground font-semibold">
                                            {parcel.nomor_peta_index}
                                        </span>
                                        <Badge
                                            className={cn(
                                                "px-2 py-0.5 text-[10px] font-bold shadow-sm",
                                                getStatusColor(
                                                    parcel.status_id,
                                                ),
                                            )}
                                        >
                                            {getStatusLabel(parcel.status_id)}
                                        </Badge>
                                        <span className="hidden sm:inline">
                                            •
                                        </span>
                                        {parcel.updated_at && (
                                            <span className="hidden sm:inline">
                                                Update:{" "}
                                                {format(
                                                    new Date(parcel.updated_at),
                                                    "dd MMM yyyy • HH:mm",
                                                    { locale: idLocale },
                                                )}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {parcel && accessState.canSubmit && (
                                <Button
                                    onClick={() => setShowSubmitDialog(true)}
                                    disabled={!canSubmit || isSaving}
                                    size="sm"
                                    className={cn(
                                        "rounded-full px-6 font-bold shadow-md transition-all",
                                        canSubmit
                                            ? "bg-primary hover:bg-primary/90"
                                            : "bg-muted text-muted-foreground shadow-none",
                                    )}
                                >
                                    {canSubmit ? (
                                        <ShieldCheck className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Lock className="h-3.5 w-3.5 mr-2" />
                                    )}
                                    {canSubmit ? "Finalisasi" : "Belum Lengkap"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── ALERT REVISI DARI KOORDINATOR ────────────────────────── */}
                {parcel?.catatan_revisi && (
                    <Alert className="bg-rose-50 border-rose-200 text-rose-800 rounded-2xl border-2 shadow-sm animate-in slide-in-from-top-4 duration-500">
                        <AlertCircle className="h-5 w-5 text-rose-600" />
                        <div className="ml-2">
                            <AlertTitle className="font-black text-rose-900 flex items-center gap-2">
                                Catatan Revisi Koordinator
                                <Badge
                                    variant="outline"
                                    className="bg-rose-100 text-rose-700 border-rose-200 text-[10px]"
                                >
                                    PENTING
                                </Badge>
                            </AlertTitle>
                            <AlertDescription className="text-rose-700 mt-2 font-medium leading-relaxed italic">
                                "{parcel.catatan_revisi}"
                            </AlertDescription>
                        </div>
                    </Alert>
                )}

                {/* ── ALERT TERKUNCI ────────────────────────────────────────── */}
                {accessState.isFinal && (
                    <Alert
                        variant="destructive"
                        className="bg-red-50 border-red-200 text-red-800 rounded-2xl"
                    >
                        <Lock className="h-5 w-5 text-red-600" />
                        <div className="ml-2">
                            <AlertTitle className="font-bold text-red-900">
                                Berkas Terkunci (Read-Only)
                            </AlertTitle>
                            <AlertDescription className="text-red-700 mt-1">
                                Data ini sudah disubmit atau diverifikasi. Anda
                                tidak dapat lagi melakukan perubahan.
                            </AlertDescription>
                        </div>
                    </Alert>
                )}

                {/* ── WIDGET CHECKLIST ──────────────────────────────────────── */}
                {parcel && accessState.canSubmit && (
                    <Card
                        className={cn(
                            "border-none shadow-sm rounded-3xl overflow-hidden transition-colors w-full",
                            canSubmit ? "bg-emerald-50/50" : "bg-muted/30",
                        )}
                    >
                        <CardContent className="p-5 md:p-6">
                            <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                                <div className="space-y-1 max-w-lg">
                                    <h3 className="text-base font-black flex items-center gap-2">
                                        {canSubmit ? (
                                            <CheckCircle2 className="text-emerald-500 h-5 w-5" />
                                        ) : (
                                            <AlertTriangle className="text-amber-500 h-5 w-5" />
                                        )}
                                        {canSubmit
                                            ? "Data Siap Dikirim"
                                            : "Status Kelengkapan Berkas"}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {canSubmit
                                            ? "Seluruh prasyarat telah terpenuhi. Anda dapat melakukan submit data sekarang."
                                            : "Lengkapi indikator merah di bawah ini untuk membuka akses pengiriman berkas."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 w-full xl:w-auto xl:justify-end">
                                    {readinessChecklist.map((item) => (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "flex items-center gap-2.5 p-2.5 px-4 rounded-xl border bg-background shadow-sm transition-all",
                                                item.met
                                                    ? "border-emerald-200"
                                                    : "border-red-200 animate-pulse",
                                            )}
                                        >
                                            {item.met ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                                            )}
                                            <span
                                                className={cn(
                                                    "text-xs font-bold whitespace-nowrap",
                                                    item.met
                                                        ? "text-foreground"
                                                        : "text-red-700",
                                                )}
                                            >
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── TABS ──────────────────────────────────────────────────── */}
                <div className="w-full">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full space-y-8"
                    >
                        <div className="flex w-full overflow-x-auto pb-2 scrollbar-hide">
                            <TabsList className="flex h-auto p-1.5 bg-background border border-border/60 shadow-sm rounded-2xl min-w-max">
                                {TABS.map((t) => (
                                    <TabsTrigger
                                        key={t.id}
                                        value={t.id}
                                        disabled={t.requiresSaved && !parcel}
                                        className="gap-2 rounded-xl py-3 px-6 font-bold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                                    >
                                        {t.icon}
                                        <span>{t.label}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className="w-full">
                            <TabsContent
                                value="info"
                                className="focus-visible:outline-none mt-0"
                            >
                                <ParcelInfoTab
                                    parcel={parcel}
                                    accessState={accessState}
                                    onSave={handleSaveParcelInfo}
                                    isLoading={isSaving}
                                />
                            </TabsContent>

                            <TabsContent
                                value="respondents"
                                className="focus-visible:outline-none mt-0"
                            >
                                {parcel ? (
                                    <RespondentsTab
                                        parcelId={parcel.id}
                                        respondents={respondents}
                                        respondentRoles={respondentRoles}
                                        accessState={accessState}
                                        onAdd={handleAddRespondent}
                                        onEdit={handleEditRespondent}
                                        onDelete={handleDeleteRespondent}
                                    />
                                ) : (
                                    <EmptyMsg />
                                )}
                            </TabsContent>

                            <TabsContent
                                value="land-detail"
                                className="focus-visible:outline-none mt-0"
                            >
                                {parcel ? (
                                    <LandDetailTab
                                        parcelId={parcel.id}
                                        landDetail={landDetail}
                                        accessState={accessState}
                                        onSave={handleSaveLandDetail}
                                        onDelete={handleDeleteLandDetail}
                                    />
                                ) : (
                                    <EmptyMsg />
                                )}
                            </TabsContent>

                            <TabsContent
                                value="inventory"
                                className="focus-visible:outline-none mt-0"
                            >
                                {parcel ? (
                                    <InventoryTab
                                        parcelId={parcel.id}
                                        items={inventoryItems}
                                        accessState={accessState}
                                        onAdd={handleAddInventory}
                                        onEdit={handleEditInventory}
                                        onDelete={handleDeleteInventory}
                                    />
                                ) : (
                                    <EmptyMsg />
                                )}
                            </TabsContent>

                            <TabsContent
                                value="photos"
                                className="focus-visible:outline-none mt-0"
                            >
                                {parcel ? (
                                    <DocumentationPhotosTab
                                        parcelId={parcel.id}
                                        photos={photos}
                                        photoTypes={photoTypes}
                                        accessState={accessState}
                                        onAdd={handleAddPhoto}
                                        onDelete={handleDeletePhoto}
                                    />
                                ) : (
                                    <EmptyMsg />
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* ── MODAL DEKLARASI INTEGRITAS ────────────────────────────── */}
                <Dialog
                    open={showSubmitDialog}
                    onOpenChange={setShowSubmitDialog}
                >
                    <DialogContent className="max-w-md p-0 overflow-hidden bg-background sm:rounded-[2rem] border-none shadow-2xl">
                        <div className="bg-primary/10 p-8 flex flex-col items-center justify-center text-center border-b border-primary/20">
                            <div className="h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-foreground">
                                Deklarasi Integritas Data
                            </DialogTitle>
                        </div>

                        <div className="p-8 space-y-6">
                            <DialogDescription className="text-base text-foreground font-medium leading-relaxed">
                                Dengan menekan tombol submit, Anda menyatakan
                                bahwa:
                                <ul className="list-disc pl-5 space-y-2 mt-4 text-muted-foreground text-sm">
                                    <li>
                                        Data identitas, ukuran, dan aset diisi
                                        sesuai fakta di lapangan.
                                    </li>
                                    <li>
                                        Foto dokumentasi bersifat asli tanpa
                                        manipulasi (GPS).
                                    </li>
                                    <li>
                                        Data ini akan dikunci untuk verifikasi
                                        lanjutan.
                                    </li>
                                </ul>
                            </DialogDescription>

                            <div className="flex gap-3 pt-4 border-t border-border">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full font-bold h-12 rounded-xl"
                                    onClick={() => setShowSubmitDialog(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="w-full font-bold h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                >
                                    {isSaving
                                        ? "Memproses..."
                                        : "Ya, Submit Berkas"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}

function EmptyMsg() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-muted rounded-[2rem] bg-muted/5 w-full">
            <div className="h-16 w-16 bg-muted flex items-center justify-center rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
                Akses Terkunci
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-2">
                Anda harus mengisi dan menyimpan Informasi Dasar Bidang terlebih
                dahulu pada Tab Bidang.
            </p>
        </div>
    );
}
