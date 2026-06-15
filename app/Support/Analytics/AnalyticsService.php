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
     * @return array
     */
    public function getAbcAnalysis(): array
    {
        return $this->abcService->calculate();
    }

    /**
     * Jalankan Algoritma Apriori.
     *
     * @param float $minSupport
     * @param float $minConfidence
     * @return array
     */
    public function getAprioriAnalysis(float $minSupport = 0.05, float $minConfidence = 0.4): array
    {
        return $this->aprioriService->calculate($minSupport, $minConfidence);
    }
}
