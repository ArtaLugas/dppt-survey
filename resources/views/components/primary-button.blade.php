<button
    class="
    w-full inline-flex justify-center items-center
    px-6 py-3 rounded-lg
    font-semibold text-sm uppercase tracking-wide text-white

    bg-gradient-to-r from-[#263592] via-[#006CCD] to-[#80C7E3]
    bg-[length:200%_100%]
    bg-left

    transition-[background-position] duration-500 ease-out
    hover:bg-right

    shadow-lg shadow-[#263592]/30
    focus:outline-none focus:ring-2 focus:ring-[#006CCD] focus:ring-offset-2
    "
>
    {{ $slot }}
</button>
