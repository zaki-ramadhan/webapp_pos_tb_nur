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

        $forceRefresh = $request->has('force_refresh');
        $monthsParam = $request->input('months');
        $months = $request->has('months') ? ($monthsParam === 'all' ? null : (int) $monthsParam) : 3;

        // 1. FAST PATH: Compute the 8 Core Widgets immediately (<25ms)
        $props = PosBlueprint::forDashboard($sample, null, null, true, $asOfDate);

        if ($user !== null) {
            $props['dashboard']['user'] = AuthenticatedUserPresenter::present($user);
        }

        $props['dashboard']['asOfDate'] = $asOfDate;

        // Mark 'integrated-analysis' as waiting for deferred analytics payload
        if (isset($props['dashboard']['sampleDashboard']['widgets'])) {
            $props['dashboard']['sampleDashboard']['widgets'] = array_map(function ($widget) {
                if ($widget['id'] === 'integrated-analysis') {
                    $widget['isDeferredLoading'] = true;
                }
                return $widget;
            }, $props['dashboard']['sampleDashboard']['widgets']);
        }

        return Inertia::render('DashboardPage', [
            ...$props,
            // 2. PROGRESSIVE DEFER: Only the heavy data mining algorithm (Apriori & ABC) is deferred
            'analyticsWidget' => Inertia::defer(function () use ($sample, $analytics, $months, $forceRefresh, $asOfDate) {
                if ($forceRefresh) {
                    \Illuminate\Support\Facades\Cache::flush();
                }
                $abc = $analytics->getAbcAnalysis($months, $forceRefresh);
                $apriori = $analytics->getAprioriAnalysis(0.05, 0.40, $months, $forceRefresh);
                $full = PosBlueprint::forDashboard($sample, $abc, $apriori, true, $asOfDate);
                return collect($full['dashboard']['sampleDashboard']['widgets'] ?? [])->firstWhere('id', 'integrated-analysis');
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

        $forceRefresh = $request->has('force_refresh');
        if ($forceRefresh) {
            \Illuminate\Support\Facades\Cache::flush();
        }

        $analytics = app(\App\Support\Analytics\AnalyticsService::class);
        $abc = $analytics->getAbcAnalysis($months, $forceRefresh);
        $apriori = $analytics->getAprioriAnalysis(0.05, 0.40, $months, $forceRefresh);
        $fullProps = PosBlueprint::forDashboard($sample, $abc, $apriori, true, $asOfDate);
        $widgets = $fullProps['dashboard']['sampleDashboard']['widgets'] ?? [];

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

        $forceRefresh = $request->has('force_refresh');
        if ($forceRefresh) {
            \Illuminate\Support\Facades\Cache::flush();
        }

        $analytics = app(\App\Support\Analytics\AnalyticsService::class);
        $abc = $analytics->getAbcAnalysis($months, $forceRefresh);
        $apriori = $analytics->getAprioriAnalysis(0.05, 0.40, $months, $forceRefresh);
        $fullProps = PosBlueprint::forDashboard($sample, $abc, $apriori, true, $asOfDate);
        $widgets = $fullProps['dashboard']['sampleDashboard']['widgets'] ?? [];

        $targetWidget = collect($widgets)->firstWhere('id', $widgetId);

        return response()->json([
            'widgetId' => $widgetId,
            'widget' => $targetWidget,
            'asOfDate' => $asOfDate,
        ]);
    }
}
