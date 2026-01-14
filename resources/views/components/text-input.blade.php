@props(['disabled' => false])

<input {{ $disabled ? 'disabled' : '' }} {!! $attributes->merge(['class' => 'block w-full px-4 py-3 border border-[#80C7E3]/40 rounded-lg text-[#333333] placeholder-[#333333]/40 focus:ring-2 focus:ring-[#006CCD] focus:border-[#006CCD] transition duration-200 disabled:bg-[#F5F5F5] disabled:cursor-not-allowed']) !!}>
