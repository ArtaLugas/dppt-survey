<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InterviewStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nomor_peta_index' => ['nullable', 'string'],
            'nomor_bidang'     => ['nullable', 'string'],
            'lokasi_wawancara' => ['nullable', 'string'],
            'tanggal_wawancara'=> ['nullable', 'date'],
            'waktu_wawancara'  => ['nullable'],
            'nama_pewawancara' => ['nullable', 'string'],
        ];
    }
}
