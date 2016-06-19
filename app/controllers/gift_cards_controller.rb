class GiftCardsController < ApplicationController
  before_action :set_gift_card, only: [:show, :update, :destroy]

  # GET /gift_cards
  def index
    @gift_cards = GiftCard.all

    render json: @gift_cards
  end

  # GET /gift_cards/1
  def show
    render json: @gift_card
  end

  # POST /gift_cards
  def create
    @gift_card = GiftCard.new(gift_card_params)

    if @gift_card.save
      render json: @gift_card, status: :created, location: @gift_card
    else
      render json: @gift_card.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /gift_cards/1
  def update
    if @gift_card.update(gift_card_params)
      render json: @gift_card
    else
      render json: @gift_card.errors, status: :unprocessable_entity
    end
  end

  # DELETE /gift_cards/1
  def destroy
    @gift_card.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_gift_card
      @gift_card = GiftCard.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def gift_card_params
      params.require(:gift_card).permit(:number, :type)
    end
end
