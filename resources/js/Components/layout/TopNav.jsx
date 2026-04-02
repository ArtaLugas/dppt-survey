import { useState } from "react";
import { router, usePage, Head } from "@inertiajs/react";
import {
    LogOut,
    Loader2,
    Bell,
    Settings,
    User,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { NotificationDialog } from "./NotificationDialog";
import { AccountSettingsDialog } from "./AccountSettingsDialog";
import { set } from "lodash";

/* =========================
   TOP NAVIGATION
========================= */
export function TopNav({}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const avatarSource = user?.avatar ? `/storage/${user.avatar}` : null;

    const [loading, setLoading] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    if (!user) return null;

    const roleLabel = user.role?.label || "User";
    const roleCode = user.role?.code || "user";

    const roleVariants = {
        admin: "default",
        koordinator: "outline",
        surveyor: "secondary",
    };

    const initials = user.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "??";

    const handleLogout = () => {
        setLoading(true);
        router.post(
            route("logout"),
            {},
            {
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <>
            <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                {/* Judul Dashboard Dinamis */}
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                        {roleLabel} Dashboard
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Notifikasi - Menggunakan Badge dari UI Kode 1 */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative hover:bg-slate-100 rounded-full"
                        onClick={() => setNotifOpen(true)}
                    >
                        <Bell className="h-5 w-5 text-slate-600" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                    </Button>

                    <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

                    {/* User Menu - Gabungan UI Dropdown & Logika Logout */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-3 px-2 hover:bg-slate-50 transition-all"
                            >
                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm overflow-hidden">
                                    <AvatarImage
                                        src={avatarSource}
                                        alt={user.name || "User Profile"}
                                        className="object-cover h-full w-full"
                                    />

                                    <AvatarFallback
                                        delayMs={600}
                                        className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white text-[10px] font-bold uppercase"
                                    >
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-sm font-semibold text-slate-800 leading-none">
                                        {user.name}
                                    </span>
                                    <Badge
                                        // 1. Pastikan roleVariants aman meskipun roleCode null
                                        variant={
                                            roleVariants[
                                                roleCode?.toLowerCase()
                                            ] || "outline"
                                        }
                                        className="text-[9px] h-4 mt-1 px-1.5 uppercase"
                                    >
                                        {/* 2. Tambahkan pengecekan sebelum toUpperCase() atau gunakan fallback */}
                                        {roleCode
                                            ? roleCode.toUpperCase()
                                            : "GUEST"}

                                        {/* REKOMENDASI TERBAIK: Gunakan label, bukan code */}
                                        {/* {user.role?.label || 'USER'} */}
                                    </Badge>
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-400 ml-1 hidden md:block" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="w-56 mt-2 shadow-xl border-slate-200"
                        >
                            <DropdownMenuItem
                                onClick={() => setSettingsOpen(true)}
                                className="cursor-pointer"
                            >
                                <Settings className="h-4 w-4 mr-2 text-slate-500" />
                                Pengaturan Akun
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={handleLogout}
                                disabled={loading}
                                className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <LogOut className="h-4 w-4 mr-2" />
                                )}
                                {loading ? "Keluar..." : "Logout"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Dialogs Terintegrasi */}
            <NotificationDialog
                open={notifOpen}
                onOpenChange={setNotifOpen}
                notifications={[]} // Sebaiknya ambil dari props.notifications
            />
            <AccountSettingsDialog
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                userName={user.name}
                userRole={roleCode}
                userEmail={user.email}
            />
        </>
    );
}
