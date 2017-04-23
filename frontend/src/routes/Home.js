import React from "react";
import { connect } from "react-redux";

import { Link } from "../MainButton";
import Showing from "../Showing";
import Header from "../Header";
import Jumbotron from "../jumbotron/jumbotron";

import { showings } from "../store/reducers/index"

const Home = React.createClass({
    componentWillMount() {
        this.props.dispatch(showings.actions.requestIndex());
    },
    render() {
        const { className, showings = [] } = this.props;
        return (
            <div className={className}>
                <Jumbotron>
                    <Header>Nytt besök?</Header>
                    <Link to="/showings/new">Skapa nytt besök</Link>
                </Jumbotron>
                <Header>Besök jag har skapat</Header>
                {/*<Showing
                    poster="https://images-na.ssl-images-amazon.com/images/M/MV5BMTUwNjUxMTM4NV5BMl5BanBnXkFtZTgwODExMDQzMTI@._V1_SY1000_CR0,0,674,1000_AL_.jpg"
                    showing={{startTime: 1410548139.042, movie: {name: "Beauty and the Beast"}, location: {name: "Bergakungen, sal 2"}, admin: {nick: "Horv"}}}/>
                    */}
                <Header>Mina kommande besök</Header>
                {showings.map(showing => (
                    <Showing movieId={showing.movieId} key={showing.id} date={showing.date} admin={showing.admin} location={showing.location.name} />
                ))}
            </div>
        )
    }
});

const mapStateToProps = (state) => ({
    showings: Object.values(state.showings.data)
})


export default connect(mapStateToProps)(Home);
