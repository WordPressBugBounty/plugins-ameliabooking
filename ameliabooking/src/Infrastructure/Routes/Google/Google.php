<?php

/**
 * @copyright © Melograno Ventures. All rights reserved.
 * @licence   See COPYING.md for license details.
 */

namespace AmeliaBooking\Infrastructure\Routes\Google;

use AmeliaBooking\Application\Controller\Google\VerifyRecaptchaController;
use AmeliaBooking\Application\Controller\Google\WatchGoogleEventController;
use Slim\App;

/**
 * Class Google
 *
 * @package AmeliaBooking\Infrastructure\Routes\Google
 */
class Google
{
    /**
     * @param App $app
     */
    public static function routes(App $app)
    {




        $app->post('/google/recaptcha/verify', VerifyRecaptchaController::class);

        $app->post('/google/watch', WatchGoogleEventController::class);

        // Middleware routes for Google Calendar integration







    }
}
