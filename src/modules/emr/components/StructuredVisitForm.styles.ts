import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  textarea: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    minHeight: '100px',
    fontSize: '16px',
    fontFamily: 'inherit'
  },
  error: {
    color: '#dc3545',
    fontSize: '14px'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px'
  },
  success: {
    backgroundColor: '#198754',
    color: 'white',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  suggestion: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    borderLeft: '4px solid #0066cc'
  },
  suggestionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  suggestionText: {
    fontSize: '14px',
    color: '#333',
    marginBottom: '8px'
  },
  suggestionButton: {
    padding: '4px 8px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  voiceNotes: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  voiceNotesTitle: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '10px'
  },
  voiceNotesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  voiceNote: {
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#333'
  }
}; 