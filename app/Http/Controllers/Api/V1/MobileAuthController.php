<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MobileAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $loginInput = trim($validated['email']);

        $user = User::query()
            ->where('email', $loginInput)
            ->orWhere('phone', $loginInput)
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email/Nomor HP atau password yang Anda masukkan salah.'],
            ]);
        }

        if ($user->is_active === false) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda sedang dinonaktifkan. Silakan hubungi Owner toko.',
            ], 403);
        }

        $email = strtolower((string) $user->email);
        $isPrivileged = $user->isPrivileged()
            || in_array($email, array_merge(\App\Models\User::DEVELOPER_EMAILS, \App\Models\User::OWNER_EMAILS), true)
            || $user->hasAnyRoleCodes(['super_admin', 'owner', 'admin']);
        $hasActiveRole = $user->roles()->where('roles.is_active', true)->exists();
        $hasAccessGroup = $user->accessGroups()->exists();

        if (! $isPrivileged && ! $hasActiveRole && ! $hasAccessGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda belum memiliki peran toko yang sah. Hubungi Owner untuk mengaktifkan akses Anda.',
            ], 403);
        }

        $restrictionMessage = app(\App\Support\Backend\BackendResourceAccessService::class)->getUserTimeRestrictionMessage($user);
        if ($restrictionMessage) {
            return response()->json([
                'success' => false,
                'message' => $restrictionMessage,
            ], 403);
        }

        $user->update(['last_login_at' => now()]);

        $deviceName = ! empty($validated['device_name']) ? $validated['device_name'] : 'Mobile Device';
        $token = $user->createToken($deviceName)->plainTextToken;

        $user->loadMissing(['roles', 'accessGroups', 'branches']);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'roles' => $user->roles->pluck('code')->all(),
                    'access_groups' => $user->accessGroups->pluck('name')->all(),
                    'branches' => $user->branches->map(fn ($b) => ['id' => $b->id, 'name' => $b->name])->all(),
                ],
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing(['roles', 'accessGroups', 'branches']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'roles' => $user->roles->pluck('code')->all(),
                'access_groups' => $user->accessGroups->pluck('name')->all(),
                'branches' => $user->branches->map(fn ($b) => ['id' => $b->id, 'name' => $b->name])->all(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Sesi berhasil diakhiri (logout).',
        ]);
    }
}
