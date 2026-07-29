<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Tests de las reglas de negocio de transferencias, ejecutados
 * contra la API REST real (rutas + validación + servicio + transacción).
 */
class TransferTest extends TestCase
{
    use RefreshDatabase;

    private User $ana;

    private User $beto;

    protected function setUp(): void
    {
        parent::setUp();

        // Ambos arrancan con Bs 1000 (default de la migración).
        $this->ana = User::factory()->create(['email' => 'ana@test.com']);
        $this->beto = User::factory()->create(['email' => 'beto@test.com']);

        Sanctum::actingAs($this->ana);
    }

    public function test_una_transferencia_valida_debita_al_emisor_y_acredita_al_receptor(): void
    {
        $response = $this->postJson('/api/transfers', [
            'email' => 'beto@test.com',
            'amount' => 200.50,
            'description' => 'almuerzo',
        ]);

        $response->assertCreated()->assertJsonPath('balance', '799.50');

        $this->assertEquals('799.50', $this->ana->fresh()->balance);
        $this->assertEquals('1200.50', $this->beto->fresh()->balance);

        $this->assertDatabaseHas('transfers', [
            'sender_id' => $this->ana->id,
            'receiver_id' => $this->beto->id,
            'amount' => '200.50',
            'description' => 'almuerzo',
        ]);
    }

    public function test_no_se_puede_enviar_mas_del_saldo_disponible(): void
    {
        $response = $this->postJson('/api/transfers', [
            'email' => 'beto@test.com',
            'amount' => 1000.01,
        ]);

        $response->assertStatus(422)->assertJsonPath('message', 'Saldo insuficiente.');

        // Nada cambió: ni saldos ni movimientos registrados.
        $this->assertEquals('1000.00', $this->ana->fresh()->balance);
        $this->assertEquals('1000.00', $this->beto->fresh()->balance);
        $this->assertDatabaseCount('transfers', 0);
    }

    public function test_no_se_puede_transferir_a_si_mismo(): void
    {
        $response = $this->postJson('/api/transfers', [
            'email' => 'ana@test.com',
            'amount' => 100,
        ]);

        $response->assertStatus(422);
        $this->assertEquals('1000.00', $this->ana->fresh()->balance);
        $this->assertDatabaseCount('transfers', 0);
    }

    public function test_falla_con_mensaje_claro_si_el_destinatario_no_existe(): void
    {
        $response = $this->postJson('/api/transfers', [
            'email' => 'nadie@test.com',
            'amount' => 100,
        ]);

        $response->assertStatus(422)->assertJsonPath('message', 'El destinatario no existe.');
        $this->assertEquals('1000.00', $this->ana->fresh()->balance);
    }

    public function test_el_monto_debe_ser_mayor_a_cero(): void
    {
        foreach ([0, -50] as $monto) {
            $this->postJson('/api/transfers', [
                'email' => 'beto@test.com',
                'amount' => $monto,
            ])->assertStatus(422);
        }

        $this->assertEquals('1000.00', $this->ana->fresh()->balance);
        $this->assertDatabaseCount('transfers', 0);
    }

    public function test_se_puede_transferir_exactamente_todo_el_saldo(): void
    {
        $this->postJson('/api/transfers', [
            'email' => 'beto@test.com',
            'amount' => 1000,
        ])->assertCreated();

        // El saldo queda en 0, nunca negativo.
        $this->assertEquals('0.00', $this->ana->fresh()->balance);
        $this->assertEquals('2000.00', $this->beto->fresh()->balance);
    }
}
