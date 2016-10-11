class Push
  class << self
    include Rails.application.routes.url_helpers

    def showing_created(showing)
      @showing = showing

      User.with_push_key.each do |user|
        Pushover.notification(message: @showing.movie.title,
                              user: user.pushover_key,
                              title: "#{@showing.owner.nick} created showing",
                              url: showing_url(@showing),
                              url_title: "Link to showing")
      end
    end

    def showing_confirmed(showing)
      @showing = showing
      @time_slot = @showing.selected_time_slot

      User.with_push_key.each do |user|
        Pushover.notification(message: @showing.movie.title,
                              user: user.pushover_key,
                              title: "TimeSlot was chosen for Showing!",
                              url: showing_url(@showing),
                              url_title: "Link to showing")
      end
    end

    def showing_ordered(showing)
      @showing = showing

      cost = @showing.selected_time_slot.price
      nick = @showing.owner.nick
      phone = @showing.owner.phone_number
      message = "#{@showing.movie.title}, Pay #{cost} to #{nick} (#{phone})"
      User.with_push_key.each do |user|
        Pushover.notification(message: message,
                              user: user.pushover_key,
                              title: "Showing has been ordered!",
                              url: showing_url(@showing),
                              url_title: "Link to showing")
      end

    end

  end
end