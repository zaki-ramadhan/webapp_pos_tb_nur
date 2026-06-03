<?php

namespace App\Support\Analytics;

class AnalyticsService
{
    protected AbcAnalysisService $abcService;
    protected AprioriAnalysisService $aprioriService;

    /**
     * AnalyticsService Constructor with Auto-Wired Micro-Services.
     */
    public function __construct(
        AbcAnalysisService $abcService,
        AprioriAnalysisService $aprioriService
    ) {
        $this->abcService = $abcService;
        $this->aprioriService = $aprioriService;
    }

    /**
     * Perform ABC Analysis on Sales Data.
     *
     * @return array
     */
    public function getAbcAnalysis(): array
    {
        return $this->abcService->calculate();
    }

    /**
     * Run Apriori Algorithm to find Association Rules.
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
