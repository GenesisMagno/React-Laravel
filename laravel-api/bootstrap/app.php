<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php', // ✅ Add this line
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)

    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append([
        \Illuminate\Http\Middleware\HandleCors::class, // ✅ global CORS middleware
        ]);
        $middleware->alias([
            'jwt.cookie' => \App\Http\Middleware\AuthenticateWithJwtCookie::class,
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
