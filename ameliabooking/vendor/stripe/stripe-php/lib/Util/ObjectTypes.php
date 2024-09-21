<?php

// File generated from our OpenAPI spec

namespace AmeliaStripe\Util;

class ObjectTypes
{
    /**
     * @var array Mapping from object types to resource classes
     */
    const mapping = [
        \AmeliaStripe\Account::OBJECT_NAME => \AmeliaStripe\Account::class,
        \AmeliaStripe\AccountLink::OBJECT_NAME => \AmeliaStripe\AccountLink::class,
        \AmeliaStripe\ApplePayDomain::OBJECT_NAME => \AmeliaStripe\ApplePayDomain::class,
        \AmeliaStripe\ApplicationFee::OBJECT_NAME => \AmeliaStripe\ApplicationFee::class,
        \AmeliaStripe\ApplicationFeeRefund::OBJECT_NAME => \AmeliaStripe\ApplicationFeeRefund::class,
        \AmeliaStripe\Apps\Secret::OBJECT_NAME => \AmeliaStripe\Apps\Secret::class,
        \AmeliaStripe\Balance::OBJECT_NAME => \AmeliaStripe\Balance::class,
        \AmeliaStripe\BalanceTransaction::OBJECT_NAME => \AmeliaStripe\BalanceTransaction::class,
        \AmeliaStripe\BankAccount::OBJECT_NAME => \AmeliaStripe\BankAccount::class,
        \AmeliaStripe\BillingPortal\Configuration::OBJECT_NAME => \AmeliaStripe\BillingPortal\Configuration::class,
        \AmeliaStripe\BillingPortal\Session::OBJECT_NAME => \AmeliaStripe\BillingPortal\Session::class,
        \AmeliaStripe\Capability::OBJECT_NAME => \AmeliaStripe\Capability::class,
        \AmeliaStripe\Card::OBJECT_NAME => \AmeliaStripe\Card::class,
        \AmeliaStripe\CashBalance::OBJECT_NAME => \AmeliaStripe\CashBalance::class,
        \AmeliaStripe\Charge::OBJECT_NAME => \AmeliaStripe\Charge::class,
        \AmeliaStripe\Checkout\Session::OBJECT_NAME => \AmeliaStripe\Checkout\Session::class,
        \AmeliaStripe\Collection::OBJECT_NAME => \AmeliaStripe\Collection::class,
        \AmeliaStripe\CountrySpec::OBJECT_NAME => \AmeliaStripe\CountrySpec::class,
        \AmeliaStripe\Coupon::OBJECT_NAME => \AmeliaStripe\Coupon::class,
        \AmeliaStripe\CreditNote::OBJECT_NAME => \AmeliaStripe\CreditNote::class,
        \AmeliaStripe\CreditNoteLineItem::OBJECT_NAME => \AmeliaStripe\CreditNoteLineItem::class,
        \AmeliaStripe\Customer::OBJECT_NAME => \AmeliaStripe\Customer::class,
        \AmeliaStripe\CustomerBalanceTransaction::OBJECT_NAME => \AmeliaStripe\CustomerBalanceTransaction::class,
        \AmeliaStripe\CustomerCashBalanceTransaction::OBJECT_NAME => \AmeliaStripe\CustomerCashBalanceTransaction::class,
        \AmeliaStripe\Discount::OBJECT_NAME => \AmeliaStripe\Discount::class,
        \AmeliaStripe\Dispute::OBJECT_NAME => \AmeliaStripe\Dispute::class,
        \AmeliaStripe\EphemeralKey::OBJECT_NAME => \AmeliaStripe\EphemeralKey::class,
        \AmeliaStripe\Event::OBJECT_NAME => \AmeliaStripe\Event::class,
        \AmeliaStripe\ExchangeRate::OBJECT_NAME => \AmeliaStripe\ExchangeRate::class,
        \AmeliaStripe\File::OBJECT_NAME => \AmeliaStripe\File::class,
        \AmeliaStripe\File::OBJECT_NAME_ALT => \AmeliaStripe\File::class,
        \AmeliaStripe\FileLink::OBJECT_NAME => \AmeliaStripe\FileLink::class,
        \AmeliaStripe\FinancialConnections\Account::OBJECT_NAME => \AmeliaStripe\FinancialConnections\Account::class,
        \AmeliaStripe\FinancialConnections\AccountOwner::OBJECT_NAME => \AmeliaStripe\FinancialConnections\AccountOwner::class,
        \AmeliaStripe\FinancialConnections\AccountOwnership::OBJECT_NAME => \AmeliaStripe\FinancialConnections\AccountOwnership::class,
        \AmeliaStripe\FinancialConnections\Session::OBJECT_NAME => \AmeliaStripe\FinancialConnections\Session::class,
        \AmeliaStripe\FundingInstructions::OBJECT_NAME => \AmeliaStripe\FundingInstructions::class,
        \AmeliaStripe\Identity\VerificationReport::OBJECT_NAME => \AmeliaStripe\Identity\VerificationReport::class,
        \AmeliaStripe\Identity\VerificationSession::OBJECT_NAME => \AmeliaStripe\Identity\VerificationSession::class,
        \AmeliaStripe\Invoice::OBJECT_NAME => \AmeliaStripe\Invoice::class,
        \AmeliaStripe\InvoiceItem::OBJECT_NAME => \AmeliaStripe\InvoiceItem::class,
        \AmeliaStripe\InvoiceLineItem::OBJECT_NAME => \AmeliaStripe\InvoiceLineItem::class,
        \AmeliaStripe\Issuing\Authorization::OBJECT_NAME => \AmeliaStripe\Issuing\Authorization::class,
        \AmeliaStripe\Issuing\Card::OBJECT_NAME => \AmeliaStripe\Issuing\Card::class,
        \AmeliaStripe\Issuing\CardDetails::OBJECT_NAME => \AmeliaStripe\Issuing\CardDetails::class,
        \AmeliaStripe\Issuing\Cardholder::OBJECT_NAME => \AmeliaStripe\Issuing\Cardholder::class,
        \AmeliaStripe\Issuing\Dispute::OBJECT_NAME => \AmeliaStripe\Issuing\Dispute::class,
        \AmeliaStripe\Issuing\Transaction::OBJECT_NAME => \AmeliaStripe\Issuing\Transaction::class,
        \AmeliaStripe\LineItem::OBJECT_NAME => \AmeliaStripe\LineItem::class,
        \AmeliaStripe\LoginLink::OBJECT_NAME => \AmeliaStripe\LoginLink::class,
        \AmeliaStripe\Mandate::OBJECT_NAME => \AmeliaStripe\Mandate::class,
        \AmeliaStripe\Order::OBJECT_NAME => \AmeliaStripe\Order::class,
        \AmeliaStripe\PaymentIntent::OBJECT_NAME => \AmeliaStripe\PaymentIntent::class,
        \AmeliaStripe\PaymentLink::OBJECT_NAME => \AmeliaStripe\PaymentLink::class,
        \AmeliaStripe\PaymentMethod::OBJECT_NAME => \AmeliaStripe\PaymentMethod::class,
        \AmeliaStripe\Payout::OBJECT_NAME => \AmeliaStripe\Payout::class,
        \AmeliaStripe\Person::OBJECT_NAME => \AmeliaStripe\Person::class,
        \AmeliaStripe\Plan::OBJECT_NAME => \AmeliaStripe\Plan::class,
        \AmeliaStripe\Price::OBJECT_NAME => \AmeliaStripe\Price::class,
        \AmeliaStripe\Product::OBJECT_NAME => \AmeliaStripe\Product::class,
        \AmeliaStripe\PromotionCode::OBJECT_NAME => \AmeliaStripe\PromotionCode::class,
        \AmeliaStripe\Quote::OBJECT_NAME => \AmeliaStripe\Quote::class,
        \AmeliaStripe\Radar\EarlyFraudWarning::OBJECT_NAME => \AmeliaStripe\Radar\EarlyFraudWarning::class,
        \AmeliaStripe\Radar\ValueList::OBJECT_NAME => \AmeliaStripe\Radar\ValueList::class,
        \AmeliaStripe\Radar\ValueListItem::OBJECT_NAME => \AmeliaStripe\Radar\ValueListItem::class,
        \AmeliaStripe\Refund::OBJECT_NAME => \AmeliaStripe\Refund::class,
        \AmeliaStripe\Reporting\ReportRun::OBJECT_NAME => \AmeliaStripe\Reporting\ReportRun::class,
        \AmeliaStripe\Reporting\ReportType::OBJECT_NAME => \AmeliaStripe\Reporting\ReportType::class,
        \AmeliaStripe\Review::OBJECT_NAME => \AmeliaStripe\Review::class,
        \AmeliaStripe\SearchResult::OBJECT_NAME => \AmeliaStripe\SearchResult::class,
        \AmeliaStripe\SetupAttempt::OBJECT_NAME => \AmeliaStripe\SetupAttempt::class,
        \AmeliaStripe\SetupIntent::OBJECT_NAME => \AmeliaStripe\SetupIntent::class,
        \AmeliaStripe\ShippingRate::OBJECT_NAME => \AmeliaStripe\ShippingRate::class,
        \AmeliaStripe\Sigma\ScheduledQueryRun::OBJECT_NAME => \AmeliaStripe\Sigma\ScheduledQueryRun::class,
        \AmeliaStripe\SKU::OBJECT_NAME => \AmeliaStripe\SKU::class,
        \AmeliaStripe\Source::OBJECT_NAME => \AmeliaStripe\Source::class,
        \AmeliaStripe\SourceTransaction::OBJECT_NAME => \AmeliaStripe\SourceTransaction::class,
        \AmeliaStripe\Subscription::OBJECT_NAME => \AmeliaStripe\Subscription::class,
        \AmeliaStripe\SubscriptionItem::OBJECT_NAME => \AmeliaStripe\SubscriptionItem::class,
        \AmeliaStripe\SubscriptionSchedule::OBJECT_NAME => \AmeliaStripe\SubscriptionSchedule::class,
        \AmeliaStripe\TaxCode::OBJECT_NAME => \AmeliaStripe\TaxCode::class,
        \AmeliaStripe\TaxId::OBJECT_NAME => \AmeliaStripe\TaxId::class,
        \AmeliaStripe\TaxRate::OBJECT_NAME => \AmeliaStripe\TaxRate::class,
        \AmeliaStripe\Terminal\Configuration::OBJECT_NAME => \AmeliaStripe\Terminal\Configuration::class,
        \AmeliaStripe\Terminal\ConnectionToken::OBJECT_NAME => \AmeliaStripe\Terminal\ConnectionToken::class,
        \AmeliaStripe\Terminal\Location::OBJECT_NAME => \AmeliaStripe\Terminal\Location::class,
        \AmeliaStripe\Terminal\Reader::OBJECT_NAME => \AmeliaStripe\Terminal\Reader::class,
        \AmeliaStripe\TestHelpers\TestClock::OBJECT_NAME => \AmeliaStripe\TestHelpers\TestClock::class,
        \AmeliaStripe\Token::OBJECT_NAME => \AmeliaStripe\Token::class,
        \AmeliaStripe\Topup::OBJECT_NAME => \AmeliaStripe\Topup::class,
        \AmeliaStripe\Transfer::OBJECT_NAME => \AmeliaStripe\Transfer::class,
        \AmeliaStripe\TransferReversal::OBJECT_NAME => \AmeliaStripe\TransferReversal::class,
        \AmeliaStripe\Treasury\CreditReversal::OBJECT_NAME => \AmeliaStripe\Treasury\CreditReversal::class,
        \AmeliaStripe\Treasury\DebitReversal::OBJECT_NAME => \AmeliaStripe\Treasury\DebitReversal::class,
        \AmeliaStripe\Treasury\FinancialAccount::OBJECT_NAME => \AmeliaStripe\Treasury\FinancialAccount::class,
        \AmeliaStripe\Treasury\FinancialAccountFeatures::OBJECT_NAME => \AmeliaStripe\Treasury\FinancialAccountFeatures::class,
        \AmeliaStripe\Treasury\InboundTransfer::OBJECT_NAME => \AmeliaStripe\Treasury\InboundTransfer::class,
        \AmeliaStripe\Treasury\OutboundPayment::OBJECT_NAME => \AmeliaStripe\Treasury\OutboundPayment::class,
        \AmeliaStripe\Treasury\OutboundTransfer::OBJECT_NAME => \AmeliaStripe\Treasury\OutboundTransfer::class,
        \AmeliaStripe\Treasury\ReceivedCredit::OBJECT_NAME => \AmeliaStripe\Treasury\ReceivedCredit::class,
        \AmeliaStripe\Treasury\ReceivedDebit::OBJECT_NAME => \AmeliaStripe\Treasury\ReceivedDebit::class,
        \AmeliaStripe\Treasury\Transaction::OBJECT_NAME => \AmeliaStripe\Treasury\Transaction::class,
        \AmeliaStripe\Treasury\TransactionEntry::OBJECT_NAME => \AmeliaStripe\Treasury\TransactionEntry::class,
        \AmeliaStripe\UsageRecord::OBJECT_NAME => \AmeliaStripe\UsageRecord::class,
        \AmeliaStripe\UsageRecordSummary::OBJECT_NAME => \AmeliaStripe\UsageRecordSummary::class,
        \AmeliaStripe\WebhookEndpoint::OBJECT_NAME => \AmeliaStripe\WebhookEndpoint::class,
    ];
}
