<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domain\Support\Models\Attachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttachmentUploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt',
            ],
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getClientMimeType();
        $fileSize = $file->getSize();

        $isImage = in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'webp', 'gif']) 
            || str_starts_with($mimeType, 'image/');

        if ($isImage && extension_loaded('gd') && function_exists('imagewebp')) {
            $compressed = $this->compressAndSaveToWebp($file, 'attachments');
            if ($compressed) {
                $filePath = $compressed['file_path'];
                $fileSize = $compressed['file_size'];
                $mimeType = 'image/webp';
                
                $pathInfo = pathinfo($originalName);
                $originalName = ($pathInfo['filename'] ?? 'attachment') . '.webp';
            } else {
                $filePath = $file->store('attachments', 'public');
            }
        } else {
            $filePath = $file->store('attachments', 'public');
        }

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

    /**
     * Compress the image using PHP's native GD extension and save it as WebP.
     */
    private function compressAndSaveToWebp($file, string $targetFolder, int $maxWidth = 1600, int $quality = 80): ?array
    {
        $mime = $file->getClientMimeType();
        $sourcePath = $file->getRealPath();

        if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
            $srcImage = @imagecreatefromjpeg($sourcePath);
        } elseif ($mime === 'image/png') {
            $srcImage = @imagecreatefrompng($sourcePath);
        } elseif ($mime === 'image/webp') {
            $srcImage = @imagecreatefromwebp($sourcePath);
        } elseif ($mime === 'image/gif') {
            $srcImage = @imagecreatefromgif($sourcePath);
        } else {
            return null;
        }

        if (!$srcImage) {
            return null;
        }

        $origWidth = imagesx($srcImage);
        $origHeight = imagesy($srcImage);

        if ($origWidth > $maxWidth) {
            $ratio = $maxWidth / $origWidth;
            $newWidth = $maxWidth;
            $newHeight = (int)($origHeight * $ratio);

            $dstImage = imagecreatetruecolor($newWidth, $newHeight);

            if ($mime === 'image/png' || $mime === 'image/webp' || $mime === 'image/gif') {
                imagealphablending($dstImage, false);
                imagesavealpha($dstImage, true);
                $transparent = imagecolorallocatealpha($dstImage, 255, 255, 255, 127);
                imagefilledrectangle($dstImage, 0, 0, $newWidth, $newHeight, $transparent);
            }

            imagecopyresampled($dstImage, $srcImage, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
            imagedestroy($srcImage);
            $srcImage = $dstImage;
        }

      // Capture WebP binary data in memory using output buffering

        ob_start();
        $success = @imagewebp($srcImage, null, $quality);
        $webpData = ob_get_clean();
        imagedestroy($srcImage);

        if (!$success || !$webpData) {
            return null;
        }

        $randomName = Str::random(40) . '.webp';
        $relativeFilePath = $targetFolder . '/' . $randomName;

      // Save via Laravel Storage facade

        $writeSuccess = \Illuminate\Support\Facades\Storage::disk('public')->put($relativeFilePath, $webpData);

        if (!$writeSuccess) {
            return null;
        }

        return [
            'file_path' => $relativeFilePath,
            'file_size' => strlen($webpData),
        ];
    }
}
