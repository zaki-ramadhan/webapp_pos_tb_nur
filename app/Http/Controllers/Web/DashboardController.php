<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\Presentation\AuthenticatedUserPresenter;
use App\Support\Presentation\PosBlueprint;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, ?string $sample = null): Response
    {
        $analytics = app(\App\Support\Analytics\AnalyticsService::class);
        $props = PosBlueprint::forDashboard($sample, null, null, false);
        $user = $request->user();

        if ($user !== null) {
            $props['dashboard']['user'] = AuthenticatedUserPresenter::present($user);
        }

        $forceRefresh = $request->has('force_refresh');
        $cacheKey = 'dashboard_widgets_' . ($sample ?? 'retail');

        return Inertia::render('DashboardPage', [
            ...$props,
            'widgets' => Inertia::defer(function () use ($sample, $analytics, $cacheKey, $forceRefresh) {
                if ($forceRefresh) {
                    \Illuminate\Support\Facades\Cache::forget($cacheKey);
                }

                return \Illuminate\Support\Facades\Cache::remember($cacheKey, 1800, function () use ($sample, $analytics) {
                    $abc = $analytics->getAbcAnalysis();
                    $apriori = $analytics->getAprioriAnalysis(0.05, 0.40);
                    $fullProps = PosBlueprint::forDashboard($sample, $abc, $apriori, true);
                    return $fullProps['dashboard']['sampleDashboard']['widgets'];
                });
            }),
        ]);
    }
}
