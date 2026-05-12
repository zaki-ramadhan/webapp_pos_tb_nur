<?php

return [
    'auth' => [
        'allow_public_registration' => env(
            'POS_ALLOW_PUBLIC_REGISTRATION',
            in_array(env('APP_ENV', 'production'), ['local', 'testing'], true),
        ),
        'allow_local_auto_login' => env('POS_ALLOW_LOCAL_AUTO_LOGIN', false),
        'local_auto_login_email' => env('POS_LOCAL_AUTO_LOGIN_EMAIL'),
    ],
    'backend' => [
        'allow_bootstrap_open_access' => env(
            'POS_BACKEND_BOOTSTRAP_OPEN_ACCESS',
            in_array(env('APP_ENV', 'production'), ['local', 'testing'], true),
        ),
    ],
];
