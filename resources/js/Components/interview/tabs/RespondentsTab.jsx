import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, User, AlertCircle, Star,
  Users, MapPin, Briefcase, Phone, Fingerprint, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';

import { RespondentDialog } from '../dialogs/RespondentDialog';
import { cn } from '@/lib/utils';

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export function RespondentsTab({
  parcelId,
  respondents = [],
  respondentRoles = [],
  accessState,
  onAdd,
  onEdit,
  onDelete
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRespondent, setEditingRespondent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // --- STATE ANIMASI LOADING ---
  const [isProcessing, setIsProcessing] = useState(false);

  // LOGIKA INTELEJEN: Matikan loading otomatis jika data dari Laravel berubah
  useEffect(() => {
    setIsProcessing(false);
    setDeleteDialogOpen(false); // Tutup dialog hapus otomatis
  }, [respondents]);

  const getRoleMetaDinamis = (roleId) => {
    const role = respondentRoles.find(r => String(r.id) === String(roleId));
    const labelText = role ? (role.label || role.code) : `Peran Tidak Dikenal (${roleId})`;

    const id = Number(roleId);
    let color = 'bg-muted text-muted-foreground border-border';
    if (id === 1) color = 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
    if (id === 2) color = 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (id === 3) color = 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';

    return { label: labelText, color };
  };

  // --- HANDLERS DENGAN INTERSEPTOR LOADING ---
  const handleAdd = () => {
    setEditingRespondent(null);
    setDialogOpen(true);
  };

  const handleEdit = (r) => {
    setEditingRespondent(r);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      setIsProcessing(true); // Nyalakan animasi saat menghapus
      onDelete(deletingId);
    }
  };

  const handleDialogSubmit = (data, callbacks) => {
    setIsProcessing(true); // Nyalakan animasi saat submit form

    const wrappedCallbacks = {
      onSuccess: (page) => {
        setIsProcessing(false);
        if (callbacks?.onSuccess) callbacks.onSuccess(page);
      },
      onError: (err) => {
        setIsProcessing(false);
        if (callbacks?.onError) callbacks.onError(err);
      }
    };

    if (editingRespondent) {
      onEdit(editingRespondent.id, data, wrappedCallbacks);
    } else {
      onAdd(data, wrappedCallbacks);
    }
  };

  const canModify = accessState?.canAddChildren && !accessState?.isReadOnly;
  const safeRespondents = Array.isArray(respondents) ? respondents : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border border-border/60 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">Daftar Responden</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Pemilik, penggarap, atau entitas yang menguasai bidang tanah.</p>
          </div>
        </div>

        {safeRespondents.length > 0 && (
          <Button
            onClick={handleAdd}
            disabled={!canModify || isProcessing}
            className="rounded-full px-6 font-bold shadow-md hover:scale-105 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Tambah Responden
          </Button>
        )}
      </div>

      {/* --- DATA TABEL / EMPTY STATE --- */}
      {safeRespondents.length > 0 ? (
        <div className="relative bg-card border border-border/60 rounded-[2rem] shadow-sm overflow-hidden min-h-[200px]">

          {/* OVERLAY LOADING ANIMATION */}
          {isProcessing && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-40 flex items-center justify-center transition-all duration-300">
              <div className="flex flex-col items-center gap-3 bg-card p-6 rounded-3xl shadow-xl border border-border animate-in zoom-in-95">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-sm font-bold text-foreground animate-pulse tracking-widest uppercase">Memproses...</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px] py-4 pl-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Profil Identitas</TableHead>
                  <TableHead className="py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Kapasitas Peran</TableHead>
                  <TableHead className="hidden md:table-cell py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Data Pribadi</TableHead>
                  <TableHead className="text-right py-4 pr-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeRespondents.map((r) => {
                  const rawRoleId = r.role_id || r.roleid || r.roleId || r.role?.id || 1;
                  const roleMeta = getRoleMetaDinamis(rawRoleId);
                  const rawPrimary = r.is_primary ?? r.isprimary ?? r.isPrimary;
                  const isPrimary = (rawPrimary === true || rawPrimary === 1 || String(rawPrimary) === '1' || rawPrimary === 't' || rawPrimary === 'true');

                  return (
                    <TableRow key={r.id} className="group hover:bg-muted/20 transition-colors">
                      {/* Kolom 1: Profil */}
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm",
                              isPrimary ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" : "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground"
                            )}>
                              {getInitials(r.nama || r.name)}
                            </div>
                            {isPrimary && (
                              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 border-2 border-background shadow-sm" title="Responden Utama">
                                <Star className="h-2.5 w-2.5 text-white fill-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm flex items-center gap-2">
                              {r.nama || r.name}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Fingerprint className="h-3 w-3" /> {r.nik || 'NIK Tidak Tersedia'}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Kolom 2: Peran */}
                      <TableCell className="py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <Badge variant="outline" className={cn("px-3 py-1 font-bold border", roleMeta.color)}>
                            {roleMeta.label}
                          </Badge>
                          {isPrimary && (
                            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-2 py-0 border-none shadow-sm">
                              Wakil Utama
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Kolom 3: Kontak */}
                      <TableCell className="hidden md:table-cell py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" />
                            <span>
                              {r.tempat_lahir || '-'}, {r.tanggal_lahir ? format(new Date(r.tanggal_lahir), 'dd MMM yyyy', { locale: localeId }) : '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5" title="No. Telepon">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground/60" />
                              <span>{r.no_telepon || r.noTelepon || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate max-w-[150px]" title="Pekerjaan">
                              <Briefcase className="h-3.5 w-3.5 text-muted-foreground/60" />
                              <span className="truncate">{r.pekerjaan || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Kolom 4: Aksi */}
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-100">
                            <Button variant="warning" size="icon" onClick={() => handleEdit(r)} disabled={!canModify || isProcessing} className="h-8 w-8 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(r.id)} disabled={!canModify || isProcessing} className="h-8 w-8 rounded-full shadow-sm opacity-90 hover:opacity-100">
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                      </TableCell>

                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="relative flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-border/60 rounded-[2rem] bg-muted/5 hover:bg-muted/10 transition-colors overflow-hidden">
          <div className="h-20 w-20 bg-background border rounded-3xl shadow-sm flex items-center justify-center mb-6 z-10">
            <User className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h4 className="text-xl font-black text-foreground mb-2 z-10">Belum Ada Responden Terdaftar</h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8 z-10 leading-relaxed">
            Data responden wajib diisi minimal 1 (satu) orang, baik sebagai pemilik asli maupun pihak yang menguasai fisik bidang tanah.
          </p>
          {canModify && (
            <Button onClick={handleAdd} disabled={isProcessing} className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform z-10">
              <Plus className="h-5 w-5 mr-2" /> Daftarkan Responden Pertama
            </Button>
          )}
        </div>
      )}

      {/* --- DIALOGS --- */}
      <RespondentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parcelId={parcelId}
        respondent={editingRespondent}
        respondentRoles={respondentRoles}
        onSubmit={handleDialogSubmit}
        isProcessing={isProcessing} // <--- KIRIM STATE LOADING KE DIALOG
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Data Responden"
        description="Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan."
        confirmLabel={isProcessing ? "Menghapus..." : "Ya, Hapus"}
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
