import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Package, AlertCircle,
  Building2, Trees, LayoutGrid, Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog';

import { InventoryItemDialog } from '../dialogs/InventoryItemDialog';

// ==========================================
// KONFIGURASI UI TAB
// ==========================================
const getCategoryLabel = (categoryCode) => {
  const labels = {
    'BANGUNAN': 'Bangunan',
    'TANAMAN': 'Tanaman',
    'BENDA_LAIN': 'Benda Lain'
  };
  return labels[categoryCode] || categoryCode;
};

const categoryIcons = {
  'BANGUNAN': <Building2 className="h-4 w-4 text-blue-500" />,
  'TANAMAN': <Trees className="h-4 w-4 text-green-500" />,
  'BENDA_LAIN': <Package className="h-4 w-4 text-orange-500" />,
};

const categoryColors = {
  'BANGUNAN': 'bg-blue-50/50 border-blue-200',
  'TANAMAN': 'bg-green-50/50 border-green-200',
  'BENDA_LAIN': 'bg-orange-50/50 border-orange-200',
};
// ==========================================

export function InventoryTab({ parcelId, items = [], accessState, onAdd, onEdit, onDelete }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [defaultCategory, setDefaultCategory] = useState('BANGUNAN');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // --- STATE ANIMASI LOADING ---
  const [isProcessing, setIsProcessing] = useState(false);

  // LOGIKA INTELEJEN: Matikan loading otomatis jika data items dari Laravel berubah
  useEffect(() => {
    setIsProcessing(false);
    setDeleteDialogOpen(false); // Tutup dialog hapus otomatis
  }, [items]);

  // --- HANDLERS DENGAN INTERSEPTOR LOADING ---
  const handleAdd = (cat) => {
    setDefaultCategory(cat);
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
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

    if (editingItem) onEdit(editingItem.id, data, wrappedCallbacks);
    else onAdd(data, wrappedCallbacks);
  };

  const canModify = accessState?.canAddChildren && !accessState?.isReadOnly;

  // SAFE FILTERING: Gunakan optional chaining untuk mencegah error
  const safeItems = Array.isArray(items) ? items : [];
  const bangunan = safeItems.filter(i => i?.category === 'BANGUNAN');
  const tanaman = safeItems.filter(i => i?.category === 'TANAMAN');
  const bendaLain = safeItems.filter(i => i?.category === 'BENDA_LAIN');

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const renderTable = (categoryItems, category) => (
    <div className="space-y-4 animate-in fade-in duration-300 relative min-h-[250px]">

      {/* OVERLAY LOADING ANIMATION */}
      {isProcessing && (
        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px] z-40 flex items-center justify-center transition-all duration-300 rounded-xl">
          <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in-95">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-sm font-bold text-slate-700 animate-pulse tracking-widest uppercase">Memproses...</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" /> Daftar {getCategoryLabel(category)}
        </h4>
        <Button
          onClick={() => handleAdd(category)}
          disabled={!canModify || !parcelId || isProcessing}
          size="sm"
          className="gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Tambah {getCategoryLabel(category)}
        </Button>
      </div>

      {categoryItems.length > 0 ? (
        <div className={`border rounded-xl overflow-hidden shadow-sm bg-white ${categoryColors[category]}`}>
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Jenis Item</TableHead>
                <TableHead className="font-semibold text-slate-700">Spesifikasi</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Jumlah</TableHead>
                <TableHead className="font-semibold text-slate-700">Satuan</TableHead>
                <TableHead className="font-semibold text-slate-700">Kondisi</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {categoryItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-800">{item?.jenis_item || '-'}</TableCell>
                  <TableCell className="text-sm text-slate-500">{item?.spesifikasi || '-'}</TableCell>
                  <TableCell className="text-right font-mono font-medium">{formatNumber(item?.jumlah)}</TableCell>
                  <TableCell className="text-slate-600">{item?.satuan || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      item?.kondisi === 'Baik' ? 'border-green-200 text-green-700 bg-green-50' :
                      item?.kondisi === 'Rusak Berat' ? 'border-red-200 text-red-700 bg-red-50' : 'bg-slate-50'
                    }>
                      {item?.kondisi || 'Tidak Diketahui'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} disabled={!canModify || isProcessing} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item.id)} disabled={!canModify || isProcessing} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
          <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 border">
            {categoryIcons[category]}
          </div>
          <p className="text-sm font-medium text-slate-700">Belum ada data {getCategoryLabel(category).toLowerCase()}</p>
          <p className="text-xs text-slate-500 mt-1">Klik tombol tambah di atas untuk mencatat aset.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">Inventarisasi Aset</h3>
          <p className="text-sm text-muted-foreground">Pencatatan bangunan, tanaman, dan benda lain di atas tanah.</p>
        </div>
      </div>

      {!parcelId && (
        <Alert variant="warning" className="bg-amber-50 text-amber-900 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>Simpan data bidang utama terlebih dahulu sebelum menambah aset.</AlertDescription>
        </Alert>
      )}

      {accessState?.isReadOnly && accessState?.message && (
        <Alert variant={accessState.isFinal ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{accessState.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="BANGUNAN" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="BANGUNAN" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {categoryIcons['BANGUNAN']} Bangunan <Badge variant="secondary" className="ml-1 bg-slate-100">{bangunan.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="TANAMAN" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {categoryIcons['TANAMAN']} Tanaman <Badge variant="secondary" className="ml-1 bg-slate-100">{tanaman.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="BENDA_LAIN" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {categoryIcons['BENDA_LAIN']} Benda Lain <Badge variant="secondary" className="ml-1 bg-slate-100">{bendaLain.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="BANGUNAN">{renderTable(bangunan, 'BANGUNAN')}</TabsContent>
        <TabsContent value="TANAMAN">{renderTable(tanaman, 'TANAMAN')}</TabsContent>
        <TabsContent value="BENDA_LAIN">{renderTable(bendaLain, 'BENDA_LAIN')}</TabsContent>
      </Tabs>

      <InventoryItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        defaultCategory={defaultCategory}
        onSubmit={handleDialogSubmit}
        isProcessing={isProcessing} // <--- KIRIM STATE KE DIALOG
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Aset"
        description="Apakah Anda yakin ingin menghapus data aset ini secara permanen?"
        confirmLabel={isProcessing ? "Menghapus..." : "Ya, Hapus"}
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
