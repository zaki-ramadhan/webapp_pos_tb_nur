<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ForgotPasswordLinkController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $rawEmail = Str::lower(trim((string) ($request->input('email') ?? $request->input('identifier') ?? '')));
        $request->merge(['email' => $rawEmail]);

        $payload = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email terlalu panjang.',
        ]);

        $email = $payload['email'];
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        if ($user === null || ! filled($user->email)) {
            RateLimiter::hit($this->throttleKey($request));

            return back()->with(
                'status',
                'Jika akun Anda terdaftar di sistem kami, tautan reset password telah dikirimkan ke email Anda.'
            );
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
                'email' => 'Gagal mengirim email verifikasi saat ini. Silakan coba beberapa saat lagi atau hubungi Pemilik Toko.',
            ]);
        }

        if ($status !== Password::RESET_LINK_SENT && $status !== Password::INVALID_USER) {
            RateLimiter::hit($this->throttleKey($request));

            $message = $status === Password::RESET_THROTTLED
                ? 'Tautan reset password baru saja dikirim. Mohon tunggu 1 menit sebelum meminta kembali.'
                : 'Permintaan reset password belum dapat diproses. Coba lagi beberapa saat lagi.';

            throw ValidationException::withMessages([
                'email' => $message,
            ]);
        }

        RateLimiter::clear($this->throttleKey($request));

        return back()->with('status', 'Link verifikasi reset password telah dikirim ke email Anda.');
    }

    protected function throttleKey(Request $request): string
    {
        return 'password-reset|'.Str::lower(trim((string) $request->input('email'))).'|'.$request->ip();
    }
}
