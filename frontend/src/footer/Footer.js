import React from "react";
import styled  from "styled-components";
import GitHubLogo from "./GithubLogo"
import QuoteBox from "./QuoteBox";

const BottomContainer = styled.div`
  background: maroon;
  padding: 1em;
  color: white;
  font-weight: 100;
`;

const FlexBox = styled.div`
  display: flex;
  align-items: center;
`;

const FlexGrow = styled.div`
  flex: 1;
`;

const TopBar = React.createClass({
    render() {
        return (
            <BottomContainer>
               <QuoteBox number={4}>Du skall icke späda din cola</QuoteBox>
               <FlexBox>
                   <FlexGrow>
                       <small>Courtesy of didIT (& Tuna)</small>
                   </FlexGrow>
                   <a href="http://github.com/cthdidit/itbio">
                       <GitHubLogo/>
                   </a>
               </FlexBox>
            </BottomContainer>
        );
    }
});

export default TopBar;
