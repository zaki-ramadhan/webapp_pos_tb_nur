<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\Presentation\PosBlueprint;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, ?string $sample = null): Response
    {
        $props = PosBlueprint::forDashboard($sample);
        $user = $request->user();

        if ($user !== null) {
            $props['dashboard']['user'] = [
                ...($props['dashboard']['user'] ?? []),
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->is_active ? 'active' : 'inactive',
            ];
        }

        return Inertia::render('DashboardPage', $props);
    }
}
