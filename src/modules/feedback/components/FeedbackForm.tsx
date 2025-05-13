import { useState  } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Box, TextField, Typography, Rating, CircularProgress } from '@mui/material';
import type { ChangeEvent, FormEvent } from 'react';

interface FeedbackFormData {
  intuitiveness: 'very' | 'clear' | 'confusing' | 'difficult';
  voiceInput: 'useful' | 'unclear' | 'interested' | 'not-interested';
  aiSuggestions: 'very-useful' | 'interesting' | 'not-useful' | 'not-seen';
  security: 'definitely' | 'somewhat' | 'not-noticed' | 'not-believe';
  futureFeatures: string;
  additionalComments: string;
}

interface FeedbackData {
  rating: number;
  comment: string;
  category: string;
  metadata?: {
    [key: string]: any;
  };
}

interface FeedbackFormProps {
  onSubmit: (data: FeedbackData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<FeedbackData>;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<FeedbackData>({
    rating: initialData?.rating || 0,
    comment: initialData?.comment || '',
    category: initialData?.category || 'general',
    metadata: initialData?.metadata || {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (_: unknown, newValue: number | null) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue || 0
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Enviar Feedback
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography component="legend">Calificación</Typography>
        <Rating
          name="rating"
          value={formData.rating}
          onChange={handleRatingChange}
          precision={0.5}
        />
      </Box>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Comentario"
        name="comment"
        value={formData.comment}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        label="Categoría"
        name="category"
        value={formData.category}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Enviar'}
            </Button>
      </Box>
    </Box>
  );
};

export default FeedbackForm; 