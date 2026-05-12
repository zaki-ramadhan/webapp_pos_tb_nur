<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Auth\AuthFeatureFlags;
use App\Support\Presentation\PosBlueprint;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if (AuthFeatureFlags::allowsLocalAutoLogin()) {
            $user = $this->resolveLocalAutoLoginUser();

            if ($user !== null) {
                Auth::login($user);
                $request->session()->regenerate();

                return redirect()->route('dashboard');
            }
        }

        return Inertia::render('HomePage', PosBlueprint::forLogin());
    }

    private function resolveLocalAutoLoginUser(): ?User
    {
        $email = AuthFeatureFlags::localAutoLoginEmail();

        if ($email !== null) {
            return User::query()->whereRaw('LOWER(email) = ?', [mb_strtolower($email)])->first();
        }

        return User::query()->orderBy('id')->first();
    }
}
