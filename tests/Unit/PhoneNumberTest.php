<?php

namespace Tests\Unit;

use App\Support\Auth\PhoneNumber;
use PHPUnit\Framework\TestCase;

class PhoneNumberTest extends TestCase
{
    public function test_it_normalizes_multiple_input_formats_to_the_same_canonical_number(): void
    {
        $this->assertSame('6281212345678', PhoneNumber::normalize('0812-1234-5678'));
        $this->assertSame('6281212345678', PhoneNumber::normalize('+62812 1234 5678'));
        $this->assertSame('6281212345678', PhoneNumber::normalize('81212345678'));
    }

    public function test_it_generates_lookup_candidates_for_existing_legacy_formats(): void
    {
        $this->assertSame(
            ['6281212345678', '+6281212345678', '081212345678', '81212345678'],
            PhoneNumber::candidates('081212345678')
        );
    }
}
