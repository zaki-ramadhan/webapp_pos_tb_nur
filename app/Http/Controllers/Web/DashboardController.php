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
        $analytics = new \App\Support\Analytics\AnalyticsService();
        $abc = $analytics->getAbcAnalysis();
        $apriori = $analytics->getAprioriAnalysis(0.05, 0.40);

        $props = PosBlueprint::forDashboard($sample, $abc, $apriori);
        $user = $request->user();

        if ($user !== null) {
            $props['dashboard']['user'] = AuthenticatedUserPresenter::present($user);
        }

        return Inertia::render('DashboardPage', $props);
    }
}
