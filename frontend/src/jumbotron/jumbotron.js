import styled from "styled-components";

import background from "./body_background.jpg";

const Jumbotron = styled.div`
    color: white;
    height: 30vh;
    margin: -1em -1em 0;
    background-image: url(${background});
    background-size: cover;
    padding: 1em;
`;

export default Jumbotron;
