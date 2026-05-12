<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class UpdatePasswordController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $payload = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email terlalu panjang.',
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
            'password.min' => 'Password baru minimal 8 karakter.',
        ]);

        $status = Password::reset([
            'email' => Str::lower(trim($payload['email'])),
            'password' => $payload['password'],
            'password_confirmation' => $payload['password_confirmation'],
            'token' => $payload['token'],
        ], function ($user) use ($payload): void {
            $user->forceFill([
                'password' => Hash::make($payload['password']),
                'remember_token' => Str::random(60),
            ])->save();

            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'auth' => 'Tautan reset password tidak valid atau sudah kedaluwarsa.',
            ]);
        }

        return redirect()->route('home')->with('status', 'Password berhasil diperbarui. Silakan masuk dengan password baru Anda.');
    }
}
