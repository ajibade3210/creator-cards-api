RetrieveCreatorCardRequest {
  path /creator-cards/:slug
  method GET
  
  params {
    slug string
  }
  
  query {
    access_code? string<length:6>
  }
  
  response.ok {
    http.code 200
    status success
    message "Creator Card Retrieved Successfully."
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
      created number
      updated number
      deleted? number
    }
  }
  
  response.error {
    http.code 404
    status error
    message string
    code? string
  }
}
