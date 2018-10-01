import React, { Component } from 'react';
import WordCloud  from 'react-d3-cloud';
import countBy from 'lodash/countBy';
class TagCloud extends Component {
  render() {
    var counts = countBy(this.props.tags);
    var data = Object.getOwnPropertyNames(counts).map(a => {return {text: a, value: counts[a]}});
    var maxFontSize = 80
    var maxDataCount = Math.max(...data.map(d=> d.value))
    var scale = maxFontSize / maxDataCount
    const fontSizeMapper = word => word.value * scale;
    
    return (
      <div>
        <article align="center">
          <header>
            <h1>{this.props.title}</h1>
          </header>
        </article>
        <WordCloud
          data={data}
          fontSizeMapper={fontSizeMapper}
          width={this.props.width}
          height={this.props.height}
        />
      </div>
    );
  }
}

export default TagCloud;