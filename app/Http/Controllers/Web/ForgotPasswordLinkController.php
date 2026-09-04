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
        $rawIdentifier = trim((string) ($request->input('email') ?? $request->input('identifier') ?? ''));
        $request->merge(['identifier' => $rawIdentifier, 'email' => $rawIdentifier]);

        $payload = $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
        ], [
            'identifier.required' => 'Email wajib diisi.',
            'identifier.max' => 'Email terlalu panjang.',
        ]);

        $identifier = trim($payload['identifier']);
        $userQuery = User::query()->whereRaw('LOWER(email) = ?', [Str::lower($identifier)]);

        if ($this->supportsUserPhone()) {
            $phoneCandidates = PhoneNumber::candidates($identifier);

            if ($phoneCandidates !== []) {
                $userQuery->orWhereIn('phone', $phoneCandidates);
            }
        }

        $user = $userQuery->first();

        if ($user === null || ! filled($user->email)) {
            RateLimiter::hit($this->throttleKey($request));

            return redirect()->route('home')->with(
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
                'email' => 'Gagal mengirim email verifikasi karena pengiriman email (SMTP) server belum dikonfigurasi. Silakan hubungi Pemilik Toko (Owner) untuk reset password.',
                'identifier' => 'Gagal mengirim email verifikasi karena pengiriman email (SMTP) server belum dikonfigurasi. Silakan hubungi Pemilik Toko (Owner) untuk reset password.',
            ]);
        }

        if ($status !== Password::RESET_LINK_SENT && $status !== Password::INVALID_USER) {
            RateLimiter::hit($this->throttleKey($request));

            throw ValidationException::withMessages([
                'identifier' => 'Permintaan reset password belum dapat diproses. Coba lagi beberapa saat lagi.',
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
        return 'password-reset|'.Str::lower(trim((string) $request->input('identifier'))).'|'.$request->ip();
    }

    protected function supportsUserPhone(): bool
    {
        return Schema::hasColumn('users', 'phone');
    }
}
