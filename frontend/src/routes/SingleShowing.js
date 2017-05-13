import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { showings as showingActions, users as userActions } from "../store/reducers";
import styled from "styled-components";

import withLoader from "../lib/withLoader";
import { getJson, jsonRequest, withBaseURL } from "../lib/fetch";

import Showing from "../Showing";
import CopyValue from "../CopyValue";
import Loader from "../Loader";
import Center from "../Center";
import Header from "../Header";
import Modal from "../Modal";
import buildUserComponent from "../UserComponentBuilder";
import MainButton, { GreenButton, RedButton, GrayButton } from "../MainButton";


const UserItem = buildUserComponent(({ user }) => (
  <div>{user.nick || user.name}</div>
))

const UserWithPriceItem = buildUserComponent(({ user, price, onPaidChange, hasPaid }) => (
  <div>
    {user.nick || user.name} {(price && (price / 100))} <label>har betalat: <input type="checkbox" checked={hasPaid} onChange={(event) => onPaidChange(!event.target.checked)}/></label>
</div>
))

const Padding = styled.div`
    padding: 1em;
`

class Showings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buyData: null,
            showModal: false
        }
    }

    handleAttend = () => {
        this.props.dispatch(showingActions.actions.requestAttend(this.props.showingId));
    }

    handleDelete = () => {
        const proceed = confirm("Är du säker? Går ej att ångra!");

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

    renderAdminAction = () => {
        return <div>
            <MainButton onClick={this.handleStartBooking}>Alla är med, nu bokar vi!</MainButton>
            <GrayButton onClick={this.handleDelete}>Ta bort Besök</GrayButton>
        </div>
    }

    handlePaidChange = (info, hasPaid) => {
        const data = {
            ...info,
            hasPaid
        }
        jsonRequest(withBaseURL('/participantinfo'), data, 'PUT').then(newInfo => {
            this.setState({
                buyData: {
                    ...this.state.buyData,
                    participantInfo: this.state.buyData.participantInfo.map(info => {
                        if (info.id === newInfo) {
                            return newInfo
                        } else {
                            return info
                        }
                    })
                }
            })
        })
    }

    renderBuyModal = (buyData) => {

        if (!buyData) {
            return <Modal><Center><Loader /></Center></Modal>
        }

        const { participantInfo, bioklubbnummer, sfBuyLink } = buyData

        return <Modal>
            <Padding>
                <button onClick={() => this.setState({showModal: false, buyData: null})}>Stäng</button>
                <Padding>
                    <a href={sfBuyLink} target="_blank" rel="noopener noreferrer">Öppna SF länk i nytt fönster</a>
                    <Header>Bioklubbnummer</Header>
                    {bioklubbnummer.map(nbr => <CopyValue key={nbr} text={nbr}/>)}
                    <Header>Deltagare</Header>
                    {participantInfo.map(info => <UserWithPriceItem key={info.userId} userId={info.userId} onPaidChange={(value) => this.handlePaidChange(info, value)} price={info.amountOwed} hasPaid={info.hasPaid} />)}
                </Padding>
            </Padding>
        </Modal>
    }

    render() {
        const { className, showing, me } = this.props;
        const { showModal, buyData } = this.state;

        const isParticipating = showing.participants.includes(me.id)
        const isAdmin = showing.admin === me.id

        return (
            <div className={className}>
                {showModal && this.renderBuyModal(buyData)}
                <Showing
                    movieId={showing.movieId}
                    date={showing.date}
                    adminId={showing.admin}
                    location={showing.location.name} />
                {!isParticipating && <GreenButton onClick={this.handleAttend}>Jag hänger på!</GreenButton>}
                {isParticipating && <RedButton onClick={this.handleUnattend}>Avanmäl</RedButton>}
                <div>
                    {showing.participants.map(userId => <UserItem key={userId} userId={userId}/>)}
                </div>
                {isAdmin && this.renderAdminAction()}
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
        showing: { ...state.showings, data: showing},
        admin: { ...state.users, data: state.users.data[adminId] },
        me: state.me.data
    }
}

export default connect(mapStateToProps)(withLoader({
    showing: ['showingId', showingActions.actions.requestSingle],
    admin: ['adminId', userActions.actions.requestSingle]
})(Showings));
