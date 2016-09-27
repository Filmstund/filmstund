module SFParty
  include HTTParty
  #debug_output $stdout
  base_uri 'https://mobilebackend.sfbio.se/services/5'
  HEADERS = {
    'User-Agent': 'SF Bio 541 (Android Nexus 6 , N',
    'X-SF-Android-Version': '541',
    'Accept': ' application/json',
    'Authorization': 'Basic U0ZiaW9BUEk6YlNGNVBGSGNSNFoz'
  }

  def self.download_data_fresh url
    resp = get(url, {headers: HEADERS})
    if resp.success?
      resp.parsed_response
    else
      # TODO raise some appropriate exception
      puts "Failed to download #{url} | Resp: #{resp.response}"
    end
  end

  def self.download_data url
    Rails.cache.fetch "downloaddata/#{url}", expires_in: 12.minutes do
      download_data_fresh url
    end
  end
end
