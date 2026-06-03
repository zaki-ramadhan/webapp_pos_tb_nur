<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPasswordNotification extends ResetPasswordNotification
{
    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $resetUrl = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Verifikasi lupa password akun accurate.id')
            ->greeting('Hi ' . $notifiable->name . ',')
            ->line('Anda menerima email ini dikarenakan ada permohonan Lupa Password atas akun accurate.id yang terdaftar menggunakan email Anda. Jika Anda tidak merasa melakukan permohonan tersebut, abaikan saja email ini, dan link verifikasi akan expire secara otomatis apabila tidak digunakan lebih dari 24 jam.')
            ->line('Jika Anda memang mengajukan permohonan Lupa Password, silakan klik link verifikasi berikut ini untuk menentukan password baru akun accurate.id Anda:')
            ->action('Link Verifikasi', $resetUrl);
    }
}
