@props(['footer_links' => [
    'Help' => 'https://equatorgroup.id/',
    'Privacy' => 'https://equatorgroup.id/',
    'Terms & Conditions' => 'https://equatorgroup.id/',
]])

<tr>
    <td>
        <table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td class="content-cell" align="center">
                    <div class="footer-content">
                        <div class="footer-links">
                            @foreach($footer_links as $label => $link)
                                <a href="{{ $link }}">{{ $label }}</a>
                            @endforeach
                        </div>

                        <p>
                            &copy; {{ date('Y') }} <strong>Equator Group</strong>. All rights reserved.
                        </p>

                        <p class="footer-address">
                            Jakarta, Indonesia<br>
                            This email was sent automatically by our system.
                        </p>
                    </div>
                </td>
            </tr>
        </table>
    </td>
</tr>

