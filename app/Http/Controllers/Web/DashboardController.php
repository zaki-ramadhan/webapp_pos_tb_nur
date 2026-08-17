<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\Presentation\AuthenticatedUserPresenter;
use App\Support\Presentation\PosBlueprint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request, ?string $sample = null)
    {
        $analytics = app(\App\Support\Analytics\AnalyticsService::class);
        $user = $request->user();
        
        $today = date('Y-m-d');
        $asOfDateInput = $request->input('as_of_date');
        $asOfDate = ($asOfDateInput && $asOfDateInput <= $today) ? $asOfDateInput : $today;

        $props = PosBlueprint::forDashboard($sample, null, null, false, $asOfDate);

        if ($user !== null) {
            $props['dashboard']['user'] = AuthenticatedUserPresenter::present($user);
        }

        $forceRefresh = $request->has('force_refresh');
        $monthsParam = $request->input('months');
        $months = $request->has('months') ? ($monthsParam === 'all' ? null : (int) $monthsParam) : 3;
        $cacheKey = 'dashboard_widgets_' . ($sample ?? 'retail') . '_' . ($months ?? 'all') . '_' . $asOfDate;

        $props['dashboard']['asOfDate'] = $asOfDate;

        return Inertia::render('DashboardPage', [
            ...$props,
            'widgets' => Inertia::defer(function () use ($sample, $analytics, $cacheKey, $forceRefresh, $months, $asOfDate) {
                if ($forceRefresh) {
                    \Illuminate\Support\Facades\Cache::forget($cacheKey);
                }

                return \Illuminate\Support\Facades\Cache::remember($cacheKey, 1800, function () use ($sample, $analytics, $months, $asOfDate) {
                    $abc = $analytics->getAbcAnalysis($months);
                    $apriori = $analytics->getAprioriAnalysis(0.05, 0.40, $months);
                    $fullProps = PosBlueprint::forDashboard($sample, $abc, $apriori, true, $asOfDate);
                    return $fullProps['dashboard']['sampleDashboard']['widgets'];
                });
            }),
        ]);
    }

    public function getWidgetsData(Request $request)
    {
        $today = date('Y-m-d');
        $asOfDateInput = $request->input('as_of_date');
        $asOfDate = ($asOfDateInput && $asOfDateInput <= $today) ? $asOfDateInput : $today;
        $monthsParam = $request->input('months');
        $months = $request->has('months') ? ($monthsParam === 'all' ? null : (int) $monthsParam) : 3;
        $sample = $request->input('sample', 'retail');

        $cacheKey = 'dashboard_widgets_' . $sample . '_' . ($months ?? 'all') . '_' . $asOfDate;

        if ($request->has('force_refresh')) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
        }

        $widgets = \Illuminate\Support\Facades\Cache::remember($cacheKey, 1800, function () use ($sample, $months, $asOfDate) {
            $analytics = app(\App\Support\Analytics\AnalyticsService::class);
            $abc = $analytics->getAbcAnalysis($months);
            $apriori = $analytics->getAprioriAnalysis(0.05, 0.40, $months);
            $fullProps = PosBlueprint::forDashboard($sample, $abc, $apriori, true, $asOfDate);
            return $fullProps['dashboard']['sampleDashboard']['widgets'];
        });

        return response()->json([
            'widgets' => $widgets,
            'asOfDate' => $asOfDate,
        ]);
    }

    public function getSingleWidgetData(Request $request)
    {
        $widgetId = $request->input('widget_id');
        $today = date('Y-m-d');
        $asOfDateInput = $request->input('as_of_date');
        $asOfDate = ($asOfDateInput && $asOfDateInput <= $today) ? $asOfDateInput : $today;
        $monthsParam = $request->input('months');
        $months = $request->has('months') ? ($monthsParam === 'all' ? null : (int) $monthsParam) : 3;
        $sample = $request->input('sample', 'retail');

        $cacheKey = 'dashboard_widgets_' . $sample . '_' . ($months ?? 'all') . '_' . $asOfDate;

        if ($request->has('force_refresh')) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
        }

        $widgets = \Illuminate\Support\Facades\Cache::remember($cacheKey, 1800, function () use ($sample, $months, $asOfDate) {
            $analytics = app(\App\Support\Analytics\AnalyticsService::class);
            $abc = $analytics->getAbcAnalysis($months);
            $apriori = $analytics->getAprioriAnalysis(0.05, 0.40, $months);
            $fullProps = PosBlueprint::forDashboard($sample, $abc, $apriori, true, $asOfDate);
            return $fullProps['dashboard']['sampleDashboard']['widgets'];
        });

        $targetWidget = collect($widgets)->firstWhere('id', $widgetId);

        return response()->json([
            'widgetId' => $widgetId,
            'widget' => $targetWidget,
            'asOfDate' => $asOfDate,
        ]);
    }
}
