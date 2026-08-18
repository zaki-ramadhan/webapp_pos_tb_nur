<?php

namespace App\Support\Analytics;

class AnalyticsService
{
    protected AbcAnalysisService $abcService;
    protected AprioriAnalysisService $aprioriService;

    /**
     * Konstruktor AnalyticsService.
     */
    public function __construct(
        AbcAnalysisService $abcService,
        AprioriAnalysisService $aprioriService
    ) {
        $this->abcService = $abcService;
        $this->aprioriService = $aprioriService;
    }

    /**
     * Jalankan Analisis ABC.
     *
     * @param int|null $months
     * @param bool $forceRefresh
     * @return array
     */
    public function getAbcAnalysis(?int $months = 3, bool $forceRefresh = false): array
    {
        $cacheKey = 'analytics_abc_' . ($months ?? 'all');
        if ($forceRefresh) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
            return $this->abcService->calculate($months);
        }
        return \Illuminate\Support\Facades\Cache::remember($cacheKey, 30, function () use ($months) {
            return $this->abcService->calculate($months);
        });
    }

    /**
     * Jalankan Algoritma Apriori.
     *
     * @param float $minSupport
     * @param float $minConfidence
     * @param int|null $months
     * @param bool $forceRefresh
     * @return array
     */
    public function getAprioriAnalysis(float $minSupport = 0.05, float $minConfidence = 0.4, ?int $months = 3, bool $forceRefresh = false): array
    {
        $cacheKey = 'analytics_apriori_' . ($months ?? 'all') . '_' . (int) ($minSupport * 100) . '_' . (int) ($minConfidence * 100);
        if ($forceRefresh) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
            return $this->aprioriService->calculate($minSupport, $minConfidence, $months);
        }
        return \Illuminate\Support\Facades\Cache::remember($cacheKey, 30, function () use ($minSupport, $minConfidence, $months) {
            return $this->aprioriService->calculate($minSupport, $minConfidence, $months);
        });
    }
}
