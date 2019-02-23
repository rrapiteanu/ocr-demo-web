import React, { Component } from "react";
import styled from "styled-components";
import { firebaseRef } from "./helpers/firebase";
import FileUploader from "react-firebase-file-uploader";
import axios from "axios";
import ProgressBar from "./components/ProgressBar";
import Spinner from "react-spinkit";

const OCR_SERVER = process.env.REACT_APP_OCR_SERVER;

const TextContainer = styled.div`
  border: 1px solid black;
  text-align: justify;
  padding: 10px;
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ImageContainer = styled.img`
  max-width: 400px;
  max-height: 400px;
`;

const ExtractingArea = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  ${ImageContainer} {
    opacity: ${props => (props.isExtracting ? 0.3 : 1)};
  }
  ${SpinnerContainer} {
    display: ${props => (props.isExtracting ? "flex" : "none")};
  }
`;

const ExtractingSpinner = () => (
  <SpinnerContainer>
    <Spinner name="ball-grid-pulse" />
  </SpinnerContainer>
);

class App extends Component {
  state = {
    imageURL: null,
    isExtracting: false,
    isUploading: false,
    progress: 0,
    text: ""
  };

  render() {
    return (
      <AppContainer>
        <FileUploader
          accept="image/*"
          storageRef={firebaseRef.storage().ref("images")}
          onUploadStart={this.handleUploadStart}
          onUploadError={this.handleUploadError}
          onUploadSuccess={this.handleUploadSuccess}
          onProgress={this.handleProgress}
        />
        {this.state.isUploading && <h2>Upload progress:</h2>}
        <ProgressBar percentage={this.state.progress} />
        {this.state.imageURL && (
          <ExtractingArea isExtracting={this.state.isExtracting}>
            <ExtractingSpinner />
            <ImageContainer src={this.state.imageURL} alt="upload" />
          </ExtractingArea>
        )}
        {this.state.text !== "" && this.renderText(this.state.text)}
      </AppContainer>
    );
  }

  renderText = text => {
    const blocks = text.split("\n");
    console.log("BLOCKS", blocks);
    return (
      <TextContainer>
        {blocks.map((block, index) => {
          block = block.replace("\n", "");
          return <div key={"block-" + index}>{block}</div>;
        })}
      </TextContainer>
    );
  };

  handleUploadStart = () => {
    this.setState({ isUploading: true, progress: 0 });
  };

  handleProgress = progress => {
    this.setState({ progress });
  };

  handleUploadError = error => {
    this.setState({ isUploading: false });
    console.error(error);
  };

  handleUploadSuccess = async filename => {
    this.setState({ avatar: filename, progress: 100, isUploading: false });

    try {
      let { bucket, fullPath, name } = await firebaseRef
        .storage()
        .ref("images")
        .child(filename)
        .getMetadata();

      console.log(bucket, fullPath, name);

      await firebaseRef
        .storage()
        .ref("images")
        .child(filename)
        .getDownloadURL()
        .then(url => this.setState({ imageURL: url }));

      this.setState({ isExtracting: true });
      const response = await axios.get(`${OCR_SERVER}/ocr?img=${name}`);
      this.setState({ isExtracting: false });
      console.log(response.data);

      this.setState({ text: response.data });
    } catch (err) {
      console.error(err);
    }
  };
}

export default App;
