import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { styled } from '@mui/material/styles';
import {
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TitleIcon from '@mui/icons-material/Title';
import axiosInstance from '../utils/axios';

const EditorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius.large,
  boxShadow: theme.customShadows.card,
}));

const MenuBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius.medium,
  backgroundColor: theme.palette.background.default,
}));

const StyledIconButton = styled(IconButton)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledEditorContent = styled(EditorContent)(({ theme }) => ({
  '& .ProseMirror': {
    minHeight: '200px',
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.border.light}`,
    borderRadius: theme.shape.borderRadius.medium,
    '&:focus': {
      outline: 'none',
      border: `1px solid ${theme.palette.primary.main}`,
    },
    '& p': {
      margin: '0.5em 0',
    },
    '& h1': {
      fontSize: '1.5em',
      fontWeight: 'bold',
      margin: '1em 0 0.5em',
    },
    '& ul, & ol': {
      padding: '0 1rem',
    },
  },
}));

const AnnouncementEditor = ({ onSave, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [importance, setImportance] = useState(initialData?.importance || 'medium');
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialData?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  const handleSave = async () => {
    if (!title.trim() || !editor?.getJSON()) {
      return;
    }

    setSaving(true);
    try {
      const announcementData = {
        title: title.trim(),
        content: editor.getJSON(),
        importance,
      };

      if (initialData?.id) {
        await axiosInstance.patch(`/api/announcements/${initialData.id}/`, announcementData);
      } else {
        await axiosInstance.post('/api/announcements/', announcementData);
      }

      if (onSave) {
        onSave();
      }
      
      // Clear form if it's a new announcement
      if (!initialData?.id) {
        setTitle('');
        editor.commands.clearContent();
        setImportance('medium');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <EditorContainer>
      <TextField
        fullWidth
        label="Announcement Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        variant="outlined"
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel>Importance Level</InputLabel>
        <Select
          value={importance}
          onChange={(e) => setImportance(e.target.value)}
          label="Importance Level"
        >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="urgent">Urgent</MenuItem>
        </Select>
      </FormControl>

      <MenuBar>
        <Tooltip title="Bold">
          <StyledIconButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <FormatBoldIcon />
          </StyledIconButton>
        </Tooltip>
        
        <Tooltip title="Italic">
          <StyledIconButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <FormatItalicIcon />
          </StyledIconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        <Tooltip title="Heading">
          <StyledIconButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
          >
            <TitleIcon />
          </StyledIconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        <Tooltip title="Bullet List">
          <StyledIconButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <FormatListBulletedIcon />
          </StyledIconButton>
        </Tooltip>

        <Tooltip title="Numbered List">
          <StyledIconButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          >
            <FormatListNumberedIcon />
          </StyledIconButton>
        </Tooltip>
      </MenuBar>

      <StyledEditorContent editor={editor} />

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !title.trim() || !editor.getHTML()}
        >
          {saving ? 'Saving...' : (initialData ? 'Update' : 'Post')} Announcement
        </Button>
      </Box>
    </EditorContainer>
  );
};

export default AnnouncementEditor;
