<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Redirect;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::with('role')
            ->whereHas('role', function ($q) {
                $q->whereIn('code', ['surveyor', 'koordinator']); // ✅ BENAR
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($user) {
                return [
                    'id'        => $user->id,
                    'name'      => $user->name,
                    'email'     => $user->email,
                    'role'      => $user->role->code,   // atau ->label jika mau tampil rapi
                    'role_id'   => (string) $user->role_id,
                    'isActive'  => (bool) $user->is_active,
                    'createdAt'=> $user->created_at->format('Y-m-d'),
                ];
            })
            ->toArray();

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->whereNull('deleted_at'),
            ],
            'role_id' => [
                'required',
                'exists:user_roles,id',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
            ],
        ]);

        User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'role_id'   => $validated['role_id'],
            'password'  => $validated['password'],
            'is_active' => true,
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User has been successfully created.');
    }

    public function update(Request $request, User $user)
    {
        if ((int) $user->role_id === 3) {
            return back()->withErrors([
                'user' => 'Admin account cannot be edited.',
            ]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user->id)->whereNull('deleted_at'),
            ],
            'role_id' => [
                'required',
                'integer',
                'exists:user_roles,id',
                Rule::notIn([3]), // admin
            ],
        ]);

        $user->update($validated);

        return back()->with('success', 'User updated successfully.');
    }

    public function sendResetPassword(User $user)
    {
        if (!$user->email) {
            return back()->withErrors([
                'message' => 'User does not have a valid email address.',
            ]);
        }

        $status = Password::sendResetLink([
            'email' => $user->email,
        ]);

        logger()->info('Reset password attempt', [
            'email' => $user->email,
            'status' => $status,
        ]);

        if ($status === Password::RESET_LINK_SENT) {
            return back()->with('success', 'Password reset email sent.');
        }

        if ($status === Password::RESET_THROTTLED) {
            return back()->withErrors([
                'message' => 'Reset link was recently sent. Please wait before retrying.',
            ]);
        }

        if ($status === Password::INVALID_USER) {
            return back()->withErrors([
                'message' => 'User email is not registered.',
            ]);
        }

        return back()->withErrors([
            'message' => 'Failed to send reset password email.',
        ]);
    }
    public function toggleStatus(User $user)
    {
        // 1. Security Check: Prevent Admin Deactivation of self
        if (auth()->id() === $user->id) {
            return Redirect::back()->with('error', 'You cannot deactivate your own account.');
        }

        // 2. Toggle Status (True to False or False to True)
        $user->update([
            'is_active' => !$user->is_active
        ]);

        $statusMessage = $user->is_active ? 'activated' : 'deactivated';

        // 3. Return back with Flash Message (to be captured in the frontend)
        return Redirect::back()->with('success', 'User status has been ' . $statusMessage);
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return Redirect::back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return Redirect::back()->with('success', 'User has been successfully deleted (moved to trash).');
    }
}

