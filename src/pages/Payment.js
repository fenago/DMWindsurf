import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';

const Payment = () => {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser, userRole, ROLES, updateUserRole } = useAuth();
  const navigate = useNavigate();

  const plans = {
    monthly: {
      id: 'price_monthly',
      name: 'Monthly Subscription',
      price: '$9.99',
      interval: 'month',
      description: 'Get access to all premium features'
    },
    annual: {
      id: 'price_annual',
      name: 'Annual Subscription',
      price: '$99.99',
      interval: 'year',
      description: 'Save 17% compared to monthly billing'
    }
  };

  useEffect(() => {
    // If user is already a subscriber, show different UI
    if (userRole === ROLES.SUBSCRIBER) {
      // You could also fetch subscription details here
    }
  }, [userRole, ROLES.SUBSCRIBER]);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setProcessing(true);

    // For a real application, you would create a payment intent on your server
    // and use the client secret here. This is a simplified example.
    // The backend would handle creating the actual charge.
    try {
      // Get a reference to a mounted CardElement
      const cardElement = elements.getElement(CardElement);

      // Use card Element to tokenize payment details
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: currentUser.email,
        },
      });

      if (error) {
        setError(`Payment failed: ${error.message}`);
        setProcessing(false);
        return;
      }

      // In a real app, you would send the token to your server to create a charge
      console.log('PaymentMethod created:', paymentMethod);
      console.log('Selected plan:', plans[selectedPlan]);
      
      // Update user role to SUBSCRIBER after successful payment
      try {
        await updateUserRole(currentUser.uid, ROLES.SUBSCRIBER);
        console.log('User role updated to SUBSCRIBER');
      } catch (roleError) {
        console.error('Error updating user role:', roleError);
        // Continue with success flow even if role update fails
        // In a production app, you might want to handle this differently
      }
      
      // Show success message
      setError(null);
      setSucceeded(true);
      setProcessing(false);
      
      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    // In a real app, you would call your backend to cancel the subscription
    setProcessing(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user role back to FREE
      await updateUserRole(currentUser.uid, ROLES.FREE);
      setSucceeded(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to cancel subscription');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  // Show subscription management UI for existing subscribers
  if (userRole === ROLES.SUBSCRIBER) {
    return (
      <div className="payment-container">
        <div className="payment-form-container">
          <h2>Manage Your Subscription</h2>
          {succeeded ? (
            <div className="success-message">
              <p>Subscription canceled successfully! Redirecting...</p>
            </div>
          ) : (
            <>
              {error && <div className="error-message">{error}</div>}
              <div className="subscription-details">
                <h3>Current Plan</h3>
                <div className="current-plan-card">
                  <p className="plan-name">Premium Subscription</p>
                  <p className="plan-status">Active</p>
                </div>
                <div className="subscription-actions">
                  <button onClick={handleCancelSubscription} className="cancel-button" disabled={processing}>
                    {processing ? 'Processing...' : 'Cancel Subscription'}
                  </button>
                </div>
              </div>
            </>
          )}
          <button onClick={() => navigate('/dashboard')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-form-container">
        <h2>Subscribe to Premium</h2>
        {succeeded ? (
          <div className="success-message">
            <p>Payment successful! Your account has been upgraded. Redirecting...</p>
          </div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}
            
            <div className="plan-selector">
              <div className={`plan-option ${selectedPlan === 'monthly' ? 'selected' : ''}`} onClick={() => setSelectedPlan('monthly')}>
                <div className="plan-details">
                  <h3>{plans.monthly.name}</h3>
                  <p className="plan-price">{plans.monthly.price} / {plans.monthly.interval}</p>
                  <p className="plan-description">{plans.monthly.description}</p>
                </div>
                <div className="plan-radio">
                  <div className={`radio-inner ${selectedPlan === 'monthly' ? 'checked' : ''}`} />
                </div>
              </div>
              
              <div className={`plan-option ${selectedPlan === 'annual' ? 'selected' : ''}`} onClick={() => setSelectedPlan('annual')}>
                <div className="plan-details">
                  <h3>{plans.annual.name}</h3>
                  <p className="plan-price">{plans.annual.price} / {plans.annual.interval}</p>
                  <p className="plan-description">{plans.annual.description}</p>
                </div>
                <div className="plan-radio">
                  <div className={`radio-inner ${selectedPlan === 'annual' ? 'checked' : ''}`} />
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Card Details</label>
                <div className="card-element-container">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>
              <button
                type="submit"
                disabled={!stripe || processing}
                className="payment-button"
              >
                {processing ? 'Processing...' : `Subscribe for ${plans[selectedPlan].price}/${plans[selectedPlan].interval}`}
              </button>
            </form>
            <div className="payment-note">
              <p>This is a test payment. No actual charge will be made.</p>
              <p>Test Card: 4242 4242 4242 4242, any future date, any CVC, any ZIP</p>
            </div>
          </>
        )}
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Payment;
