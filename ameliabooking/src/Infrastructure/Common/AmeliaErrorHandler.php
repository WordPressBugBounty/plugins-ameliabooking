<?php

/**
 * @copyright © Melograno Ventures. All rights reserved.
 * @licence   See COPYING.md for license details.
 */

namespace AmeliaBooking\Infrastructure\Common;

use AmeliaBooking\Application\Common\Exceptions\AccessDeniedException;
use AmeliaBooking\Application\Controller\Controller;
use AmeliaBooking\Infrastructure\Common\Exceptions\NotFoundException;
use AmeliaVendor\Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpException;
use Slim\Handlers\ErrorHandler;

class AmeliaErrorHandler extends ErrorHandler
{
    protected function respond(): ResponseInterface
    {
        $exception = $this->exception;
        $request = $this->request;

        $isInternalError = false;

        if ($exception instanceof AccessDeniedException) {
            $status = Controller::STATUS_FORBIDDEN;
        } elseif ($exception instanceof NotFoundException) {
            $status = Controller::STATUS_NOT_FOUNT;
        } elseif ($exception instanceof HttpException) {
            $status = $exception->getCode();
        } else {
            $status = Controller::STATUS_INTERNAL_SERVER_ERROR;
            $isInternalError = true;

            // Only the unexpected-error branch — AccessDenied/NotFound/HttpException above are
            // expected control flow, not plugin failures, and would just be noise in Sentry.
            \AmeliaBooking\Infrastructure\Services\ErrorTracking\SentryReporter::report(
                $exception->getMessage(),
                ['exception' => $exception]
            );
        }

        // Never leak internal error text (e.g. raw database errors) to the client. Details are
        // captured server-side via Sentry above; the client gets a generic message. Expected
        // control-flow exceptions (AccessDenied/NotFound/Http) keep their user-facing message.
        $responseMessage = [
            'message' => $isInternalError ? 'Internal server error.' : $exception->getMessage(),
        ];

        $queryParams = $request->getQueryParams();
        if (!empty($queryParams['showAmeliaSqlExceptions'])) {
            $prev = $exception->getPrevious();
            $responseMessage['exception'] = $prev ? $prev->getMessage() : '';
        }

        $response = $this->responseFactory->createResponse($status);
        $response->getBody()->write(json_encode($responseMessage));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
