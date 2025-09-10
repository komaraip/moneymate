<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $country_code
 * @property string|null $logo_url
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory byCountry($countryCode)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory whereCountryCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory whereLogoUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardNameCategory whereUpdatedAt($value)
 */
	class CardNameCategory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string|null $logo_url
 * @property string $color
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory whereLogoUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CardTypeCategory whereUpdatedAt($value)
 */
	class CardTypeCategory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string $code_2
 * @property string|null $flag_url
 * @property string|null $currency_code
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CardNameCategory> $cardNames
 * @property-read int|null $card_names_count
 * @property-read \App\Models\Currency|null $currency
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory whereCode2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory whereCurrencyCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory whereFlagUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CountryCategory whereUpdatedAt($value)
 */
	class CountryCategory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $symbol
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereSymbol($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereUpdatedAt($value)
 */
	class Currency extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string|null $icon
 * @property string $color
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IncomeCategory whereUpdatedAt($value)
 */
	class IncomeCategory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string|null $icon
 * @property string $color
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OutcomeCategory whereUpdatedAt($value)
 */
	class OutcomeCategory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $category
 * @property numeric $balance
 * @property string|null $description
 * @property string $type
 * @property \Illuminate\Support\Carbon $transaction_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\IncomeCategory|null $incomeCategory
 * @property-read \App\Models\OutcomeCategory|null $outcomeCategory
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction expense()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction income()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereTransactionDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereUserId($value)
 */
	class Transaction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $fullname
 * @property string $email
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $country
 * @property string|null $card
 * @property string|null $card_type
 * @property string|null $card_name
 * @property string|null $cardnumber
 * @property numeric $balance
 * @property numeric $balance_limit
 * @property string $currency
 * @property string|null $profile
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\CardNameCategory|null $cardNameCategory
 * @property-read \App\Models\CardTypeCategory|null $cardTypeCategory
 * @property-read \App\Models\CountryCategory|null $countryCategory
 * @property mixed $name
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Transaction> $transactions
 * @property-read int|null $transactions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User admins()
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User users()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBalanceLimit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCard($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCardName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCardType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCardnumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCurrency($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereFullname($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereProfile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}

