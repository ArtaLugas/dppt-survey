import { useState, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import { Search, Filter, RefreshCcw, Lock, Ban } from "lucide-react";
import { DashboardLayout } from "@/Components/layout/DashboardLayout";
import { InterviewTable } from "@/Components/dashboard/InterviewTable";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Button } from "@/Components/ui/button";
import { useToast } from "@/hooks/use-toast";
import debounce from "lodash/debounce";

export default function AdminInterview({
    auth,
    interviews,
    surveyors,
    koordinators,
    statuses,
    filters,
}) {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState(filters.search || "");

    // Server-side filtering logic
    const handleFilterChange = (key, value) => {
        router.get(
            route("admin.interviews.index"),
            {
                ...filters,
                [key]: value,
                page: 1, // Reset to first page on filter change
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const debouncedSearch = useCallback(
        debounce((value) => {
            handleFilterChange("search", value);
        }, 500),
        [filters],
    );

    const onSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleView = (id) => {
        router.get(route("koordinator.interviews.show", id));
    };

    const handleLock = (id) => {
        router.patch(
            route("admin.interviews.lock", id),
            {},
            {
                onSuccess: () => {
                    toast({
                        title: "Success",
                        description: "Data wawancara berhasil dikunci.",
                    });
                },
            },
        );
    };

    const handleCancel = (id) => {
        router.patch(
            route("admin.interviews.cancel", id),
            {},
            {
                onSuccess: () => {
                    toast({
                        title: "Success",
                        description: "Data wawancara telah dibatalkan.",
                    });
                },
            },
        );
    };

    const resetFilters = () => {
        setSearchTerm("");
        router.get(route("admin.interviews.index"), {});
    };

    return (
        <DashboardLayout
            userName={auth.user.name}
            userRole={auth.user.role?.name || "Admin"}
        >
            <Head title="Manajemen Wawancara - Admin" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Manajemen Wawancara
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Monitor dan kelola seluruh data hasil survei lapangan secara terpusat.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="w-fit"
                    >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Reset Filter
                    </Button>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative md:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Cari NIB, Bidang, Surveyor..."
                                value={searchTerm}
                                onChange={onSearchChange}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select
                            value={filters.status || "all"}
                            onValueChange={(v) => handleFilterChange("status", v)}
                        >
                            <SelectTrigger>
                                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                {statuses.map((s) => (
                                    <SelectItem key={s.id} value={s.code}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Surveyor Filter */}
                        <Select
                            value={filters.surveyor || "all"}
                            onValueChange={(v) => handleFilterChange("surveyor", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Surveyor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Surveyor</SelectItem>
                                {surveyors.map((s) => (
                                    <SelectItem key={s.id} value={s.id.toString()}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Koordinator Filter */}
                        <Select
                            value={filters.koordinator || "all"}
                            onValueChange={(v) => handleFilterChange("koordinator", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Koordinator" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Koordinator</SelectItem>
                                {koordinators.map((k) => (
                                    <SelectItem key={k.id} value={k.id.toString()}>
                                        {k.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table Section */}
                <div className="min-h-[400px]">
                    <InterviewTable
                        interviews={interviews.data}
                        userRole="admin"
                        onView={handleView}
                        onLock={handleLock}
                        onDelete={handleCancel} // Mapping Cancel ke onDelete (Void/Batal) di table
                        showSurveyor
                        showKoordinator
                    />
                </div>

                {/* Pagination Placeholder (Dapat ditambahkan komponen Pagination khusus jika diperlukan) */}
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs text-slate-500">
                        Menampilkan {interviews.from || 0} - {interviews.to || 0} dari {interviews.total} hasil
                    </p>
                    <div className="flex gap-2">
                        {interviews.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className="h-8 min-w-[32px] px-2"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
