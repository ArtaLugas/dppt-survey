<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Password;
use Illuminate\Http\RedirectResponse;

class PasswordResetLinkController extends Controller
{
    /**
     * Tampilan form lupa password.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Menangani permintaan link reset password.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // 1. STRONGER CHECK: Cari user terlebih dahulu
        $user = User::where('email', $request->email)->first();

        // 2. LOGICAL GUARD: Jika user tidak ada atau tidak aktif,
        // kita beri respon sukses yang ambigu demi keamanan (Security by Obscurity)
        // agar bot tidak bisa menebak email mana yang terdaftar.
        if (! $user || ! $user->is_active) {
            return back()->with(
                'status',
                'If the email is registered and active, we have sent a password reset link.'
            );
        }

        // 3. EXPLICIT EXECUTION: Kirim link reset melalui Broker Password
        $status = Password::sendResetLink(
            $request->only('email')
        );

        // 4. RESULT HANDLING
        return $status === Password::RESET_LINK_SENT
            ? back()->with('status', __($status))
            : back()->withErrors(['email' => __($status)]);
    }
}

