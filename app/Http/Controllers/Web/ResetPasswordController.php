<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\Presentation\PosBlueprint;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResetPasswordController extends Controller
{
    public function __invoke(Request $request, string $token): Response
    {
        return Inertia::render('ResetPasswordPage', PosBlueprint::forResetPassword(
            token: $token,
            email: $request->string('email')->toString() ?: null,
        ));
    }
}
