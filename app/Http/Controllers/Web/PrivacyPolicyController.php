<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PrivacyPolicyController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('PrivacyPolicyPage', [
            'appName' => 'Point of Sale TB NUR',
            'supportEmail' => 'zakiram4dhan@gmail.com',
            'lastUpdated' => '19 September 2026',
        ]);
    }
}
