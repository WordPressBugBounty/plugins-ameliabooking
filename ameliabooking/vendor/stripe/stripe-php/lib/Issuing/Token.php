<?php

// File generated from our OpenAPI spec

namespace AmeliaStripe\Issuing;

/**
 * An issuing token object is created when an issued card is added to a digital wallet. As a <a href="https://stripe.com/docs/issuing">card issuer</a>, you can <a href="https://stripe.com/docs/issuing/controls/token-management">view and manage these tokens</a> through Stripe.
 *
 * @property string $id Unique identifier for the object.
 * @property string $object String representing the object's type. Objects of the same type share the same value.
 * @property Card|string $card Card associated with this token.
 * @property int $created Time at which the object was created. Measured in seconds since the Unix epoch.
 * @property null|string $device_fingerprint The hashed ID derived from the device ID from the card network associated with the token.
 * @property null|string $last4 The last four digits of the token.
 * @property bool $livemode Has the value <code>true</code> if the object exists in live mode or the value <code>false</code> if the object exists in test mode.
 * @property string $network The token service provider / card network associated with the token.
 * @property null|(object{device?: (object{device_fingerprint?: string, ip_address?: string, location?: string, name?: string, phone_number?: string, type?: string}&\AmeliaStripe\StripeObject), mastercard?: (object{card_reference_id?: string, token_reference_id: string, token_requestor_id: string, token_requestor_name?: string}&\AmeliaStripe\StripeObject), type: string, visa?: (object{card_reference_id: string, token_reference_id: string, token_requestor_id: string, token_risk_score?: string}&\AmeliaStripe\StripeObject), wallet_provider?: (object{account_id?: string, account_trust_score?: int, card_number_source?: string, cardholder_address?: (object{line1: string, postal_code: string}&\AmeliaStripe\StripeObject), cardholder_name?: string, device_trust_score?: int, hashed_account_email_address?: string, reason_codes?: string[], suggested_decision?: string, suggested_decision_version?: string}&\AmeliaStripe\StripeObject)}&\AmeliaStripe\StripeObject) $network_data
 * @property int $network_updated_at Time at which the token was last updated by the card network. Measured in seconds since the Unix epoch.
 * @property string $status The usage state of the token.
 * @property null|string $wallet_provider The digital wallet for this token, if one was used.
 */
class Token extends \AmeliaStripe\ApiResource
{
    const OBJECT_NAME = 'issuing.token';

    use \AmeliaStripe\ApiOperations\Update;

    const NETWORK_MASTERCARD = 'mastercard';
    const NETWORK_VISA = 'visa';

    const STATUS_ACTIVE = 'active';
    const STATUS_DELETED = 'deleted';
    const STATUS_REQUESTED = 'requested';
    const STATUS_SUSPENDED = 'suspended';

    const WALLET_PROVIDER_APPLE_PAY = 'apple_pay';
    const WALLET_PROVIDER_GOOGLE_PAY = 'google_pay';
    const WALLET_PROVIDER_SAMSUNG_PAY = 'samsung_pay';

    /**
     * Lists all Issuing <code>Token</code> objects for a given card.
     *
     * @param null|array{card: string, created?: array|int, ending_before?: string, expand?: string[], limit?: int, starting_after?: string, status?: string} $params
     * @param null|array|string $opts
     *
     * @return \AmeliaStripe\Collection<Token> of ApiResources
     *
     * @throws \AmeliaStripe\Exception\ApiErrorException if the request fails
     */
    public static function all($params = null, $opts = null)
    {
        $url = static::classUrl();

        return static::_requestPage($url, \AmeliaStripe\Collection::class, $params, $opts);
    }

    /**
     * Retrieves an Issuing <code>Token</code> object.
     *
     * @param array|string $id the ID of the API resource to retrieve, or an options array containing an `id` key
     * @param null|array|string $opts
     *
     * @return Token
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

    /**
     * Attempts to update the specified Issuing <code>Token</code> object to the status
     * specified.
     *
     * @param string $id the ID of the resource to update
     * @param null|array{expand?: string[], status: string} $params
     * @param null|array|string $opts
     *
     * @return Token the updated resource
     *
     * @throws \AmeliaStripe\Exception\ApiErrorException if the request fails
     */
    public static function update($id, $params = null, $opts = null)
    {
        self::_validateParams($params);
        $url = static::resourceUrl($id);

        list($response, $opts) = static::_staticRequest('post', $url, $params, $opts);
        $obj = \AmeliaStripe\Util\Util::convertToStripeObject($response->json, $opts);
        $obj->setLastResponse($response);

        return $obj;
    }
}
