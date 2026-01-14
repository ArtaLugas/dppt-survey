@props(['value'])

<label {{ $attributes->merge(['class' => 'block text-sm font-semibold text-[#333333] mb-2']) }}>
    {{ $value ?? $slot }}
</label>
