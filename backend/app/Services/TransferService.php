<?php

namespace App\Services;

use App\Exceptions\TransferException;
use App\Models\Transfer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TransferService
{
    /**
     * Ejecuta una transferencia de forma atómica.
     *
     * Garantías:
     * - DB::transaction: si algo falla, se revierte todo (nada de plata
     *   perdida o duplicada a mitad de camino).
     * - lockForUpdate: bloquea las filas de ambos usuarios hasta el commit,
     *   así dos transferencias concurrentes no pueden leer el mismo saldo.
     * - El lock se toma en orden ascendente de id para evitar deadlocks
     *   entre transferencias cruzadas (A→B y B→A al mismo tiempo).
     * - El saldo se verifica DESPUÉS del lock, y el débito/crédito lo hace
     *   la base de datos (decrement/increment sobre decimal), no PHP.
     *
     * @throws TransferException si se viola una regla de negocio
     */
    public function execute(User $sender, string $receiverEmail, string|float $amount, ?string $description = null): Transfer
    {
        $receiver = User::where('email', $receiverEmail)->first();

        if (! $receiver) {
            throw new TransferException('El destinatario no existe.');
        }

        if ($receiver->id === $sender->id) {
            throw new TransferException('No podés transferirte dinero a vos mismo.');
        }

        return DB::transaction(function () use ($sender, $receiver, $amount, $description): Transfer {
            $locked = User::whereIn('id', [$sender->id, $receiver->id])
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $lockedSender = $locked[$sender->id];
            $lockedReceiver = $locked[$receiver->id];

            if ((float) $lockedSender->balance < (float) $amount) {
                throw new TransferException('Saldo insuficiente.');
            }

            $lockedSender->decrement('balance', $amount);
            $lockedReceiver->increment('balance', $amount);

            return Transfer::create([
                'sender_id' => $lockedSender->id,
                'receiver_id' => $lockedReceiver->id,
                'amount' => $amount,
                'description' => $description,
            ]);
        });
    }
}
