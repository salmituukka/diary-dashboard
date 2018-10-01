# Usage of Learning Service

## Short descriptions
The service is made for tracking learning of some life branch, for example professional learning.
The service contains few separate issues that have some slight interactions.

### Branches section

One can define multiple learning branches from this section. The different branches are completely independent.

### Biography section

This section is so far completely separate for others. This is basically interactive CV.
### Mission section
This section contains the goal of the learning process. This section have also no interactions with other sections.  
### Plan section
This sections contains learning plan. [ Some sections of plans may be accociated to diary](###plan) so that plan progress is shown when corresponding [planning tags are added to the diary](###diary).
### Principles section
This section contains some principles that are wanted to be tracked. Principles are tracked from [Diary](###diary). It is possible to track only some of the principles for each day. This section renders with color codes how well principles are came true at average level.

### Diary section

This section shows what issues are learnt for each day. Moreover, the section shows how well tracked principles or other events are came true with the selected time frame. In addition, gauge shows which ratio of the planning tags are in the latest learning plan. Diary events are added using markdown format described [here](###diary)
### Privacy

This section contains settings that which items others can see. By the default all the items are private. Privacy is set per branch.

## Data formats

### Diary

Format of uploaded diary files :
```markdown
---
date: 13.8.2018
principle1: value1
principle2: value2
keyN: valueN
#LearningTag1
#LearningTag2
@PlanningTag1
@PlanningTag2
---
Notes of the day in markdown format
```
Values for principles are assumed to be integers from range [4,10].
### Plan
Plan is set in standard markdown file with the exception that some of the plan items can be tagged with planning tag like {this sentence is tagged with tag}@PlanningTag1.
### Biography
Biography items can be set one by one or imported from json file.  An example file format is
```json
{
  "skills": [
    {"name": "Skill1", "weight": 1, "groups": ["Group1", "Group2"], "preference": 1},
    {"name": "Skill2", "weight": 5, "groups": ["Group2", "Group3"], "preference": 3}
  ],
  "events": [
    {"name": "Name", "title": "Short description", "start": "2000-10-01", "end": "2000-12-31", "group": "work", "logo":"https://www.sttinfo.fi/data/images/00756/5cc77d24-3bde-4096-9cfc-dd40de4cd96e.png"},
    {"name": "Deep learning with Python", "title": "François Chollet: Deep Learning with Python", "start": "2018-09-01", "group": "study", "subgroup":"book" },
  ]
}
```