import React from 'react';

import WordCloud from '../../helpers/wordcloud2';
import BioSkillDialog from './BioSkillDialog';
import flatten from 'lodash/flatten';
import map from 'lodash/map';
import toPairs from 'lodash/toPairs';

import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const fontValues = [4,10,16,22,28] 
const fontSizeMapper = (weight, width) => fontValues[weight-1] * width  / 1024;

const centerImage = require('../../images/heart.png')

var infoGrids = {};

const divStyle = {
    backgroundColor: 'rgba(0,0,200,0.1)',
    position: 'absolute',
    bottom: `0px`,
    align: 'center'
};

const divCenter = (width, height, offset) => {
  return {
    position: 'absolute',
    bottom: `${height/2-offset}px`,
    left: `${width/2-offset}px`
  };
};

const checkbox = (height) => {
  return {
    position: 'absolute',
    top: `${height}px`,
    right: `0px`
  };
};


class SingleSkillCloud extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hover: undefined };
  }
  componentDidMount() {
    this.plotWordCloud();
  }
  componentDidUpdate(prevProps) {
    if (this.props !== prevProps)  {
      this.plotWordCloud();
    }
  }  
  clickSkillCallback(item) {
    this.props.clickSkillCallback(item[0], this.props.canvas);
  }
  showHover (item, dimension) {
    if (!!item) {
      const hover = {text: item[2], dimension: dimension};
      this.setState({hover});
    } else if (!!this.state.hover) {
      this.setState({hover: undefined});
    }
  }
  plotWordCloud() {

    var canvas = this.refs[this.props.canvas];
    if (canvas && canvas.getContext && this.props.width > 0 && this.props.height > 0 && this.props.relSize > 0) {
      canvas.width = this.props.width;
      canvas.height = this.props.height; 

      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);   

      ctx.beginPath();
      ctx.ellipse(this.props.width * (1-this.props.relSize)/2, this.props.height * (1-this.props.relSize)/2, this.props.width * this.props.relSize,  this.props.height * this.props.relSize, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.fill();

      ctx.beginPath();
      if (!!this.props.relInnerSize) {
        ctx.ellipse(this.props.width * (1-this.props.relInnerSize)/2, this.props.height * (1-this.props.relInnerSize)/2, this.props.width * this.props.relInnerSize,  this.props.height * this.props.relInnerSize, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse((this.props.width - this.props.absoluteInnerSize)/2, (this.props.height -this.props.absoluteInnerSize)/2, this.props.absoluteInnerSize,  this.props.absoluteInnerSize, 0, 0, Math.PI * 2);
      }
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();   

      const skillsWithSizes = this.props.skills.map(skill => [skill.name, fontSizeMapper(skill.weight, this.props.width), skill.description]);

      infoGrids[this.props.canvas]= WordCloud([canvas], 
        {           
          list: skillsWithSizes,
          weightFactor: 1,
          fontFamily: 'Finger Paint, cursive, sans-serif',
          color: 'random-dark',
          clearCanvas: false,
          shuffle: true,
          gridSize: 4,//Math.round(16 * this.props.width / 1024),
          rotateRatio: 0,
          rotationSteps: 10,
          ellipticity: 1,
          otherInfoGrids: infoGrids,
          shape: (theta) => this.props.width
            / Math.sqrt(Math.pow(this.props.width*Math.sin(theta),2)+Math.pow(this.props.height*Math.cos(theta),2)),
          click: this.clickSkillCallback.bind(this),
          hover: this.showHover.bind(this)
        });   
    }
  }

  render() {
    return(
      <div>
      <div style={divStyle} >
        <canvas ref={this.props.canvas} width = {this.props.width}  height = {this.props.height}>
        </canvas>
      </div>
      {this.state.hover && this.state.hover.text && (
        <span className = "tooltiptext" style = {{
          top: this.state.hover.dimension.y + window.innerHeight - this.props.height - this.state.hover.dimension.h - 80, 
          left: this.state.hover.dimension.x,
          width: `${Math.sqrt(this.state.hover.text.length*1000)}px`
        }} >{this.state.hover.text}</span>
      )}
      </div>
    );
  }
}

