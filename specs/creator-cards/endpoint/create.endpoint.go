CreateCreatorCardRequest {
  path /creator-cards
  method POST
  
  body {
    title string
    description? string
    slug? string
    creator_reference string<startsWith:crt_|length:20>
    links[]? {
      title string
      url string
    }
    service_rates? {
      currency string(NGN|USD|GBP|KES|GHS)
      rates[] {
        name string
        description string
        amount number
      }
    }
    status string(draft|published)
    access_type? string(public|private)
    access_code? string<length:6>
  }
  
  response.ok {
    http.code 200
    status success
    message "Creator Card Created Successfully."
    data {
      id string
      title string
      description? string
      slug string
      creator_reference string
      links[]? {
        title string
        url string
      }
      service_rates? {
        currency string
        rates[] {
          name string
          description string
          amount number
        }
      }
      status string
      access_type string
      access_code? string
      created number
      updated number
      deleted? number
    }
  }
  
  response.error {
    http.code 400
    status error
    message string
    code? string
  }
}
