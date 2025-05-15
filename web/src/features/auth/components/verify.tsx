import { api } from '@/lib/api-client';
import { useNavigate, useParams } from 'react-router';
import { useEffect } from 'react';
import { useNotifications } from '../../../components/ui/notifications';
import { useUser } from '@/lib/auth';
import { useVerificationEmailSent } from '../hooks/verification-email-sent';

export function VerifyPage() {
  const { token } = useParams();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  useEffect(() => {
    if (token) {
      api
        .post('/auth/verify', {
          token,
        })
        .then((res) => {
          console.log(res);
          addNotification({
            title: 'Account verified',
            message: 'Your account has been successfully verified.',
            type: 'success',
          });
          navigate('/login');
        })
        .catch((error) => {
          console.error('Verification failed:', error);
          console.log(error.response.data.detail);
          if (error.response.data.detail == 'VERIFY_USER_BAD_TOKEN') {
            addNotification({
              title: 'Verification failed',
              message: 'The verification token is invalid or has expired.',
              type: 'error',
            });
          }
        });
    }
  }, [token]);

  return <div className="flex m-5">Verifying your account. Please wait</div>;
}

export function VerifyPrompt() {
  const user = useUser();
  const { addNotification } = useNotifications();
  const { setSent, sent } = useVerificationEmailSent();

  if (user.data?.is_verified || sent || user.data == null) {
    return null;
  }

  return (
    <div className="flex bg-amber-100 p-2 text-amber-800 font-md m-auto text-sm">
      <span className="p-1">
        Verify your account to access additional features.
      </span>
      <button
        className="ml-auto outline rounded p-1 hover:bg-amber-200 cursor-pointer"
        onClick={() => {
          api
            .post('/auth/request-verify-token', {
              email: user.data?.email,
            })
            .then(() => {
              addNotification({
                title: 'Verification Email Sent',
                message: 'Please check your email for the verification link.',
                type: 'success',
              });
              setSent();
            })
            .catch((error) => {
              console.error('Error sending verification email:', error);
              addNotification({
                title: 'Error',
                message: 'There was an error sending the verification email.',
                type: 'error',
              });
            });
        }}
      >
        Send Email
      </button>
    </div>
  );
}
