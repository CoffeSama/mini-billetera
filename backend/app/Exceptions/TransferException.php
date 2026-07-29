<?php

namespace App\Exceptions;

use Exception;

/**
 * Error de regla de negocio en una transferencia.
 * Se traduce a una respuesta 422 con mensaje claro para el usuario.
 */
class TransferException extends Exception
{
}
