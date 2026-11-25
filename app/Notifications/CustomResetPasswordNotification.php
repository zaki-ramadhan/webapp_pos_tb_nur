<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPasswordNotification extends ResetPasswordNotification
{
    /**
     * Kirim notifikasi via email.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $resetUrl = $this->resetUrl($notifiable);
        $loginUrl = 'https://tb-nur.shop/login';

        return (new MailMessage)
            ->subject('Verifikasi Lupa Password Akun TB Nur')
            ->greeting('Halo ' . ($notifiable->name ?? 'Pengguna') . ',')
            ->line('Anda menerima email ini karena ada permohonan Lupa Password untuk akun TB Nur (' . $loginUrl . ') yang terdaftar menggunakan email Anda.')
            ->line('Jika Anda tidak merasa mengajukan permohonan tersebut, silakan abaikan email ini. Tautan verifikasi ini akan kedaluwarsa secara otomatis dalam 60 menit.')
            ->line('Jika Anda memang mengajukan permohonan Lupa Password, silakan klik tombol di bawah ini untuk menentukan password baru akun TB Nur Anda:')
            ->action('Reset Password Akun', $resetUrl)
            ->line('Setelah password berhasil diperbarui, Anda dapat langsung masuk kembali ke sistem melalui: ' . $loginUrl)
            ->salutation("Salam hangat,\nTim TB Nur");
    }
}
