import { Component } from 'react';
import ReactDOM from 'react-dom';
import renderHTML from 'react-render-html';
import * as showdown from 'showdown';
import {githubTemplate} from '../../helpers/htmlHelper';
    
class Document extends Component {
  constructor(props) {
    super(props);
    this.containerEl = document.createElement('div');
    this.externalWindow = null;
    this.converter = new showdown.Converter();
  }

  componentDidMount() {
    this.externalWindow = window.open('', 'Notes', 'width=600,height=400,left=200,top=200');

    if (!!this.externalWindow) {      
      this.externalWindow.document.body.appendChild(this.containerEl);
      this.externalWindow.addEventListener('unload', this.props.documentClosedCallback);
    }
  }

  componentWillUnmount() {
    if (!!this.externalWindow) {
      this.externalWindow.close();
    }
  }

  render() {
    if (!!this.externalWindow) {  
      this.externalWindow.name = this.props.title;
      this.externalWindow.focus(); 
    }
    const text = this.props.plainText 
      ? this.props.markdownDocument
      : githubTemplate(this.converter.makeHtml(this.props.markdownDocument));
    return (
      ReactDOM.createPortal(renderHTML(text), this.containerEl)
    );
  }
}
  
export default Document;
