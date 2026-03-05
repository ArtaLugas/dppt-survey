<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRules;
use Illuminate\Support\Facades\Redirect;

class UserManagementController extends Controller
{
    public function index(): Response
    {
        $users = User::with('role')
        ->orderByDesc('is_active')
        ->orderByDesc('created_at')
        ->get()
        ->map(function ($user) {
            return [
                'id'            => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'role_id'       => $user->role_id,
                'role_code'     => $user->role->code,
                'role_label'    => $user->role->label,
                'is_active'     => (bool) $user->is_active,
                'created_at'    => $user->created_at->toDateTimeString(),
            ];
        });

        $roles = UserRole::all(['id', 'label', 'code']);

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')],
            'role_id' => ['required', 'exists:user_roles,id'],
            'password' => ['required', 'confirmed', PasswordRules::defaults()],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        return Redirect::route('admin.users.store')
            ->with('success', 'User has been successfully created.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role_id' => ['required', 'exists:user_roles,id'],
            'password' => ['nullable', 'confirmed', PasswordRules::defaults()],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
        ]);

        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return Redirect::back()->with('success', 'User has been successfully updated.');
    }

    public function toggleStatus(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return Redirect::back()->with('error', 'You cannot toggle your own status.');
        }

        $user->update(['is_active' => ! $user->is_active]);

        $statusMsg = $user->is_active ? 'activated back' : 'deactivated';
        return Redirect::back()->with('success', "Account {$user->name} has been successfully $statusMsg.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return Redirect::back()->with('error', 'You cannot delete your own account.');
        }

        try {
            $user->delete();

            return Redirect::back()->with('success', 'User has been successfully deleted permanently (Clean data).');
        } catch (Exception $e) {
            return Redirect::back()->with('error', $e->getMessage());
        }
    }

    public function sendResetPassword(User $user): RedirectResponse
    {
        $status = Password::sendResetLink(['email' => $user->email]);

        return $status === Password::RESET_LINK_SENT
            ? Redirect::back()->with('success', 'Password reset link has been sent.')
            : Redirect::back()->with('error', 'Password reset link could not be sent. Please try again.');
    }
}