class SkillCloud extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: 0, height: 0, groups:{}, selectedSkill: undefined };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }
  componentDidMount() {
    this.updateWindowDimensions(1.0, (1.0-this.props.yOffset));
    window.addEventListener('resize', () => this.updateWindowDimensions(1.0, (1.0-this.props.yOffset)));
   }
  
   componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    clearInterval(this.reRenderer);
  }
  
  updateWindowDimensions(widthRatio, heightRatio) {
    this.setState({ width: window.innerWidth * widthRatio, height: window.innerHeight*heightRatio });
  }

  handleChange(group, checked) {
    const groups = this.state.groups;
    groups[group] =checked;
    this.setState({groups});
  }

  openSkillDialog(word, group) {
    const selectedSkill = this.props.skills.map(skill => skill.name).indexOf(word);
    this.setState({selectedSkill})
  }

  skillDialogCancelCallback() {
    this.setState({selectedSkill: undefined})
  }  

  skillDialogEditCallback(skill) {
    const selectedSkill = this.state.selectedSkill;
    this.setState({selectedSkill: undefined});
    return this.props.editSkillCallback(selectedSkill, skill);
  } 

  skillDialogDeleteCallback(skill) {
    const selectedSkill = this.state.selectedSkill;
    this.setState({selectedSkill: undefined});
    return this.props.deleteSkillCallback(selectedSkill, skill);
  } 

  render() {
    const groupSet =  new Set( flatten(this.props.skills.map(skill=>skill.groups)));
    const disabledGroupSet =  new Set(toPairs(this.state.groups).filter(nameEnabled => !nameEnabled[1]).map(nameEnabled => nameEnabled[0]));
    const groups = [...groupSet];
    const preferenceGroup1Skills = this.props.skills.filter(skill=>skill.preference===1 && skill.groups.filter(x=>!disabledGroupSet.has(x)).length > 0);
    const preferenceGroup2Skills = this.props.skills.filter(skill=>skill.preference===2 && skill.groups.filter(x=>!disabledGroupSet.has(x)).length > 0);
    const preferenceGroup3Skills = this.props.skills.filter(skill=>skill.preference===3 && skill.groups.filter(x=>!disabledGroupSet.has(x)).length > 0);
    const preferenceGroup1TextLengthSum = preferenceGroup1Skills.map(skill=>fontSizeMapper(skill.weight, this.state.width)*skill.name.length).reduce((a, b) => a + b, 0);
    const preferenceGroup2TextLengthSum = preferenceGroup2Skills.map(skill=>fontSizeMapper(skill.weight, this.state.width)*skill.name.length).reduce((a, b) => a + b, 0);
    const preferenceGroup3TextLengthSum = preferenceGroup3Skills.map(skill=>fontSizeMapper(skill.weight, this.state.width)*skill.name.length).reduce((a, b) => a + b, 0);
    const totalTextLengthSum = preferenceGroup1TextLengthSum + preferenceGroup2TextLengthSum + preferenceGroup3TextLengthSum;
    const middleCircleRadius = 100;
    const middleCircleArea =  Math.PI * middleCircleRadius * middleCircleRadius;
    const totalArea = Math.PI * this.state.width * this.state.height - middleCircleArea;
    const areaGroup1 = totalArea * preferenceGroup1TextLengthSum / Math.max(1, totalTextLengthSum);
    const areaGroup2 = totalArea * preferenceGroup2TextLengthSum / Math.max(1, totalTextLengthSum);
    const group1RelSize = Math.max(0.25, 
       Math.sqrt((areaGroup1 + middleCircleArea) / (Math.PI * this.state.width * this.state.height)));
    const group2RelSize = Math.max(0.4, Math.min(0.9, Math.sqrt((areaGroup1 + areaGroup2 + middleCircleArea) / (Math.PI * this.state.width * this.state.height))));
    const group3RelSize = 1.0;

    return(
      <div> 
        <SingleSkillCloud 
          skills = {preferenceGroup3Skills} 
          width = {this.state.width} 
          height = {this.state.height} 
          relSize = {group3RelSize} 
          relInnerSize = {group2RelSize} 
          yOffset = {this.props.yOffset}
          canvas = "3"/>
        <SingleSkillCloud 
          skills = {preferenceGroup2Skills} 
          width = {this.state.width} 
          height = {this.state.height} 
          relSize = {group2RelSize} 
          relInnerSize = {group1RelSize}
          yOffset = {this.props.yOffset}
          canvas = "2"/>
        <SingleSkillCloud 
          clickSkillCallback = {this.openSkillDialog.bind(this)}
          skills = {preferenceGroup1Skills} 
          width = {this.state.width} 
          height = {this.state.height} 
          relSize = {group1RelSize} 
          absoluteInnerSize = {middleCircleRadius}
          yOffset = {this.props.yOffset}
          canvas = "1"/>
        <div style={divCenter(this.state.width, this.state.height, middleCircleRadius/2)} >          
          <img src={centerImage} alt = {''} width = {middleCircleRadius} height = {middleCircleRadius}/>
        </div>
        <div style={checkbox(this.props.yOffset * this.state.height / ( 1- this.props.yOffset))}>
          <FormLabel component="legend">Skill groups</FormLabel>
          <FormGroup>
            {map(groups, group => (
              <FormControlLabel
                key = {group}
                control={
                  <Checkbox style = {{height: 30}} checked={this.state.groups[group] === undefined || this.state.groups[group]} value={group} onChange={(event, checked) => this.handleChange(group, checked)}/>
                }
                label={group}
              />
            ))}
          </FormGroup>
        </div>
        {!!this.state.selectedSkill && (
          <BioSkillDialog  
            skill = {this.props.skills[this.state.selectedSkill]}
            deleteCallback = {this.skillDialogDeleteCallback.bind(this)}
            cancelCallback = {this.skillDialogCancelCallback.bind(this)}
            submitCallback = {this.skillDialogEditCallback.bind(this)}
          />
        )}        
      </div>
    );
  }  
}


export default SkillCloud;
