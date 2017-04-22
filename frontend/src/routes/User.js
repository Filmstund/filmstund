import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import alfons from "../assets/alfons.jpg";

const Box = styled.div`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  height: 100px;
`;

const AvatarImage = styled.div`
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  height: 100px;
  width: 100px;
`

const UserName = styled.h3`
  margin: 0;
  padding: 0;
`

const UserInfo = styled.div`
  padding: 1em;
`

const User = ({ me, className }) => (
  <div className={className}>
    <Box>
      <AvatarImage src={me.avatar || alfons} />
      <UserInfo>
        <UserName>{me.name}</UserName>
        {me.nick && <div>"{me.nick}"</div>}
        <div>{me.email}</div>
      </UserInfo>
    </Box>
  </div>
)


export default connect(state => ({
  me: state.me.data
}))(User)
