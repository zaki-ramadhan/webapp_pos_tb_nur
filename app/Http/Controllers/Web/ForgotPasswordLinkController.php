<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Auth\PhoneNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ForgotPasswordLinkController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $this->ensureIsNotRateLimited($request);

        $payload = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email terlalu panjang.',
        ]);

        $email = trim($payload['email']);
        $user = User::query()->whereRaw('LOWER(email) = ?', [Str::lower($email)])->first();

        if ($user === null || ! filled($user->email)) {
            RateLimiter::hit($this->throttleKey($request));

            throw ValidationException::withMessages([
                'email' => 'Email tidak terdaftar. Periksa kembali penulisan atau daftar akun baru jika belum memiliki akun.',
            ]);
        }

        try {
            $status = Password::sendResetLink([
                'email' => $user->email,
            ]);
        } catch (\Throwable $e) {
            logger()->error('Password reset mail sending failed: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            throw ValidationException::withMessages([
                'email' => 'Gagal mengirim email verifikasi karena gangguan koneksi server. Silakan coba lagi beberapa saat lagi.',
            ]);
        }

        if ($status !== Password::RESET_LINK_SENT && $status !== Password::INVALID_USER) {
            RateLimiter::hit($this->throttleKey($request));

            throw ValidationException::withMessages([
                'email' => 'Permintaan reset password belum dapat diproses. Coba lagi beberapa saat lagi.',
            ]);
        }

        RateLimiter::clear($this->throttleKey($request));

        return back()->with('status', 'Link verifikasi reset password telah dikirim ke email Anda.');
    }

    protected function ensureIsNotRateLimited(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 3)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'auth' => "Terlalu banyak permintaan reset password. Coba lagi dalam {$seconds} detik.",
        ]);
    }

    protected function throttleKey(Request $request): string
    {
        return 'password-reset|'.Str::lower((string) $request->input('email', $request->input('identifier'))).'|'.$request->ip();
    }

    protected function supportsUserPhone(): bool
    {
        return Schema::hasColumn('users', 'phone');
    }
}
