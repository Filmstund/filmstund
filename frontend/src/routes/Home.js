import React from "react";
import { connect } from "react-redux";

import MainButton from "../MainButton";
import Showing from "../Showing";
import Header from "../Header";
import Jumbotron from "../jumbotron/jumbotron";

import rest from "../store/reducers/rest"

const Home = React.createClass({
    componentWillMount() {
        this.props.dispatch(rest.actions.showings.sync())
    },
    componentWillUnmount() {
        this.props.dispatch(rest.actions.showings.reset())
    },
    render() {
        const { className, showings = [] } = this.props;
        return (
            <div className={className}>
                <Jumbotron>
                    <Header>Nytt besök?</Header>
                    <MainButton onClick={() => console.log("button")}>Skapa nytt besök</MainButton>
                </Jumbotron>
                <Header>Besök jag har skapat</Header>
                {/*<Showing
                    poster="https://images-na.ssl-images-amazon.com/images/M/MV5BMTUwNjUxMTM4NV5BMl5BanBnXkFtZTgwODExMDQzMTI@._V1_SY1000_CR0,0,674,1000_AL_.jpg"
                    showing={{startTime: 1410548139.042, movie: {name: "Beauty and the Beast"}, location: {name: "Bergakungen, sal 2"}, admin: {nick: "Horv"}}}/>
                    */}
                <Header>Mina kommande besök</Header>
                {showings.map(showing => (
                    <Showing key={showing.id} showing={showing}/>
                ))}
            </div>
        )
    }
});

const mapStateToProps = (state) => ({
    showings: state.showings.data
})


export default connect(mapStateToProps)(Home);
