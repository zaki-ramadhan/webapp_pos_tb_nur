<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\Auth\AuthFeatureFlags;
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
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RegisterUserController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        if (! AuthFeatureFlags::allowsPublicRegistration()) {
            throw new NotFoundHttpException();
        }

        $this->ensureIsNotRateLimited($request);

        $normalizedPhone = PhoneNumber::normalize($request->input('phone'));

        $rules = [
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', app()->environment('testing') ? 'email' : 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
        ];

        $rules['phone'] = [
            'nullable',
            'string',
            'max:50',
            function (string $attribute, mixed $value, \Closure $fail) use ($normalizedPhone): void {
                if ($value === null || trim((string) $value) === '') {
                    return;
                }

                if (! PhoneNumber::isValidIndonesianMobile((string) $value)) {
                    $fail('Gunakan nomor handphone Indonesia yang aktif, misalnya 08123456789 atau +628123456789.');
                }

                if ($normalizedPhone !== null && User::query()
                    ->whereNotNull('phone')
                    ->whereIn('phone', PhoneNumber::candidates($normalizedPhone))
                    ->exists()) {
                    $fail('Nomor handphone ini sudah terdaftar.');
                }
            },
        ];

        $payload = $request->validate($rules, [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.max' => 'Nama lengkap terlalu panjang.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email terlalu panjang.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'phone.max' => 'Nomor handphone terlalu panjang.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.max' => 'Password terlalu panjang.',
        ]);

        $attributes = [
            'name' => trim($payload['name']),
            'email' => Str::lower(trim($payload['email'])),
            'password' => Hash::make($payload['password']),
        ];

        if ($this->supportsUserPhone()) {
            $attributes['phone'] = $normalizedPhone;
        }

        if ($this->supportsUserActivation()) {
            $attributes['is_active'] = true;
        }

        if ($this->supportsLastLoginTracking()) {
            $attributes['last_login_at'] = now();
        }

        $user = User::query()->create($attributes);

        Auth::login($user);
        $request->session()->regenerate();
        RateLimiter::clear($this->throttleKey($request));

        return redirect()->route('dashboard')->with('status', 'Pendaftaran berhasil. Akun Anda sudah aktif dan siap digunakan.');
    }

    protected function ensureIsNotRateLimited(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 3)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'auth' => "Terlalu banyak percobaan pendaftaran. Coba lagi dalam {$seconds} detik.",
        ]);
    }

    protected function throttleKey(Request $request): string
    {
        return 'register|'.Str::lower(trim((string) $request->input('email'))).'|'.$request->ip();
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
}
