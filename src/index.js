import React from 'react'
import ReactDOM from "react-dom"
import styled from 'styled-components'

const DragContainer = styled.div`
  cursor: pointer;
  background: green;
  padding: 20px;
`;

class App extends React.Component {
  constructor(props) {
    super(props);

    // Default state variables
    this.state = {
      playbackRate: 0.5,
      isDragActive: false,
      brightness: 100,
      contrast: 100
    };

    // React non-sense
    this.videoRef = React.createRef();

    // Bind DOM events to this class so that they can access "this" object
    this.handleLoadedMetadata = this.handleLoadedMetadata.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.changeSpeed = this.changeSpeed.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  handleLoadedMetadata(event) {
    const target = event.target;
    target.playbackRate = this.state.playbackRate;
    target.play();
  }
  changeSpeed(speed) {
    this.setState({ playbackRate: speed });
    this.videoRef.current.playbackRate = speed;
    this.videoRef.current.play();
  }

  computeXY(e) {
    // compute x,y relative to the top,left corner of the video
    const { left, top } = this.videoRef.current.getBoundingClientRect();
    const { clientX, clientY } = e;
    const point = {
      x: clientX - left,
      y: clientY - top
    };
    return point;
  }

  handleMouseDown(e) {
    const { x, y } = this.computeXY(e);
    this.setState({
      isDragActive: true,
      x: x,
      y: y,
      lastX: x,
      lastY: y
    });
  }

  handleMouseUp(e) {
    this.setState({ isDragActive: false });
  }

  handleMouseMove(e) {
    const { x, y } = this.computeXY(e);
    const { lastX, lastY } = this.state;
    if (this.state.isDragActive) {
      this.brightCont(x - lastX, y - lastY);
    }
    this.setState({ x: x, y: y, lastX: x, lastY: y });
  }

  brightCont(offsetX, offsetY) {
    const stepY = parseFloat(offsetY / 2);
    const stepX = parseFloat(offsetX / 2);

    let brightness = this.state.brightness + stepY;
    let contrast = this.state.contrast + stepX;

    if (brightness < 0) brightness = 0;
    if (brightness > 200) brightness = 200;
    if (contrast < 0) contrast = 0;
    if (contrast > 200) contrast = 200;

    this.setState({ brightness: brightness, contrast: contrast });
  }

  render() {
    return (
      <div style={{ marginBottom: "400px" }}>
        <DragContainer
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onMouseMove={this.handleMouseMove}
          style={{ width: "400px", marginTop: "00px" }}
        >
          <video
            src={this.props.src}
            ref={this.videoRef}
            autoplay={true}
            loop={true}
            style={{
              filter: `brightness(${this.state.brightness}%) contrast(${this.state.contrast}%)`
            }}
            onLoadedMetadata={this.handleLoadedMetadata}
            width={400}
          ></video>
        </DragContainer>
        <div>
          <button onClick={() => this.changeSpeed(0.1)}>0.1</button>
          <button onClick={() => this.changeSpeed(0.25)}>0.25</button>
          <button onClick={() => this.changeSpeed(0.5)}>0.5</button>
          <button onClick={() => this.changeSpeed(0.75)}>0.75</button>
          <button onClick={() => this.changeSpeed(1)}>1.0</button>
        </div>
        VideoSpeed: {this.state.playbackRate}.
        {this.state.brightness &&
          ` Brightness/contrast: ${this.state.brightness} ${this.state.contrast}`}
        <br />
        {this.state.isDragActive &&
          `Dragging. X,Y: ${this.state.x}, ${this.state.y}`}

      </div>
    );
  }
}


const videos = document.querySelectorAll("[data-type=sono-player]");
videos.forEach(function (item) {
  const src = item.dataset.src;
  ReactDOM.render(<App {...item.dataset} />, item);
});
