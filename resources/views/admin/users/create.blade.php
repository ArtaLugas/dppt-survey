<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Create User</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-100 min-h-screen flex flex-col items-center pt-6">
    <div class="w-full max-w-7xl mx-auto sm:px-6 lg:px-8">

        <form method="POST" action="/admin/users">
            @csrf

            <input name="name" placeholder="Name" required>
            <input name="email" type="email" required>

            <select name="role_id" required>
                @foreach ($roles as $role)
                    <option value="{{ $role->id }}">{{ $role->label }}</option>
                @endforeach
            </select>

            <input name="password" type="password" required>
            <input name="password_confirmation" type="password" required>

            <button type="submit">Create User</button>
        </form>
    </div>
</body>
