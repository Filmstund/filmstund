import React, { Component } from "react";
import { connect } from "react-redux";
import { groupBy } from "lodash";
import { showings as showingActions, users as userActions } from "../store/reducers";
import styled from "styled-components";

import withLoader from "../lib/withLoader";
import { getJson, jsonRequest, withBaseURL } from "../lib/fetch";

import Showing from "../Showing";
import QRCode from "../QRCode";
import CopyValue from "../CopyValue";
import Loader from "../Loader";
import Center from "../Center";
import Field from "../Field";
import Input from "../Input";
import Header, { SmallHeader } from "../Header";
import Modal from "../Modal";
import buildUserComponent from "../UserComponentBuilder";
import MainButton, { GreenButton, RedButton, GrayButton } from "../MainButton";

const UserActiveStatus = styled.div`
    color: ${props => props.active ? '#000' : '#ccc'}
`

const UserItem = buildUserComponent(({ user }) => (
  <div>{user.nick || user.name} ({user.phone})</div>
))

const UserWithPriceItem = buildUserComponent(({ user, active, price, onPaidChange, hasPaid }) => (
  <UserActiveStatus active={active}>
    {user.nick || user.name} <label>har betalat: <input type="checkbox" checked={hasPaid} onChange={onPaidChange}/></label>
  </UserActiveStatus>
))

const Padding = styled.div`
    padding: 1em;
`

const oreToKr = (price) => {
    if (price === null) {
        return 0
    } else {
        return price / 100
    }
}

