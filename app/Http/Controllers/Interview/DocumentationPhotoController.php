<?php

namespace App\Http\Controllers\Interview;

use App\Http\Controllers\Controller;
use App\Models\DocumentationPhoto;
use App\Models\Parcel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentationPhotoController extends Controller
{
    /**
     * Menyimpan foto dokumentasi baru beserta metadata EXIF-nya
     */
    public function store(Request $request, Parcel $parcel)
    {
        // 1. Otorisasi Lapis Pertama: hanya pemilik bidang (surveyor terkait) yang boleh upload
        abort_if($parcel->surveyor_id !== auth()->id(), 403, 'Anda tidak memiliki otoritas atas bidang ini.');

        // 2. Otorisasi Lapis Kedua: Cegah perubahan pada data yang sudah di-submit/kunci
        $statusCode = $parcel->status?->code ?? 'draft';
        if (in_array($statusCode, ['submitted', 'verified', 'locked'])) {
            return back()->withErrors(['file' => 'Status bidang terkunci. Tidak dapat menambah foto dokumentasi.']);
        }

        // 3. Validasi Input Ketat
        $request->validate([
            'photo_type_id' => ['required', 'exists:photo_types,id'],
            'caption'       => ['nullable', 'string', 'max:500'],
            'photo_file'    => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],
        ], [
            'photo_file.max' => 'Ukuran foto maksimal adalah 10 MB.',
        ]);

        $file = $request->file('photo_file');

        try {
            DB::beginTransaction();

            $meta = $this->extractMetadata($file);

            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs("uploads/parcels/{$parcel->id}", $filename, 'public');

            if (!$path) {
                throw new \Exception('Gagal menyimpan file ke dalam storage server.');
            }

            $photo = DocumentationPhoto::create([
                'parcel_id'       => $parcel->id,
                'photo_type_id'   => $request->photo_type_id,
                'file_path'       => $path,
                'file_name'       => $file->getClientOriginalName(),
                'caption'         => $request->caption,
                'mime_type'       => $file->getMimeType(),
                'file_size_bytes' => $file->getSize(),
                'latitude'        => $meta['lat'],
                'longitude'       => $meta['lng'],
                'taken_at'        => $meta['taken_at'],
                'uploaded_by'     => auth()->id(),
            ]);

            DB::commit();
            return back()->with('message', 'Dokumentasi foto berhasil diunggah dan diverifikasi sistem.');

        } catch (\Exception $e) {
            DB::rollback();

            // Hapus file fisik jika sudah terlanjur tersimpan sebelum error DB
            if (isset($path) && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }

            return back()->withErrors(['photo_file' => 'Terjadi kesalahan sistem saat memproses foto: ' . $e->getMessage()]);
        }
    }

    /**
     * Menghapus foto dokumentasi.
     */
    public function destroy(DocumentationPhoto $photo)
    {
        // 1. Otorisasi Kepemilikan
        abort_if($photo->parcel->surveyor_id !== auth()->id(), 403, 'Akses ditolak.');

        // 2. Pengecekan Status Bidang
        $statusCode = $photo->parcel->status?->code ?? 'draft';
        if (in_array($statusCode, ['submitted', 'verified', 'locked'])) {
            return back()->withErrors(['error' => 'Tidak dapat menghapus foto pada Interview yang sudah terkunci.']);
        }

        // 3. Eksekusi Hapus (File fisik otomatis terhapus oleh method boot() di Model)
        $photo->delete();

        return back()->with('message', 'Foto dokumentasi berhasil dihapus permanen.');
    }

    /**
     * Ekstrak metadata EXIF dari file gambar (GPS + timestamp).
     */
    private function extractMetadata($file): array
    {
        $data = ['lat' => null, 'lng' => null, 'taken_at' => null];

        if (!function_exists('exif_read_data')) {
            return $data;
        }

        try {
            $exif = @exif_read_data($file->getRealPath());

            if (!$exif) {
                return $data;
            }

            // Ekstrak waktu pengambilan foto
            if (!empty($exif['DateTimeOriginal'])) {
                $parsed = strtotime($exif['DateTimeOriginal']);
                if ($parsed !== false) {
                    $data['taken_at'] = date('Y-m-d H:i:s', $parsed);
                }
            }

            // FIX: Periksa semua key GPS sekaligus dengan isset sebelum akses array
            // Ini mencegah "Undefined index" warning pada PHP strict mode
            if (
                isset($exif['GPSLatitude'], $exif['GPSLongitude'], $exif['GPSLatitudeRef'], $exif['GPSLongitudeRef']) &&
                is_array($exif['GPSLatitude']) && count($exif['GPSLatitude']) >= 3 &&
                is_array($exif['GPSLongitude']) && count($exif['GPSLongitude']) >= 3
            ) {
                $lat = $this->gpsToDecimal($exif['GPSLatitude'], $exif['GPSLatitudeRef']);
                $lng = $this->gpsToDecimal($exif['GPSLongitude'], $exif['GPSLongitudeRef']);

                // Validasi range koordinat
                if ($lat >= -90 && $lat <= 90 && $lng >= -180 && $lng <= 180) {
                    $data['lat'] = $lat;
                    $data['lng'] = $lng;
                }
            }

        } catch (\Exception $e) {
            // Fail gracefully: Jika EXIF rusak, proses upload tetap berlanjut
        }

        return $data;
    }

    /**
     * Konversi format DMS (Degrees Minutes Seconds) kamera ke Desimal Google Maps.
     */
    private function gpsToDecimal(array $coord, string $hemisphere): float
    {
        $degrees = count($coord) > 0 ? $this->gpsPartToFloat($coord[0]) : 0;
        $minutes = count($coord) > 1 ? $this->gpsPartToFloat($coord[1]) : 0;
        $seconds = count($coord) > 2 ? $this->gpsPartToFloat($coord[2]) : 0;

        $decimal = $degrees + ($minutes / 60) + ($seconds / 3600);

        return ($hemisphere === 'S' || $hemisphere === 'W') ? ($decimal * -1) : $decimal;
    }

    /**
     * Memecah format rasio pecahan EXIF menjadi angka Float.
     * Contoh: "51/1" → 51.0 | "30/100" → 0.3
     */
    private function gpsPartToFloat($part): float
    {
        // Handle jika sudah berupa angka (beberapa implementasi EXIF langsung mengembalikan float)
        if (is_float($part) || is_int($part)) {
            return (float) $part;
        }

        $parts = explode('/', (string) $part);

        if (count($parts) === 0) {
            return 0.0;
        }

        $num = (float) trim($parts[0]);
        $den = count($parts) > 1 ? (float) trim($parts[1]) : 1.0;

        // Cegah division by zero
        if ($den === 0.0) {
            return 0.0;
        }

        return $num / $den;
    }
}
