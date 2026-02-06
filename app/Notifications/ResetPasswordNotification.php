<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    public function __construct(protected string $token)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $url = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->email,
        ], false));

        return (new MailMessage)
            ->subject('Reset Your Account Password')
            ->greeting(sprintf('Hello, %s', $notifiable->name))
            ->line('We received a request to reset the password of your account.')
            ->line('Please click the button below to create a new password.')
            ->action('Reset Password', $url)
            ->line('This link is only valid for the next 60 minutes.')
            ->line('If you did not make this request, please ignore this email. No changes will be made to your account.')
            ->salutation('Best regards,');
    }
}
