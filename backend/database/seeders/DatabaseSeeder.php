<?php

namespace Database\Seeders;

use App\Models\Transfer;
use App\Models\User;
use App\Services\TransferService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Crea 2 usuarios listos y algunos movimientos de ejemplo entre ellos.
     * Los montos se cancelan entre sí, así ambos conservan Bs 1000.
     * Es idempotente: se puede correr varias veces sin duplicar nada.
     */
    public function run(): void
    {
        $ana = User::firstOrCreate(
            ['email' => 'ana@beepay.test'],
            ['name' => 'Ana Pérez', 'password' => 'password123'],
        );

        $beto = User::firstOrCreate(
            ['email' => 'beto@beepay.test'],
            ['name' => 'Beto Rojas', 'password' => 'password123'],
        );

        if (Transfer::count() > 0) {
            return;
        }

        // Usamos el mismo servicio que la app: los saldos quedan consistentes.
        $transfers = app(TransferService::class);
        $transfers->execute($ana, $beto->email, 150, 'Almuerzo');
        $transfers->execute($beto, $ana->email, 200, 'Préstamo');
        $transfers->execute($ana, $beto->email, 50, 'Entradas del cine');
        // Neto: Ana −150 +200 −50 = 0 · Beto +150 −200 +50 = 0
    }
}
