#!/bin/bash

echo "🔍 Contact Form Configuration Test"
echo "=================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "📝 Run: cp .env.example .env"
    echo "📝 Then update .env with your actual credentials"
    exit 1
fi

echo "✅ .env file found"

# Check if required environment variables are set
echo ""
echo "🔧 Checking environment variables..."

# Source the .env file to check variables
if grep -q "^VITE_MY_EMAIL=" .env && ! grep -q "^VITE_MY_EMAIL=your-email@example.com" .env; then
    echo "✅ VITE_MY_EMAIL is configured"
else
    echo "❌ VITE_MY_EMAIL not configured or still using placeholder"
fi

if grep -q "^VITE_EMAILJS_SERVICE_ID=" .env && ! grep -q "^VITE_EMAILJS_SERVICE_ID=your_service_id" .env; then
    echo "✅ VITE_EMAILJS_SERVICE_ID is configured"
else
    echo "❌ VITE_EMAILJS_SERVICE_ID not configured or still using placeholder"
fi

if grep -q "^VITE_EMAILJS_TEMPLATE_ID=" .env && ! grep -q "^VITE_EMAILJS_TEMPLATE_ID=your_template_id" .env; then
    echo "✅ VITE_EMAILJS_TEMPLATE_ID is configured"
else
    echo "❌ VITE_EMAILJS_TEMPLATE_ID not configured or still using placeholder"
fi

if grep -q "^VITE_EMAILJS_PUBLIC_KEY=" .env && ! grep -q "^VITE_EMAILJS_PUBLIC_KEY=your_public_key" .env; then
    echo "✅ VITE_EMAILJS_PUBLIC_KEY is configured"
else
    echo "❌ VITE_EMAILJS_PUBLIC_KEY not configured or still using placeholder"
fi

echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your actual credentials"
echo "2. Run: npm run dev"
echo "3. Test the contact form at http://localhost:5173"
echo "4. Check browser console for any errors"
echo ""
echo "📖 See CONTACT_FORM_TESTING.md for detailed instructions"