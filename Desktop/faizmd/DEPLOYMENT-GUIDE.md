# QuickShare - Deployment Guide for shubhtiwari.xyz

## ✅ Step 1: Code Pushed Successfully
Your code has been pushed to: https://github.com/Shubhtiwari-77/Quickshare

## 🌐 Step 2: Configure DNS Settings

You need to configure your DNS records at your domain registrar (where you bought shubhtiwari.xyz):

### Option A: Using CNAME (Recommended if using www)
Add this CNAME record:
```
Type: CNAME
Name: www
Value: shubhtiwari-77.github.io
TTL: 3600
```

### Option B: Using A Records (For apex domain - shubhtiwari.xyz)
Add these A records:
```
Type: A
Name: @
Value: 185.199.108.153
TTL: 3600

Type: A
Name: @
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @
Value: 185.199.111.153
TTL: 3600
```

### For Both www and apex domain:
Add both the CNAME record (for www) and A records (for @).

## 📝 Step 3: Enable GitHub Pages

1. Go to: https://github.com/Shubhtiwari-77/Quickshare/settings/pages

2. Under **"Source"**:
   - Select branch: **main**
   - Select folder: **/ (root)**
   - Click **Save**

3. Under **"Custom domain"**:
   - The CNAME file has already been created with `shubhtiwari.xyz`
   - GitHub should detect it automatically
   - If not, enter: `shubhtiwari.xyz`
   - Click **Save**

4. Wait a few minutes, then check the box:
   - ✅ **Enforce HTTPS** (this will be available after DNS propagates)

## ⏱️ Step 4: Wait for DNS Propagation

- DNS changes can take **10 minutes to 48 hours** (usually within 1 hour)
- Check DNS propagation at: https://www.whatsmydns.net/#A/shubhtiwari.xyz

## 🔒 Step 5: HTTPS Certificate (Automatic)

Once DNS is configured:
1. GitHub will automatically provision a Let's Encrypt SSL certificate
2. This can take up to **1 hour** after DNS propagation
3. Your site will be accessible via HTTPS: `https://shubhtiwari.xyz`

If HTTPS doesn't work:
- Remove and re-add the custom domain in GitHub Pages settings
- Wait another hour

## 🎯 Step 6: Verify CAA Records (Optional but Recommended)

If you're using CAA records for security, add this to your DNS:
```
Type: CAA
Name: @
Value: 0 issue "letsencrypt.org"
TTL: 3600
```

## ✨ Your Site Will Be Live At:
- **https://shubhtiwari.xyz** (primary)
- **https://www.shubhtiwari.xyz** (if CNAME configured)

## 🔧 Troubleshooting

### Issue: "Domain is already taken"
1. Go to: https://github.com/settings/pages
2. Click **"Verify"** next to your domain
3. Add the TXT record to your DNS
4. Click **"Verify domain"**

### Issue: HTTPS not working after 1 hour
1. Go to GitHub Pages settings
2. Remove custom domain → Save
3. Re-add custom domain → Save
4. Wait another hour

### Issue: DNS not propagating
- Check your domain registrar's DNS settings
- Make sure you're editing the correct DNS zone
- Try flushing your local DNS: `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder`

### Issue: 404 Error
- Make sure `index.html` is in the root of your repository
- Check that GitHub Pages is enabled and using the **main** branch

## 📱 Test Your Deployment

Once DNS propagates, test:
1. Visit: https://shubhtiwari.xyz
2. Visit: https://shubhtiwari.xyz/quick-order.html
3. Check HTTPS padlock icon in browser
4. Test on mobile device

## 🚀 Future Updates

To update your live site:
```bash
cd /Users/testuser/Desktop/faizmd
git add .
git commit -m "Update description"
git push quickshare vanilla-html:main
```

Changes will be live within 1-2 minutes!

## 📊 Current Status

✅ Code pushed to GitHub  
⏳ DNS Configuration (You need to do this)  
⏳ GitHub Pages enabled (You need to do this)  
⏳ HTTPS Certificate (Automatic after DNS)  

---

**Next Steps:**
1. Configure DNS at your domain registrar
2. Enable GitHub Pages with custom domain
3. Wait for DNS to propagate
4. Enable HTTPS
5. Your site will be live! 🎉
