<?php

// File generated from our OpenAPI spec

namespace AmeliaStripe;

/**
 * A payment method domain represents a web domain that you have registered with Stripe.
 * Stripe Elements use registered payment method domains to control where certain payment methods are shown.
 *
 * Related guide: <a href="https://stripe.com/docs/payments/payment-methods/pmd-registration">Payment method domains</a>.
 *
 * @property string $id Unique identifier for the object.
 * @property string $object String representing the object's type. Objects of the same type share the same value.
 * @property (object{status: string, status_details?: (object{error_message: string}&StripeObject)}&StripeObject) $amazon_pay Indicates the status of a specific payment method on a payment method domain.
 * @property (object{status: string, status_details?: (object{error_message: string}&StripeObject)}&StripeObject) $apple_pay Indicates the status of a specific payment method on a payment method domain.
 * @property int $created Time at which the object was created. Measured in seconds since the Unix epoch.
 * @property string $domain_name The domain name that this payment method domain object represents.
 * @property bool $enabled Whether this payment method domain is enabled. If the domain is not enabled, payment methods that require a payment method domain will not appear in Elements.
 * @property (object{status: string, status_details?: (object{error_message: string}&StripeObject)}&StripeObject) $google_pay Indicates the status of a specific payment method on a payment method domain.
 * @property (object{status: string, status_details?: (object{error_message: string}&StripeObject)}&StripeObject) $klarna Indicates the status of a specific payment method on a payment method domain.
 * @property (object{status: string, status_details?: (object{error_message: string}&StripeObject)}&StripeObject) $link Indicates the status of a specific payment method on a payment method domain.
 * @property bool $livemode Has the value <code>true</code> if the object exists in live mode or the value <code>false</code> if the object exists in test mode.
 * @property (object{status: string, status_details?: (object{error_message: string}&StripeObject)}&StripeObject) $paypal Indicates the status of a specific payment method on a payment method domain.
 */
class PaymentMethodDomain extends ApiResource
{
    const OBJECT_NAME = 'payment_method_domain';

    use ApiOperations\Update;

    /**
     * Creates a payment method domain.
     *
     * @param null|array{domain_name: string, enabled?: bool, expand?: string[]} $params
     * @param null|array|string $options
     *
     * @return PaymentMethodDomain the created resource
     *
     * @throws Exception\ApiErrorException if the request fails
     */
    public static function create($params = null, $options = null)
    {
        self::_validateParams($params);
        $url = static::classUrl();

        list($response, $opts) = static::_staticRequest('post', $url, $params, $options);
        $obj = Util\Util::convertToStripeObject($response->json, $opts);
        $obj->setLastResponse($response);

        return $obj;
    }

    /**
     * Lists the details of existing payment method domains.
     *
     * @param null|array{domain_name?: string, enabled?: bool, ending_before?: string, expand?: string[], limit?: int, starting_after?: string} $params
     * @param null|array|string $opts
     *
     * @return Collection<PaymentMethodDomain> of ApiResources
     *
     * @throws Exception\ApiErrorException if the request fails
     */
    public static function all($params = null, $opts = null)
    {
        $url = static::classUrl();

        return static::_requestPage($url, Collection::class, $params, $opts);
    }

    /**
     * Retrieves the details of an existing payment method domain.
     *
     * @param array|string $id the ID of the API resource to retrieve, or an options array containing an `id` key
     * @param null|array|string $opts
     *
     * @return PaymentMethodDomain
     *
     * @throws Exception\ApiErrorException if the request fails
     */
    public static function retrieve($id, $opts = null)
    {
        $opts = Util\RequestOptions::parse($opts);
        $instance = new static($id, $opts);
        $instance->refresh();

        return $instance;
    }

    /**
     * Updates an existing payment method domain.
     *
     * @param string $id the ID of the resource to update
     * @param null|array{enabled?: bool, expand?: string[]} $params
     * @param null|array|string $opts
     *
     * @return PaymentMethodDomain the updated resource
     *
     * @throws Exception\ApiErrorException if the request fails
     */
    public static function update($id, $params = null, $opts = null)
    {
        self::_validateParams($params);
        $url = static::resourceUrl($id);

        list($response, $opts) = static::_staticRequest('post', $url, $params, $opts);
        $obj = Util\Util::convertToStripeObject($response->json, $opts);
        $obj->setLastResponse($response);

        return $obj;
    }

    /**
     * @param null|array $params
     * @param null|array|string $opts
     *
     * @return PaymentMethodDomain the validated payment method domain
     *
     * @throws Exception\ApiErrorException if the request fails
     */
    public function validate($params = null, $opts = null)
    {
        $url = $this->instanceUrl() . '/validate';
        list($response, $opts) = $this->_request('post', $url, $params, $opts);
        $this->refreshFrom($response, $opts);

        return $this;
    }
}
