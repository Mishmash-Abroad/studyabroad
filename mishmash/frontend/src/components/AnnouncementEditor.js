import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Markdown } from 'tiptap-markdown';
import { styled } from '@mui/material/styles';
import axiosInstance from '../utils/axios';
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Divider,
  Tooltip,
  Stack,
  Box,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  TableChart,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckBox,
} from '@mui/icons-material';

const EditorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  boxShadow: theme.customShadows.card,
  maxHeight: 'calc(100vh - 100px)', // Leave room for navigation and margins
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
}));

const EditorContentContainer = styled(Box)({
  flex: 1,
  minHeight: '200px',
  maxHeight: '60vh', // Prevent it from getting too large
  overflow: 'auto',
});

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    height: '100%',
    display: 'flex',
  },
  '& .MuiInputBase-input': {
    flex: 1,
    minHeight: '300px !important',
  },
});

const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'active'
})(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : 'inherit',
  '&:hover': {
    color: theme.palette.primary.main,
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
  const [importance, setImportance] = useState(initialData?.importance || 'low');
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [isMarkdownRendered, setIsMarkdownRendered] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
      }),
      CodeBlock,
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListClass: 'tight',
        bulletListMarker: '-',
        linkify: true,
      }),
    ],
    editable: true,
    content: initialData?.content || '',
  });

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const insertImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleMarkdownToggle = () => {
    if (isMarkdownMode) {
      // Convert markdown to editor content
      editor.commands.setContent(markdownContent, {
        parseOptions: { preserveWhitespace: 'full' }
      });
      setIsMarkdownRendered(true);
    } else {
      // Convert editor content to markdown
      const markdown = editor.storage.markdown.getMarkdown();
      setMarkdownContent(markdown);
      setIsMarkdownRendered(false);
    }
    setIsMarkdownMode(!isMarkdownMode);
  };

  const handleRenderMarkdown = () => {
    editor.commands.setContent(markdownContent, {
      parseOptions: { preserveWhitespace: 'full' }
    });
    setIsMarkdownMode(false);
    setIsMarkdownRendered(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    if (isMarkdownMode && !isMarkdownRendered) {
      // If we're in markdown mode and haven't rendered yet, show an error or warning
      alert('Please render your markdown first before saving');
      return;
    }

    setSaving(true);
    try {
      const content = editor.getHTML();
      const announcementData = {
        title: title.trim(),
        content,
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
        setMarkdownContent('');
        editor.commands.clearContent();
        setImportance('low');
        setIsMarkdownMode(false);
        setIsMarkdownRendered(false);
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditorContainer>
      <Stack spacing={2} sx={{ height: '100%' }}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />
        
        <FormControl fullWidth>
          <InputLabel>Importance</InputLabel>
          <Select
            value={importance}
            onChange={(e) => setImportance(e.target.value)}
            label="Importance"
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleMarkdownToggle}
          >
            {isMarkdownMode ? 'Rich Text' : 'Markdown'}
          </Button>
          
          {!isMarkdownMode && (
            <>
              <Tooltip title="Bold">
                <IconButton onClick={() => editor.chain().focus().toggleBold().run()}>
                  <FormatBold />
                </IconButton>
              </Tooltip>
              <Tooltip title="Italic">
                <IconButton onClick={() => editor.chain().focus().toggleItalic().run()}>
                  <FormatItalic />
                </IconButton>
              </Tooltip>
              <Tooltip title="Bullet List">
                <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()}>
                  <FormatListBulleted />
                </IconButton>
              </Tooltip>
              <Tooltip title="Numbered List">
                <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                  <FormatListNumbered />
                </IconButton>
              </Tooltip>
              <Tooltip title="Insert Table">
                <IconButton onClick={insertTable}>
                  <TableChart />
                </IconButton>
              </Tooltip>
              <Tooltip title="Code Block">
                <IconButton onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                  <Code />
                </IconButton>
              </Tooltip>
              <Tooltip title="Insert Link">
                <IconButton onClick={insertLink}>
                  <LinkIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Insert Image">
                <IconButton onClick={insertImage}>
                  <ImageIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Task List">
                <IconButton onClick={() => editor.chain().focus().toggleTaskList().run()}>
                  <CheckBox />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>

        <EditorContentContainer>
          {isMarkdownMode ? (
            <StyledTextField
              multiline
              fullWidth
              value={markdownContent}
              onChange={(e) => {
                setMarkdownContent(e.target.value);
                setIsMarkdownRendered(false);
              }}
              placeholder="Enter markdown content..."
            />
          ) : (
            <StyledEditorContent editor={editor} />
          )}
        </EditorContentContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={isMarkdownMode ? handleRenderMarkdown : handleSave}
            disabled={saving || !title.trim()}
          >
            {isMarkdownMode ? 'Render Markdown' : (saving ? 'Saving...' : (initialData ? 'Update' : 'Post') + ' Announcement')}
          </Button>
        </Box>
      </Stack>
    </EditorContainer>
  );
};

export default AnnouncementEditor;
