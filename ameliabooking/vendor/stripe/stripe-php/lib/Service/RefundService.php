<?php

// File generated from our OpenAPI spec

namespace AmeliaStripe\Service;

/**
 * @phpstan-import-type RequestOptionsArray from \AmeliaStripe\Util\RequestOptions
 *
 * @psalm-import-type RequestOptionsArray from \AmeliaStripe\Util\RequestOptions
 */
class RefundService extends AbstractService
{
    /**
     * Returns a list of all refunds you created. We return the refunds in sorted
     * order, with the most recent refunds appearing first. The 10 most recent refunds
     * are always available by default on the Charge object.
     *
     * @param null|array{charge?: string, created?: array|int, ending_before?: string, expand?: string[], limit?: int, payment_intent?: string, starting_after?: string} $params
     * @param null|RequestOptionsArray|\AmeliaStripe\Util\RequestOptions $opts
     *
     * @return \AmeliaStripe\Collection<\AmeliaStripe\Refund>
     *
     * @throws \AmeliaStripe\Exception\ApiErrorException if the request fails
     */
    public function all($params = null, $opts = null)
    {
        return $this->requestCollection('get', '/v1/refunds', $params, $opts);
    }

    /**
     * Cancels a refund with a status of <code>requires_action</code>.
     *
     * You can’t cancel refunds in other states. Only refunds for payment methods that
     * require customer action can enter the <code>requires_action</code> state.
     *
     * @param string $id
     * @param null|array{expand?: string[]} $params
     * @param null|RequestOptionsArray|\AmeliaStripe\Util\RequestOptions $opts
     *
     * @return \AmeliaStripe\Refund
     *
     * @throws \AmeliaStripe\Exception\ApiErrorException if the request fails
     */
    public function cancel($id, $params = null, $opts = null)
    {
        return $this->request('post', $this->buildPath('/v1/refunds/%s/cancel', $id), $params, $opts);
    }

    /**
     * When you create a new refund, you must specify a Charge or a PaymentIntent
     * object on which to create it.
     *
     * Creating a new refund will refund a charge that has previously been created but
     * not yet refunded. Funds will be refunded to the credit or debit card that was
     * originally charged.
     *
     * You can optionally refund only part of a charge. You can do so multiple times,
     * until the entire charge has been refunded.
     *
     * Once entirely refunded, a charge can’t be refunded again. This method will raise
     * an error when called on an already-refunded charge, or when trying to refund
     * more money than is left on a charge.
     *
     * @param null|array{amount?: int, charge?: string, currency?: string, customer?: string, expand?: string[], instructions_email?: string, metadata?: null|array<string, string>, origin?: string, payment_intent?: string, reason?: string, refund_application_fee?: bool, reverse_transfer?: bool} $params
     * @param null|RequestOptionsArray|\AmeliaStripe\Util\RequestOptions $opts
     *
     * @return \AmeliaStripe\Refund
     *
     * @throws \AmeliaStripe\Exception\ApiErrorException if the request fails
     */
    public function create($params = null, $opts = null)
    {
        return $this->request('post', '/v1/refunds', $params, $opts);
    }

    /**
     * Retrieves the details of an existing refund.
     *
     * @param string $id
     * @param null|array{expand?: string[]} $params
     * @param null|RequestOptionsArray|\AmeliaStripe\Util\RequestOptions $opts
     *
     * @return \AmeliaStripe\Refund
     *
     * @throws \AmeliaStripe\Exception\ApiErrorException if the request fails
     */
    public function retrieve($id, $params = null, $opts = null)
    {
        return $this->request('get', $this->buildPath('/v1/refunds/%s', $id), $params, $opts);
    }

    /**
     * Updates the refund that you specify by setting the values of the passed
     * parameters. Any parameters that you don’t provide remain unchanged.
     *
     * This request only accepts <code>metadata</code> as an argument.
     *
     * @param string $id
     * @param null|array{expand?: string[], metadata?: null|array<string, string>} $params
     * @param null|RequestOptionsArray|\AmeliaStripe\Util\RequestOptions $opts
     *
     * @return \AmeliaStripe\Refund
     *
     * @throws \AmeliaStripe\Exception\ApiErrorException if the request fails
     */
    public function update($id, $params = null, $opts = null)
    {
        return $this->request('post', $this->buildPath('/v1/refunds/%s', $id), $params, $opts);
    }
}
