# Consensus - Project Description & Use Cases

## 🎯 Project Overview

Consensus is a generic platform for group decision-making that enables communities to collaboratively choose activities, items, or experiences through structured voting and recommendation systems. The platform is designed to be flexible enough to support various types of group activities while maintaining a consistent, intuitive workflow.

## 🌟 Core Concept

The application solves the common problem of group decision-making by providing a structured, fair, and transparent process for groups to:
1. **Recommend** items or activities
2. **Vote** on recommendations using configurable point systems
3. **Track** completion and progress
4. **Rotate** responsibility for recommendations among members

## 🎪 Supported Use Cases

### 1. **Book Clubs**
**Purpose**: Choose next book to read and track reading progress
- **Workflow**: Members take turns recommending books, group votes, everyone reads the winning book
- **Configuration**: 3-5 book recommendations, [3,2,1] voting system, sequential turns
- **Features**: Reading progress tracking, discussion scheduling, book ratings

### 2. **Movie Nights**
**Purpose**: Select films to watch together or individually
- **Workflow**: One member recommends movies, group votes, everyone watches the winner
- **Configuration**: 1-3 movie recommendations, [3,2,1] voting system, group viewing options
- **Features**: Watch party coordination, movie ratings, genre preferences

### 3. **Restaurant Groups**
**Purpose**: Decide where to eat and explore new cuisines
- **Workflow**: Members recommend restaurants, group votes, everyone visits the chosen place
- **Configuration**: 2-4 restaurant recommendations, [3,2,1] voting system, location-based filtering
- **Features**: Restaurant reviews, cuisine tracking, reservation coordination

### 4. **Travel Planning**
**Purpose**: Select destinations and plan group trips
- **Workflow**: Members suggest destinations, group votes, plan the winning trip
- **Configuration**: 2-3 destination recommendations, [5,4,3,2,1] voting system, budget considerations
- **Features**: Itinerary planning, cost tracking, travel coordination

### 5. **Gaming Groups**
**Purpose**: Pick board games or video games for group sessions
- **Workflow**: Members recommend games, group votes, everyone plays the chosen game
- **Configuration**: 2-4 game recommendations, [3,2,1] voting system, player count filtering
- **Features**: Game ratings, session tracking, difficulty preferences

### 6. **Learning Groups**
**Purpose**: Select courses, workshops, or study materials
- **Workflow**: Members suggest learning resources, group votes, everyone studies the chosen topic
- **Configuration**: 2-3 course recommendations, [3,2,1] voting system, skill level matching
- **Features**: Progress tracking, resource sharing, study group coordination

### 7. **Event Planning**
**Purpose**: Select venues, themes, and activities for group events
- **Workflow**: Members suggest event ideas, group votes, plan the winning event
- **Configuration**: 2-3 event recommendations, [3,2,1] voting system, date coordination
- **Features**: Event coordination, RSVP tracking, theme planning

### 8. **Podcast Groups**
**Purpose**: Choose podcasts to listen to and discuss
- **Workflow**: Members recommend podcasts, group votes, everyone listens to episodes
- **Configuration**: 3-5 podcast recommendations, [3,2,1] voting system, episode selection
- **Features**: Episode tracking, discussion scheduling, podcast ratings

### 9. **TV Show Groups**
**Purpose**: Select TV shows to watch and discuss
- **Workflow**: Members recommend shows, group votes, everyone watches episodes
- **Configuration**: 1-3 show recommendations, [3,2,1] voting system, episode coordination
- **Features**: Episode tracking, watch party scheduling, show ratings

### 10. **Music Groups**
**Purpose**: Discover and share music with group members
- **Workflow**: Members recommend albums/artists, group votes, everyone listens
- **Configuration**: 3-5 music recommendations, [3,2,1] voting system, genre preferences
- **Features**: Playlist creation, music sharing, concert coordination

## 🔄 Core Workflow

### 1. **Club Creation**
- Set club name, type, and configuration
- Define voting systems, turn order, and participation requirements
- Configure club-specific settings (min/max recommendations, etc.)

### 2. **Member Management**
- Add members to the club
- Set up member profiles (name, email for future OAuth)
- Manage member permissions and roles

### 3. **Round Management**
- Start a new round with a designated recommender
- Track round status (recommending → voting → completing → finished)
- Manage turn rotation (sequential or random)

### 4. **Recommendation Phase**
- Current recommender submits items within configured limits
- Items include title, description, and metadata
- System validates recommendations against club configuration

### 5. **Voting Phase**
- All members vote on recommendations using configured point system
- System tracks participation and enforces minimum requirements
- Real-time vote counting and display

### 6. **Winner Selection**
- Close voting and determine winner based on points
- Handle ties using configured tie-breaking method
- Announce winner and transition to completion phase

### 7. **Completion Tracking**
- Members mark when they've completed the chosen item
- Track completion status for all members
- Enable discussion scheduling (Phase 2)

### 8. **Round Completion**
- Finish current round when all members complete the item
- Start next round with new recommender
- Maintain turn order and club history

## ⚙️ Configuration Options

### **Recommendation Settings**
- **Min/Max Recommendations**: Configurable per club type (e.g., books: 3-5, movies: 1-3)
- **Recommendation Format**: Title, description, metadata fields
- **Validation Rules**: Ensure recommendations meet club requirements

### **Voting Systems**
- **Point Systems**: [3,2,1] for 3 items, [5,4,3,2,1] for 5+ items
- **Voting Rules**: All members must vote, minimum participation requirements
- **Vote Validation**: Ensure points are used correctly and completely

### **Turn Management**
- **Turn Order**: Sequential (A→B→C→A) or random selection
- **Turn Duration**: Configurable time limits for each phase
- **Skip Logic**: Handle inactive members or missed turns

### **Tie-Breaking**
- **Random Selection**: System randomly picks winner
- **Recommender Decides**: Original recommender chooses
- **Re-vote**: Create new voting round with tied items

### **Participation Requirements**
- **Minimum Participation**: Percentage of members who must vote
- **Completion Requirements**: All members must complete before next round
- **Inactivity Handling**: What to do with inactive members

## 🎨 User Experience Principles

### **Simplicity First**
- Clean, intuitive interface that works on mobile and desktop
- Minimal steps to complete common tasks
- Clear visual feedback for all actions

### **Transparency**
- All votes and decisions are visible to club members
- Clear indication of current round status and next steps
- Historical data and analytics for club insights

### **Flexibility**
- Configurable settings for different club types
- Adaptable to various group sizes and preferences
- Support for different voting and recommendation styles

### **Fairness**
- Structured process ensures everyone gets a turn
- Configurable tie-breaking prevents deadlocks
- Minimum participation requirements ensure group engagement

## 🚀 Future Vision

Consensus aims to become the go-to platform for group decision-making, expanding beyond entertainment to include:
- **Professional Use Cases**: Team building, project selection, resource allocation
- **Educational Applications**: Course selection, study group coordination
- **Community Building**: Local event planning, neighborhood decisions
- **Family Coordination**: Vacation planning, activity selection, meal planning

The platform will evolve to support increasingly complex decision-making scenarios while maintaining its core simplicity and fairness principles.
