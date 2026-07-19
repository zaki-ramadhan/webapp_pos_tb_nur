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
    public function __invoke(Request $request, ?string $sample = null)
    {
        $year = $request->query('year') ? (int) $request->query('year') : null;
        $widgetId = $request->query('widget_id');
        
        if ($widgetId) {
            $analytics = app(\App\Support\Analytics\AnalyticsService::class);
            $cacheKey = 'dashboard_widgets_' . ($sample ?? 'retail') . '_' . ($year ?? 'current');
            
            $widgets = \Illuminate\Support\Facades\Cache::remember($cacheKey, 1800, function () use ($sample, $analytics, $year) {
                $abc = $analytics->getAbcAnalysis();
                $apriori = $analytics->getAprioriAnalysis(0.05, 0.40);
                $fullProps = PosBlueprint::forDashboard($sample, $abc, $apriori, true, $year);
                return $fullProps['dashboard']['sampleDashboard']['widgets'];
            });
            
            $widgetData = collect($widgets)->firstWhere('id', $widgetId);
            return response()->json($widgetData);
        }

        $analytics = app(\App\Support\Analytics\AnalyticsService::class);
        $props = PosBlueprint::forDashboard($sample, null, null, false, $year);
        $user = $request->user();

        if ($user !== null) {
            $props['dashboard']['user'] = AuthenticatedUserPresenter::present($user);
        }

        $forceRefresh = $request->has('force_refresh');
        $cacheKey = 'dashboard_widgets_' . ($sample ?? 'retail') . '_' . ($year ?? 'current');

        return Inertia::render('DashboardPage', [
            ...$props,
            'widgets' => Inertia::defer(function () use ($sample, $analytics, $cacheKey, $forceRefresh, $year) {
                if ($forceRefresh) {
                    \Illuminate\Support\Facades\Cache::forget($cacheKey);
                }

                return \Illuminate\Support\Facades\Cache::remember($cacheKey, 1800, function () use ($sample, $analytics, $year) {
                    $abc = $analytics->getAbcAnalysis();
                    $apriori = $analytics->getAprioriAnalysis(0.05, 0.40);
                    $fullProps = PosBlueprint::forDashboard($sample, $abc, $apriori, true, $year);
                    return $fullProps['dashboard']['sampleDashboard']['widgets'];
                });
            }),
        ]);
    }
}
