import { useState, useMemo, useId, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    User,
    Lock,
    Bell,
    Camera,
    ShieldCheck,
    Mail,
    Smartphone,
    Loader2,
    CheckCircle2,
    KeyRound,
    AtSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountSettingsDialog({ open, onOpenChange }) {
    const { auth } = usePage().props; // Data Authenticated User
    const user = auth.user;
    const [activeTab, setActiveTab] = useState("profile");

    // ID Unik untuk mencegah tabrakan id input antara TopNav & Sidebar
    const fileInputId = useId();

    // Form Profile State
    const [showProfileSuccess, setShowProfileSuccess] = useState(false);
    // Form Profil
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: null,
    });

    const [avatarPreview, setAvatarPreview] = useState(
        user.avatar ? `/storage/${user.avatar}` : null,
    );

    // Form Keamanan State
    const [showSecuritySuccess, setShowSecuritySuccess] = useState(false);
    // Form Keamanan
    const securityForm = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    // Variabel Animasi
    const tabVariants = {
        initial: { opacity: 0, y: 8, scale: 0.99, filter: "blur(4px)" },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8,
            },
        },
        exit: {
            opacity: 0,
            y: -4,
            scale: 0.99,
            filter: "blur(2px)",
            transition: { duration: 0.15, ease: "easeOut" },
        },
    };

    const initials = useMemo(() => {
        return (
            user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "??"
        );
    }, [user.name]);

    // Variabel Animasi Banner Sukses
    const successBannerVariants = {
        initial: { height: 0, opacity: 0, marginBottom: 0 },
        animate: { height: "auto", opacity: 1, marginBottom: 20 },
        exit: { height: 0, opacity: 0, marginBottom: 0 },
    };

    const submitProfile = (e) => {
        e.preventDefault();
        setShowProfileSuccess(false); // Reset dulu
        profileForm.post(route("profile.update", { _method: "patch" }), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowProfileSuccess(true);
                setTimeout(() => setShowProfileSuccess(false), 3000); // Hilang setelah 3 detik
            },
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            profileForm.setData("avatar", file);

            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submitSecurity = (e) => {
        e.preventDefault();
        setShowSecuritySuccess(false); // Reset dulu
        securityForm.put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => {
                securityForm.reset();
                setShowSecuritySuccess(true);
                setTimeout(() => setShowSecuritySuccess(false), 3000); // Hilang setelah 3 detik
            },
        });
    };

    const roleLabel = user.role?.label || user.role?.code || "User";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-2xl">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50/30 px-6 py-8 border-b border-slate-100 relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl" />

                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="relative group">
                                {/* Outer Ring Animation effect */}
                                <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>

                                <Avatar className="relative h-16 w-16 border-[3px] border-white shadow-md transition-transform duration-300 group-hover:scale-105">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt={user.name}
                                            className="h-full w-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white text-xl font-bold">
                                            {initials}
                                        </AvatarFallback>
                                    )}
                                </Avatar>

                                <div className="absolute -bottom-1 -right-1">
                                    <label
                                        htmlFor={`avatar-upload-${fileInputId}`}
                                        className="flex items-center justify-center p-1.5 bg-white text-slate-600 rounded-full border border-slate-200 shadow-sm hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
                                        title="Ubah Foto Profil"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </label>
                                    <input
                                        id={`avatar-upload-${fileInputId}`}
                                        type="file"
                                        accept="image/jpeg, image/png, image/jpg"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 flex-1">
                                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                    Pengaturan Akun
                                </DialogTitle>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                        <AtSign className="h-3.5 w-3.5 text-slate-400" />
                                        {user.email}
                                    </span>
                                    <div className="h-3.5 w-px bg-slate-300" />
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                    >
                                        {roleLabel}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full relative"
                >
                    <div className="px-6 bg-white border-b border-slate-100 relative z-10 shadow-sm">
                        <TabsList className="bg-transparent h-14 p-0 gap-8 w-full justify-start">
                            {[
                                { id: "profile", label: "Profil", icon: User },
                                {
                                    id: "security",
                                    label: "Keamanan",
                                    icon: Lock,
                                },
                                {
                                    id: "notifications",
                                    label: "Notifikasi",
                                    icon: Bell,
                                },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-14 px-0 text-slate-500 data-[state=active]:text-blue-700 font-semibold transition-all text-sm gap-2 uppercase tracking-wide"
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{tab.label}</span>

                                        {/* Indikator Garis Bawah yang Smooth */}
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="activeTabIndicator"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 380,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    <ScrollArea className="max-h-[60vh] bg-slate-50/50">
                        <div className="p-6 md:p-8 overflow-x-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    variants={tabVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    {/* --- TAB: PROFILE --- */}
                                    {activeTab === "profile" && (
                                        <form
                                            onSubmit={submitProfile}
                                            className="space-y-6"
                                        >
                                            <AnimatePresence>
                                                {showProfileSuccess && (
                                                    <motion.div
                                                        variants={
                                                            successBannerVariants
                                                        }
                                                        initial="initial"
                                                        animate="animate"
                                                        exit="exit"
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-3 text-emerald-700 shadow-sm">
                                                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                                                            <span className="text-xs font-semibold uppercase tracking-wider">
                                                                Perubahan
                                                                Berhasil
                                                                Disimpan
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <div className="grid gap-6 sm:grid-cols-2">
                                                <div className="space-y-2.5">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                        Nama Lengkap
                                                    </Label>
                                                    <div className="relative group">
                                                        <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                        <Input
                                                            value={
                                                                profileForm.data
                                                                    .name
                                                            }
                                                            onChange={(e) =>
                                                                profileForm.setData(
                                                                    "name",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-10 pl-10 bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all rounded-lg shadow-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                        Email Kerja
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            value={
                                                                profileForm.data
                                                                    .email
                                                            }
                                                            disabled
                                                            className="h-10 pl-10 bg-slate-100/80 text-slate-500 border-slate-200 cursor-not-allowed rounded-lg shadow-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5 sm:col-span-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                        Nomor Telepon / WhatsApp
                                                    </Label>
                                                    <div className="relative group">
                                                        <Smartphone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                        <Input
                                                            value={
                                                                profileForm.data
                                                                    .phone || ""
                                                            }
                                                            onChange={(e) =>
                                                                profileForm.setData(
                                                                    "phone",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Contoh: 08123456789"
                                                            className="h-10 pl-10 bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all rounded-lg shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        profileForm.processing
                                                    }
                                                    className={cn(
                                                        "px-6 h-10 rounded-lg transition-all flex items-center justify-center min-w-[160px]",
                                                        showProfileSuccess
                                                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                                                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 shadow-md text-white",
                                                    )}
                                                >
                                                    {profileForm.processing ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : showProfileSuccess ? (
                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    )}
                                                    {showProfileSuccess
                                                        ? "Tersimpan!"
                                                        : "Simpan Perubahan"}
                                                </Button>
                                            </div>
                                        </form>
                                    )}

                                    {/* --- TAB: SECURITY --- */}
                                    {activeTab === "security" && (
                                        <div className="space-y-6">
                                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100/80 rounded-xl flex gap-4 items-start shadow-sm">
                                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
                                                    <ShieldCheck className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-900">
                                                        Perlindungan Akun
                                                    </h4>
                                                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                                                        Sistem mengharuskan
                                                        penggunaan password yang
                                                        kuat untuk melindungi
                                                        integritas dan
                                                        kerahasiaan data survei
                                                        lahan. Pastikan password
                                                        Anda terdiri dari
                                                        kombinasi huruf dan
                                                        angka.
                                                    </p>
                                                </div>
                                            </div>

                                            <form
                                                onSubmit={submitSecurity}
                                                className="space-y-6"
                                            >
                                                <AnimatePresence>
                                                    {showSecuritySuccess && (
                                                        <motion.div
                                                            variants={
                                                                successBannerVariants
                                                            }
                                                            initial="initial"
                                                            animate="animate"
                                                            exit="exit"
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-3 text-emerald-700 shadow-sm">
                                                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                                                <span className="text-xs font-semibold uppercase tracking-wider">
                                                                    Keamanan
                                                                    Berhasil
                                                                    Diperbarui
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                <div className="space-y-6">
                                                    <div className="space-y-2.5">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                            Password Saat Ini
                                                        </Label>
                                                        <div className="relative group">
                                                            <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                            <Input
                                                                type="password"
                                                                value={
                                                                    securityForm
                                                                        .data
                                                                        .current_password
                                                                }
                                                                onChange={(e) =>
                                                                    securityForm.setData(
                                                                        "current_password",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="••••••••"
                                                                className="h-10 pl-10 bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all rounded-lg shadow-sm"
                                                            />
                                                        </div>
                                                    </div>

                                                    <Separator className="bg-slate-200/60" />

                                                    <div className="grid gap-6 sm:grid-cols-2">
                                                        <div className="space-y-2.5">
                                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                                Password Baru
                                                            </Label>
                                                            <div className="relative group">
                                                                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                                <Input
                                                                    type="password"
                                                                    value={
                                                                        securityForm
                                                                            .data
                                                                            .password
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        securityForm.setData(
                                                                            "password",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="••••••••"
                                                                    className="h-10 pl-10 bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all rounded-lg shadow-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2.5">
                                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                                Konfirmasi
                                                                Password
                                                            </Label>
                                                            <div className="relative group">
                                                                <CheckCircle2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                                <Input
                                                                    type="password"
                                                                    value={
                                                                        securityForm
                                                                            .data
                                                                            .password_confirmation
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        securityForm.setData(
                                                                            "password_confirmation",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="••••••••"
                                                                    className="h-10 pl-10 bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all rounded-lg shadow-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            securityForm.processing
                                                        }
                                                        className={cn(
                                                            "px-6 h-10 rounded-lg transition-all flex items-center justify-center min-w-[160px]",
                                                            showSecuritySuccess
                                                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                                                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 shadow-md text-white",
                                                        )}
                                                    >
                                                        {securityForm.processing ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : showSecuritySuccess ? (
                                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        ) : (
                                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        )}
                                                        {showSecuritySuccess
                                                            ? "Tersimpan!"
                                                            : "Update Keamanan"}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* --- TAB: NOTIFICATIONS --- */}
                                    {activeTab === "notifications" && (
                                        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100">
                                            {[
                                                {
                                                    id: "email",
                                                    label: "Laporan via Email",
                                                    desc: "Terima ringkasan mingguan verifikasi lahan ke kotak masuk Anda.",
                                                },
                                                {
                                                    id: "push",
                                                    label: "Push Notification",
                                                    desc: "Notifikasi real-time saat status lahan berubah di dashboard.",
                                                },
                                                {
                                                    id: "status",
                                                    label: "Aktivitas Surveyor",
                                                    desc: "Sistem memberitahu Anda hanya saat surveyor baru mengirim data.",
                                                },
                                            ].map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <div className="space-y-1 pr-6">
                                                        <Label className="text-sm font-semibold text-slate-900 cursor-pointer">
                                                            {item.label}
                                                        </Label>
                                                        <p className="text-xs text-slate-500 leading-relaxed max-w-[400px]">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        className="data-[state=checked]:bg-blue-600 shrink-0"
                                                        defaultChecked={
                                                            index < 2
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
