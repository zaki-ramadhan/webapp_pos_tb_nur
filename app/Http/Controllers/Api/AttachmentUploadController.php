<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domain\Support\Models\Attachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttachmentUploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getClientMimeType();
        $fileSize = $file->getSize();

        $filePath = $file->store('attachments', 'public');

        $attachment = Attachment::create([
            'file_path' => $filePath,
            'file_name' => $originalName,
            'file_type' => $mimeType,
            'file_size' => $fileSize,
        ]);

        return response()->json([
            'message' => 'Berkas berhasil diunggah.',
            'data' => $attachment,
        ], 201);
    }
}
