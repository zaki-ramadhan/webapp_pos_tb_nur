<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title inertia><?php echo e(config('app.name', 'TB Nur POS')); ?></title>
        <link rel="icon" type="image/png" href="/logo_icon.png" />
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
            href="https://fonts.bunny.net/css?family=montserrat:400,500,600,700,800"
            rel="stylesheet"
        />
        <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
        <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app/App.jsx']); ?>
        <?php if (isset($component)) { $__componentOriginal56673881198e3a2924721e242dee6899 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal56673881198e3a2924721e242dee6899 = $attributes; } ?>
<?php $component = Inertia\View\Components\Head::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inertia::head'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Inertia\View\Components\Head::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal56673881198e3a2924721e242dee6899)): ?>
<?php $attributes = $__attributesOriginal56673881198e3a2924721e242dee6899; ?>
<?php unset($__attributesOriginal56673881198e3a2924721e242dee6899); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal56673881198e3a2924721e242dee6899)): ?>
<?php $component = $__componentOriginal56673881198e3a2924721e242dee6899; ?>
<?php unset($__componentOriginal56673881198e3a2924721e242dee6899); ?>
<?php endif; ?>
    </head>
    <body class="bg-[var(--color-surface)] text-[var(--color-ink)] antialiased">
        <div id="initial-loader" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background-color: #f8f9fb; z-index: 99999; font-family: 'Montserrat', sans-serif; transition: opacity 0.3s ease-out;">
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top-color: #21539b; border-radius: 50%; animation: initial-loader-spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <div style="font-size: 16px; font-weight: 500; color: #1e293b; animation: initial-loader-pulse 1.5s ease-in-out infinite;">Sedang memuat...</div>
            </div>
        </div>
        <style>
            @keyframes initial-loader-spin {
                to { transform: rotate(360deg); }
            }
            @keyframes initial-loader-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
        <?php if (isset($component)) { $__componentOriginal1830bdc8f8b965a5838ec47487b5507c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1830bdc8f8b965a5838ec47487b5507c = $attributes; } ?>
<?php $component = Inertia\View\Components\App::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inertia::app'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Inertia\View\Components\App::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1830bdc8f8b965a5838ec47487b5507c)): ?>
<?php $attributes = $__attributesOriginal1830bdc8f8b965a5838ec47487b5507c; ?>
<?php unset($__attributesOriginal1830bdc8f8b965a5838ec47487b5507c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1830bdc8f8b965a5838ec47487b5507c)): ?>
<?php $component = $__componentOriginal1830bdc8f8b965a5838ec47487b5507c; ?>
<?php unset($__componentOriginal1830bdc8f8b965a5838ec47487b5507c); ?>
<?php endif; ?>
    </body>
</html>
<?php /**PATH D:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\views/app.blade.php ENDPATH**/ ?>