class Showings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ticketPrice: oreToKr(props.showing.price),
            buyData: null,
            payData: null,
            showModal: false
        }
    }

    componentWillMount() {
        if (this.props.showing.ticketsBought) {
            this.requestPaymentInfo()
        }
    }

    handleAttend = () => {
        this.props.dispatch(showingActions.actions.requestAttend(this.props.showingId));
    }

    handleDelete = () => {
        const proceed = window.confirm("Är du säker? Går ej att ångra!");

        if (proceed) {
            this.props.dispatch(showingActions.actions.requestDelete(this.props.showingId));
        }
    }

    handleUnattend = () => {
        this.props.dispatch(showingActions.actions.requestUnattend(this.props.showingId));
    }

    handleStartBooking = () => {
        const { showing } = this.props;
        this.setState({
            showModal: true
        })

        getJson(`/showings/${showing.id}/buy`).then(buyData => {
            this.setState({
                showModal: true,
                buyData
            })
        })
    }

    requestPaymentInfo = () => {
        const { showing } = this.props;

        getJson(`/showings/${showing.id}/pay`).then(payData => {
            this.setState({
                payData
            })
        })
    }

    renderAdminAction = (ticketsBought) => {
        return <div>
            <MainButton onClick={this.handleStartBooking}>{ticketsBought ? "Visa betalningsstatus" : "Alla är med, nu bokar vi!"}</MainButton>
            <GrayButton onClick={this.handleDelete}>Ta bort Besök</GrayButton>
        </div>
    }

    handlePaidChange = (info) => {
        const data = {
            ...info,
            hasPaid: !info.hasPaid
        }
        jsonRequest(withBaseURL('/participantinfo'), data, 'PUT').then(newInfo => {
            this.setState({
                buyData: {
                    ...this.state.buyData,
                    participantInfo: this.state.buyData.participantInfo.map(info => {
                        if (info.id === newInfo.id) {
                            return newInfo
                        } else {
                            return info
                        }
                    })
                }
            })
        })
    }

    renderParticipants = (participants) => {
        const { hasPaid = [], hasNotPaid = [] } = groupBy(participants, info => info.hasPaid ? 'hasPaid' : 'hasNotPaid')

        return (
            <div>
                <Header>Deltagare</Header>
                {hasNotPaid.length === 0 && ("Alla har betalat!")}
                {hasNotPaid.map(info => <UserWithPriceItem key={info.id} active={true} userId={info.userId} onPaidChange={() => this.handlePaidChange(info)} price={info.amountOwed} hasPaid={info.hasPaid} />)}
                <hr/>
                {hasPaid.map(info => <UserWithPriceItem key={info.id} active={false} userId={info.userId} onPaidChange={() => this.handlePaidChange(info)} price={info.amountOwed} hasPaid={info.hasPaid} />)}
            </div>
        )
    }

    setPrice = (price) => {
        const int = parseInt(price, 10)

        this.setState({
            ticketPrice: isNaN(int) ? 0 : int
        })
    }

    handleMarkBought = (event) => {
        event.preventDefault()

        this.props.dispatch(showingActions.actions.requestUpdate({
            ...this.props.showing,
            price: this.state.ticketPrice * 100,
            ticketsBought: true
        }))
        setTimeout(() => {
            this.handleStartBooking()
        }, 2000)
    }

    renderSwishModal = () => {
        const { payData } = this.state
        if (!payData) {
            return <Loader />
        }
        // const { amountOwed, swishLink, hasPaid, payTo } = payData
        const { swishLink } = payData

        if (swishLink) {
            return (
                <Modal>
                    <button onClick={() => this.setState({swish: false})}>Stäng</button>
                    <QRCode value={swishLink} width={200} height={200} />
                </Modal>
            )
        }
    }

    renderBuyModal = (buyData) => {

        if (!buyData || this.props.loading) {
            return <Modal><Center><Loader /></Center></Modal>
        }

        const { participantInfo, bioklubbnummer, sfBuyLink } = buyData
        const { ticketsBought } = this.props.showing
        const { ticketPrice } = this.state

        return <Modal>
            <Padding>
                <button onClick={() => this.setState({showModal: false, buyData: null})}>Stäng</button>
                <Padding>
                    {ticketsBought && this.renderParticipants(participantInfo)}
                    {!ticketsBought && <form onSubmit={this.handleMarkBought}>
                        <Header>Boka</Header>
                        {!sfBuyLink && "Ingen köplänk genererad ännu! Kom tillbaka senare!"}
                        {sfBuyLink && <a href={sfBuyLink} target="_blank" rel="noopener noreferrer">Öppna SF länk i nytt fönster</a>}
                        <SmallHeader>Bioklubbnummer</SmallHeader>
                        {bioklubbnummer.map(nbr => <CopyValue key={nbr} text={nbr}/>)}
                        <hr/>
                        = {bioklubbnummer.map(nbr => parseInt(nbr, 10)).reduce((acc, nbr) => acc + nbr, 0)}
                        <Field text="Biljettpris:">
                            <Input type="number" value={ticketPrice} min={0} onChange={event => this.setPrice(event.target.value)} />
                        </Field>
                        <MainButton>Markera som bokad</MainButton>
                    </form>}
                </Padding>
            </Padding>
        </Modal>
    }

    renderPendingShowing = (showing, isParticipating) => {

        return <div>
            {!isParticipating && <GreenButton onClick={this.handleAttend}>Jag hänger på!</GreenButton>}
            {isParticipating && <RedButton onClick={this.handleUnattend}>Avanmäl</RedButton>}
            <div>
                {showing.participants.map(userId => <UserItem key={userId} userId={userId}/>)}
            </div>
        </div>
    }

    openSwish = (swishLink) => {
        this.setState({ swish: true })
        window.location = swishLink
    }

    renderBoughtShowing = (showing) => {
        const { payData } = this.state
        if (!payData) {
            return <Loader />
        }
        const { amountOwed, swishLink, hasPaid, payTo } = payData

        return <div>
            {hasPaid && "Du har betalat!"}
            {!hasPaid && <div>
                Betala {amountOwed / 100} till <UserItem userId={payTo} />
                <GreenButton onClick={() => this.openSwish(swishLink)}>Betala</GreenButton>
            </div>}
        </div>
    }

    render() {
        const { className, showing, me } = this.props;
        const { swish, showModal, buyData } = this.state;

        const isParticipating = showing.participants.includes(me.id)
        const isAdmin = showing.admin === me.id

        return (
            <div className={className}>
                {swish && this.renderSwishModal()}
                {showModal && this.renderBuyModal(buyData)}
                <Showing
                    movieId={showing.movieId}
                    date={showing.date}
                    adminId={showing.admin}
                    location={showing.location.name} />
                {!showing.ticketsBought && this.renderPendingShowing(showing, isParticipating)}
                {showing.ticketsBought && this.renderBoughtShowing(showing)}
                {isAdmin && this.renderAdminAction(showing.ticketsBought)}
            </div>
        )
    }
}

const mapStateToProps = (state, props) => {
    const { showingId } = props.match.params
    const showing = state.showings.data[showingId]
    const adminId = showing && showing.admin

    return {
        showingId,
        adminId,
        loading: state.showings.loading,
        showing: { ...state.showings, data: showing},
        admin: { ...state.users, data: state.users.data[adminId] },
        me: state.me.data
    }
}

export default connect(mapStateToProps)(withLoader({
    showing: ['showingId', showingActions.actions.requestSingle],
    admin: ['adminId', userActions.actions.requestSingle]
})(Showings));
