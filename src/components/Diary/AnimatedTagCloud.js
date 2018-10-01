import React, { Component } from 'react';
import countBy from 'lodash/countBy';
import TagCloud from 'react-tag-cloud';

class AnimatedTagCloud extends Component {

  constructor(props) {
    super(props);
    this.state = { width: 0, height: 0 };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions(this.props.widthRatio, this.props.heightRatio);
    window.addEventListener('resize', () => this.updateWindowDimensions(this.props.widthRatio, this.props.heightRatio));
    this.reRenderer = setInterval(() => {
      this.forceUpdate();
    }, 3000);
   }

   componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    clearInterval(this.reRenderer);
  }
  
  updateWindowDimensions(widthRatio, heightRatio) {
    this.setState({ width: window.innerWidth * widthRatio, height: window.innerHeight*heightRatio });
  }
  
  render() {
    var counts = countBy(this.props.tags);
    var data = Object.getOwnPropertyNames(counts).map(a => {return {text: a, value: counts[a]}});
    var maxFontSize = 80
    var maxDataCount = Math.max(...data.map(d=> d.value))
    var scale = maxFontSize / maxDataCount
    const fontSizeMapper = word => word.value * scale;
    
    return (
      <div className = "tag-cloud-outer-div" width={this.state.width} height={this.state.height}>
        <article align="center">
          <header>
            <h1>{this.props.title}</h1>
          </header>
        </article>
        <TagCloud
          className='tag-cloud'>
        >
        <div>Teksti</div>
        </TagCloud>
      </div>
    );
  }
}

export default AnimatedTagCloud;