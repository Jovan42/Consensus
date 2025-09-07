# Member Notes Feature Documentation

This document describes the member notes feature that allows users to keep private notes for each round in their clubs.

## 🌟 Overview

The member notes feature provides a way for club members to keep private, personal notes about each round. These notes are completely private and only visible to the member who created them - not even club admins can see them.

## 🎯 Use Cases

- **Reading Notes**: Keep track of thoughts, quotes, and insights while reading a book
- **Movie Reviews**: Write personal reviews and thoughts about movies watched
- **Gaming Notes**: Record strategies, achievements, or memorable moments from games
- **General Reflection**: Any personal thoughts or observations about the round's content

## 🔒 Privacy & Security

- **Complete Privacy**: Notes are only visible to the member who created them
- **Admin Access**: Even club administrators cannot view member notes
- **Data Isolation**: Each member's notes are completely separate from others
- **Secure Storage**: Notes are stored securely in the database with proper access controls

## 🏗️ Technical Implementation

### Database Schema

The `member_notes` table stores all private notes:

```sql
CREATE TABLE member_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT,
  title VARCHAR(255),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(member_id, round_id)
);
```

### API Endpoints

- `GET /api/member-notes/round/:roundId` - Get or create a note for a specific round
- `PUT /api/member-notes/:noteId` - Update a note
- `GET /api/member-notes` - Get all notes for the authenticated member
- `DELETE /api/member-notes/:noteId` - Delete a note

### Frontend Components

- **NotesSection**: Main component that manages the notes interface
- **NotesButton**: Button to add/edit notes
- **NotesEditor**: Modal editor for creating/editing notes
- **NotesDisplay**: Component to show note summaries

## 🎨 User Interface

### Notes Button

Each round page includes a "My Private Notes" section with:
- **Add Notes** button (when no notes exist)
- **Edit Notes** button (when notes exist)
- **Note Summary** display (when notes exist)

### Notes Editor

A modal dialog that provides:
- **Title Field**: Optional title for the notes
- **Content Area**: Large text area for the main notes
- **Save/Cancel**: Action buttons with unsaved changes warning
- **Privacy Notice**: Clear indication that notes are private

### Notes Display

Shows a summary of existing notes:
- **Title**: Note title (if provided)
- **Content Preview**: Truncated content with "..." if too long
- **Last Updated**: Timestamp of last modification
- **Edit Link**: Quick access to edit the notes

## 🔧 Usage Guide

### Adding Notes

1. Navigate to any round page
2. Scroll to the "My Private Notes" section
3. Click "Add Notes"
4. Enter an optional title and your notes content
5. Click "Save Notes"

### Editing Notes

1. On a round page with existing notes, click "Edit Notes"
2. Modify the title and/or content
3. Click "Save Notes" to save changes
4. Or click "Cancel" to discard changes (with confirmation if unsaved)

### Viewing All Notes

1. Navigate to your profile page
2. Access the "My Notes" section (future feature)
3. View all your notes across all rounds

## 🛡️ Security Features

### Access Control

- **Authentication Required**: All note operations require valid authentication
- **Member Verification**: Only the note owner can access their notes
- **Club Membership**: Users can only create notes for rounds in clubs they belong to
- **Cascade Deletion**: Notes are automatically deleted when members leave clubs or rounds are deleted

### Data Validation

- **Title Length**: Maximum 255 characters
- **Content**: No length limit (stored as TEXT)
- **Input Sanitization**: All input is properly validated and sanitized
- **SQL Injection Protection**: Using parameterized queries

## 📱 Responsive Design

The notes feature works seamlessly across all devices:
- **Desktop**: Full modal editor with large text areas
- **Tablet**: Responsive modal that adapts to screen size
- **Mobile**: Touch-friendly interface with appropriate sizing

## 🎨 Theme Support

The notes feature fully supports both light and dark themes:
- **Consistent Styling**: Uses the centralized color system
- **Theme Toggle**: Automatically adapts when users switch themes
- **Accessibility**: Maintains proper contrast ratios in both themes

## 🔮 Future Enhancements

### Planned Features

- **Rich Text Editor**: Support for formatting, links, and lists
- **Note Categories**: Organize notes by type (quotes, thoughts, reviews)
- **Search Functionality**: Search through all personal notes
- **Export Options**: Export notes to PDF or text files
- **Note Templates**: Pre-defined templates for different content types
- **Tags**: Add tags to organize and filter notes

### Potential Integrations

- **Calendar Integration**: Link notes to specific dates
- **Book/Movie APIs**: Auto-populate titles and metadata
- **Social Features**: Optional sharing of non-private notes
- **Analytics**: Personal reading/viewing statistics

## 🐛 Troubleshooting

### Common Issues

1. **Notes Not Saving**
   - Check internet connection
   - Verify you're logged in
   - Try refreshing the page

2. **Notes Not Loading**
   - Clear browser cache
   - Check if you're a member of the club
   - Verify the round exists

3. **Editor Not Opening**
   - Check browser console for errors
   - Ensure JavaScript is enabled
   - Try a different browser

### Error Messages

- **"You are not a member of this club"**: You need to be a club member to create notes
- **"You can only edit your own notes"**: Security error - contact support if this persists
- **"Note not found"**: The note may have been deleted or you don't have access

## 📊 Performance Considerations

- **Lazy Loading**: Notes are only loaded when needed
- **Efficient Queries**: Database queries are optimized with proper indexes
- **Caching**: Note data is cached to reduce API calls
- **Pagination**: Future support for large numbers of notes

## 🤝 Contributing

When working with the notes feature:

1. **Always respect privacy**: Never add features that compromise note privacy
2. **Test thoroughly**: Ensure notes work in both light and dark themes
3. **Follow patterns**: Use the established component patterns
4. **Document changes**: Update this documentation for any modifications

## 📚 Related Documentation

- [API Endpoints](./API-ENDPOINTS.md#member-notes) - Complete API documentation
- [Database Schema](./DATABASE-SCHEMA.md#7-member_notes) - Database structure
- [Color System](../apps/consensus-web/docs/COLOR-SYSTEM.md) - UI styling guidelines
- [Theme System](./THEME-SYSTEM.md) - Theme implementation details

---

The member notes feature enhances the Consensus experience by allowing users to maintain personal records of their journey through each round, creating a more engaging and reflective experience.
