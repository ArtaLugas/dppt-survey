<?php

namespace App\Http\Controllers\Interview;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\Parcel;
use Illuminate\Http\Request;

class InventoryItemController extends Controller
{
    /**
     * Simpan item baru
     */
    public function store(Request $request, Parcel $parcel)
    {
        $validated = $request->validate([
            'category'      => 'required|string|in:BANGUNAN,TANAMAN,BENDA_LAIN',
            'jenis_item'    => 'required|string|max:255',
            'spesifikasi'   => 'nullable|string|max:255',
            'jumlah'        => 'required|numeric|min:0.01',
            'satuan'        => 'required|string|max:50',
            'kondisi'       => 'nullable|string',
            'keterangan'    => 'nullable|string',
        ]);

        $parcel->inventoryItems()->create($validated);

        return back()->with('success','Aset berhasil ditambahkan.');
    }

    /**
     * Update Item Lama
     */
    public function update(Request $request, InventoryItem $inventoryItem)
    {
        // KOREKSI: Hapus spasi di dalam aturan 'in'
        $validated = $request->validate([
            'category'      => 'required|string|in:BANGUNAN,TANAMAN,BENDA_LAIN',
            'jenis_item'    => 'required|string|max:255',
            'spesifikasi'   => 'nullable|string|max:255',
            'jumlah'        => 'required|numeric|min:0.01',
            'satuan'        => 'required|string|max:50',
            'kondisi'       => 'nullable|string',
            'keterangan'    => 'nullable|string',
        ]);

        $inventoryItem->update($validated);

        return back()->with('success','Aset berhasil diperbarui.');
    }

    /**
     * Hapus Item(Delete)
     */
    public function destroy(InventoryItem $inventoryItem)
    {
        $inventoryItem->delete();

        return back()->with('success','Aset berhasil dihapus.');
    }
}
