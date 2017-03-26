import React from "react";
import styled from "styled-components";
import MainButton from "../MainButton";
import Showing from "../Showing";
import Header from "../Header";
import Jumbotron from "../jumbotron/jumbotron";

const Home = ({ className }) => (
    <div className={className}>
        <Jumbotron>
            <Header>Nytt besök?</Header>
            <MainButton>Skapa nytt besök</MainButton>
        </Jumbotron>
        <Header>Besök jag har skapat</Header>
        <Showing
            poster="https://images-na.ssl-images-amazon.com/images/M/MV5BMTUwNjUxMTM4NV5BMl5BanBnXkFtZTgwODExMDQzMTI@._V1_SY1000_CR0,0,674,1000_AL_.jpg"
            title="Beauty and the Beast"
            date="2017-04-06 20:00"
            location="Bergakungen, sal 9"
            owner="Horv"/>
        <Header>Mina kommande besök</Header>
        <Showing
            poster="https://images-na.ssl-images-amazon.com/images/M/MV5BMjI1MjkzMjczMV5BMl5BanBnXkFtZTgwNDk4NjYyMTI@._V1_SY1000_CR0,0,676,1000_AL_.jpg"
            title="Logan"
            date="2017-04-10 20:00"
            location="Bergakungen, sal 8"
            owner="Ndushi"/>
    </div>
)


export default styled(Home)`

`;
