<?php

// File generated from our OpenAPI spec

namespace AmeliaStripe\FinancialConnections;

/**
 * A Financial Connections Session is the secure way to programmatically launch the client-side Stripe.js modal that lets your users link their accounts.
 *
 * @property string $id Unique identifier for the object.
 * @property string $object String representing the object's type. Objects of the same type share the same value.
 * @property null|(object{account?: string|\AmeliaStripe\Account, customer?: string|\AmeliaStripe\Customer, type: string}&\AmeliaStripe\StripeObject) $account_holder The account holder for whom accounts are collected in this session.
 * @property \AmeliaStripe\Collection<Account> $accounts The accounts that were collected as part of this Session.
 * @property string $client_secret A value that will be passed to the client to launch the authentication flow.
 * @property null|(object{account_subcategories: null|string[], countries: null|string[]}&\AmeliaStripe\StripeObject) $filters
 * @property bool $livemode Has the value <code>true</code> if the object exists in live mode or the value <code>false</code> if the object exists in test mode.
 * @property string[] $permissions Permissions requested for accounts collected during this session.
 * @property null|string[] $prefetch Data features requested to be retrieved upon account creation.
 * @property null|string $return_url For webview integrations only. Upon completing OAuth login in the native browser, the user will be redirected to this URL to return to your app.
 */
class Session extends \AmeliaStripe\ApiResource
{
    const OBJECT_NAME = 'financial_connections.session';

    /**
     * To launch the Financial Connections authorization flow, create a
     * <code>Session</code>. The session’s <code>client_secret</code> can be used to
     * launch the flow using Stripe.js.
     *
     * @param null|array{account_holder: array{account?: string, customer?: string, type: string}, expand?: string[], filters?: array{account_subcategories?: string[], countries?: string[]}, permissions: string[], prefetch?: string[], return_url?: string} $params
     * @param null|array|string $options
     *
     * @return Session the created resource
     *
     * @throws \AmeliaStripe\Exception\ApiErrorException if the request fails
     */
    public static function create($params = null, $options = null)
    {
        self::_validateParams($params);
        $url = static::classUrl();

        list($response, $opts) = static::_staticRequest('post', $url, $params, $options);
        $obj = \AmeliaStripe\Util\Util::convertToStripeObject($response->json, $opts);
        $obj->setLastResponse($response);

        return $obj;
    }

    /**
     * Retrieves the details of a Financial Connections <code>Session</code>.
     *
     * @param array|string $id the ID of the API resource to retrieve, or an options array containing an `id` key
     * @param null|array|string $opts
     *
     * @return Session
     *
     * @throws \AmeliaStripe\Exception\ApiErrorException if the request fails
     */
    public static function retrieve($id, $opts = null)
    {
        $opts = \AmeliaStripe\Util\RequestOptions::parse($opts);
        $instance = new static($id, $opts);
        $instance->refresh();

        return $instance;
    }
}
