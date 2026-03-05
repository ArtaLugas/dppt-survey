<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected string $token)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        // Pastikan URL generate secara absolute
        $url = route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->email,
        ]);

        return (new MailMessage)
            ->subject('Action Required: Reset Your Password') // Subject yang jelas dan urgent
            ->greeting('Dear ' . $notifiable->name . ',') // Sapaan formal
            ->line('We received a request to reset the password associated with your account at ' . config('app.name') . '.')
            ->line('You can reset your password by clicking the button below:')
            ->action('Reset Password', $url)
            ->line('For security purposes, this link will expire in 60 minutes.')
            ->line('If you did not initiate this request, please ignore this email. Your password will remain unchanged and your account is secure.')
            ->salutation('Regards, ' . "\n" . config('app.name') . ' Team'); // Penutup profesional
    }
}
