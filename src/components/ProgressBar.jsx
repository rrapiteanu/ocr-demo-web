import React from "react";
import styled from "styled-components";

const ProgressBarContainer = styled.div`
  position: relative;
  height: 20px;
  width: 350px;
  border: 1px solid #333;
  margin-bottom: 10px;
`;

const Filler = styled.div`
  background: greenyellow;
  height: 100%;
  border-radius: inherit;
  transition: width 0.2s ease-in;
  width: ${props => props.percentage}%;
`;

const ProgressBar = props => {
  return (
    <ProgressBarContainer>
      <Filler percentage={props.percentage} />
    </ProgressBarContainer>
  );
};

export default ProgressBar;