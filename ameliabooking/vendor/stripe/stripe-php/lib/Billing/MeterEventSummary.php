<?php

// File generated from our OpenAPI spec

namespace AmeliaStripe\Billing;

/**
 * A billing meter event summary represents an aggregated view of a customer's billing meter events within a specified timeframe. It indicates how much
 * usage was accrued by a customer for that period.
 *
 * Note: Meters events are aggregated asynchronously so the meter event summaries provide an eventually consistent view of the reported usage.
 *
 * @property string $id Unique identifier for the object.
 * @property string $object String representing the object's type. Objects of the same type share the same value.
 * @property float $aggregated_value Aggregated value of all the events within <code>start_time</code> (inclusive) and <code>end_time</code> (inclusive). The aggregation strategy is defined on meter via <code>default_aggregation</code>.
 * @property int $end_time End timestamp for this event summary (exclusive). Must be aligned with minute boundaries.
 * @property bool $livemode Has the value <code>true</code> if the object exists in live mode or the value <code>false</code> if the object exists in test mode.
 * @property string $meter The meter associated with this event summary.
 * @property int $start_time Start timestamp for this event summary (inclusive). Must be aligned with minute boundaries.
 */
class MeterEventSummary extends \AmeliaStripe\ApiResource
{
    const OBJECT_NAME = 'billing.meter_event_summary';
}
