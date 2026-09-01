<?php

/*
|--------------------------------------------------------------------------
| Pest Global Configuration
|--------------------------------------------------------------------------
*/

uses(
    Tests\TestCase::class,
)->in('Feature');

uses(
    Tests\TestCase::class,
)->in('Unit');

function testAdmin(): \App\Models\User
{
    /** @var Tests\TestCase $test */
    $test = test();
    return $test->createAuthorizedUser();
}
