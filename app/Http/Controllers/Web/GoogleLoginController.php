<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as OAuthUser;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleLoginController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (! $this->hasGoogleCredentials()) {
            return redirect()
                ->route('home')
                ->withErrors([
                    'auth' => 'Login Google belum dikonfigurasi.',
                ]);
        }

        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        if (! $this->hasGoogleCredentials()) {
            return redirect()
                ->route('home')
                ->withErrors([
                    'auth' => 'Login Google belum dikonfigurasi.',
                ]);
        }

        try {
            /** @var OAuthUser $oauthUser */
            $oauthUser = Socialite::driver('google')
                ->stateless()
                ->user();
        } catch (Throwable $exception) {
            report($exception);

            return redirect()
                ->route('home')
                ->withErrors([
                    'auth' => 'Autentikasi Google gagal diproses. Silakan coba lagi.',
                ]);
        }

        $email = Str::lower(trim((string) $oauthUser->getEmail()));

        if ($email === '') {
            return redirect()
                ->route('home')
                ->withErrors([
                    'auth' => 'Akun Google Anda tidak memiliki email yang dapat digunakan.',
                ]);
        }

        $user = $this->resolveUser($oauthUser, $email);

        if ($user === null) {
            $user = $this->createUserFromGoogle($oauthUser, $email);
        }

        if ($this->supportsUserActivation() && ! (bool) $user->is_active) {
            return redirect()
                ->route('home')
                ->withErrors([
                    'auth' => 'Akun ini tidak aktif. Hubungi administrator.',
                ]);
        }

        $this->syncGoogleIdentity($user, $oauthUser);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()
            ->intended(route('dashboard'))
            ->with('status', 'Berhasil masuk dengan Google.');
    }

    private function resolveUser(OAuthUser $oauthUser, string $email): ?User
    {
        $query = User::query()->whereRaw('LOWER(email) = ?', [$email]);

        if ($this->supportsGoogleIdentity()) {
            $googleId = trim((string) $oauthUser->getId());

            if ($googleId !== '') {
                $query->orWhere('google_id', $googleId);
            }
        }

        return $query->first();
    }

    private function createUserFromGoogle(OAuthUser $oauthUser, string $email): User
    {
        $attributes = [
            'name' => trim((string) ($oauthUser->getName() ?: $oauthUser->getNickname() ?: $email)),
            'email' => $email,
            'password' => Hash::make(Str::password(32)),
        ];

        if ($this->supportsGoogleIdentity()) {
            $attributes['google_id'] = trim((string) $oauthUser->getId()) ?: null;
            $attributes['google_avatar'] = $oauthUser->getAvatar();
        }

        if ($this->supportsUserActivation()) {
            $attributes['is_active'] = true;
        }

        if ($this->supportsLastLoginTracking()) {
            $attributes['last_login_at'] = now();
        }

        if ($this->supportsEmailVerification()) {
            $attributes['email_verified_at'] = now();
        }

        return User::query()->create($attributes);
    }

    private function syncGoogleIdentity(User $user, OAuthUser $oauthUser): void
    {
        $attributes = [];

        if ($this->supportsGoogleIdentity()) {
            $googleId = trim((string) $oauthUser->getId());

            if ($googleId !== '') {
                $attributes['google_id'] = $googleId;
            }

            $attributes['google_avatar'] = $oauthUser->getAvatar();
        }

        if ($this->supportsLastLoginTracking()) {
            $attributes['last_login_at'] = now();
        }

        if ($this->supportsEmailVerification() && $user->email_verified_at === null) {
            $attributes['email_verified_at'] = now();
        }

        if ($attributes !== []) {
            $user->forceFill($attributes)->save();
        }
    }

    private function hasGoogleCredentials(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'))
            && filled(config('services.google.redirect'));
    }

    private function supportsGoogleIdentity(): bool
    {
        return Schema::hasColumn('users', 'google_id')
            && Schema::hasColumn('users', 'google_avatar');
    }

    private function supportsUserActivation(): bool
    {
        return Schema::hasColumn('users', 'is_active');
    }

    private function supportsLastLoginTracking(): bool
    {
        return Schema::hasColumn('users', 'last_login_at');
    }

    private function supportsEmailVerification(): bool
    {
        return Schema::hasColumn('users', 'email_verified_at');
    }
}
