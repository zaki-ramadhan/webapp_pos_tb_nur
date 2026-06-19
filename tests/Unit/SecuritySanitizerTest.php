<?php

namespace Tests\Unit;

use App\Support\Backend\BackendResourcePayloadSanitizer;
use Tests\TestCase;

class SecuritySanitizerTest extends TestCase
{
    public function test_sanitizer_strips_html_tags_from_payload(): void
    {
        $sanitizer = new BackendResourcePayloadSanitizer();

        $payload = [
            'name' => '<b>Semen Tiga Roda</b>',
            'code' => '<script>alert("hack")</script>PM-01',
            'description' => 'Ini adalah deskripsi <iframe src="dangerous.html"></iframe> produk.',
            'quantity' => 10,
        ];

        $sanitized = $sanitizer->sanitize($payload);

        $this->assertEquals('Semen Tiga Roda', $sanitized['name']);
        $this->assertEquals('alert("hack")PM-01', $sanitized['code']);
        $this->assertEquals('Ini adalah deskripsi  produk.', $sanitized['description']);
        $this->assertEquals(10, $sanitized['quantity']);
    }
}
