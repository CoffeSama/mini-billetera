<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransferController;
use Illuminate\Support\Facades\Route;

// throttle: máx. 10 intentos por minuto por IP — frena fuerza bruta de credenciales.
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/transfers', [TransferController::class, 'store']);
    Route::get('/transfers', [TransferController::class, 'index']);
});
