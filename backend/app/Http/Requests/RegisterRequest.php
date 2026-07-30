<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Los emails se guardan y comparan en minúsculas.
     */
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
            // Letras (con acentos), espacios, apóstrofes, puntos y guiones.
            // Suficientemente estricto para frenar basura, sin rechazar nombres reales.
            'name' => ['required', 'string', 'max:255', 'regex:/^[\pL\pM\s\'\.\-]+$/u'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            // 'confirmed' exige que llegue password_confirmation idéntico.
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.regex' => 'El nombre solo puede contener letras, espacios, apóstrofes, puntos y guiones.',
            'email.unique' => 'Ya existe una cuenta con ese email.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ];
    }
}
