import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiStar } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './Testimonials.css';

const defaultTestimonials = [
  {
    text: 'Working with Jonathan was an absolute pleasure. He delivered a world-class design system that our entire team now relies on. The attention to detail and communication throughout the project was exceptional.',
    name: 'Arjun Sharma',
    role: 'CEO, TechStartup',
    stars: 5,
  },
  {
    text: 'Jonathan turned our complex product vision into a clean, user-friendly interface. Deliveries were always on time and the quality was beyond what we expected. Would highly recommend.',
    name: 'Priya Nair',
    role: 'Founder, DesignCo',
    stars: 5,
  },
  {
    text: 'The best designer I\'ve worked with remotely. Jonathan deeply understands user psychology and applies it to every decision. Our user retention increased by 35% after the redesign.',
    name: 'Mike Johnson',
    role: 'Product Manager, SaasCorp',
    stars: 5,
  },
];

export default function Testimonials() {
  const [reviews, setReviews] = useState(defaultTestimonials);
  const [active, setActive] = useState(0);
  const [userToken, setUserToken] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ text: '', role: '', stars: 5 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  // Use the correct API base URL
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/reviews`);
      if (data && data.length > 0) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const prev = () => setActive(p => (p - 1 + reviews.length) % reviews.length);
  const next = () => setActive(p => (p + 1) % reviews.length);

  const handleLoginSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    setUserToken(token);
    
    try {
      const { data } = await axios.post(`${API_URL}/api/reviews/me`, { token });
      if (data.review) {
        setNewReview({
          text: data.review.text || '',
          role: data.review.role || '',
          stars: data.review.stars || 5
        });
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Failed to fetch own review', err);
    }
    
    setShowReviewForm(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReview.text.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const { data } = await axios.post(`${API_URL}/api/reviews`, {
        token: userToken,
        text: newReview.text,
        role: newReview.role,
        stars: newReview.stars,
      });
      
      if (data.isNew || !isEditing) {
        setReviews([data.review, ...reviews]);
      } else {
        setReviews(reviews.map(r => (r._id === data.review._id ? data.review : r)));
      }
      
      setShowReviewForm(false);
      setNewReview({ text: '', role: '', stars: 5 });
      setActive(0);
      setMessage(isEditing ? 'Review updated successfully!' : 'Review submitted successfully!');
      setIsEditing(true);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section testimonials-section" ref={ref}>
      <div className="container">
        <div className="testimonials-wrap">
          <motion.div
            className="testimonials-inner"
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {/* Floating Nav Buttons */}
            {reviews.length > 1 && (
              <>
                <button className="nav-btn nav-prev" onClick={prev} aria-label="Previous"><FiArrowLeft /></button>
                <button className="nav-btn nav-next" onClick={next} aria-label="Next"><FiArrowRight /></button>
              </>
            )}

            {/* Stars */}
            <div className="stars-row">
              {[...Array(reviews[active]?.stars || 5)].map((_, i) => (
                <span key={i} className="star">☆</span>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="testimonial-quote"
              >
                "{reviews[active]?.text}"
              </motion.blockquote>
            </AnimatePresence>

            <div className="testimonial-author">
              {reviews[active]?.avatar && (
                <img src={reviews[active].avatar} alt={reviews[active].name} className="reviewer-avatar" />
              )}
              <span className="author-name">{reviews[active]?.name}</span>
              <span className="author-role">{reviews[active]?.role}</span>
            </div>

            {/* Review Submission Area */}
            <div className="review-action-area">
              {message && <div className="review-message">{message}</div>}
              
              {!userToken ? (
                <div className="google-login-wrapper">
                  <p>Write a review:</p>
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => setMessage('Login Failed')}
                    useOneTap
                  />
                </div>
              ) : showReviewForm ? (
                <form className="review-form" onSubmit={submitReview}>
                  <textarea
                    placeholder="Write your review here..."
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    required
                    className="review-input"
                    rows="3"
                  />
                  <div className="review-form-row">
                    <input
                      type="text"
                      placeholder="Your Role/Company (Optional)"
                      value={newReview.role}
                      onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                      className="review-input"
                    />
                    <div className="star-selector">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`star-icon ${newReview.stars >= star ? 'filled' : ''}`}
                          onClick={() => setNewReview({ ...newReview, stars: star })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="review-form-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowReviewForm(false)}>Cancel</button>
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              ) : (
                <button className="write-review-btn" onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </button>
              )}
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
