<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Crea 2 usuarios listos para probar una transferencia entre ellos.
     * Credenciales documentadas en el README.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'ana@beepay.test'],
            ['name' => 'Ana Pérez', 'password' => 'password123'],
        );

        User::firstOrCreate(
            ['email' => 'beto@beepay.test'],
            ['name' => 'Beto Rojas', 'password' => 'password123'],
        );
    }
}
