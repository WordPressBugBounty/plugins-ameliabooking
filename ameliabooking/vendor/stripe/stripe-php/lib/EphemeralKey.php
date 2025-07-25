<?php

// File generated from our OpenAPI spec

namespace AmeliaStripe;

/**
 * @property string $id Unique identifier for the object.
 * @property string $object String representing the object's type. Objects of the same type share the same value.
 * @property int $created Time at which the object was created. Measured in seconds since the Unix epoch.
 * @property int $expires Time at which the key will expire. Measured in seconds since the Unix epoch.
 * @property bool $livemode Has the value <code>true</code> if the object exists in live mode or the value <code>false</code> if the object exists in test mode.
 * @property null|string $secret The key's secret. You can use this value to make authorized requests to the Stripe API.
 */
class EphemeralKey extends ApiResource
{
    const OBJECT_NAME = 'ephemeral_key';

    /**
     * Invalidates a short-lived API key for a given resource.
     *
     * @param null|array{expand?: string[]} $params
     * @param null|array|string $opts
     *
     * @return EphemeralKey the deleted resource
     *
     * @throws Exception\ApiErrorException if the request fails
     */
    public function delete($params = null, $opts = null)
    {
        self::_validateParams($params);

        $url = $this->instanceUrl();
        list($response, $opts) = $this->_request('delete', $url, $params, $opts);
        $this->refreshFrom($response, $opts);

        return $this;
    }

    use ApiOperations\Create {
        create as protected _create;
    }

    /**
     * @param null|array $params
     * @param null|array|string $opts
     *
     * @return EphemeralKey the created key
     *
     * @throws Exception\InvalidArgumentException if stripe_version is missing
     * @throws Exception\ApiErrorException if the request fails
     */
    public static function create($params = null, $opts = null)
    {
        if (!$opts || !isset($opts['stripe_version'])) {
            throw new Exception\InvalidArgumentException('stripe_version must be specified to create an ephemeral key');
        }

        return self::_create($params, $opts);
    }
}
