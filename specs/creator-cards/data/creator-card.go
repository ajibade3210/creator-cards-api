import ../../commons.go

CreatorCard {
  _id string<isUnique|indexed> // Unique identifier (ULID)
  title string // Title of the creator card
  description? string // Optional description of the creator card
  slug string<isUnique|indexed> // Unique slug for URL routing
  creator_reference string<indexed> // Creator reference string
  links[]? { // Optional list of social links
    title string // Title of the link
    url string // URL of the link
  }
  service_rates? { // Optional service rates configuration
    currency string // Currency code (e.g. NGN, USD, GBP, KES, GHS)
    rates[] { // Array of rates for services
      name string // Name of the rate service
      description string // Description of the rate service
      amount number // Amount in smallest unit of currency (integer)
    }
  }
  status string(draft|published) // Card status: draft, published
  access_type string(public|private) // Access type: public, private. Defaults to public
  access_code? string // Alphanumeric access code of exactly 6 characters, required on private cards
  ...common
}
