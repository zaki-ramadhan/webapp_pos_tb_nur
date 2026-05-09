<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\Presentation\PosBlueprint;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('RegisterPage', PosBlueprint::forRegister());
    }
}
