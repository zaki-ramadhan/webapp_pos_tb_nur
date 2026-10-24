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
            'appName' => 'TB Nur POS',
            'supportEmail' => 'support@tb-nur.shop',
            'lastUpdated' => '24 September 2026',
        ]);
    }
}
