import React from "react";
import { connect } from "react-redux";
import DatePicker from "react-datepicker";
import moment from "moment";
import 'react-datepicker/dist/react-datepicker.css';

import rest from "./store/reducers/rest";

import Header from "./Header";
import Showing from "./Showing";
import Input from "./Input";
import Field from "./Field";
import MainButton from "./MainButton";

const NewShowing = React.createClass({
    getInitialState() {
        const now = moment();

        return {
            showing: {
                date: now,
                time: now.format("HH:mm"),
                location: "",
                movieId: this.props.movieId
            }
        }
    },
    setShowingValueFromEvent(key, { target: { value } }) {
        return this.setShowingValue(key, value);
    },
    setShowingValue(key, value) {
        this.setState({
            showing: {
                ...this.state.showing,
                [key]: value
            }
        });
    },
    handleSubmit(event) {
        event.preventDefault();
        const submitObject = {
            ...this.state.showing,
            date: this.state.showing.date.format("YYYY-MM-DD")
        };

        console.log(submitObject, rest.actions);

        this.props.dispatch(rest.actions.createShowing({}, {body: JSON.stringify(submitObject)}));
    },
    render() {
        const { showing } = this.state;
        const { movie } = this.props;

        return (
            <div>
                <Header>Skapa besök</Header>
                <form onSubmit={this.handleSubmit}>
                    <Showing showing={showing} movie={movie}/>
                    <Field text="Datum:">
                        <DatePicker selected={showing.date} onChange={v => this.setShowingValue("date", v)} />
                    </Field>
                    <Header>Alt. 1: Välj tid från SF</Header>
                    <Field text="Stad:">
                        <Input type="text" value="Göteborg" disabled={true} />
                    </Field>
                    <Header>Alt. 2: Skapa egen tid</Header>
                    <Field text="Tid:">
                        <Input type="time" value={showing.time} onChange={v => this.setShowingValueFromEvent("time", v)}/>
                    </Field>
                    <Field text="Plats:">
                        <Input type="text" value={showing.location} onChange={v => this.setShowingValueFromEvent("location", v)} />
                    </Field>
                    <Field text="Pris:">
                        <Input type="text" defaultValue=""/>
                    </Field>
                    <MainButton>Skapa visning</MainButton>
                </form>
            </div>
        )
    }
});

const mapStateToProps = (state, { movieId }) => ({
    movie: state.movies.data.find(m => movieId === m.id)
});


export default connect(mapStateToProps)(NewShowing);
