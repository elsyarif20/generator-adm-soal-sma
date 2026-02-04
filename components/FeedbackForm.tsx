import React, { useState } from 'react';

interface FeedbackFormProps {
  onFeedbackSubmit: (rating: number, comment: string) => void;
}

interface StarProps {
  filled: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

// FIX: Explicitly typed Star as a React.FC to ensure TypeScript correctly handles
// the special 'key' prop when the component is used in a list, resolving the type error.
const Star: React.FC<StarProps> = ({ filled, onClick, onMouseEnter }) => (
  <svg onClick={onClick} onMouseEnter={onMouseEnter} className={`w-8 h-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onFeedbackSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      // More robust feedback could be added here
      return;
    }
    onFeedbackSubmit(rating, comment);
    setRating(0);
    setComment('');
  };

  return (
    <div className="bg-white rounded-lg card-shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Beri Masukan & Evaluasi</h2>
      <p className="text-gray-600 mb-6">Masukan Anda sangat berharga untuk membantu kami meningkatkan aplikasi ini.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating Anda</label>
          <div className="flex space-x-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                    key={star}
                    filled={(hoverRating || rating) >= star} 
                    onClick={() => setRating(star)} 
                    onMouseEnter={() => setHoverRating(star)}
                />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700">Komentar (Opsional)</label>
          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Tulis komentar, saran, atau laporan bug di sini..."
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            disabled={rating === 0}
          >
            Kirim Masukan
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;