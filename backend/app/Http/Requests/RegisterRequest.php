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
            // Palabras de letras (con acentos) separadas por UN espacio, apóstrofe,
            // punto o guión. Empieza y termina en letra.
            // Acepta "Ana-María", "O'Brien", "J. Pérez"; rechaza "Juan-.-.-." o "123".
            'name' => ['required', 'string', 'max:255', 'regex:/^[\pL\pM]+(?:[\s\'\.\-]\s?[\pL\pM]+)*$/u'],
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
            'name.regex' => 'Ingresá un nombre válido: letras separadas por espacios, guiones, puntos o apóstrofes.',
            'email.unique' => 'Ya existe una cuenta con ese email.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ];
    }
}
