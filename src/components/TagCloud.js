import React, { Component } from 'react';
import WordCloud  from 'react-d3-cloud';
import countBy from 'lodash/countBy';
class TagCloud extends Component {

  constructor(props) {
    super(props);
    this.state = { width: 0, height: 0 };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions(this.props.heightRatio);
    window.addEventListener('resize', () => this.updateWindowDimensions(this.props.heightRatio));
    setInterval(() => {
      this.forceUpdate();
    }, 3000);
   }

   componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions(heightRatio) {
    this.setState({ width: window.innerWidth, height: window.innerHeight*heightRatio });
  }
  
  render() {
    var counts = countBy(this.props.tags);
    var data = Object.getOwnPropertyNames(counts).map(a => {return {text: a, value: counts[a]}});
    var maxFontSize = 80
    var maxDataCount = Math.max(...data.map(d=> d.value))
    var scale = maxFontSize / maxDataCount
    const fontSizeMapper = word => word.value * scale;
    
    return (
      <WordCloud
        data={data}
        fontSizeMapper={fontSizeMapper}
        width={this.state.width}
        height={this.state.height}
      />      
    );
  }
}

export default TagCloud;
