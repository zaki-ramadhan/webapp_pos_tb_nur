<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Auth\PhoneNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $this->ensureIsNotRateLimited($request);

        $credentials = $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ], [
            'identifier.required' => 'Email atau nomor handphone wajib diisi.',
            'identifier.max' => 'Email atau nomor handphone terlalu panjang.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $identifier = trim($credentials['identifier']);
        $userQuery = User::query()->whereRaw('LOWER(email) = ?', [Str::lower($identifier)]);

        if ($this->supportsUserPhone()) {
            $phoneCandidates = PhoneNumber::candidates($identifier);

            if ($phoneCandidates !== []) {
                $userQuery->orWhereIn('phone', $phoneCandidates);
            }
        }

        $user = $userQuery->first();

        if ($user === null || ! Hash::check($credentials['password'], $user->password)) {
            RateLimiter::hit($this->throttleKey($request));

            throw ValidationException::withMessages([
                'auth' => $this->invalidCredentialsMessage(),
            ]);
        }

        if ($this->supportsUserActivation() && ! (bool) $user->is_active) {
            RateLimiter::hit($this->throttleKey($request));

            throw ValidationException::withMessages([
                'auth' => 'Akun Anda telah dinonaktifkan oleh Owner. Silakan hubungi pemilik toko.',
            ]);
        }

        $email = strtolower((string) $user->email);
        $isOwner = in_array($email, ['piscokpiscok2610@gmail.com', 'nurhayati.karya@gmail.com', 'zakiram4dhan@gmail.com'], true) || $user->hasAnyRoleCodes(['super_admin']);
        $user->loadMissing('accessGroups');

        if (! $isOwner && $user->accessGroups->isEmpty()) {
            RateLimiter::clear($this->throttleKey($request));

            return redirect()->route('home')->with(
                'warning',
                "Akun Anda ({$user->email}) belum memiliki Hak Akses. Silakan hubungi Pemilik Toko (Owner) untuk mengaktifkan akses akun Anda."
            );
        }

        $restrictionMessage = app(\App\Support\Backend\BackendResourceAccessService::class)->getUserTimeRestrictionMessage($user);
        if ($restrictionMessage) {
            RateLimiter::hit($this->throttleKey($request));

            throw ValidationException::withMessages([
                'auth' => $restrictionMessage,
            ]);
        }

        RateLimiter::clear($this->throttleKey($request));

        Auth::login($user);
        $request->session()->regenerate();

        if ($this->supportsLastLoginTracking()) {
            $user->forceFill([
                'last_login_at' => now(),
            ])->save();
        }

        return redirect()->intended(route('dashboard'))->with('status', 'Berhasil masuk. Selamat datang kembali.');
    }

    protected function ensureIsNotRateLimited(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'auth' => "Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik.",
        ]);
    }

    protected function throttleKey(Request $request): string
    {
        return Str::lower((string) $request->input('identifier')).'|'.$request->ip();
    }

    protected function supportsUserPhone(): bool
    {
        return Schema::hasColumn('users', 'phone');
    }

    protected function supportsUserActivation(): bool
    {
        return Schema::hasColumn('users', 'is_active');
    }

    protected function supportsLastLoginTracking(): bool
    {
        return Schema::hasColumn('users', 'last_login_at');
    }

    protected function invalidCredentialsMessage(): string
    {
        return $this->supportsUserPhone()
            ? 'Email, nomor handphone, atau password tidak valid.'
            : 'Email atau password tidak valid.';
    }
}
