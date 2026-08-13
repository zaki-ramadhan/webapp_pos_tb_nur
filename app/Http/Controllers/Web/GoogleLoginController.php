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
    public function redirect(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        $usePopup = $request->query('popup') === '1';

        if (Auth::check()) {
            if ($usePopup) {
                return $this->respondWithPopupSuccess('Berhasil masuk dengan Google.');
            }
            return redirect()->intended(route('dashboard'));
        }

        if (! $this->hasGoogleCredentials()) {
            if ($usePopup) {
                return $this->respondWithPopupError('Login Google belum dikonfigurasi.');
            }
            return redirect()
                ->route('home')
                ->withErrors([
                    'auth' => 'Login Google belum dikonfigurasi.',
                ]);
        }

        if ($usePopup) {
            $request->session()->put('auth_use_popup', true);
        } else {
            $request->session()->forget('auth_use_popup');
        }

        $state = $usePopup ? 'popup' : 'standard';

        return Socialite::driver('google')
            ->stateless()
            ->with(['state' => $state])
            ->redirect();
    }

    public function callback(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        $state = $request->query('state');
        $usePopup = $state === 'popup' || $request->session()->pull('auth_use_popup', false);

        if (Auth::check()) {
            if ($usePopup) {
                return $this->respondWithPopupSuccess('Berhasil masuk dengan Google.');
            }
            return redirect()->intended(route('dashboard'));
        }

        if (! $this->hasGoogleCredentials()) {
            if ($usePopup) {
                return $this->respondWithPopupError('Login Google belum dikonfigurasi.');
            }
            return redirect()
                ->route('home')
                ->withErrors([
                    'auth' => 'Login Google belum dikonfigurasi.',
                ]);
        }

        try {
            /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
            $driver = Socialite::driver('google');
            $driver->stateless();

            $guzzleClient = new \GuzzleHttp\Client([
                'verify' => false,
                'timeout' => 15,
                'connect_timeout' => 10,
            ]);
            $driver->setHttpClient($guzzleClient);

            /** @var OAuthUser $oauthUser */
            $oauthUser = $driver->user();
        } catch (Throwable $exception) {
            report($exception);

            $errorMsg = 'Autentikasi Google gagal: ' . $exception->getMessage();

            if ($usePopup) {
                return $this->respondWithPopupError($errorMsg);
            }
            return redirect()
                ->route('home')
                ->withErrors([
                    'auth' => $errorMsg,
                ]);
        }

        $email = Str::lower(trim((string) $oauthUser->getEmail()));

        if ($email === '') {
            if ($usePopup) {
                return $this->respondWithPopupError('Akun Google Anda tidak memiliki email yang dapat digunakan.');
            }
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
            if ($usePopup) {
                return $this->respondWithPopupError('Akun Anda telah dinonaktifkan oleh Owner. Silakan hubungi pemilik toko.');
            }
            return redirect()
                ->route('home')
                ->withErrors([
                    'auth' => 'Akun Anda telah dinonaktifkan oleh Owner. Silakan hubungi pemilik toko.',
                ]);
        }

        $this->syncGoogleIdentity($user, $oauthUser);

        Auth::login($user);
        $request->session()->regenerate();

        if ($usePopup) {
            return $this->respondWithPopupSuccess('Berhasil masuk dengan Google.');
        }

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

        $user = User::query()->create($attributes);

        try {
            $isOwner = in_array(strtolower($email), ['piscokpiscok2610@gmail.com', 'nurhayati.karya@gmail.com', 'zakiram4dhan@gmail.com'], true);
            $roleCode = $isOwner ? 'super_admin' : 'operator';
            $role = \App\Domain\Identity\Models\Role::where('code', $roleCode)->first();
            if ($role) {
                $user->roles()->syncWithoutDetaching([$role->id]);
            }

            $groupCode = $isOwner ? 'OWNER' : 'KASIR';
            $targetGroup = \App\Domain\Identity\Models\AccessGroup::where('code', $groupCode)->first()
                ?? \App\Domain\Identity\Models\AccessGroup::where('code', 'OWNER')->first();
            if ($targetGroup) {
                $user->accessGroups()->syncWithoutDetaching([$targetGroup->id]);
            }
        } catch (\Throwable $e) {
            // Ignore if tables not yet seeded
        }

        return $user;
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

        try {
            $email = strtolower((string) $user->email);
            $isOwner = in_array($email, ['piscokpiscok2610@gmail.com', 'nurhayati.karya@gmail.com', 'zakiram4dhan@gmail.com'], true);

            $roleCode = $isOwner ? 'super_admin' : 'operator';
            $role = \App\Domain\Identity\Models\Role::where('code', $roleCode)->first();
            if ($role) {
                $user->roles()->syncWithoutDetaching([$role->id]);
            }

            $groupCode = $isOwner ? 'OWNER' : 'KASIR';
            $targetGroup = \App\Domain\Identity\Models\AccessGroup::where('code', $groupCode)->first();
            if ($targetGroup) {
                $user->accessGroups()->sync([$targetGroup->id]);
            }
        } catch (\Throwable) {
            // Ignore if access groups table not available
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

    private function respondWithPopupSuccess(string $message): \Illuminate\Http\Response
    {
        $html = sprintf('
            <!DOCTYPE html>
            <html>
            <head>
                <title>Autentikasi Berhasil</title>
                <style>
                    body { font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #334155; }
                    .loader { border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-bottom: 12px; }
                    @keyframes spin { 0%% { transform: rotate(0deg); } 100%% { transform: rotate(360deg); } }
                </style>
            </head>
            <body>
                <div class="loader"></div>
                <p>Autentikasi berhasil, mengalihkan...</p>
                <script>
                    (function() {
                        var sent = false;
                        // BroadcastChannel: COOP-safe, same-origin
                        try {
                            var bc = new BroadcastChannel("google_auth");
                            bc.postMessage({ status: "success", message: %s });
                            bc.close();
                            sent = true;
                        } catch(e) {}

                        // Fallback: postMessage via window.opener
                        if (!sent && window.opener && !window.opener.closed) {
                            try {
                                window.opener.postMessage({ status: "success", message: %s }, window.location.origin);
                                sent = true;
                            } catch(e) {}
                        }

                        // Last resort: redirect this popup to dashboard
                        setTimeout(function() {
                            if (window.opener && !window.opener.closed) {
                                window.close();
                            } else {
                                window.location.href = %s;
                            }
                        }, 300);
                    })();
                </script>
            </body>
            </html>
        ', json_encode($message), json_encode($message), json_encode(route('dashboard')));

        return response($html)->header('Content-Type', 'text/html');
    }

    private function respondWithPopupError(string $message): \Illuminate\Http\Response
    {
        $html = sprintf('
            <!DOCTYPE html>
            <html>
            <head>
                <title>Autentikasi Gagal</title>
                <style>
                    body { font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #334155; }
                    .loader { border: 3px solid #f3f3f3; border-top: 3px solid #ef4444; border-radius: 50%%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-bottom: 12px; }
                    @keyframes spin { 0%% { transform: rotate(0deg); } 100%% { transform: rotate(360deg); } }
                </style>
            </head>
            <body>
                <div class="loader"></div>
                <p>Autentikasi gagal: %s. Menutup...</p>
                <script>
                    (function() {
                        try {
                            var bc = new BroadcastChannel("google_auth");
                            bc.postMessage({ status: "error", message: %s });
                            bc.close();
                        } catch(e) {}

                        if (window.opener && !window.opener.closed) {
                            try {
                                window.opener.postMessage({ status: "error", message: %s }, window.location.origin);
                            } catch(e) {}
                        }

                        setTimeout(function() {
                            if (window.opener && !window.opener.closed) {
                                window.close();
                            } else {
                                window.location.href = "/?error=" + encodeURIComponent(%s);
                            }
                        }, 2000);
                    })();
                </script>
            </body>
            </html>
        ', htmlspecialchars($message), json_encode($message), json_encode($message), json_encode($message));

        return response($html)->header('Content-Type', 'text/html');
    }
}
