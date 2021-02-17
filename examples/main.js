/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fxp/jquery-scroller/scss/scroller.scss';
import '../scss/sidebar.scss';
import '../scss/sidebar-bootstrap.scss';
import './examples.css';
import 'hammerjs';
import '@fxp/jquery-scroller';
import '@fxp/jquery-scroller/js/sticky-header';
import '../js/sidebar';

$(document).ready(function() {
    var $miniSidebars = $('.fxp-sidebar-mini');

    if ($miniSidebars.length > 0) {
        $miniSidebars.each(function (index) {
            var $miniSidebar = $miniSidebars.eq(index);

            $miniSidebar.on('mouseenter', null, null, function () {
                $miniSidebar.sidebar('open');
            });

            $miniSidebar.on('mouseleave', null, null, function () {
                $miniSidebar.sidebar('close');
            });
        });
    }
});
