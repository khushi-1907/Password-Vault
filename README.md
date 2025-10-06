# Password Generator & Secure Vault (MVP)

## **Overview**

A small web application that allows users to **generate strong passwords**, **store them securely in a personal vault**, and **manage them efficiently**. The app is **fast, minimal, and privacy-first**, with client-side encryption to ensure sensitive data is never stored in plaintext on the server.

---

## **Tech Stack**

* **Frontend:** Next.js (React) + TypeScript
* **Backend / API:** Next.js API Routes
* **Database:** MongoDB Atlas (cloud-hosted)
* **Crypto:** Client-side encryption using [your library choice, e.g., `crypto-js`]

---

## **Goal**

Users can:

1. **Generate strong passwords** with options for length, letters, numbers, symbols, and exclude look-alikes.
2. **Save passwords to a personal vault**.
3. **View, edit, and delete vault items**.
4. **Search/filter entries** in a clean dashboard.
5. **Copy passwords to clipboard** with auto-clear for extra security.

---

## **Features**

### **Must-Have**

* **Password Generator**

  * Adjustable length slider
  * Include/exclude letters, numbers, symbols, and look-alikes
* **Simple Authentication**

  * Email + Password sign-up/login
* **Vault Items**

  * Title, username, password, URL, notes
  * Client-side encryption ensures server stores only encrypted data
* **Copy to Clipboard**

  * Auto-clear after ~10–20 seconds
* **Search / Filter**

  * Quickly locate vault items

### **Nice-to-Have (Optional)**

* 2FA (TOTP)
* Tags / Folders
* Dark mode toggle
* Export / import encrypted vault files

---

## **Folder Structure**

```
/pages
  ├─ index.tsx           # Home / login page
  ├─ signup.tsx          # Signup page
  ├─ dashboard.tsx       # Vault panel
  ├─ api/
       ├─ login.ts
       ├─ signup.ts
       ├─ vault.ts       # CRUD for vault items
/lib
  ├─ crypto.ts           # Encryption / decryption functions
/components
  ├─ PasswordGenerator.tsx
  ├─ VaultItem.tsx
/hooks
  ├─ useClipboard.ts
```

---

## **Setup & Run Locally**

1. Clone the repo:

```bash
git clone https://github.com/yourusername/password-vault.git
cd password-vault
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local`:

```
MONGODB_URI="your-mongodb-connection-string"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## **Live Demo**

[Your Vercel / Netlify URL]

---

## **Crypto Used**

* **Library:** `crypto-js` (AES encryption)
* **Why:** Easy-to-use client-side encryption ensures **vault items are encrypted before hitting the server**, keeping sensitive information private.

---

## **Screen Recording**

* A 60–90 second demo showing:

  1. Generate password
  2. Save to vault
  3. Search/filter item
  4. Edit item
  5. Delete item

---

## **Acceptance Criteria**

* Sign-up / login works.
* Vault items are stored **encrypted** in MongoDB.
* Password generator works instantly.
* Copy-to-clipboard auto-clears.
* Basic search/filter returns expected results.

---

## **Deployment**

* **Frontend + Backend:** Vercel (Next.js API routes)
* **Database:** MongoDB Atlas (cloud)
* Fully free to host with environment variables for secrets.

---

## **Inspiration**

* [1Password](https://1password.com)
* [Bitwarden](https://bitwarden.com)

---
