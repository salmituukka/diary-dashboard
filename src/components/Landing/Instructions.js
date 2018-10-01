import React, { Component } from 'react';
import withoutAuthorization from '../withoutAuthorization';
import Document from '../Diary/Document';
import Button from '@material-ui/core/Button';

const planningTemplate = '# Planning document\n \
Planning document is standard markdown file where you can tag some parts of texts.\
{This sentence is assigned a tag "Planning_tag1"}@Planning_tag1';
const diaryTemplate = '---\
date: 13.9.2018\
keyword1: 4\
keyword2: 10\
#Learning_tag1\
#Learning_tag2\
@Planning_tag1\
@Planning_tag2\
---\
Notes for the day in standard markdown format';

const htmlDocument = (<div>
<h1>Quick instructions</h1>
<h2>Format for planning document</h2>
<h3>Example 1:</h3>
{planningTemplate}
<h2>Format for diary documents</h2>
<h3>Example 1:</h3>
{diaryTemplate}
</div>);

class Instructions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDocument: false,
    };
  }

  documentClosed() {
    this.setState({showDocument: false});
  } 

  documentOpened() {
    this.setState({showDocument: true});
  }  

  render() {
    return (
      <div>
        <Button onClick = {this.documentOpened.bind(this)}>Some quick instructions</Button>
        {this.state.showDocument && (
          <Document
            plainText = {true}
            markdownDocument = {htmlDocument}
            title = 'Quick instructions'
            documentClosedCallback = {this.documentClosed.bind(this)}
          />
         )}
      </div>        
    );
  }
}

export default withoutAuthorization(Instructions);