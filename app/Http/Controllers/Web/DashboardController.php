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
        $user = $request->user();
        $today = date('Y-m-d');
        $asOfDateInput = $request->input('as_of_date');
        $asOfDate = ($asOfDateInput && $asOfDateInput <= $today) ? $asOfDateInput : $today;

        $props = PosBlueprint::forDashboard($sample, true, $asOfDate);

        if ($user !== null) {
            $props['dashboard']['user'] = AuthenticatedUserPresenter::present($user);
        }

        $props['dashboard']['asOfDate'] = $asOfDate;

        return Inertia::render('DashboardPage', [
            ...$props,
        ]);
    }

    public function getWidgetsData(Request $request)
    {
        $today = date('Y-m-d');
        $asOfDateInput = $request->input('as_of_date');
        $asOfDate = ($asOfDateInput && $asOfDateInput <= $today) ? $asOfDateInput : $today;
        $sample = $request->input('sample', 'retail');

        $fullProps = PosBlueprint::forDashboard($sample, true, $asOfDate);
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
        $sample = $request->input('sample', 'retail');

        $fullProps = PosBlueprint::forDashboard($sample, true, $asOfDate);
        $widgets = $fullProps['dashboard']['sampleDashboard']['widgets'] ?? [];
        $targetWidget = collect($widgets)->firstWhere('id', $widgetId);

        return response()->json([
            'widgetId' => $widgetId,
            'widget' => $targetWidget,
            'asOfDate' => $asOfDate,
        ]);
    }
}
