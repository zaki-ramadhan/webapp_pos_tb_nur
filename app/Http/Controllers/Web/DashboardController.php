<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\Presentation\PosBlueprint;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(?string $sample = null): Response
    {
        return Inertia::render('DashboardPage', PosBlueprint::forDashboard($sample));
    }
}
