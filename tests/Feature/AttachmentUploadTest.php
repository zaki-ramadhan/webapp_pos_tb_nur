<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttachmentUploadTest extends TestCase
{
    use RefreshDatabase;
    public function test_image_is_compressed_and_saved_as_webp(): void
    {
        Storage::fake('public');

        // Create a user and authenticate
        $user = User::factory()->create();
        $this->actingAs($user);

        // Create a fake large JPEG image (width 3000px, height 2000px, size 2MB)
        $file = UploadedFile::fake()->image('bukti_bayar.jpg', 3000, 2000)->size(2048);

        // Call the API endpoint with backend prefix
        $response = $this->postJson('/api/backend/attachments/upload', [
            'file' => $file,
        ]);

        $response->assertStatus(201);

        // Verify the response metadata
        $data = $response->json('data');
        $this->assertNotNull($data);
        $this->assertStringEndsWith('.webp', $data['file_path']);
        $this->assertEquals('image/webp', $data['file_type']);

        // Verify file exists on disk
        Storage::disk('public')->assertExists($data['file_path']);

        // Verify that the dimensions were scaled down to max width 1600
        $filePathOnDisk = Storage::disk('public')->path($data['file_path']);
        $size = getimagesize($filePathOnDisk);
        $this->assertEquals(1600, $size[0]);
        // 2000 * (1600/3000) = 1066.6 => 1066px height
        $this->assertEquals(1066, $size[1]);

        // Verify database persistence
        $this->assertDatabaseHas('attachments', [
            'id' => $data['id'],
            'file_type' => 'image/webp',
        ]);
    }

    public function test_non_image_file_is_saved_without_compression(): void
    {
        Storage::fake('public');

        // Create a user and authenticate
        $user = User::factory()->create();
        $this->actingAs($user);

        // Create a fake PDF document (size 1MB)
        $file = UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf');

        $response = $this->postJson('/api/backend/attachments/upload', [
            'file' => $file,
        ]);

        $response->assertStatus(201);

        $data = $response->json('data');
        $this->assertNotNull($data);
        $this->assertStringEndsWith('.pdf', $data['file_path']);
        $this->assertEquals('application/pdf', $data['file_type']);

        Storage::disk('public')->assertExists($data['file_path']);
    }
}
