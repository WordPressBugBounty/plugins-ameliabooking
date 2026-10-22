<?php

namespace AmeliaBooking\Application\Controller\Booking\Event;

use AmeliaBooking\Application\Commands\Booking\Event\GetEventsCommand;
use AmeliaBooking\Application\Controller\Controller;
use AmeliaVendor\Psr\Http\Message\ServerRequestInterface as Request;

/**
 * Class GetEventsController
 *
 * @package AmeliaBooking\Application\Controller\Booking\Event
 */
class GetEventsController extends Controller
{
    /**
     * Instantiates the Get Events command to hand it over to the Command Handler
     *
     * @param Request $request
     * @param         $args
     *
     * @return GetEventsCommand
     * @throws \RuntimeException
     */
    protected function instantiateCommand(Request $request, $args)
    {
        $command = new GetEventsCommand($args);

        $params = (array)$request->getQueryParams();

        if (isset($params['source'])) {
            $command->setPage($params['source']);
            unset($params['source']);
        }

        $this->setArrayParams($params);

        foreach (['events', 'excludeIds', 'id', 'customers', 'customerBookingsIds', 'locations', 'providers'] as $intList) {
            if (isset($params[$intList])) {
                $params[$intList] = array_values(array_map('intval', (array)$params[$intList]));
            }
        }

        if (isset($params['tag'])) {
            $params['tag'] = array_values((array)$params['tag']);
        }

        $command->setField('params', $params);

        $command->setToken($request);

        return $command;
    }
}
