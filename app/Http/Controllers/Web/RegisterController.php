<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\Auth\AuthFeatureFlags;
use App\Support\Presentation\PosBlueprint;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RegisterController extends Controller
{
    public function __invoke(): Response
    {
        if (! AuthFeatureFlags::allowsPublicRegistration()) {
            throw new NotFoundHttpException();
        }

        return Inertia::render('RegisterPage', PosBlueprint::forRegister());
    }
}
