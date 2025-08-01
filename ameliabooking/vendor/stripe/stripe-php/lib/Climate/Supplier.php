<?php

// File generated from our OpenAPI spec

namespace AmeliaStripe\Climate;

/**
 * A supplier of carbon removal.
 *
 * @property string $id Unique identifier for the object.
 * @property string $object String representing the object’s type. Objects of the same type share the same value.
 * @property string $info_url Link to a webpage to learn more about the supplier.
 * @property bool $livemode Has the value <code>true</code> if the object exists in live mode or the value <code>false</code> if the object exists in test mode.
 * @property ((object{city: null|string, country: string, latitude: null|float, longitude: null|float, region: null|string}&\AmeliaStripe\StripeObject))[] $locations The locations in which this supplier operates.
 * @property string $name Name of this carbon removal supplier.
 * @property string $removal_pathway The scientific pathway used for carbon removal.
 */
class Supplier extends \AmeliaStripe\ApiResource
{
    const OBJECT_NAME = 'climate.supplier';

    const REMOVAL_PATHWAY_BIOMASS_CARBON_REMOVAL_AND_STORAGE = 'biomass_carbon_removal_and_storage';
    const REMOVAL_PATHWAY_DIRECT_AIR_CAPTURE = 'direct_air_capture';
    const REMOVAL_PATHWAY_ENHANCED_WEATHERING = 'enhanced_weathering';

    /**
     * Lists all available Climate supplier objects.
     *
     * @param null|array{ending_before?: string, expand?: string[], limit?: int, starting_after?: string} $params
     * @param null|array|string $opts
     *
     * @return \AmeliaStripe\Collection<Supplier> of ApiResources
     *
     * @throws \AmeliaStripe\Exception\ApiErrorException if the request fails
     */
    public static function all($params = null, $opts = null)
    {
        $url = static::classUrl();

        return static::_requestPage($url, \AmeliaStripe\Collection::class, $params, $opts);
    }

    /**
     * Retrieves a Climate supplier object.
     *
     * @param array|string $id the ID of the API resource to retrieve, or an options array containing an `id` key
     * @param null|array|string $opts
     *
     * @return Supplier
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
