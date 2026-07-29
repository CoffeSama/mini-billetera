<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\TransferException;
use App\Http\Controllers\Controller;
use App\Http\Requests\TransferRequest;
use App\Models\Transfer;
use App\Services\TransferService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    public function __construct(private readonly TransferService $transferService)
    {
    }

    /**
     * POST /api/transfers — ejecutar una transferencia.
     */
    public function store(TransferRequest $request): JsonResponse
    {
        try {
            $transfer = $this->transferService->execute(
                sender: $request->user(),
                receiverEmail: $request->validated('email'),
                amount: $request->validated('amount'),
                description: $request->validated('description'),
            );
        } catch (TransferException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Transferencia realizada.',
            'transfer' => $transfer,
            'balance' => $request->user()->fresh()->balance,
        ], 201);
    }

    /**
     * GET /api/transfers — historial del usuario, más recientes primero.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $transfers = Transfer::with(['sender:id,name,email', 'receiver:id,name,email'])
            ->where(fn ($q) => $q->where('sender_id', $userId)->orWhere('receiver_id', $userId))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(function (Transfer $t) use ($userId): array {
                $sent = $t->sender_id === $userId;
                $counterparty = $sent ? $t->receiver : $t->sender;

                return [
                    'id' => $t->id,
                    'type' => $sent ? 'sent' : 'received',
                    'counterparty' => [
                        'name' => $counterparty->name,
                        'email' => $counterparty->email,
                    ],
                    'amount' => $t->amount,
                    'description' => $t->description,
                    'date' => $t->created_at->toIso8601String(),
                ];
            });

        return response()->json(['transfers' => $transfers]);
    }
}
