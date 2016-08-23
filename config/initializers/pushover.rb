Pushover.configure do |config|
  config.token = Rails.application.secrets.pushover_appkey
end