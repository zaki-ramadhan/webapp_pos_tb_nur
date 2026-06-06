<?php

namespace App\Support\Presentation\Blueprints\Pages;

class OrderFulfillmentPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['order-fulfillment'], [
            'orderFulfillment' => [],
        ]);
    }
}
