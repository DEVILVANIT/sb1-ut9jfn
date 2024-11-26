import React, { useState, useEffect } from 'react';
import Sentiment from 'sentiment';
import { Microphone, Stop } from '@emotion-icons/heroicons-outline';
import { motion } from 'framer-motion';

const sentiment = new Sentiment();

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [emotion, setEmotion] = useState({ score: 0, comparative: 0 });
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          const result = sentiment.analyze(finalTranscript);
          setEmotion(result);
        }
      };

      setRecognition(recognition);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const getEmotionColor = () => {
    if (emotion.comparative > 0.5) return 'bg-green-500';
    if (emotion.comparative < -0.5) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getEmotionLabel = () => {
    if (emotion.comparative > 0.5) return 'Positive';
    if (emotion.comparative < -0.5) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Speech Emotion Detection</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-center mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? stopListening : startListening}
              className={`p-4 rounded-full ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white`}
            >
              {isListening ? (
                <Stop size={24} />
              ) : (
                <Microphone size={24} />
              )}
            </motion.button>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Transcript:</h2>
            <div className="p-4 bg-gray-50 rounded-lg min-h-[100px]">
              {transcript || 'Start speaking...'}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">Emotion:</span>
              <span className={`px-4 py-2 rounded-full text-white ${getEmotionColor()}`}>
                {getEmotionLabel()}
              </span>
            </div>
            
            <motion.div 
              className="h-4 bg-gray-200 rounded-full overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
            >
              <motion.div 
                className={`h-full ${getEmotionColor()}`}
                initial={{ width: '50%' }}
                animate={{ width: `${(emotion.comparative + 1) * 50}%` }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>

            <div className="text-sm text-gray-600">
              Score: {emotion.score} | Comparative: {emotion.comparative.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">How it works:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Click the microphone button to start recording</li>
            <li>Speak clearly into your microphone</li>
            <li>The app will transcribe your speech in real-time</li>
            <li>Sentiment analysis will be performed on your speech</li>
            <li>The emotion will be displayed with a color-coded indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;