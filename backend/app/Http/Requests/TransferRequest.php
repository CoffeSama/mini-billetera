<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->email)) {
            $this->merge(['email' => mb_strtolower(trim($this->email))]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            // max: evita desbordar la columna decimal(12,2) con montos absurdos.
            'amount' => ['required', 'numeric', 'gt:0', 'decimal:0,2', 'max:9999999999'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.gt' => 'El monto debe ser mayor a 0.',
            'amount.decimal' => 'El monto admite hasta 2 decimales.',
            'email.required' => 'Indicá el email del destinatario.',
        ];
    }
}
