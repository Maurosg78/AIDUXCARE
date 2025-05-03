import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FeedbackFormData {
  intuitiveness: 'very' | 'clear' | 'confusing' | 'difficult';
  voiceInput: 'useful' | 'unclear' | 'interested' | 'not-interested';
  aiSuggestions: 'very-useful' | 'interesting' | 'not-useful' | 'not-seen';
  security: 'definitely' | 'somewhat' | 'not-noticed' | 'not-believe';
  futureFeatures: string;
  additionalComments: string;
}

const FeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    intuitiveness: 'clear',
    voiceInput: 'interested',
    aiSuggestions: 'interesting',
    security: 'somewhat',
    futureFeatures: '',
    additionalComments: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Error al enviar el feedback');
      
      alert('¡Gracias por tu feedback!');
      setFormData({
        intuitiveness: 'clear',
        voiceInput: 'interested',
        aiSuggestions: 'interesting',
        security: 'somewhat',
        futureFeatures: '',
        additionalComments: ''
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al enviar el feedback. Por favor, intenta de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>📝 Formulario de Feedback — Prueba de AiDuxCare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-gray-600">
            Gracias por participar en la prueba inicial de AiDuxCare. Este formulario tiene como objetivo recoger tu experiencia real como fisioterapeuta usando el sistema. No se recopilan datos personales.
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. 🧠 ¿Qué tan intuitiva te resultó la ficha clínica?</h3>
            <RadioGroup
              value={formData.intuitiveness}
              onValueChange={(value) => setFormData({ ...formData, intuitiveness: value as FeedbackFormData['intuitiveness'] })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very" id="intuitiveness-very" />
                <Label htmlFor="intuitiveness-very">Muy intuitiva</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="clear" id="intuitiveness-clear" />
                <Label htmlFor="intuitiveness-clear">Bastante clara, con leves dudas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="confusing" id="intuitiveness-confusing" />
                <Label htmlFor="intuitiveness-confusing">Tuve que detenerme a pensar varias veces</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="difficult" id="intuitiveness-difficult" />
                <Label htmlFor="intuitiveness-difficult">Confusa, difícil de usar</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">2. 🎙️ ¿Utilizaste la función de escucha activa (micrófono)?</h3>
            <RadioGroup
              value={formData.voiceInput}
              onValueChange={(value) => setFormData({ ...formData, voiceInput: value as FeedbackFormData['voiceInput'] })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="useful" id="voice-useful" />
                <Label htmlFor="voice-useful">Sí, y me pareció útil</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unclear" id="voice-unclear" />
                <Label htmlFor="voice-unclear">Sí, pero no entendí cómo funcionaba</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interested" id="voice-interested" />
                <Label htmlFor="voice-interested">No, pero me interesa usarla</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-interested" id="voice-not-interested" />
                <Label htmlFor="voice-not-interested">No, no me interesa esa función</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">3. 🤖 ¿Te parecieron útiles las sugerencias del asistente (IA)?</h3>
            <RadioGroup
              value={formData.aiSuggestions}
              onValueChange={(value) => setFormData({ ...formData, aiSuggestions: value as FeedbackFormData['aiSuggestions'] })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-useful" id="ai-very-useful" />
                <Label htmlFor="ai-very-useful">Muy útiles, me ahorraron trabajo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interesting" id="ai-interesting" />
                <Label htmlFor="ai-interesting">Interesantes, pero no siempre relevantes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-useful" id="ai-not-useful" />
                <Label htmlFor="ai-not-useful">No aportaron mucho</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-seen" id="ai-not-seen" />
                <Label htmlFor="ai-not-seen">No las vi o no las entendí</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">4. 🛡️ ¿Sentiste que el sistema mejora la seguridad y calidad de tu documentación?</h3>
            <RadioGroup
              value={formData.security}
              onValueChange={(value) => setFormData({ ...formData, security: value as FeedbackFormData['security'] })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="definitely" id="security-definitely" />
                <Label htmlFor="security-definitely">Sí, definitivamente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="somewhat" id="security-somewhat" />
                <Label htmlFor="security-somewhat">Algo, pero necesita mejorar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-noticed" id="security-not-noticed" />
                <Label htmlFor="security-not-noticed">No lo noté</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-believe" id="security-not-believe" />
                <Label htmlFor="security-not-believe">No lo creo</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">5. 📋 ¿Qué función te gustaría que tuviera AiDuxCare en el futuro?</h3>
            <Textarea
              value={formData.futureFeatures}
              onChange={(e) => setFormData({ ...formData, futureFeatures: e.target.value })}
              placeholder="Escribe aquí tus sugerencias..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">6. 🗣️ ¿Algo que quieras compartir sobre tu experiencia?</h3>
            <Textarea
              value={formData.additionalComments}
              onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
              placeholder="Comparte tus comentarios adicionales..."
              className="min-h-[100px]"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">
              Enviar Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default FeedbackForm; 