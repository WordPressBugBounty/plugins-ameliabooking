<?php

// File generated from our OpenAPI spec

namespace AmeliaStripe\Reporting;

/**
 * The Report Type resource corresponds to a particular type of report, such as
 * the &quot;Activity summary&quot; or &quot;Itemized payouts&quot; reports. These objects are
 * identified by an ID belonging to a set of enumerated values. See
 * <a href="https://stripe.com/docs/reporting/statements/api">API Access to Reports documentation</a>
 * for those Report Type IDs, along with required and optional parameters.
 *
 * Note that certain report types can only be run based on your live-mode data (not test-mode
 * data), and will error when queried without a <a href="https://stripe.com/docs/keys#test-live-modes">live-mode API key</a>.
 *
 * @property string $id The <a href="https://stripe.com/docs/reporting/statements/api#available-report-types">ID of the Report Type</a>, such as <code>balance.summary.1</code>.
 * @property string $object String representing the object's type. Objects of the same type share the same value.
 * @property int $data_available_end Most recent time for which this Report Type is available. Measured in seconds since the Unix epoch.
 * @property int $data_available_start Earliest time for which this Report Type is available. Measured in seconds since the Unix epoch.
 * @property null|string[] $default_columns List of column names that are included by default when this Report Type gets run. (If the Report Type doesn't support the <code>columns</code> parameter, this will be null.)
 * @property bool $livemode Has the value <code>true</code> if the object exists in live mode or the value <code>false</code> if the object exists in test mode.
 * @property string $name Human-readable name of the Report Type
 * @property int $updated When this Report Type was latest updated. Measured in seconds since the Unix epoch.
 * @property int $version Version of the Report Type. Different versions report with the same ID will have the same purpose, but may take different run parameters or have different result schemas.
 */
class ReportType extends \AmeliaStripe\ApiResource
{
    const OBJECT_NAME = 'reporting.report_type';

    /**
     * Returns a full list of Report Types.
     *
     * @param null|array{expand?: string[]} $params
     * @param null|array|string $opts
     *
     * @return \AmeliaStripe\Collection<ReportType> of ApiResources
     *
     * @throws \AmeliaStripe\Exception\ApiErrorException if the request fails
     */
    public static function all($params = null, $opts = null)
    {
        $url = static::classUrl();

        return static::_requestPage($url, \AmeliaStripe\Collection::class, $params, $opts);
    }

    /**
     * Retrieves the details of a Report Type. (Certain report types require a <a
     * href="https://stripe.com/docs/keys#test-live-modes">live-mode API key</a>.).
     *
     * @param array|string $id the ID of the API resource to retrieve, or an options array containing an `id` key
     * @param null|array|string $opts
     *
     * @return ReportType
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
