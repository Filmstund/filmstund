class Push < ApplicationMailer

  def showing_created(showing)
    @showing = showing

    User.with_push_key.each do |user|
      Pushover.notification(message: @showing.movie.title,
                            user: user.pushover_key,
                            title: "Showing was created!",
                            url: showing_url(@showing),
                            url_title: "Link to showing")
    end
  end
end