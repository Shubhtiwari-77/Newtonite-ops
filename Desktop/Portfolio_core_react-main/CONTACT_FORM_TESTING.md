# Contact Form Testing Instructions

## Setup Environment Variables

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual credentials:
   - `VITE_MY_EMAIL`: Your email address where form submissions should be sent
   - `VITE_EMAILJS_SERVICE_ID`: Your EmailJS service ID
   - `VITE_EMAILJS_TEMPLATE_ID`: Your EmailJS template ID  
   - `VITE_EMAILJS_PUBLIC_KEY`: Your EmailJS public key

## EmailJS Setup

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Create an account or log in
3. Create a new Email Service (Gmail, Outlook, etc.)
4. Create an Email Template with these variables:
   - `{{from_name}}` - Sender's name
   - `{{from_email}}` - Sender's email
   - `{{from_phone}}` - Sender's phone
   - `{{message}}` - Message content
5. Make sure your template sends emails to your desired recipient email
6. Copy the service ID, template ID, and public key to your `.env` file

## Testing Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173 in your browser

3. Scroll down to the "Let's Talk" section

4. Fill out the contact form:
   - Your name
   - Your email  
   - Phone number
   - Project description

5. Click "Send Contact Request Now"

6. Check for:
   - Success toast message appears
   - Form resets after submission
   - Email arrives at your configured recipient address
   - Console shows "SUCCESS!" message (check browser dev tools)

## Troubleshooting

- If form fails: Check browser console for errors
- If no email received: Verify EmailJS template configuration
- If environment variables not loading: Restart the dev server after changing `.env`
- Make sure your EmailJS template is configured to send to the correct recipient email

## Test Checklist

- [ ] Environment variables loaded correctly
- [ ] Form displays your email in header and footer
- [ ] Form submission shows loading spinner
- [ ] Success message appears after submission
- [ ] Form clears after successful submission
- [ ] Email received at configured address
- [ ] Email contains all form field data