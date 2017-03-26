import React from "react";
import MainButton from "../MainButton";
import Showing from "../Showing";
import Header from "../Header";
import Jumbotron from "../jumbotron/jumbotron";
import {getJson} from "../lib/rest";

const Home = React.createClass({
    getInitialState() {
        return {
            showings: []
        }
    },
    componentWillMount() {
        getJson("/showings").then(showings => {
            this.setState({ showings });
        });
    },
    render() {
        const { showings } = this.state;
        const { className } = this.props;
        return (
            <div className={className}>
                <Jumbotron>
                    <Header>Nytt besök?</Header>
                    <MainButton>Skapa nytt besök</MainButton>
                </Jumbotron>
                <Header>Besök jag har skapat</Header>
                <Showing
                    poster="https://images-na.ssl-images-amazon.com/images/M/MV5BMTUwNjUxMTM4NV5BMl5BanBnXkFtZTgwODExMDQzMTI@._V1_SY1000_CR0,0,674,1000_AL_.jpg"
                    showing={{startTime: 1410548139.042, movie: {name: "Beauty and the Beast"}, location: {name: "Bergakungen, sal 2"}, admin: {nick: "Horv"}}}/>
                <Header>Mina kommande besök</Header>
                {showings.map(showing => (
                    <Showing key={showing.id} showing={showing}/>
                ))}
            </div>
        )
    }
});


export default Home;
