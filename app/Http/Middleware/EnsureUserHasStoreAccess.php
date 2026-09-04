<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasStoreAccess
{
    /**
     * @var list<string>
     */
    protected array $privilegedEmails = [
        'piscokpiscok2610@gmail.com',
        'nurhayati.karya@gmail.com',
        'zakiram4dhan@gmail.com',
    ];

    /**
     * Pastikan user yang login memiliki peran toko (Owner atau Karyawan Aktif).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi login Anda telah berakhir. Silakan login kembali.',
            ], 401);
        }

        $email = strtolower((string) $user->email);

        $privilegedEmails = array_values(array_unique(array_merge(
            $this->privilegedEmails,
            \App\Models\User::getDeveloperEmails(),
            \App\Models\User::getOwnerEmails()
        )));

        // 1. Owner utama / Super admin / Administrator Sistem selalu lolos
        if ($user->isPrivileged() || in_array($email, $privilegedEmails, true) || $user->hasAnyRoleCodes(['super_admin', 'owner', 'admin'])) {
            return $next($request);
        }

        // 2. Akun wajib dalam kondisi aktif
        if ($user->is_active === false) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda sedang dinonaktifkan oleh Owner toko.',
            ], 403);
        }

        // 3. User wajib memiliki Role toko atau Access Group
        $hasActiveRole = $user->roles()->where('roles.is_active', true)->exists();
        $hasAccessGroup = $user->accessGroups()->exists();

        if (! $hasActiveRole && ! $hasAccessGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda belum memiliki peran toko yang sah. Hubungi Owner untuk mengaktifkan akses Anda.',
            ], 403);
        }

        // 4. Pembatasan waktu operasional grup akses
        if (! $request->routeIs('logout')) {
            $restrictionMessage = app(\App\Support\Backend\BackendResourceAccessService::class)->getUserTimeRestrictionMessage($user);
            if ($restrictionMessage) {
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'success' => false,
                        'message' => $restrictionMessage,
                    ], 403);
                }

                auth()->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('home')->withErrors([
                    'auth' => $restrictionMessage,
                ]);
            }
        }

        return $next($request);
    }
}
